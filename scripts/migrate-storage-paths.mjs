import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const REPORT_BUCKET = "client-reports";
const DOCUMENT_BUCKET = "client-documents";
const applyChanges = process.argv.includes("--apply");
const removeMissingRecords = process.argv.includes("--remove-missing-records");

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY"]) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function normalizeClientCode(clientCode) {
  const normalized = clientCode?.trim().toLowerCase();
  if (!normalized || !/^[a-z0-9]+$/.test(normalized)) {
    return null;
  }
  return normalized;
}

function reportTargetPath(clientCode, year, month) {
  return `${clientCode}/${year}-${String(month).padStart(2, "0")}.html`;
}

function documentTargetPath(clientCode, currentPath) {
  const filename = currentPath.split("/").at(-1);
  if (!filename) throw new Error(`Invalid document path: ${currentPath}`);
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+\./g, ".")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${clientCode}/${sanitized || "document"}`;
}

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function downloadObject(bucketName, path) {
  const { data, error } = await supabase.storage.from(bucketName).download(path);
  if (error || !data) return { data: null, error };
  return {
    data: Buffer.from(await data.arrayBuffer()),
    contentType: data.type || "application/octet-stream",
    error: null,
  };
}

async function migrateObject(task) {
  const bucket = supabase.storage.from(task.bucket);
  const source = await downloadObject(task.bucket, task.from);
  if (source.error || !source.data) {
    throw new Error(
      `Could not download ${task.bucket}/${task.from}: ${source.error?.message ?? "missing object"}`,
    );
  }

  const existingTarget = await downloadObject(task.bucket, task.to);
  let createdTarget = false;

  if (existingTarget.data) {
    if (hash(existingTarget.data) !== hash(source.data)) {
      throw new Error(
        `Refusing to overwrite different content at ${task.bucket}/${task.to}`,
      );
    }
  } else {
    const { error: uploadError } = await bucket.upload(task.to, source.data, {
      contentType: source.contentType,
      upsert: false,
    });
    if (uploadError) {
      throw new Error(
        `Could not copy ${task.bucket}/${task.from} to ${task.to}: ${uploadError.message}`,
      );
    }
    createdTarget = true;
  }

  const verifiedTarget = await downloadObject(task.bucket, task.to);
  if (
    !verifiedTarget.data ||
    hash(verifiedTarget.data) !== hash(source.data)
  ) {
    if (createdTarget) await bucket.remove([task.to]);
    throw new Error(`Verification failed for ${task.bucket}/${task.to}`);
  }

  const { data: updated, error: updateError } = await supabase
    .from(task.table)
    .update({ file_path: task.to })
    .eq("id", task.rowId)
    .eq("file_path", task.from)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    if (createdTarget) await bucket.remove([task.to]);
    throw new Error(
      `Could not update ${task.table}.${task.rowId}: ${updateError?.message ?? "record changed during migration"}`,
    );
  }

  const { error: removeError } = await bucket.remove([task.from]);
  if (removeError) {
    const { error: rollbackError } = await supabase
      .from(task.table)
      .update({ file_path: task.from })
      .eq("id", task.rowId)
      .eq("file_path", task.to);

    if (rollbackError) {
      throw new Error(
        `Old object cleanup and database rollback both failed for ${task.bucket}/${task.from}. Database currently points to ${task.to}.`,
      );
    }

    throw new Error(
      `Could not remove old object ${task.bucket}/${task.from}; database path was rolled back safely.`,
    );
  }
}

async function findMissingSourceTasks(tasks) {
  const missing = [];
  for (const task of tasks) {
    const source = await downloadObject(task.bucket, task.from);
    if (!source.data) missing.push(task);
  }
  return missing;
}

const [clientsResult, profilesResult, reportsResult, documentsResult] =
  await Promise.all([
  supabase.from("clients").select("id, company_name, client_code"),
  supabase
    .from("profiles")
    .select("id, client_id, full_name, created_at")
    .eq("role", "client")
    .not("client_id", "is", null)
    .order("created_at"),
  supabase
    .from("filing_periods")
    .select("id, client_id, period_year, period_month, file_path")
    .not("file_path", "is", null),
  supabase
    .from("client_documents")
    .select("id, client_id, file_path, original_filename"),
  ]);

for (const result of [
  clientsResult,
  profilesResult,
  reportsResult,
  documentsResult,
]) {
  if (result.error) throw result.error;
}

const clients = new Map(clientsResult.data.map((client) => [client.id, client]));
const profilesByClient = new Map();
for (const profile of profilesResult.data) {
  const profiles = profilesByClient.get(profile.client_id) ?? [];
  profiles.push(profile);
  profilesByClient.set(profile.client_id, profiles);
}

function slugifyReadableName(name) {
  const words = name
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    .filter(Boolean);

  if (words.length === 0) return "client";
  if (words.length === 1) return words[0];
  return words[0] + words[words.length - 1];
}

const reservedCodes = new Set(
  clientsResult.data
    .map((client) => normalizeClientCode(client.client_code))
    .filter(Boolean),
);
const plannedClientCodes = new Map();
const codeAssignments = [];

for (const client of clientsResult.data) {
  const existingCode = normalizeClientCode(client.client_code);
  if (existingCode) {
    plannedClientCodes.set(client.id, existingCode);
    continue;
  }

  const linkedProfile = profilesByClient.get(client.id)?.[0];
  const base = slugifyReadableName(
    linkedProfile?.full_name ?? client.company_name,
  );
  let suffix = 1;
  let code = `${base}${suffix}`;
  while (reservedCodes.has(code)) {
    suffix += 1;
    code = `${base}${suffix}`;
  }

  reservedCodes.add(code);
  plannedClientCodes.set(client.id, code);
  codeAssignments.push({
    clientId: client.id,
    companyName: client.company_name,
    code,
    source: linkedProfile ? `user ${linkedProfile.full_name}` : "company name",
  });
}

const tasks = [];
const blockers = [];

for (const report of reportsResult.data) {
  const client = clients.get(report.client_id);
  const clientCode = plannedClientCodes.get(report.client_id);
  if (!clientCode) {
    blockers.push(
      `Report ${report.id}: ${client?.company_name ?? report.client_id} has no valid client_code.`,
    );
    continue;
  }

  const target = reportTargetPath(
    clientCode,
    report.period_year,
    report.period_month,
  );
  if (report.file_path !== target) {
    tasks.push({
      kind: "report",
      bucket: REPORT_BUCKET,
      table: "filing_periods",
      rowId: report.id,
      from: report.file_path,
      to: target,
    });
  }
}

for (const document of documentsResult.data) {
  const client = clients.get(document.client_id);
  const clientCode = plannedClientCodes.get(document.client_id);
  if (!clientCode) {
    blockers.push(
      `Document ${document.id}: ${client?.company_name ?? document.client_id} has no valid client_code.`,
    );
    continue;
  }

  const target = documentTargetPath(clientCode, document.file_path);
  if (document.file_path !== target) {
    tasks.push({
      kind: "document",
      bucket: DOCUMENT_BUCKET,
      table: "client_documents",
      rowId: document.id,
      from: document.file_path,
      to: target,
    });
  }
}

console.log(
  `${applyChanges ? "Applying" : "Dry run:"} ${codeAssignments.length} client code assignment(s) and ${tasks.length} Storage path migration(s) in ${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname}.`,
);
for (const assignment of codeAssignments) {
  console.log(
    `- client code: ${assignment.companyName} -> ${assignment.code} (from ${assignment.source})`,
  );
}
for (const task of tasks) {
  console.log(`- ${task.kind}: ${task.bucket}/${task.from} -> ${task.to}`);
}

const missingSourceTasks = await findMissingSourceTasks(tasks);
if (missingSourceTasks.length) {
  console.error("\nDatabase records whose Storage objects are missing:");
  for (const task of missingSourceTasks) {
    console.error(`- ${task.kind}: ${task.bucket}/${task.from}`);
  }
}

if (blockers.length) {
  console.error("\nBlocked records:");
  for (const blocker of blockers) console.error(`- ${blocker}`);
  throw new Error(
    "Assign valid client codes to every blocked client before running this migration.",
  );
}

if (missingSourceTasks.length && !removeMissingRecords) {
  throw new Error(
    "Remove or repair the missing-file database records before migrating paths. If the objects were intentionally deleted, re-run with --apply --remove-missing-records.",
  );
}

if (!applyChanges) {
  console.log(
    "\nNo changes were made. Re-run with --apply after reviewing this plan.",
  );
  process.exit(0);
}

if (removeMissingRecords) {
  for (const task of missingSourceTasks) {
    const { data: removed, error } = await supabase
      .from(task.table)
      .delete()
      .eq("id", task.rowId)
      .eq("file_path", task.from)
      .select("id")
      .maybeSingle();

    if (error || !removed) {
      throw new Error(
        `Could not remove stale ${task.table}.${task.rowId}: ${error?.message ?? "record changed during cleanup"}`,
      );
    }
    console.log(`Removed stale database record for ${task.bucket}/${task.from}.`);
  }
}

const missingTaskIds = new Set(missingSourceTasks.map((task) => task.rowId));
const migratableTasks = tasks.filter((task) => !missingTaskIds.has(task.rowId));

for (const assignment of codeAssignments) {
  const { data: updated, error } = await supabase
    .from("clients")
    .update({ client_code: assignment.code })
    .eq("id", assignment.clientId)
    .is("client_code", null)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    throw new Error(
      `Could not assign ${assignment.code} to ${assignment.companyName}: ${error?.message ?? "client changed during migration"}`,
    );
  }
  console.log(
    `Assigned client code ${assignment.code} to ${assignment.companyName}.`,
  );
}

for (const task of migratableTasks) {
  await migrateObject(task);
  console.log(`Migrated ${task.bucket}/${task.to}`);
}

console.log(
  `Completed ${codeAssignments.length} client code assignment(s), ${migratableTasks.length} Storage path migration(s), and ${removeMissingRecords ? missingSourceTasks.length : 0} stale-record removal(s).`,
);

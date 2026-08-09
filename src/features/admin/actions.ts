/*
 This file contains the admin-side Server Actions for managing clients, stores, and client user accounts.

 It handles:
 - Creating and renaming clients.
 - Suspending/reactivating clients.
 - Creating and renaming stores.
 - Suspending/reactivating stores.
 - Approving pending client signups and linking them to a client company.
 - Suspending/reactivating client users.
 - Rejecting pending signups by deleting the pending Supabase Auth account.
 - Revalidating affected admin pages after database changes.
 - Redirecting back to the admin interface with success/error messages.

 Every action calls requireAdmin(), so these operations can only be performed
 by an authenticated administrator.

 Admin Actions
│
├── Clients
│   ├── Create
│   ├── Rename
│   └── Suspend/reactivate
│
├── Stores
│   ├── Create
│   ├── Rename
│   └── Suspend/reactivate
│
└── Client users
    ├── Approve pending signup
    ├── Suspend/reactivate
    └── Reject pending signup
*/

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  approveUserSchema,
  clientSchema,
  idSchema,
  storeSchema,
} from "./schemas";


/*
REDIRECT + FLASH MESSAGE HELPER
Redirects the admin to a page while adding either a success or error message to the URL so the interface
can display feedback.
*/
function go(
  path: string,
  kind: "success" | "error",
  message: string,
): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`${path}?${params.toString()}`);
}


// CLIENT MANAGEMENT: Creates a new client/company in the clients table.
export async function createClientAction(formData: FormData) {
  const parsed = clientSchema.safeParse({
    companyName: formData.get("companyName"),
  });

  if (!parsed.success) {
    go("/admin/clients", "error", "Enter a valid company name.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("clients").insert({
    company_name: parsed.data.companyName,
  });

  if (error) {
    go("/admin/clients", "error", "The client could not be created.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");

  go("/admin/clients", "success", "Client created.");
}


// CLIENT MANAGEMENT: Updates the company name of an existing client.
export async function updateClientNameAction(formData: FormData) {
  const id = idSchema.safeParse(formData.get("clientId"));

  const values = clientSchema.safeParse({
    companyName: formData.get("companyName"),
  });

  if (!id.success || !values.success) {
    go("/admin/clients", "error", "Invalid client update.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("clients")
    .update({
      company_name: values.data.companyName,
    })
    .eq("id", id.data);

  if (error) {
    go(
      `/admin/clients/${id.data}`,
      "error",
      "The client could not be updated.",
    );
  }

  revalidatePath(`/admin/clients/${id.data}`);

  go(`/admin/clients/${id.data}`, "success", "Client updated.");
}


// CLIENT STATUS MANAGEMENT: Switches a client between active and suspended.
export async function setClientStatusAction(formData: FormData) {
  const id = idSchema.safeParse(formData.get("clientId"));
  const status = formData.get("status");

  if (
    !id.success ||
    (status !== "active" && status !== "suspended")
  ) {
    go("/admin/clients", "error", "Invalid status change.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("clients")
    .update({ status })
    .eq("id", id.data);

  if (error) {
    go(
      `/admin/clients/${id.data}`,
      "error",
      "Status could not be changed.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id.data}`);

  go(
    `/admin/clients/${id.data}`,
    "success",
    `Client ${status}.`,
  );
}


// STORE MANAGEMENT: Creates a new store belonging to a specific client.
export async function createStoreAction(formData: FormData) {
  const parsed = storeSchema.safeParse({
    clientId: formData.get("clientId"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    go("/admin/clients", "error", "Enter a valid store name.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("stores").insert({
    client_id: parsed.data.clientId,
    display_name: parsed.data.displayName,
  });

  const path = `/admin/clients/${parsed.data.clientId}`;

  if (error) {
    go(
      path,
      "error",
      "The store could not be created. Check for a duplicate name.",
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");

  go(path, "success", "Store created.");
}


// STORE MANAGEMENT: Changes the display name of an existing store.
export async function updateStoreNameAction(formData: FormData) {
  const storeId = idSchema.safeParse(formData.get("storeId"));

  const parsed = storeSchema.safeParse({
    clientId: formData.get("clientId"),
    displayName: formData.get("displayName"),
  });

  if (!storeId.success || !parsed.success) {
    go("/admin/clients", "error", "Invalid store update.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("stores")
    .update({
      display_name: parsed.data.displayName,
    })
    .eq("id", storeId.data)
    .eq("client_id", parsed.data.clientId);

  const path = `/admin/clients/${parsed.data.clientId}`;

  if (error) {
    go(path, "error", "The store could not be updated.");
  }

  revalidatePath(path);

  go(path, "success", "Store updated.");
}


// STORE STATUS MANAGEMENT: Switches a store between active and suspended.
export async function setStoreStatusAction(formData: FormData) {
  const storeId = idSchema.safeParse(formData.get("storeId"));
  const clientId = idSchema.safeParse(formData.get("clientId"));
  const status = formData.get("status");

  if (
    !storeId.success ||
    !clientId.success ||
    (status !== "active" && status !== "suspended")
  ) {
    go("/admin/clients", "error", "Invalid store status.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("stores")
    .update({ status })
    .eq("id", storeId.data)
    .eq("client_id", clientId.data);

  const path = `/admin/clients/${clientId.data}`;

  if (error) {
    go(path, "error", "Store status could not be changed.");
  }

  revalidatePath(path);
  revalidatePath("/admin");

  go(path, "success", `Store ${status}.`);
}

/*
PENDING USER APPROVAL
Approves a self-registered client account by:
- linking the profile to the selected client company
- changing the profile from pending to active
*/
export async function approveUserAction(formData: FormData) {
  const parsed = approveUserSchema.safeParse({
    profileId: formData.get("profileId"),
    clientId: formData.get("clientId"),
  });

  if (!parsed.success) {
    go("/admin/users", "error", "Select a valid client.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      client_id: parsed.data.clientId,
      status: "active",
    })
    .eq("id", parsed.data.profileId)
    .eq("role", "client")
    .eq("status", "pending");

  if (error) {
    go(
      "/admin/users",
      "error",
      "The account could not be approved.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");

  go("/admin/users", "success", "Account approved.");
}


// CLIENT USER STATUS MANAGEMENT: Allows the admin to suspend or reactivate an approved client user.
export async function setUserStatusAction(formData: FormData) {
  const profileId = idSchema.safeParse(
    formData.get("profileId"),
  );

  const status = formData.get("status");

  if (
    !profileId.success ||
    (status !== "active" && status !== "suspended")
  ) {
    go("/admin/users", "error", "Invalid account status.");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", profileId.data)
    .eq("role", "client");

  if (error) {
    go(
      "/admin/users",
      "error",
      "The account status could not be changed.",
    );
  }

  revalidatePath("/admin/users");

  go(
    "/admin/users",
    "success",
    `Account ${status}.`,
  );
}

/*
PENDING USER REJECTION
Rejects a self-registered account that is still pending.
It first verifies that the profile is actually a pending client account.
Then it uses the privileged Supabase Admin client to delete the user's
Supabase Auth account entirely.
*/
export async function rejectPendingUserAction(
  formData: FormData,
) {
  const profileId = idSchema.safeParse(
    formData.get("profileId"),
  );

  if (!profileId.success) {
    go("/admin/users", "error", "Invalid account.");
  }

  const { supabase } = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", profileId.data)
    .maybeSingle();

  if (
    !profile ||
    profile.role !== "client" ||
    profile.status !== "pending"
  ) {
    go(
      "/admin/users",
      "error",
      "Only pending accounts can be rejected.",
    );
  }

  const adminClient = createSupabaseAdminClient();

  const { error } =
    await adminClient.auth.admin.deleteUser(profileId.data);

  if (error) {
    go(
      "/admin/users",
      "error",
      "The pending account could not be rejected.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");

  go(
    "/admin/users",
    "success",
    "Pending account rejected.",
  );
}

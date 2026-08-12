const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_FULL_NAME",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const passwordRequirements =
  "ADMIN_PASSWORD must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
const adminPassword = process.env.ADMIN_PASSWORD;

if (
  adminPassword.length < 8 ||
  adminPassword.length > 72 ||
  !/[A-Z]/.test(adminPassword) ||
  !/[a-z]/.test(adminPassword) ||
  !/[0-9]/.test(adminPassword) ||
  !/[^A-Za-z0-9\s]/.test(adminPassword)
) {
  throw new Error(passwordRequirements);
}

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

const created = await request("/auth/v1/admin/users", {
  method: "POST",
  body: JSON.stringify({
    email: process.env.ADMIN_EMAIL,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: process.env.ADMIN_FULL_NAME },
  }),
});

let user = created.response.ok ? created.body : null;

if (!created.response.ok) {
  const listed = await request("/auth/v1/admin/users?page=1&per_page=1000");
  if (!listed.response.ok) {
    throw new Error(listed.body?.message ?? "Could not list Auth users.");
  }
  user = listed.body.users.find(
    (candidate) => candidate.email === process.env.ADMIN_EMAIL,
  );
  if (!user) {
    throw new Error(
      created.body?.message ??
        created.body?.msg ??
        created.body?.error_description ??
        "Could not create the admin user.",
    );
  }
}

if (!user?.id) throw new Error("Could not locate or create the admin user.");

const profile = await request(`/rest/v1/profiles?id=eq.${user.id}`, {
  method: "PATCH",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify({
    full_name: process.env.ADMIN_FULL_NAME,
    role: "admin",
    status: "active",
    client_id: null,
  }),
});

if (!profile.response.ok || !profile.body?.length) {
  throw new Error(profile.body?.message ?? "Could not promote the admin profile.");
}

console.log(`Admin account ready: ${process.env.ADMIN_EMAIL}`);

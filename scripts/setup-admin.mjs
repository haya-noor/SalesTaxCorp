const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_FULL_NAME",
  "ADMIN_2_EMAIL",
  "ADMIN_2_PASSWORD",
  "ADMIN_2_FULL_NAME",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function validatePassword(name, password) {
  if (
    password.length < 8 ||
    password.length > 72 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9\s]/.test(password)
  ) {
    throw new Error(
      `${name} must contain 8-72 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.`,
    );
  }
}

const administrators = [
  {
    email: process.env.ADMIN_EMAIL.trim(),
    password: process.env.ADMIN_PASSWORD,
    fullName: process.env.ADMIN_FULL_NAME.trim(),
  },
  {
    email: process.env.ADMIN_2_EMAIL.trim(),
    password: process.env.ADMIN_2_PASSWORD,
    fullName: process.env.ADMIN_2_FULL_NAME.trim(),
  },
];

validatePassword("ADMIN_PASSWORD", administrators[0].password);
validatePassword("ADMIN_2_PASSWORD", administrators[1].password);

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

async function provisionAdministrator({ email, password, fullName }) {
  const created = await request("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  let user = created.response.ok ? created.body : null;

  if (!created.response.ok) {
    const listed = await request("/auth/v1/admin/users?page=1&per_page=1000");
    if (!listed.response.ok) {
      throw new Error(listed.body?.message ?? "Could not list Auth users.");
    }
    user = listed.body.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!user) {
      throw new Error(
        created.body?.message ??
          created.body?.msg ??
          created.body?.error_description ??
          `Could not create the administrator ${email}.`,
      );
    }

    const updated = await request(`/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });

    if (!updated.response.ok) {
      throw new Error(
        updated.body?.message ?? `Could not update the administrator ${email}.`,
      );
    }

    user = updated.body;
  }

  if (!user?.id) {
    throw new Error(`Could not locate or create the administrator ${email}.`);
  }

  const profile = await request(`/rest/v1/profiles?id=eq.${user.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      full_name: fullName,
      role: "admin",
      status: "active",
      client_id: null,
    }),
  });

  if (!profile.response.ok || !profile.body?.length) {
    throw new Error(
      profile.body?.message ?? `Could not promote ${email} to administrator.`,
    );
  }

  console.log(`Administrator account ready: ${email}`);
}

for (const administrator of administrators) {
  await provisionAdministrator(administrator);
}

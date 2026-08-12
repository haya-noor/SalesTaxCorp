const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "CLIENT_A_EMAIL",
  "CLIENT_A_PASSWORD",
  "CLIENT_B_EMAIL",
  "CLIENT_B_PASSWORD",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function request(path, { token, method = "GET", body, prefer } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${token ?? apiKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: response.ok, status: response.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

async function login(email, password) {
  const result = await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  if (!result.ok) throw new Error(`Login failed for ${email}: ${result.data?.message}`);
  return result.data;
}

async function signupOrLogin({ email, password, fullName, companyName }) {
  const signup = await request("/auth/v1/signup", {
    method: "POST",
    body: {
      email,
      password,
      data: {
        full_name: fullName,
        requested_company_name: companyName,
      },
    },
  });

  if (signup.ok && signup.data?.access_token) return signup.data;
  return login(email, password);
}

async function getOrCreateClient(token, companyName) {
  const query = encodeURIComponent(companyName);
  const existing = await request(
    `/rest/v1/clients?company_name=eq.${query}&select=*`,
    { token },
  );
  if (!existing.ok) throw new Error(`Could not query client ${companyName}`);
  if (existing.data.length) return existing.data[0];

  const created = await request("/rest/v1/clients", {
    token,
    method: "POST",
    prefer: "return=representation",
    body: { company_name: companyName },
  });
  if (!created.ok) throw new Error(`Could not create client ${companyName}`);
  return created.data[0];
}

async function getOrCreateStore(token, clientId, displayName) {
  const existing = await request(
    `/rest/v1/stores?client_id=eq.${clientId}&display_name=eq.${encodeURIComponent(displayName)}&select=*`,
    { token },
  );
  if (!existing.ok) throw new Error(`Could not query store ${displayName}`);
  if (existing.data.length) return existing.data[0];

  const created = await request("/rest/v1/stores", {
    token,
    method: "POST",
    prefer: "return=representation",
    body: { client_id: clientId, display_name: displayName },
  });
  if (!created.ok) throw new Error(`Could not create store ${displayName}`);
  return created.data[0];
}

async function setProfile(token, userId, values) {
  const updated = await request(`/rest/v1/profiles?id=eq.${userId}`, {
    token,
    method: "PATCH",
    prefer: "return=representation",
    body: values,
  });
  if (!updated.ok || !updated.data?.length) {
    throw new Error(`Could not update profile ${userId}: ${updated.data?.message}`);
  }
  return updated.data[0];
}

const adminSession = await login(
  process.env.ADMIN_EMAIL,
  process.env.ADMIN_PASSWORD,
);
const adminToken = adminSession.access_token;

const adminProfile = await request(
  `/rest/v1/profiles?id=eq.${adminSession.user.id}&select=*`,
  { token: adminToken },
);
assert(adminProfile.data?.[0]?.role === "admin", "bootstrap user has the admin role");

const clientA = await getOrCreateClient(adminToken, "Test Client A LLC");
const clientB = await getOrCreateClient(adminToken, "Test Client B LLC");
const storeA1 = await getOrCreateStore(adminToken, clientA.id, "Store A - Downtown");
await getOrCreateStore(adminToken, clientA.id, "Store A - Online");
const storeB1 = await getOrCreateStore(adminToken, clientB.id, "Store B - Main");
assert(clientA.id !== clientB.id, "admin created two isolated client companies");

const sessionA = await signupOrLogin({
  email: process.env.CLIENT_A_EMAIL,
  password: process.env.CLIENT_A_PASSWORD,
  fullName: "Client A Tester",
  companyName: "Test Client A LLC",
});
const sessionB = await signupOrLogin({
  email: process.env.CLIENT_B_EMAIL,
  password: process.env.CLIENT_B_PASSWORD,
  fullName: "Client B Tester",
  companyName: "Test Client B LLC",
});

const beforeA = await request(`/rest/v1/profiles?id=eq.${sessionA.user.id}&select=*`, {
  token: sessionA.access_token,
});
const beforeB = await request(`/rest/v1/profiles?id=eq.${sessionB.user.id}&select=*`, {
  token: sessionB.access_token,
});

if (beforeA.data?.[0]?.status === "pending") {
  assert(beforeA.data[0].client_id === null, "Client A signup starts pending and unassigned");
}
if (beforeB.data?.[0]?.status === "pending") {
  assert(beforeB.data[0].client_id === null, "Client B signup starts pending and unassigned");
}

await setProfile(adminToken, sessionA.user.id, {
  client_id: clientA.id,
  status: "active",
});
await setProfile(adminToken, sessionB.user.id, {
  client_id: clientB.id,
  status: "active",
});
assert(true, "admin approved both client users");

const clientsVisibleA = await request("/rest/v1/clients?select=*", {
  token: sessionA.access_token,
});
const storesVisibleA = await request("/rest/v1/stores?select=*", {
  token: sessionA.access_token,
});
assert(
  clientsVisibleA.data.length === 1 && clientsVisibleA.data[0].id === clientA.id,
  "Client A can read only its own company",
);
assert(
  storesVisibleA.data.length === 2 && storesVisibleA.data.every((store) => store.client_id === clientA.id),
  "Client A can read all and only its own stores",
);

const crossStoreA = await request(`/rest/v1/stores?id=eq.${storeB1.id}&select=*`, {
  token: sessionA.access_token,
});
assert(crossStoreA.data.length === 0, "Client A cannot access Client B's store by ID");

const crossStoreB = await request(`/rest/v1/stores?id=eq.${storeA1.id}&select=*`, {
  token: sessionB.access_token,
});
assert(crossStoreB.data.length === 0, "Client B cannot access Client A's store by ID");

const roleEscalation = await request(
  `/rest/v1/profiles?id=eq.${sessionA.user.id}`,
  {
    token: sessionA.access_token,
    method: "PATCH",
    prefer: "return=representation",
    body: { role: "admin" },
  },
);
assert(!roleEscalation.ok || !roleEscalation.data?.length, "client cannot promote itself to admin");

await setProfile(adminToken, sessionB.user.id, {
  client_id: null,
  status: "pending",
});

try {
  const pendingSelfPromotion = await request(
    `/rest/v1/profiles?id=eq.${sessionB.user.id}`,
    {
      token: sessionB.access_token,
      method: "PATCH",
      prefer: "return=representation",
      body: { role: "admin", status: "active" },
    },
  );
  assert(
    !pendingSelfPromotion.ok || !pendingSelfPromotion.data?.length,
    "pending user cannot grant itself administrator access",
  );
} finally {
  await setProfile(adminToken, sessionB.user.id, {
    role: "client",
    client_id: clientB.id,
    status: "active",
  });
}
assert(true, "pending test account was restored to its client role");

await setProfile(adminToken, sessionA.user.id, { status: "suspended" });
const suspendedAccess = await request("/rest/v1/stores?select=*", {
  token: sessionA.access_token,
});
assert(suspendedAccess.data.length === 0, "suspended client user cannot read stores");

await setProfile(adminToken, sessionA.user.id, {
  client_id: clientA.id,
  status: "active",
});
assert(true, "Client A was reactivated for manual browser testing");

const adminClients = await request("/rest/v1/clients?select=*", { token: adminToken });
assert(adminClients.data.length >= 2, "admin can read and manage all clients");

console.log("SMOKE_TEST_COMPLETE");

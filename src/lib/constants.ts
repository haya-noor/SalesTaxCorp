export const USER_ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;

export const PROFILE_STATUSES = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export const ENTITY_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PENDING: "/pending-approval",
  ACCESS_DENIED: "/access-denied",
  ADMIN: "/admin",
  DASHBOARD: "/dashboard",
} as const;

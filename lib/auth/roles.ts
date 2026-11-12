export const ADMIN_ROLES = ["admin", "editor", "viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isValidAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && (ADMIN_ROLES as readonly string[]).includes(role);
}

export function hasRequiredRole(
  userRole: unknown,
  allowedRoles: readonly AdminRole[]
): boolean {
  if (!isValidAdminRole(userRole)) return false;
  return allowedRoles.includes(userRole);
}

export const ROLE_META: Record<
  AdminRole,
  { label: string; badgeClass: string; description: string }
> = {
  admin: {
    label: "Admin",
    badgeClass: "bg-[#e1eeec] text-[#0a4744] ring-1 ring-[#b9d6d2]",
    description: "Full access: manage users, roles, system cache, and all content.",
  },
  editor: {
    label: "Editor",
    badgeClass: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200",
    description: "Can create, edit, and publish projects, profile, experience, and media.",
  },
  viewer: {
    label: "Viewer",
    badgeClass: "bg-[#f3efe8] text-[#4c535b] ring-1 ring-[#d4cdc0]",
    description: "Read-only access to dashboard telemetry and content previews.",
  },
};

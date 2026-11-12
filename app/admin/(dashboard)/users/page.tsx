import { ShieldCheck } from "@/components/Icons";
import { UsersManager } from "@/components/admin/UsersManager";
import { ROLE_META } from "@/lib/auth/roles";
import { getAuthenticatedAdminLean } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAuthenticatedAdminLean();

  if (!admin || admin.role !== "admin") {
    const roleLabel = admin?.role ? ROLE_META[admin.role]?.label || admin.role : "Guest";
    return (
      <div className="rounded-2xl border border-[#e6e1d8] bg-white p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf1df] text-[#82540a]">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#191c20]">Admin Role Required</h2>
            <p className="mt-1 text-sm text-[#4c535b]">
              Your current role is <span className="font-mono font-semibold">{roleLabel}</span>. Only{" "}
              <span className="font-mono font-semibold">Admin</span> accounts can add users or modify role permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <UsersManager currentUserEmail={admin.email} />;
}

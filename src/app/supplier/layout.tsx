
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import SupplierNavigation from "@/components/supplier/SupplierNavigation";

export default async function SupplierLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, roles } = await requireRole("supplier");

  const name =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "Supplier";

  return (
    <div className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <SupplierNavigation name={name} roles={roles} />
      {children}
    </div>
  );
}

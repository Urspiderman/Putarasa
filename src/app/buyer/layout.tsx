
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import BuyerNavigation from "@/components/buyer/BuyerNavigation";

export default async function BuyerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, roles } = await requireRole("buyer");

  const name =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "Buyer";

  return (
    <div className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <BuyerNavigation name={name} roles={roles} />
      {children}
    </div>
  );
}

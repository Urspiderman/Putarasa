
import type { ReactNode } from "react";
import CourierSidebar from "@/components/courier/CourierSidebar";
import { requireRole } from "@/lib/auth";

export default async function CourierLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("courier");

  return (
    <div className="min-h-screen bg-[#FFFBF1]">
      <CourierSidebar />

      <div className="min-h-screen pt-16 lg:ml-[270px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}

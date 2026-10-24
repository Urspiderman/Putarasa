
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Recycle,
} from "lucide-react";

import {
  type Role,
  getRoleDashboard,
} from "@/lib/roles";

type Props = {
  roles: Role[];
  onNavigate?: () => void;
};

const roleOptions = {
  admin: {
    label: "Admin",
    description: "Kelola sistem",
    icon: ShieldCheck,
  },
  buyer: {
    label: "Buyer",
    description: "Belanja produk",
    icon: ShoppingCart,
  },
  supplier: {
    label: "Supplier",
    description: "Kelola penyetoran",
    icon: Recycle,
  },
  courier: {
    label: "Courier",
    description: "Kelola penjemputan",
    icon: Truck,
  },
};

export default function AdminRoleSwitcher({
  roles,
  onNavigate,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const availableRoles = roles.filter(
    (role) => role in roleOptions
  );

  function handleSwitch(role: Role) {
    if (!availableRoles.includes(role)) return;

    setOpen(false);
    onNavigate?.();

    if (role !== "admin") {
      router.push(getRoleDashboard(role));
    }
  }

  return (
    <div className="px-4 pb-3">
      <div className="rounded-[18px] border border-[#DDB63D]/60 bg-white/35 p-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/40"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#47763A] text-white">
            <ArrowLeftRight size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-black text-[#332417]">
              Ganti Role
            </p>
            <p className="text-[11px] text-[#765C27]">
              Saat ini: Admin
            </p>
          </div>

          <ChevronDown
            size={17}
            className={`text-[#765C27] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="mt-2 space-y-1 border-t border-[#DDB63D]/50 pt-2">
            {availableRoles.map((role) => {
              const option = roleOptions[role];
              const Icon = option.icon;
              const active = role === "admin";

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSwitch(role)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-[#E8F2DE]"
                      : "hover:bg-white/60"
                  }`}
                >
                  <Icon
                    size={18}
                    className="shrink-0 text-[#47763A]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-extrabold text-[#332417]">
                      {option.label}
                    </p>
                    <p className="text-[10px] text-[#765C27]">
                      {option.description}
                    </p>
                  </div>

                  {active && (
                    <Check
                      size={17}
                      className="text-[#47763A]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

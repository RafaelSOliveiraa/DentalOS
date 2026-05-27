"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, DollarSign, Package,
  BarChart2, BrainCircuit, Settings, LayoutGrid,
} from "lucide-react";
import { useProfile, ProfileType } from "@/lib/auth/profiles";

/* ─── Logo ─── */
function ToothSvg() {
  return (
    <svg width={28} height={28} viewBox="0 0 64 64" fill="none">
      <path
        d="M22 8C16 8 10 13 10 20c0 4 1.5 7 3 10l4 20c.5 3 2 4 3.5 4s2.5-1 3-3L26 38c.5-2 1.5-3 3-3h6c1.5 0 2.5 1 3 3l2.5 13c.5 2 1.5 3 3 3s3-1 3.5-4l4-20c1.5-3 3-6 3-10 0-7-6-12-12-12-3 0-5.5 1.5-7 3C33.5 9.5 32 9 32 9s-1.5.5-2.5 1.5C28 9 25.5 8 22 8z"
        fill="#1D9E75"
        opacity="0.9"
      />
    </svg>
  );
}

/* ─── Nav item definitions per profile ─── */
interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const NAV_BY_PROFILE: Record<ProfileType, NavItem[]> = {
  ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard" },
    { icon: CalendarDays,    label: "Agenda",        href: "/dashboard/agenda" },
    { icon: Users,           label: "Pacientes",     href: "/dashboard/pacientes" },
    { icon: DollarSign,      label: "Financeiro",    href: "/dashboard/financeiro" },
    { icon: Package,         label: "Estoque",       href: "/dashboard/estoque" },
    { icon: BarChart2,       label: "Relatórios",    href: "/dashboard/relatorios" },
    { icon: BrainCircuit,    label: "Assistente IA", href: "/dashboard/ia" },
    { icon: Settings,        label: "Configurações", href: "/dashboard/configuracoes" },
  ],
  RECEPCIONISTA: [
    { icon: LayoutGrid,   label: "Recepção",  href: "/dashboard/recepcao" },
    { icon: CalendarDays, label: "Agenda",    href: "/dashboard/agenda" },
    { icon: Users,        label: "Pacientes", href: "/dashboard/pacientes" },
  ],
  DENTISTA: [
    { icon: CalendarDays, label: "Agenda", href: "/dashboard/agenda" },
  ],
};

/* ─── Sidebar component ─── */
export function Sidebar() {
  const { profile, profileType } = useProfile();
  const pathname = usePathname();
  const navItems = NAV_BY_PROFILE[profileType];

  return (
    <aside
      className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-5 gap-1.5 border-r border-white/[0.06] z-30"
      style={{ background: "#0C0F1A" }}
    >
      {/* Logo */}
      <div className="mb-4 mt-1">
        <ToothSvg />
      </div>

      {/* Nav items */}
      {navItems.map(({ icon: Icon, label, href }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <a
            key={label}
            href={href}
            title={label}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              active
                ? "bg-[#1D9E75]/15 text-[#1D9E75]"
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
            }`}
          >
            <Icon size={18} />
          </a>
        );
      })}

      {/* Profile badge — pinned to bottom */}
      <div className="mt-auto">
        <div
          title={`${profile.name}\n${profile.role}`}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-default select-none border-2"
          style={{
            background: `${profile.color}22`,
            borderColor: `${profile.color}55`,
            color: profile.color,
          }}
        >
          {profile.initials}
        </div>
        <p
          className="text-[9px] text-center mt-1 font-medium leading-tight"
          style={{ color: profile.color, opacity: 0.7 }}
        >
          {profile.type === "ADMIN"
            ? "Admin"
            : profile.type === "RECEPCIONISTA"
            ? "Recep."
            : "Dr."}
        </p>
      </div>
    </aside>
  );
}

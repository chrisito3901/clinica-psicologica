"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LogOut,
  HeartHandshake,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    icon: Users,
  },
  {
    label: "Agenda y Citas",
    href: "/agenda",
    icon: Calendar,
  },
  {
    label: "Notas de Sesión",
    href: "/notas",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user?.email) {
          setUserEmail(data.user.email);
        }
      } catch (err) {
        console.warn("Error fetching user in sidebar:", err);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      document.cookie = "demo_mode=; path=/; max-age=0; SameSite=Lax";
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Error signing out:", err);
      window.location.href = "/login";
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-800 tracking-tight leading-none">
            MenteSana
          </h1>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Clínica de Psicología
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="space-y-1 flex-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Gestión Clínica
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-sky-600" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Psychologist User & Sign out */}
      <div className="pt-4 border-t border-slate-100 mt-auto space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-50">
          <div className={cn(
            "w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center",
            userEmail ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
          )}>
            {userEmail ? userEmail.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {userEmail || "Modo Demostración"}
            </p>
            <p className={cn(
              "text-[10px] font-medium flex items-center gap-1",
              userEmail ? "text-teal-600" : "text-amber-600"
            )}>
              <Sparkles className="w-2.5 h-2.5" />
              {userEmail ? "Cuenta Supabase" : "Datos de prueba"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón flotante móvil para abrir Sidebar */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Escritorio (fijo) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {navContent}
      </aside>

      {/* Drawer Móvil */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">{navContent}</div>
        </div>
      )}
    </>
  );
}

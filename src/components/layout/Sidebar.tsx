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
  ShieldCheck,
  Lock,
  ArrowRightLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ClinicService } from "@/lib/services/clinicService";
import { UserRole } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<UserRole>("psicologo");

  const updateProfile = React.useCallback(async () => {
    try {
      const profile = await ClinicService.getCurrentProfile();
      if (profile) {
        setRole(profile.rol);
        setUserName(profile.nombre);
        if (profile.id !== "demo-user") {
          setUserEmail(profile.email);
        }
      }
    } catch (err) {
      console.warn("Error fetching profile in sidebar:", err);
    }
  }, []);

  React.useEffect(() => {
    updateProfile();

    const handleRoleChanged = () => {
      updateProfile();
    };
    window.addEventListener("demo-role-changed", handleRoleChanged);
    return () => {
      window.removeEventListener("demo-role-changed", handleRoleChanged);
    };
  }, [updateProfile]);

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

  const isSecretary = role === "secretaria";

  // Ítems de navegación dinámicos según rol
  const navItems = [
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
    // Solo visible para psicólogos (oculto para secretaría por confidencialidad clínica)
    ...(!isSecretary
      ? [
          {
            label: "Notas de Sesión",
            href: "/notas",
            icon: FileText,
          },
        ]
      : []),
    {
      label: "Equipo y Roles",
      href: "/equipo",
      icon: ShieldCheck,
    },
  ];

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-800 tracking-tight leading-none">
            MenteSana
          </h1>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {isSecretary ? "Panel de Secretaría" : "Clínica de Psicología"}
          </p>
        </div>
      </div>

      {/* Selector de Rol en Modo Demostración */}
      {!userEmail && (
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 mb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-amber-900">Vista Demo Activa:</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isSecretary
                  ? "bg-teal-100 text-teal-800"
                  : "bg-sky-100 text-sky-800"
              )}
            >
              {isSecretary ? "Secretaría" : "Psicólogo"}
            </span>
          </div>
          <button
            onClick={() => {
              const nextRole: UserRole = isSecretary ? "psicologo" : "secretaria";
              ClinicService.setDemoRole(nextRole);
              setRole(nextRole);
              if (nextRole === "secretaria" && pathname.startsWith("/notas")) {
                router.push("/dashboard");
              }
            }}
            className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-amber-900 hover:bg-amber-100/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Ver como {isSecretary ? "Psicólogo(a)" : "Secretaria(o)"}</span>
          </button>
        </div>
      )}

      {/* Navigation links */}
      <nav className="space-y-1 flex-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {isSecretary ? "Gestión Asistencial" : "Gestión Clínica"}
        </p>
        {navItems.map((item) => {
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

        {/* Indicador de expediente restringido para secretaria */}
        {isSecretary && (
          <div className="pt-2 px-3">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-slate-500 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Expedientes clínicos restringidos por secreto profesional.</span>
            </div>
          </div>
        )}
      </nav>

      {/* Usuario actual & Sign out */}
      <div className="pt-4 border-t border-slate-100 mt-auto space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-50">
          <div
            className={cn(
              "w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center text-white",
              isSecretary
                ? "bg-gradient-to-tr from-teal-500 to-emerald-600"
                : "bg-gradient-to-tr from-sky-600 to-indigo-600"
            )}
          >
            {isSecretary ? "S" : userEmail ? userEmail.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {userName || (userEmail ? userEmail.split("@")[0] : isSecretary ? "Secretaría Clínica" : "Psicólogo(a)")}
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
              <Sparkles className="w-2.5 h-2.5 text-teal-600" />
              <span>{isSecretary ? "Rol Secretaría" : "Rol Especialista"}</span>
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

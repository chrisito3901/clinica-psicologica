"use client";

import * as React from "react";
import { Bell, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Appointment } from "@/types/database";
import { ClinicService } from "@/lib/services/clinicService";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [appointmentsToday, setAppointmentsToday] = React.useState<Appointment[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchTodayAppointments = React.useCallback(async () => {
    try {
      const todayAppts = await ClinicService.getTodayAppointments();
      setAppointmentsToday(todayAppts);
    } catch (err) {
      console.warn("Error cargando citas de hoy en campana:", err);
      setAppointmentsToday([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTodayAppointments();

    // Actualizar periódicamente cada 60 segundos
    const interval = setInterval(fetchTodayAppointments, 60000);

    // Escuchar clics fuera para cerrar dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchTodayAppointments]);

  const activeAppointments = appointmentsToday.filter(
    (a) => a.estado === "programada"
  );
  const count = activeAppointments.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer",
          isOpen && "bg-slate-100 text-slate-900"
        )}
        aria-label="Notificaciones de citas"
        title="Recordatorio de citas de hoy"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95">
          <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-semibold text-slate-800">
                Citas de Hoy
              </h4>
            </div>
            <span className="text-xs bg-sky-50 text-sky-700 font-medium px-2 py-0.5 rounded-full">
              {count} pendientes
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 px-2">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Cargando recordatorios...
              </div>
            ) : appointmentsToday.length === 0 ? (
              <div className="py-8 text-center px-4">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-xs font-medium text-slate-700">
                  ¡No tienes citas pendientes para hoy!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Revisa tu calendario para las próximas sesiones.
                </p>
              </div>
            ) : (
              appointmentsToday.map((appt) => {
                const time = new Date(appt.fecha_hora).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isPending = appt.estado === "programada";

                return (
                  <div
                    key={appt.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isPending ? "bg-amber-500" : "bg-emerald-500"
                          )}
                        />
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {appt.patients?.nombre || "Paciente sin nombre"}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {time}
                      </span>
                    </div>

                    {appt.motivo && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 pl-4">
                        Motivo: {appt.motivo}
                      </p>
                    )}

                    <div className="mt-2 pl-4 flex items-center justify-between">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                          appt.estado === "programada"
                            ? "bg-amber-50 text-amber-700"
                            : appt.estado === "completada"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {appt.estado.charAt(0).toUpperCase() + appt.estado.slice(1)}
                      </span>

                      {appt.patient_id && (
                        <Link
                          href={`/pacientes/${appt.patient_id}`}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                        >
                          <User className="w-3 h-3" /> Ver Expediente
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 px-3 border-t border-slate-100 text-center">
            <Link
              href="/agenda"
              onClick={() => setIsOpen(false)}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium inline-block py-1"
            >
              Ver agenda completa en Calendario →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClinicService } from "@/lib/services/clinicService";
import { Appointment, Patient } from "@/types/database";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserPlus,
  ArrowRight,
  User,
  HeartPulse,
  Sparkles,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import { generateGoogleCalendarUrl } from "@/lib/utils/calendar";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { AppointmentFormModal } from "@/components/appointments/AppointmentFormModal";

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    activePatients: 0,
    totalPatients: 0,
    todayAppointmentsCount: 0,
    thisWeekAppointmentsCount: 0,
  });
  const [todayAppointments, setTodayAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = React.useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await ClinicService.getDashboardStats();
      setStats({
        activePatients: data.activePatients,
        totalPatients: data.totalPatients,
        todayAppointmentsCount: data.todayAppointmentsCount,
        thisWeekAppointmentsCount: data.thisWeekAppointmentsCount,
      });
      setTodayAppointments(data.todayAppointments);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteAppointment = async (id: string) => {
    try {
      await ClinicService.updateAppointmentStatus(id, "completada");
      loadData();
    } catch (err) {
      console.error("Error completing appointment:", err);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "programada":
        return <Badge variant="warning">Programada</Badge>;
      case "completada":
        return <Badge variant="success">Completada</Badge>;
      case "cancelada":
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  return (
    <AppLayout>
      <Header
        title="Panel Clínico"
        subtitle="Bienvenido a tu espacio terapéutico y control de pacientes"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPatientModalOpen(true)}
              className="hidden sm:inline-flex"
            >
              <UserPlus className="w-4 h-4 text-sky-600" />
              <span>Nuevo Paciente</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsApptModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Cita</span>
            </Button>
          </>
        }
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* BANNER BIENVENIDA Y RECORDATORIO PRINCIPAL */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 p-6 sm:p-8 text-white shadow-lg shadow-sky-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-sky-100 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resumen de tu Jornada de Hoy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tienes {todayAppointments.filter((a) => a.estado === "programada").length}{" "}
              {todayAppointments.filter((a) => a.estado === "programada").length === 1 ? "sesión pendiente" : "sesiones pendientes"} para hoy
            </h2>
            <p className="mt-2 text-sm text-sky-100/90 leading-relaxed">
              Mantén el enfoque en el bienestar de tus pacientes. Revisa los expedientes antes de cada sesión para un acompañamiento óptimo.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
            <HeartPulse className="w-80 h-80" />
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS (STAT CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pacientes Activos
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-800">
                  {stats.activePatients}
                </span>
                <span className="text-xs text-slate-400">
                  / {stats.totalPatients} totales
                </span>
              </div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Citas de Hoy
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-800">
                  {stats.todayAppointmentsCount}
                </span>
                <span className="text-xs text-teal-600 font-medium">
                  {todayAppointments.filter((a) => a.estado === "completada").length} completadas
                </span>
              </div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Citas Esta Semana
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-800">
                  {stats.thisWeekAppointmentsCount}
                </span>
                <span className="text-xs text-indigo-600 font-medium">
                  programadas
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* SECCIÓN PRINCIPAL: CITAS DE HOY (RECORDATORIO DESTACADO) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <span>Citas de Hoy</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tu agenda programada para el día de hoy
              </p>
            </div>
            <Link
              href="/agenda"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <span>Ver agenda semanal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <Card className="p-12 text-center text-slate-400 text-sm">
              Cargando citas de hoy...
            </Card>
          ) : todayAppointments.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-2 bg-slate-50/50">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-90" />
              <h4 className="text-base font-semibold text-slate-800">
                ¡No tienes citas programadas para hoy!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Aprovecha el tiempo para revisar expedientes clínicos, preparar evaluaciones o agendar nuevas sesiones.
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsApptModalOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Agendar Cita Ahora</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayAppointments.map((appt) => {
                const dateObj = new Date(appt.fecha_hora);
                const timeString = dateObj.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isPending = appt.estado === "programada";

                return (
                  <Card
                    key={appt.id}
                    className="flex flex-col justify-between hover:border-sky-300 transition-all border-l-4 border-l-sky-500"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-800">
                            {timeString}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({appt.duracion_minutos || 50} min)
                          </span>
                        </div>
                        {getStatusBadge(appt.estado)}
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-sky-600 shrink-0" />
                          <span className="line-clamp-1">
                            {appt.patients?.nombre || "Paciente"}
                          </span>
                        </h4>
                        {appt.patients?.telefono && (
                          <p className="text-xs text-slate-400 pl-5.5 mt-0.5">
                            {appt.patients.telefono}
                          </p>
                        )}
                      </div>

                      {appt.motivo && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">Objetivo: </span>
                          {appt.motivo}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/pacientes/${appt.patient_id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        Expediente Clínico →
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={generateGoogleCalendarUrl(appt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-colors"
                          title="Sincronizar con Google Calendar (alarma en tu celular)"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-sky-600" />
                          <span className="hidden sm:inline">Google Cal</span>
                        </a>

                        {isPending && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCompleteAppointment(appt.id)}
                            className="text-xs h-7 px-2.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completar</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ACCESOS DIRECTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link href="/pacientes" className="block group">
            <Card className="p-6 transition-all group-hover:border-sky-300 group-hover:shadow-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base group-hover:text-sky-600 transition-colors">
                    Directorio de Pacientes
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestiona historiales, información de contacto y altas
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
            </Card>
          </Link>

          <Link href="/agenda" className="block group">
            <Card className="p-6 transition-all group-hover:border-teal-300 group-hover:shadow-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base group-hover:text-teal-600 transition-colors">
                    Calendario Terapéutico
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Planifica tus sesiones mensuales, semanales y horarios
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
            </Card>
          </Link>
        </div>
      </div>

      {/* MODALES */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      <AppointmentFormModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </AppLayout>
  );
}

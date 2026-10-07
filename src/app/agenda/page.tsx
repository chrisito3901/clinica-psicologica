"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClinicService } from "@/lib/services/clinicService";
import { Appointment, Patient, AppointmentStatus } from "@/types/database";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  Trash2,
  FileText,
  AlertCircle,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import { generateGoogleCalendarUrl } from "@/lib/utils/calendar";
import { AppointmentFormModal } from "@/components/appointments/AppointmentFormModal";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date("2026-10-01"));
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date("2026-10-01"));
  const [todayDateStr, setTodayDateStr] = React.useState<string>("");
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
    setTodayDateStr(now.toDateString());
  }, []);

  const fetchAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await ClinicService.getAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Navegación mensual
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await ClinicService.updateAppointmentStatus(id, newStatus);
      fetchAppointments();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de cancelar y eliminar esta cita?")) {
      try {
        await ClinicService.deleteAppointment(id);
        fetchAppointments();
      } catch (err) {
        console.error("Error deleting appointment:", err);
      }
    }
  };

  // Cálculo de días del mes para el grid del calendario
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Días previos para rellenar
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  // Filtrar citas del día seleccionado
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const dayAppointments = appointments.filter((a) =>
    a.fecha_hora.startsWith(selectedDateStr)
  );

  return (
    <AppLayout>
      <Header
        title="Agenda y Calendario"
        subtitle="Organiza tus sesiones terapéuticas y horarios de consulta"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Nueva Cita</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALENDARIO MENSUAL INTERACTIVO */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {MONTH_NAMES[month]} {year}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en un día para ver o planificar citas
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
                  Hoy
                </Button>
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cabecera de días */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100">
              {DAY_NAMES.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarCells.map((cellDate, idx) => {
                if (!cellDate) {
                  return <div key={`empty-${idx}`} className="h-14 sm:h-20" />;
                }

                const cellDateStr = cellDate.toISOString().split("T")[0];
                const isSelected =
                  cellDate.toDateString() === selectedDate.toDateString();
                const isToday =
                  cellDate.toDateString() === todayDateStr;

                // Citas en este día
                const apptsOnThisDay = appointments.filter((a) =>
                  a.fecha_hora.startsWith(cellDateStr)
                );

                return (
                  <button
                    key={cellDateStr}
                    onClick={() => setSelectedDate(cellDate)}
                    className={cn(
                      "h-14 sm:h-20 p-1.5 rounded-2xl flex flex-col justify-between items-start transition-all text-left border cursor-pointer group relative",
                      isSelected
                        ? "border-sky-500 bg-sky-50/70 shadow-xs"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50",
                      isToday && !isSelected && "border-teal-400 bg-teal-50/30"
                    )}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                          isSelected
                            ? "bg-sky-600 text-white"
                            : isToday
                            ? "bg-teal-600 text-white"
                            : "text-slate-700 group-hover:text-sky-600"
                        )}
                      >
                        {cellDate.getDate()}
                      </span>
                      {apptsOnThisDay.length > 0 && (
                        <span className="hidden sm:inline-block text-[10px] font-bold text-sky-700 bg-sky-100/80 px-1.5 rounded-full">
                          {apptsOnThisDay.length}
                        </span>
                      )}
                    </div>

                    {/* Indicadores de citas */}
                    <div className="w-full flex items-center gap-1 overflow-hidden">
                      {apptsOnThisDay.slice(0, 3).map((a) => (
                        <span
                          key={a.id}
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            a.estado === "programada"
                              ? "bg-amber-400"
                              : a.estado === "completada"
                              ? "bg-emerald-500"
                              : "bg-rose-400"
                          )}
                        />
                      ))}
                      {apptsOnThisDay.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-bold">
                          +{apptsOnThisDay.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LISTA DE CITAS DEL DÍA SELECCIONADO */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-sky-600" />
                    <span>
                      {selectedDate.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dayAppointments.length}{" "}
                    {dayAppointments.length === 1 ? "cita registrada" : "citas registradas"}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar en este día</span>
                </Button>
              </div>

              {dayAppointments.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-slate-700">
                    Sin citas para este día
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto mb-4">
                    No hay sesiones programadas para la fecha seleccionada.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agendar Cita</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {dayAppointments.map((appt) => {
                    const time = new Date(appt.fecha_hora).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={appt.id}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-slate-800">
                                {time}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({appt.duracion_minutos || 50} min)
                              </span>
                            </div>
                            <h5 className="font-semibold text-sm text-slate-800 mt-1 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-sky-600" />
                              {appt.patients?.nombre || "Paciente"}
                            </h5>
                          </div>

                          <span
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-full",
                              appt.estado === "programada"
                                ? "bg-amber-100 text-amber-800"
                                : appt.estado === "completada"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            )}
                          >
                            {appt.estado.charAt(0).toUpperCase() + appt.estado.slice(1)}
                          </span>
                        </div>

                        {appt.motivo && (
                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="font-semibold text-slate-700">Objetivo: </span>
                            {appt.motivo}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          {appt.patient_id && (
                            <Link
                              href={`/pacientes/${appt.patient_id}`}
                              className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Expediente</span>
                            </Link>
                          )}

                          <div className="flex items-center gap-1.5">
                            <a
                              href={generateGoogleCalendarUrl(appt)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Sincronizar / Añadir a Google Calendar (alarma en tu celular)"
                            >
                              <CalendarPlus className="w-4 h-4 text-sky-600" />
                            </a>

                            {appt.estado === "programada" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "completada")}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Marcar como completada"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {appt.estado !== "cancelada" && (
                              <button
                                onClick={() => handleStatusChange(appt.id, "cancelada")}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                title="Cancelar cita"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(appt.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar cita"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Agendar Cita */}
      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDateStr}
        onSuccess={() => {
          fetchAppointments();
        }}
      />
    </AppLayout>
  );
}

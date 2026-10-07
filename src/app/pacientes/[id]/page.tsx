"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClinicService } from "@/lib/services/clinicService";
import { Patient, SessionNote, Appointment } from "@/types/database";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  FileText,
  Stethoscope,
  CheckSquare,
  AlertCircle,
  Printer,
  History,
  CalendarPlus,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { SessionNoteFormModal } from "@/components/notes/SessionNoteFormModal";
import { AppointmentFormModal } from "@/components/appointments/AppointmentFormModal";

function PatientDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [notes, setNotes] = React.useState<SessionNote[]>([]);
  const [isSecretary, setIsSecretary] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Modales
  const [isNoteModalOpen, setIsNoteModalOpen] = React.useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = React.useState(false);

  const loadPatientData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [patientData, notesData, profile] = await Promise.all([
        ClinicService.getPatientById(patientId),
        ClinicService.getSessionNotesByPatient(patientId),
        ClinicService.getCurrentProfile(),
      ]);
      setPatient(patientData);
      setNotes(notesData);
      setIsSecretary(profile?.rol === "secretaria");
    } catch (err) {
      console.error("Error loading patient file:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const [currentYear, setCurrentYear] = React.useState(2026);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const calculateAge = (birthDateString: string | null) => {
    if (!birthDateString) return null;
    const birthYear = parseInt(birthDateString.split("-")[0], 10);
    if (isNaN(birthYear)) return null;
    return Math.max(0, currentYear - birthYear);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-16 text-center text-slate-400 text-sm">
          Cargando expediente clínico...
        </div>
      </AppLayout>
    );
  }

  if (!patient) {
    return (
      <AppLayout>
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Paciente no encontrado</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            El expediente que buscas no existe o fue eliminado.
          </p>
          <Link href="/pacientes">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al directorio
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const age = calculateAge(patient.fecha_nacimiento);

  return (
    <AppLayout>
      <Header
        title={patient.nombre}
        subtitle="Expediente Clínico y Evolución Psicológica"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="hidden sm:inline-flex"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsApptModalOpen(true)}
            >
              <CalendarPlus className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Agendar Cita</span>
            </Button>
            {!isSecretary && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Nota</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 print:p-0 print:max-w-none print:space-y-6">
        {/* CABECERA OFICIAL DE IMPRESIÓN (Visible ÚNICAMENTE en impresión/PDF) */}
        <div className="hidden print:block pb-4 mb-6 border-b-2 border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                Clínica Psicológica MenteSana
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Expediente Clínico & Registro de Evolución Terapéutica
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-slate-100 border border-slate-300 text-slate-800 mb-1">
                Documento Confidencial
              </span>
              <p>Fecha de emisión: {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {/* ENLACE DE RETORNO */}
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Pacientes</span>
        </Link>

        {/* FICHA RESUMEN DEL PACIENTE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 print:border print:border-slate-300 print:shadow-none print:p-5 print:rounded-2xl print:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 print:border-slate-300 print:pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-sky-500/20 print:hidden">
                {patient.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    {patient.nombre}
                  </h2>
                  <Badge variant={patient.estado === "activo" ? "success" : "neutral"} className="print:border print:border-slate-300">
                    {patient.estado === "activo" ? "Tratamiento Activo" : patient.estado}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ID Expediente: <span className="font-mono">{patient.id.slice(0, 8)}</span> • Registrado el {new Date(patient.created_at).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          </div>

          {/* DATOS DEMOGRÁFICOS Y DE CONTACTO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs print:grid-cols-3 print:gap-3">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 print:bg-white print:border-slate-300 print:p-3 print:rounded-xl">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Contacto
              </span>
              <p className="font-medium text-slate-800 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-600 print:hidden" />
                {patient.telefono || "No registrado"}
              </p>
              <p className="font-medium text-slate-800 flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-sky-600 print:hidden" />
                {patient.email || "No registrado"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 print:bg-white print:border-slate-300 print:p-3 print:rounded-xl">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Edad y Nacimiento
              </span>
              <p className="font-medium text-slate-800 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-sky-600 print:hidden" />
                {patient.fecha_nacimiento || "Fecha no registrada"}
              </p>
              {age !== null && (
                <p className="text-slate-600 pl-5.5 font-medium print:pl-0">
                  {age} años de edad
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 print:bg-white print:border-slate-300 print:p-3 print:rounded-xl">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Sesiones Registradas
              </span>
              <p className="text-2xl font-bold text-sky-700 print:text-xl print:text-slate-800">
                {notes.length}
              </p>
              <p className="text-slate-500">
                notas clínicas documentadas
              </p>
            </div>
          </div>

          {/* MOTIVO DE CONSULTA Y ANTECEDENTES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 print:grid-cols-2 print:gap-3 print:pt-0">
            <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-1 print:bg-white print:border-slate-300 print:p-3 print:rounded-xl">
              <p className="font-bold text-sky-900 flex items-center gap-1.5 print:text-slate-900">
                <FileText className="w-4 h-4 text-sky-600 print:hidden" />
                Motivo de Consulta Inicial
              </p>
              <p className="text-slate-700 leading-relaxed">
                {patient.motivo_consulta || "No especificado."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 print:bg-white print:border-slate-300 print:p-3 print:rounded-xl">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500 print:hidden" />
                Notas Generales y Antecedentes
              </p>
              <p className="text-slate-600 leading-relaxed">
                {patient.notas_generales || "Sin notas adicionales registradas."}
              </p>
            </div>
          </div>
        </div>

        {/* EXPEDIENTE CLÍNICO: NOTAS DE SESIÓN (HISTORIAL CRONOLÓGICO) */}
        <div className="space-y-4 print:space-y-3">
          <div className="flex items-center justify-between print:mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 print:text-base">
                <FileText className="w-5 h-5 text-teal-600 print:hidden" />
                <span>
                  {isSecretary ? "Expediente Clínico Reservado" : `Historial Cronológico de Sesiones (${notes.length})`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isSecretary
                  ? "Información médica y notas de evolución protegidas"
                  : "Evolución clínica, observaciones y acuerdos terapéuticos"}
              </p>
            </div>

            {!isSecretary && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
                className="print:hidden"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nota de Sesión</span>
              </Button>
            )}
          </div>

          {isSecretary ? (
            <Card className="p-8 text-center border border-slate-200/80 bg-slate-50/70 space-y-3 print:border-slate-300 print:bg-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs print:hidden">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Acceso Restringido por Confidencialidad y Secreto Profesional
              </h4>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                Las observaciones de sesión, hipótesis diagnósticas y evolución terapéutica de este paciente están protegidas bajo el secreto profesional médico y son de acceso exclusivo para el psicólogo tratante.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 print:hidden">
                <Button variant="secondary" size="sm" onClick={() => setIsApptModalOpen(true)}>
                  <CalendarPlus className="w-4 h-4 text-sky-600" />
                  <span>Agendar Próxima Cita para {patient.nombre}</span>
                </Button>
              </div>
            </Card>
          ) : notes.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 bg-slate-50/50 print:bg-white print:border-slate-300">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3 print:hidden" />
              <h4 className="text-base font-semibold text-slate-800">
                Aún no hay notas registradas para este paciente
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Documenta la primera sesión clínica con las observaciones, diagnóstico preliminar y tareas.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
                className="print:hidden"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primera Nota</span>
              </Button>
            </Card>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-sky-200/70 space-y-8 ml-3 sm:ml-4 pt-2 print:border-l-0 print:pl-0 print:ml-0 print:space-y-4 print:pt-0">
              {notes.map((note, index) => (
                <div key={note.id} className="relative group break-inside-avoid">
                  {/* Nodo circular del timeline */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-white border-4 border-sky-600 shadow-xs group-hover:scale-125 transition-transform print:hidden" />

                  <Card className="p-6 space-y-4 hover:border-sky-300 transition-all bg-white shadow-xs break-inside-avoid print:shadow-none print:border print:border-slate-300 print:p-4 print:rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 print:border-slate-200 print:pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 print:bg-slate-100 print:text-slate-800 print:border print:border-slate-300">
                          Sesión #{notes.length - index}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400 print:hidden" />
                          {new Date(note.fecha).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Registrado: {new Date(note.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Diagnóstico Preliminar */}
                    {note.diagnostico_preliminar && (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs print:bg-slate-50 print:border-slate-300">
                        <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-0.5 print:text-slate-800">
                          <Stethoscope className="w-3.5 h-3.5 text-amber-600 print:hidden" />
                          Diagnóstico / Hipótesis Clínica:
                        </p>
                        <p className="text-amber-950 font-medium print:text-slate-900">
                          {note.diagnostico_preliminar}
                        </p>
                      </div>
                    )}

                    {/* Observaciones Clínicas */}
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Observaciones y Evolución de la Sesión:
                      </p>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line text-sm bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 print:bg-transparent print:border print:border-slate-200 print:p-3 print:rounded-lg">
                        {note.observaciones}
                      </p>
                    </div>

                    {/* Tareas y Recomendaciones */}
                    {note.tareas_recomendaciones && (
                      <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/70 text-xs print:bg-slate-50 print:border-slate-300">
                        <p className="font-bold text-teal-900 flex items-center gap-1.5 mb-1 print:text-slate-800">
                          <CheckSquare className="w-3.5 h-3.5 text-teal-600 print:hidden" />
                          Tareas Asignadas y Recomendaciones:
                        </p>
                        <p className="text-teal-950 leading-relaxed whitespace-pre-line font-medium print:text-slate-900">
                          {note.tareas_recomendaciones}
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIE DE PÁGINA Y FIRMA PROFESIONAL (Visible ÚNICAMENTE al imprimir) */}
        <div className="hidden print:block pt-16 mt-8 break-inside-avoid">
          <div className="flex justify-between items-end px-4">
            <div className="text-center w-72 border-t border-slate-800 pt-2 text-xs text-slate-800">
              <p className="font-bold">Firma y Sello del Profesional</p>
              <p className="text-[10px] text-slate-500">Psicólogo(a) Clínico Tratante</p>
            </div>
            <div className="text-right text-[10px] text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700">Documento Confidencial de Uso Médico-Clínico</p>
              <p className="mt-0.5">
                La divulgación de este expediente está sujeta al secreto profesional y normativas de confidencialidad en salud mental.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Nota de Sesión */}
      <SessionNoteFormModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        patientId={patient.id}
        patientName={patient.nombre}
        onSuccess={() => {
          loadPatientData();
        }}
      />

      {/* Modal Agendar Cita para este paciente */}
      <AppointmentFormModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        preselectedPatientId={patient.id}
        onSuccess={() => {
          // Cita programada
        }}
      />
    </AppLayout>
  );
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center text-slate-400 text-sm">
            Cargando expediente clínico...
          </div>
        </div>
      }
    >
      <PatientDetailContent params={params} />
    </React.Suspense>
  );
}

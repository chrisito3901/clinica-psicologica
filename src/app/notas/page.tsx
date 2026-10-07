"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClinicService } from "@/lib/services/clinicService";
import { SessionNote, Patient } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Calendar,
  Stethoscope,
  CheckSquare,
  User,
  ArrowRight,
  Lock,
} from "lucide-react";
import Link from "next/link";

export default function NotesExplorerPage() {
  const [notes, setNotes] = React.useState<SessionNote[]>([]);
  const [patientsMap, setPatientsMap] = React.useState<Record<string, Patient>>({});
  const [isSecretary, setIsSecretary] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [notesData, patientsData, profile] = await Promise.all([
          ClinicService.getAllSessionNotes(),
          ClinicService.getPatients(),
          ClinicService.getCurrentProfile(),
        ]);
        setIsSecretary(profile?.rol === "secretaria");
        setNotes(notesData);

        const map: Record<string, Patient> = {};
        patientsData.forEach((p) => {
          map[p.id] = p;
        });
        setPatientsMap(map);
      } catch (err) {
        console.error("Error loading notes explorer:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredNotes = notes.filter((n) => {
    const patient = patientsMap[n.patient_id];
    const q = search.toLowerCase();
    return (
      n.observaciones.toLowerCase().includes(q) ||
      (n.diagnostico_preliminar && n.diagnostico_preliminar.toLowerCase().includes(q)) ||
      (n.tareas_recomendaciones && n.tareas_recomendaciones.toLowerCase().includes(q)) ||
      (patient && patient.nombre.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <Header
        title="Notas de Sesión Clínicas"
        subtitle="Registro global y búsqueda de expedientes y evoluciones terapéuticas"
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs max-w-xl">
          <Input
            placeholder="Buscar por paciente, diagnóstico, síntomas o tareas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* LISTADO DE NOTAS */}
        {isSecretary ? (
          <Card className="p-12 text-center border border-slate-200/80 bg-slate-50/70 space-y-4 max-w-lg mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Acceso Restringido a Notas Clínicas
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El rol de secretaría o asistencia no tiene permisos para consultar diagnósticos ni notas de sesión terapéuticas por secreto profesional médico.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Volver al Panel Principal
                </Button>
              </Link>
            </div>
          </Card>
        ) : loading ? (
          <Card className="p-16 text-center text-slate-400 text-sm">
            Cargando historial de notas...
          </Card>
        ) : filteredNotes.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 bg-slate-50/50">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-semibold text-slate-800">
              No se encontraron notas clínicas
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {search
                ? "Prueba buscando con otros términos o nombres de pacientes."
                : "Aún no hay notas registradas. Entra al perfil de un paciente para crear su primera nota."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const patient = patientsMap[note.patient_id];

              return (
                <Card
                  key={note.id}
                  className="p-6 hover:border-sky-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">
                          {patient?.nombre || "Paciente"}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Sesión del {note.fecha}
                        </span>
                      </div>
                    </div>

                    {patient && (
                      <Link
                        href={`/pacientes/${patient.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 group"
                      >
                        <span>Ver Expediente Completo</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>

                  {note.diagnostico_preliminar && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs">
                      <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                        Diagnóstico / Hipótesis Clínica:
                      </p>
                      <p className="text-amber-950 font-medium">
                        {note.diagnostico_preliminar}
                      </p>
                    </div>
                  )}

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Observaciones:
                    </p>
                    <p className="text-slate-800 leading-relaxed text-sm bg-slate-50/60 p-3 rounded-xl">
                      {note.observaciones}
                    </p>
                  </div>

                  {note.tareas_recomendaciones && (
                    <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 text-xs">
                      <p className="font-bold text-teal-900 flex items-center gap-1.5 mb-0.5">
                        <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                        Tareas y Acuerdos:
                      </p>
                      <p className="text-teal-950 font-medium">
                        {note.tareas_recomendaciones}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

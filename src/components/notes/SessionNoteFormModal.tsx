"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SessionNote } from "@/types/database";
import { ClinicService } from "@/lib/services/clinicService";
import { Calendar, Stethoscope, CheckSquare, FileText } from "lucide-react";

interface SessionNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (note: SessionNote) => void;
  patientId: string;
  patientName: string;
}

export function SessionNoteFormModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  patientName,
}: SessionNoteFormModalProps) {
  const [fecha, setFecha] = React.useState("");
  const [observaciones, setObservaciones] = React.useState("");
  const [diagnosticoPreliminar, setDiagnosticoPreliminar] = React.useState("");
  const [tareasRecomendaciones, setTareasRecomendaciones] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFecha(new Date().toISOString().split("T")[0]);
      setObservaciones("");
      setDiagnosticoPreliminar("");
      setTareasRecomendaciones("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observaciones.trim()) {
      setError("Las observaciones clínicas son obligatorias.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newNote = await ClinicService.createSessionNote({
        patient_id: patientId,
        appointment_id: null,
        fecha,
        observaciones,
        diagnostico_preliminar: diagnosticoPreliminar || null,
        tareas_recomendaciones: tareasRecomendaciones || null,
      });

      onSuccess(newNote);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar la nota clínica.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Nota de Sesión Clínica"
      description={`Registrando expediente para ${patientName}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha de la Sesión *"
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Diagnóstico / Hipótesis Clínica"
            placeholder="Ej. F41.1 Ansiedad generalizada, duelo agudo..."
            value={diagnosticoPreliminar}
            onChange={(e) => setDiagnosticoPreliminar(e.target.value)}
            icon={<Stethoscope className="w-4 h-4" />}
          />
        </div>

        <Textarea
          label="Observaciones y Evolución Clínica *"
          placeholder="Describe la dinámica de la sesión, afecto del paciente, temas abordados, resistencia o avances observados..."
          rows={5}
          required
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <Textarea
          label="Tareas Terapéuticas y Recomendaciones"
          placeholder="Pautas para la semana, ejercicios asignados, lecturas recomendadas, acuerdos terapéuticos..."
          rows={3}
          value={tareasRecomendaciones}
          onChange={(e) => setTareasRecomendaciones(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Guardar Nota Clínica
          </Button>
        </div>
      </form>
    </Modal>
  );
}

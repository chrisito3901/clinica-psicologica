"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Appointment, Patient, AppointmentStatus } from "@/types/database";
import { ClinicService } from "@/lib/services/clinicService";
import { Calendar, Clock, User, AlignLeft } from "lucide-react";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
  preselectedPatientId?: string;
  defaultDate?: string;
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedPatientId,
  defaultDate,
}: AppointmentFormModalProps) {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [patientId, setPatientId] = React.useState(preselectedPatientId || "");
  const [fecha, setFecha] = React.useState(defaultDate || "");
  const [hora, setHora] = React.useState("10:00");
  const [duracionMinutos, setDuracionMinutos] = React.useState(50);
  const [motivo, setMotivo] = React.useState("");
  const [notas, setNotas] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      ClinicService.getPatients().then((data) => {
        setPatients(data);
        if (!patientId && data.length > 0) {
          setPatientId(preselectedPatientId || data[0].id);
        }
      });
      if (defaultDate) {
        setFecha(defaultDate);
      } else {
        setFecha(new Date().toISOString().split("T")[0]);
      }
    }
  }, [isOpen, preselectedPatientId, defaultDate, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError("Debes seleccionar un paciente para la cita.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fechaHoraIso = new Date(`${fecha}T${hora}:00`).toISOString();

      const newAppt = await ClinicService.createAppointment({
        patient_id: patientId,
        fecha_hora: fechaHoraIso,
        duracion_minutos: Number(duracionMinutos),
        estado: "programada",
        motivo: motivo || null,
        notas: notas || null,
      });

      onSuccess(newAppt);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al programar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Nueva Cita Psicológica"
      description="Programa una sesión terapéutica asignando paciente, fecha y hora."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Seleccionar Paciente *
          </label>
          <div className="relative">
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.telefono || p.email || "Sin contacto"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Fecha *"
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Hora *"
            type="time"
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            icon={<Clock className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Duración
            </label>
            <select
              value={duracionMinutos}
              onChange={(e) => setDuracionMinutos(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={50}>50 minutos (Estándar)</option>
              <option value={60}>60 minutos (1 hora)</option>
              <option value={90}>90 minutos</option>
            </select>
          </div>
        </div>

        <Input
          label="Objetivo / Motivo de la sesión"
          placeholder="Ej. Revisión de tareas cognitivas o sesión inicial"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          icon={<AlignLeft className="w-4 h-4" />}
        />

        <Textarea
          label="Notas previas para el psicólogo (opcional)"
          placeholder="Preparar cuestionario de ansiedad, recordar solicitar firma de consentimiento..."
          rows={2}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Confirmar Cita
          </Button>
        </div>
      </form>
    </Modal>
  );
}

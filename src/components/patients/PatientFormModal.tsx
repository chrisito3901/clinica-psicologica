"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Patient, PatientStatus } from "@/types/database";
import { ClinicService } from "@/lib/services/clinicService";
import { User, Phone, Mail, Calendar, FileText } from "lucide-react";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  patientToEdit?: Patient | null;
}

export function PatientFormModal({
  isOpen,
  onClose,
  onSuccess,
  patientToEdit,
}: PatientFormModalProps) {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [fechaNacimiento, setFechaNacimiento] = React.useState("");
  const [motivoConsulta, setMotivoConsulta] = React.useState("");
  const [notasGenerales, setNotasGenerales] = React.useState("");
  const [estado, setEstado] = React.useState<PatientStatus>("activo");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (patientToEdit) {
      setNombre(patientToEdit.nombre || "");
      setEmail(patientToEdit.email || "");
      setTelefono(patientToEdit.telefono || "");
      setFechaNacimiento(patientToEdit.fecha_nacimiento || "");
      setMotivoConsulta(patientToEdit.motivo_consulta || "");
      setNotasGenerales(patientToEdit.notas_generales || "");
      setEstado(patientToEdit.estado || "activo");
    } else {
      setNombre("");
      setEmail("");
      setTelefono("");
      setFechaNacimiento("");
      setMotivoConsulta("");
      setNotasGenerales("");
      setEstado("activo");
    }
    setError(null);
  }, [patientToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (patientToEdit) {
        const updated = await ClinicService.updatePatient(patientToEdit.id, {
          nombre,
          email: email || null,
          telefono: telefono || null,
          fecha_nacimiento: fechaNacimiento || null,
          motivo_consulta: motivoConsulta || null,
          notas_generales: notasGenerales || null,
          estado,
        });
        onSuccess(updated);
      } else {
        const created = await ClinicService.createPatient({
          nombre,
          email: email || null,
          telefono: telefono || null,
          fecha_nacimiento: fechaNacimiento || null,
          motivo_consulta: motivoConsulta || null,
          notas_generales: notasGenerales || null,
          estado,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar el paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientToEdit ? "Editar Ficha de Paciente" : "Registrar Nuevo Paciente"}
      description="Completa la información clínica y de contacto del paciente."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Nombre Completo *"
              placeholder="Ej. Laura Sánchez Mendoza"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="laura@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Teléfono / WhatsApp"
            type="tel"
            placeholder="+34 600 000 000"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Estado Terapéutico
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as PatientStatus)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="activo">En Tratamiento Activo</option>
              <option value="inactivo">Inactivo / Pausa</option>
              <option value="alta">Alta Terapéutica</option>
            </select>
          </div>
        </div>

        <Textarea
          label="Motivo Principal de Consulta"
          placeholder="Describe brevemente la razón por la que acude a terapia psicológica..."
          rows={3}
          value={motivoConsulta}
          onChange={(e) => setMotivoConsulta(e.target.value)}
        />

        <Textarea
          label="Notas Generales / Antecedentes de Interés"
          placeholder="Alergias, medicación previa, canal de derivación, personas de contacto..."
          rows={3}
          value={notasGenerales}
          onChange={(e) => setNotasGenerales(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {patientToEdit ? "Guardar Cambios" : "Crear Paciente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

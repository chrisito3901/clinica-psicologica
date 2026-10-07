"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClinicService } from "@/lib/services/clinicService";
import { UserProfile } from "@/types/database";
import { User, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";

interface SecretaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export function SecretaryModal({
  isOpen,
  onClose,
  onSuccess,
}: SecretaryModalProps) {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setNombre("");
      setEmail("");
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await ClinicService.createSecretary({
        nombre,
        email,
        password,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la cuenta de la secretaría.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Acceso para Secretaría / Asistente"
      description="Vincula una cuenta de secretaria a tu consultorio para gestionar citas y pacientes."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5 text-sky-800">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            Permisos de la Secretaría:
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-slate-600 text-[11px]">
            <li>Podrá agendar, reprogramar y cancelar citas en tu agenda.</li>
            <li>Podrá crear y actualizar datos de contacto de tus pacientes.</li>
            <li className="font-semibold text-rose-700">
              No tendrá acceso a notas de sesión, expedientes ni diagnósticos clínicos (Secreto Profesional).
            </li>
          </ul>
        </div>

        <Input
          label="Nombre Completo de la Secretaría *"
          placeholder="Ej. María Elena Delgado"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          icon={<User className="w-4 h-4" />}
        />

        <Input
          label="Correo Electrónico de Acceso *"
          type="email"
          placeholder="secretaria@tudominio.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Contraseña Inicial *"
          type="password"
          placeholder="Mínimo 6 caracteres"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Crear y Vincular Acceso
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClinicService } from "@/lib/services/clinicService";
import { UserProfile, UserRole } from "@/types/database";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  Mail,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { SecretaryModal } from "@/components/team/SecretaryModal";

export default function TeamPage() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [secretaries, setSecretaries] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [currentProfile, secs] = await Promise.all([
        ClinicService.getCurrentProfile(),
        ClinicService.getSecretaries(),
      ]);
      setProfile(currentProfile);
      setSecretaries(secs);
    } catch (err) {
      console.error("Error loading team data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleRoleChanged = () => {
      loadData();
    };
    window.addEventListener("demo-role-changed", handleRoleChanged);
    return () => {
      window.removeEventListener("demo-role-changed", handleRoleChanged);
    };
  }, [loadData]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Revocar acceso a ${name}? Ya no podrá gestionar citas ni pacientes.`)) {
      try {
        await ClinicService.deleteSecretary(id);
        loadData();
      } catch (err) {
        console.error("Error revoking secretary:", err);
      }
    }
  };

  const isPsychologist = profile?.rol === "psicologo";

  return (
    <AppLayout>
      <Header
        title="Equipo y Secretaría"
        subtitle="Gestión de roles y accesos asistenciales para la clínica"
        actions={
          isPsychologist ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Secretaría</span>
            </Button>
          ) : undefined
        }
      />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        {/* BANNER INFORMATIVO DE CONFIDENCIALIDAD Y SEPARACIÓN DE ROLES */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-700 via-sky-800 to-teal-800 text-white p-6 sm:p-8 shadow-md space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-sky-100">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Seguridad Clínica & Secreto Profesional</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {isPsychologist
              ? "Tu consultorio cuenta con segregación estricta de datos"
              : "Panel Asistencial de Secretaría"}
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-3xl">
            {isPsychologist
              ? "Tu secretaria puede ayudarte a registrar pacientes y gestionar tu agenda sin comprometer el secreto terapéutico. Las notas de evolución y diagnósticos están cifrados para tu exclusivo acceso."
              : "Tienes acceso para registrar pacientes, responder llamadas y programar citas en la agenda del especialista. El expediente clínico confidencial permanece protegido."}
          </p>
        </div>

        {/* COMPARATIVA DE PRIVILEGIOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 border-l-4 border-l-sky-500 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                Rol: Psicólogo(a) Titular
              </h4>
              <Badge variant="info">Control Total</Badge>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Directorio y fichas completas de pacientes.</li>
              <li>Agenda, horarios y citas sincronizadas.</li>
              <li className="font-semibold text-sky-700">
                Redacción y consulta de Notas de Sesión y Diagnósticos clínicos.
              </li>
              <li>Crear y gestionar accesos para su secretaría.</li>
            </ul>
          </Card>

          <Card className="p-5 border-l-4 border-l-teal-500 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                Rol: Secretaría / Asistente
              </h4>
              <Badge variant="success">Asistencial</Badge>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Crear y actualizar datos de contacto de pacientes.</li>
              <li>Agendar, mover y cancelar citas en la agenda del psicólogo.</li>
              <li>Sincronizar citas con Google Calendar.</li>
              <li className="text-rose-600 font-semibold">
                🔒 Bloqueo ético: Sin acceso a notas de sesión ni diagnósticos.
              </li>
            </ul>
          </Card>
        </div>

        {/* LISTADO DE SECRETARIAS VINCULADAS */}
        {isPsychologist && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  <span>Cuentas de Secretaría Vinculadas ({secretaries.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Personas autorizadas para gestionar tu recepción y citas
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                <span>Nueva Secretaria</span>
              </Button>
            </div>

            {loading ? (
              <Card className="p-12 text-center text-slate-400 text-sm">
                Cargando equipo...
              </Card>
            ) : secretaries.length === 0 ? (
              <Card className="p-10 text-center border-dashed border-2 bg-slate-50/50 space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="font-semibold text-sm text-slate-800">
                  Aún no tienes una secretaria vinculada
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Crea una cuenta para tu secretaria o asistente para delegar la gestión telefónica y la programación de citas.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Acceso Ahora</span>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secretaries.map((sec) => (
                  <Card
                    key={sec.id}
                    className="p-5 flex items-start justify-between gap-3 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {sec.nombre ? sec.nombre.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800">
                            {sec.nombre || "Secretaría"}
                          </h4>
                          <Badge variant="success">Vinculada</Badge>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sec.email}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Asignada el {new Date(sec.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(sec.id, sec.nombre || sec.email)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Revocar acceso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SecretaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </AppLayout>
  );
}

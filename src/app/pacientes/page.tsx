"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClinicService } from "@/lib/services/clinicService";
import { Patient, PatientStatus } from "@/types/database";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { Modal } from "@/components/ui/modal";

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("todos");

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = React.useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const fetchPatients = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await ClinicService.getPatients(search, statusFilter);
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleEdit = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient(p);
    setIsFormModalOpen(true);
  };

  const handleDeletePrompt = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingPatient(p);
  };

  const confirmDelete = async () => {
    if (!deletingPatient) return;
    try {
      setDeleteLoading(true);
      await ClinicService.deletePatient(deletingPatient.id);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const getStatusBadge = (estado: PatientStatus) => {
    switch (estado) {
      case "activo":
        return <Badge variant="success">En Tratamiento</Badge>;
      case "inactivo":
        return <Badge variant="warning">En Pausa</Badge>;
      case "alta":
        return <Badge variant="info">Alta Médica</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  return (
    <AppLayout>
      <Header
        title="Directorio de Pacientes"
        subtitle={`Administra las fichas y expedientes clínicos (${patients.length} registrados)`}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingPatient(null);
              setIsFormModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Estado:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="todos">Todos los pacientes</option>
              <option value="activo">En Tratamiento Activo</option>
              <option value="inactivo">En Pausa</option>
              <option value="alta">Alta Terapéutica</option>
            </select>
          </div>
        </div>

        {/* LISTADO DE PACIENTES */}
        {loading ? (
          <Card className="p-16 text-center text-slate-400 text-sm">
            Cargando directorio de pacientes...
          </Card>
        ) : patients.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 bg-slate-50/50">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-semibold text-slate-800">
              No se encontraron pacientes
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {search
                ? "No hay resultados para tu búsqueda. Intenta con otro término."
                : "Aún no tienes pacientes registrados en tu clínica. Crea el primero ahora."}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingPatient(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Paciente</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {patients.map((patient) => {
              const age = calculateAge(patient.fecha_nacimiento);

              return (
                <Card
                  key={patient.id}
                  className="flex flex-col justify-between hover:border-sky-300 transition-all hover:shadow-md group"
                >
                  <div className="space-y-4">
                    {/* Header del card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-sky-100/70 text-sky-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {patient.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-base leading-tight group-hover:text-sky-600 transition-colors">
                            {patient.nombre}
                          </h4>
                          {age !== null && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {age} años • {patient.fecha_nacimiento}
                            </p>
                          )}
                        </div>
                      </div>

                      {getStatusBadge(patient.estado)}
                    </div>

                    {/* Datos de contacto */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      {patient.telefono && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{patient.telefono}</span>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Motivo de consulta */}
                    {patient.motivo_consulta && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <p className="font-semibold text-slate-700 mb-0.5">
                          Motivo de consulta:
                        </p>
                        <p className="text-slate-600 line-clamp-2">
                          {patient.motivo_consulta}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones del card */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/pacientes/${patient.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 group/btn"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ver Expediente</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleEdit(patient, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                        title="Editar paciente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePrompt(patient, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar paciente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Paciente */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPatient(null);
        }}
        patientToEdit={editingPatient}
        onSuccess={() => {
          fetchPatients();
        }}
      />

      {/* Modal Confirmación de Eliminación */}
      <Modal
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        title="¿Eliminar paciente?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Esta acción es irreversible</p>
              <p className="mt-0.5">
                Se eliminará la ficha de{" "}
                <span className="font-bold">{deletingPatient?.nombre}</span> junto con todas sus citas asociadas y su historial clínico.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setDeletingPatient(null)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={deleteLoading}
            >
              Sí, eliminar paciente
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

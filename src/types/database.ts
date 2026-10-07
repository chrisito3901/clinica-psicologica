export type PatientStatus = 'activo' | 'inactivo' | 'alta';
export type AppointmentStatus = 'programada' | 'completada' | 'cancelada' | 'no_asistio';

export interface Patient {
  id: string;
  user_id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  motivo_consulta: string | null;
  notas_generales: string | null;
  estado: PatientStatus;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  estado: AppointmentStatus;
  motivo: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  // Campos anidados para vistas y joins
  patients?: Pick<Patient, 'id' | 'nombre' | 'email' | 'telefono'>;
}

export interface SessionNote {
  id: string;
  user_id: string;
  patient_id: string;
  appointment_id: string | null;
  fecha: string;
  observaciones: string;
  diagnostico_preliminar: string | null;
  tareas_recomendaciones: string | null;
  created_at: string;
  updated_at: string;
}

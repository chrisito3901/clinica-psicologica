import { createClient } from "@/lib/supabase/client";
import { Patient, Appointment, SessionNote, PatientStatus, AppointmentStatus } from "@/types/database";

// ==============================================================================
// DATOS EXCLUSIVOS PARA MODO DEMOSTRACIÓN (SOLO SI NO HAY USUARIO AUTENTICADO)
// ==============================================================================
const DEMO_PATIENTS: Patient[] = [
  {
    id: "demo-p1",
    user_id: "demo-user",
    nombre: "Sofía Martínez Ruiz",
    email: "sofia.martinez@email.com",
    telefono: "+34 612 345 678",
    fecha_nacimiento: "1994-05-14",
    motivo_consulta: "Episodios recurrentes de ansiedad laboral y dificultades para conciliar el sueño.",
    notas_generales: "Paciente comprometida, acude por recomendación médica. Realiza ejercicios de respiración.",
    estado: "activo",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-p2",
    user_id: "demo-user",
    nombre: "Carlos Eduardo Gómez",
    email: "carlos.gomez@email.com",
    telefono: "+34 689 456 123",
    fecha_nacimiento: "1988-11-20",
    motivo_consulta: "Gestión del duelo y adaptación a cambios familiares recientes.",
    notas_generales: "Expresa buena receptividad a reestructuración cognitiva. Sesión quincenal.",
    estado: "activo",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-p3",
    user_id: "demo-user",
    nombre: "Elena Valenzuela Castro",
    email: "elena.v@email.com",
    telefono: "+34 655 789 012",
    fecha_nacimiento: "2001-02-08",
    motivo_consulta: "Baja autoestima, autoexigencia académica y bloqueo ante exámenes.",
    notas_generales: "Estudiante universitaria. Progreso favorable en asertividad.",
    estado: "activo",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-p4",
    user_id: "demo-user",
    nombre: "Javier Morales Sotomayor",
    email: "j.morales@email.com",
    telefono: "+34 620 987 654",
    fecha_nacimiento: "1979-08-30",
    motivo_consulta: "Terapia de manejo de ira e impulsividad en entorno laboral.",
    notas_generales: "Completó ciclo de 12 sesiones con objetivos cumplidos.",
    estado: "alta",
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const today = new Date();
const todayDateStr = today.toISOString().split("T")[0];

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "demo-a1",
    user_id: "demo-user",
    patient_id: "demo-p1",
    fecha_hora: `${todayDateStr}T10:00:00`,
    duracion_minutos: 50,
    estado: "programada",
    motivo: "Sesión 4: Evaluación de registro de pensamientos automáticos",
    notas: "Revisar diario de ansiedad y escala de activación.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patients: {
      id: "demo-p1",
      nombre: "Sofía Martínez Ruiz",
      email: "sofia.martinez@email.com",
      telefono: "+34 612 345 678",
    },
  },
  {
    id: "demo-a2",
    user_id: "demo-user",
    patient_id: "demo-p2",
    fecha_hora: `${todayDateStr}T16:30:00`,
    duracion_minutos: 50,
    estado: "programada",
    motivo: "Sesión 2: Estrategias de afrontamiento y red de apoyo",
    notas: "Continuar con desahogo emocional y rituales de cierre.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patients: {
      id: "demo-p2",
      nombre: "Carlos Eduardo Gómez",
      email: "carlos.gomez@email.com",
      telefono: "+34 689 456 123",
    },
  },
  {
    id: "demo-a3",
    user_id: "demo-user",
    patient_id: "demo-p3",
    fecha_hora: new Date(Date.now() + 86400000).toISOString().split("T")[0] + "T11:00:00",
    duracion_minutos: 50,
    estado: "programada",
    motivo: "Sesión 3: Reestructuración de creencias limitantes",
    notas: "Traerá listado de autocríticas.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patients: {
      id: "demo-p3",
      nombre: "Elena Valenzuela Castro",
      email: "elena.v@email.com",
      telefono: "+34 655 789 012",
    },
  },
];

const DEMO_SESSION_NOTES: SessionNote[] = [
  {
    id: "demo-n1",
    user_id: "demo-user",
    patient_id: "demo-p1",
    appointment_id: null,
    fecha: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    observaciones: "La paciente reporta menor frecuencia de ataques de pánico (de 4 semanales a 1 leve). Logró identificar disparadores principales en reuniones con su superior.",
    diagnostico_preliminar: "Trastorno de Ansiedad Generalizada (F41.1) con sintomatología somática moderada.",
    tareas_recomendaciones: "Continuar registro ABC cognitivo. Practicar respiración diafragmática 10 min antes de entrar al trabajo. Limitar cafeína a 1 taza matutina.",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "demo-n2",
    user_id: "demo-user",
    patient_id: "demo-p1",
    appointment_id: null,
    fecha: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    observaciones: "Primera entrevista clínica. Paciente colaboradora, muestra afecto congruente con llanto contenido al hablar de su carga de trabajo. Buena alianza terapéutica.",
    diagnostico_preliminar: "Ansiedad reactiva por estrés laboral.",
    tareas_recomendaciones: "Fijar horario de desconexión digital después de las 20:00 h. Comenzar diario emocional.",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "demo-n3",
    user_id: "demo-user",
    patient_id: "demo-p2",
    appointment_id: null,
    fecha: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    observaciones: "El paciente expresa dificultad para expresar tristeza ante su familia por sentir que 'debe ser el fuerte'. Se valida su proceso de duelo.",
    diagnostico_preliminar: "Reacción al estrés agudo / Proceso de duelo no patológico.",
    tareas_recomendaciones: "Escritura de carta no enviada para canalizar emociones reprimidas. Caminatas al aire libre 3 veces por semana.",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Almacenamiento local en memoria ÚNICAMENTE si no hay sesión autenticada
let memoryPatients = [...DEMO_PATIENTS];
let memoryAppointments = [...DEMO_APPOINTMENTS];
let memorySessionNotes = [...DEMO_SESSION_NOTES];

export const ClinicService = {
  // ==========================================
  // PACIENTES
  // ==========================================
  async getPatients(search?: string, status?: string): Promise<Patient[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // SI HAY USUARIO AUTENTICADO: Consultar estrictamente Supabase
    if (user) {
      let query = supabase
        .from("patients")
        .select("*")
        .order("nombre", { ascending: true });

      if (status && status !== "todos") {
        query = query.eq("estado", status);
      }
      if (search) {
        query = query.ilike("nombre", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error al consultar pacientes en Supabase:", error.message);
        return [];
      }
      // Si el usuario no tiene pacientes aún, retorna arreglo vacío (Clean Slate)
      return (data || []) as Patient[];
    }

    // SI ES MODO DEMO (Sin usuario autenticado): Usar datos de demostración
    let result = [...memoryPatients];
    if (status && status !== "todos") {
      result = result.filter((p) => p.estado === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.telefono?.includes(q)
      );
    }
    return result;
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener paciente en Supabase:", error.message);
        return null;
      }
      return data as Patient;
    }

    // Modo demo
    return memoryPatients.find((p) => p.id === id) || null;
  },

  async createPatient(patientData: Omit<Patient, "id" | "user_id" | "created_at" | "updated_at">): Promise<Patient> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("patients")
        .insert({
          ...patientData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Patient;
    }

    // Modo demo
    const newPatient: Patient = {
      ...patientData,
      id: "demo-p-" + Date.now(),
      user_id: "demo-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryPatients.unshift(newPatient);
    return newPatient;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("patients")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Patient;
    }

    // Modo demo
    const idx = memoryPatients.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryPatients[idx] = {
        ...memoryPatients[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return memoryPatients[idx];
    }
    throw new Error("Paciente no encontrado");
  },

  async deletePatient(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }

    // Modo demo
    memoryPatients = memoryPatients.filter((p) => p.id !== id);
    memoryAppointments = memoryAppointments.filter((a) => a.patient_id !== id);
    memorySessionNotes = memorySessionNotes.filter((n) => n.patient_id !== id);
  },

  // ==========================================
  // CITAS Y AGENDA
  // ==========================================
  async getTodayAppointments(): Promise<Appointment[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (user) {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (id, nombre, email, telefono)
        `)
        .gte("fecha_hora", startOfDay.toISOString())
        .lte("fecha_hora", endOfDay.toISOString())
        .order("fecha_hora", { ascending: true });

      if (error) {
        console.error("Error al obtener citas de hoy en Supabase:", error.message);
        return [];
      }

      // Si no tiene citas hoy, retorna array vacío
      return (data || []).map((item: any) => ({
        ...item,
        patients: Array.isArray(item.patients) ? item.patients[0] : item.patients,
      })) as Appointment[];
    }

    // Modo demo
    const todayStr = new Date().toISOString().split("T")[0];
    return memoryAppointments.filter((a) => a.fecha_hora.startsWith(todayStr));
  },

  async getAllAppointments(): Promise<Appointment[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (id, nombre, email, telefono)
        `)
        .order("fecha_hora", { ascending: true });

      if (error) {
        console.error("Error al consultar citas en Supabase:", error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        ...item,
        patients: Array.isArray(item.patients) ? item.patients[0] : item.patients,
      })) as Appointment[];
    }

    // Modo demo
    return memoryAppointments;
  },

  async createAppointment(
    data: Omit<Appointment, "id" | "user_id" | "created_at" | "updated_at" | "patients">
  ): Promise<Appointment> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: appt, error } = await supabase
        .from("appointments")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select(`
          *,
          patients (id, nombre, email, telefono)
        `)
        .single();

      if (error) throw new Error(error.message);
      return {
        ...appt,
        patients: Array.isArray(appt.patients) ? appt.patients[0] : appt.patients,
      } as Appointment;
    }

    // Modo demo
    const patient = memoryPatients.find((p) => p.id === data.patient_id);
    const newAppt: Appointment = {
      ...data,
      id: "demo-a-" + Date.now(),
      user_id: "demo-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      patients: patient ? {
        id: patient.id,
        nombre: patient.nombre,
        email: patient.email,
        telefono: patient.telefono,
      } : undefined,
    };
    memoryAppointments.push(newAppt);
    return newAppt;
  },

  async updateAppointmentStatus(id: string, estado: AppointmentStatus): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("appointments")
        .update({ estado, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }

    // Modo demo
    const idx = memoryAppointments.findIndex((a) => a.id === id);
    if (idx !== -1) {
      memoryAppointments[idx].estado = estado;
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }

    // Modo demo
    memoryAppointments = memoryAppointments.filter((a) => a.id !== id);
  },

  // ==========================================
  // NOTAS DE SESIÓN (EXPEDIENTE CLÍNICO)
  // ==========================================
  async getSessionNotesByPatient(patientId: string): Promise<SessionNote[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("session_notes")
        .select("*")
        .eq("patient_id", patientId)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error al obtener notas en Supabase:", error.message);
        return [];
      }
      return (data || []) as SessionNote[];
    }

    // Modo demo
    return memorySessionNotes
      .filter((n) => n.patient_id === patientId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  async getAllSessionNotes(): Promise<SessionNote[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("session_notes")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error al consultar notas generales en Supabase:", error.message);
        return [];
      }
      return (data || []) as SessionNote[];
    }

    // Modo demo
    return memorySessionNotes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  async createSessionNote(
    data: Omit<SessionNote, "id" | "user_id" | "created_at" | "updated_at">
  ): Promise<SessionNote> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: note, error } = await supabase
        .from("session_notes")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return note as SessionNote;
    }

    // Modo demo
    const newNote: SessionNote = {
      ...data,
      id: "demo-n-" + Date.now(),
      user_id: "demo-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memorySessionNotes.unshift(newNote);
    return newNote;
  },

  // ==========================================
  // ESTADÍSTICAS DEL DASHBOARD
  // ==========================================
  async getDashboardStats() {
    const [patients, todayAppointments, allAppointments] = await Promise.all([
      this.getPatients(),
      this.getTodayAppointments(),
      this.getAllAppointments(),
    ]);

    const activePatients = patients.filter((p) => p.estado === "activo").length;

    // Calcular citas de esta semana
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeekAppointments = allAppointments.filter((a) => {
      const d = new Date(a.fecha_hora);
      return d >= startOfWeek && d <= endOfWeek;
    }).length;

    return {
      activePatients,
      totalPatients: patients.length,
      todayAppointmentsCount: todayAppointments.length,
      thisWeekAppointmentsCount: thisWeekAppointments,
      todayAppointments,
    };
  },
};

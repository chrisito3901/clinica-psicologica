-- ==============================================================================
-- SISTEMA DE GESTIÓN PARA CLÍNICA DE PSICOLOGÍA
-- Esquema de Base de Datos y Políticas de Seguridad RLS en Supabase
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PACIENTES (patients)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    fecha_nacimiento DATE,
    motivo_consulta TEXT,
    notas_generales TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'alta')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: CITAS / AGENDA (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 50,
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'no_asistio')),
    motivo TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: NOTAS DE SESIÓN / EXPEDIENTE CLÍNICO (session_notes)
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    observaciones TEXT NOT NULL,
    diagnostico_preliminar TEXT,
    tareas_recomendaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_fecha_hora ON public.appointments(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_session_notes_user_id ON public.session_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_patient_id ON public.session_notes(patient_id);

-- ==============================================================================
-- SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- Cada psicólogo solo puede ver y modificar sus propios datos
-- ==============================================================================

-- Habilitar RLS en cada tabla
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Políticas para 'patients'
CREATE POLICY "Los psicólogos pueden ver solo sus pacientes"
    ON public.patients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden crear sus pacientes"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden actualizar sus pacientes"
    ON public.patients FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden eliminar sus pacientes"
    ON public.patients FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para 'appointments'
CREATE POLICY "Los psicólogos pueden ver solo sus citas"
    ON public.appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden crear sus citas"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden actualizar sus citas"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden eliminar sus citas"
    ON public.appointments FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para 'session_notes'
CREATE POLICY "Los psicólogos pueden ver solo sus notas de sesión"
    ON public.session_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden crear sus notas de sesión"
    ON public.session_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden actualizar sus notas de sesión"
    ON public.session_notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los psicólogos pueden eliminar sus notas de sesión"
    ON public.session_notes FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- HABILITAR REALTIME (Para notificaciones instantáneas de citas y notas)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_notes;

-- ==============================================================================
-- SISTEMA DE GESTIÓN PARA CLÍNICA DE PSICOLOGÍA: MENTESANA
-- Esquema de Base de Datos y Políticas de Seguridad RLS en Supabase
-- Incluye Soporte Multi-Rol: Psicólogo(a) y Secretaría / Asistente
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PERFILES DE USUARIO Y ROLES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    rol VARCHAR(20) DEFAULT 'psicologo' NOT NULL CHECK (rol IN ('psicologo', 'secretaria')),
    psychologist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Vinculación: si es secretaria, apunta a su psicólogo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: PACIENTES (patients)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- ID del psicólogo dueño de la clínica
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

-- 4. TABLA: CITAS / AGENDA (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- ID del psicólogo
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 50,
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'no_asistio')),
    motivo TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: NOTAS DE SESIÓN / EXPEDIENTE CONFIDENCIAL (session_notes)
-- ACCESO ESTRICTAMENTE RESERVADO PARA EL PSICÓLOGO TRATANTE
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- ID del psicólogo
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
-- FUNCIÓN HELPER: OBTENER EL ID DEL PSICÓLOGO ACTIVO
-- Si el usuario es psicólogo, devuelve su propio UID.
-- Si el usuario es secretaria, devuelve el UID del psicólogo al que está vinculada.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_active_psychologist_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (SELECT psychologist_id FROM public.profiles WHERE id = auth.uid() AND rol = 'secretaria'),
    auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol, psychologist_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'psicologo'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'rol' = 'secretaria' THEN (NEW.raw_user_meta_data->>'psychologist_id')::UUID
      ELSE NEW.id
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ÍNDICES PARA ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_psychologist_id ON public.profiles(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_fecha_hora ON public.appointments(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_session_notes_user_id ON public.session_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_patient_id ON public.session_notes(patient_id);

-- ==============================================================================
-- SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
CREATE POLICY "Usuarios pueden ver su propio perfil o el de su equipo"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = psychologist_id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- POLÍTICAS: PACIENTES (Accesible por Psicólogo y su Secretaría vinculada)
CREATE POLICY "Acceso a pacientes del psicólogo activo"
  ON public.patients FOR SELECT
  USING (user_id = public.get_active_psychologist_id());

CREATE POLICY "Creación de pacientes para el psicólogo activo"
  ON public.patients FOR INSERT
  WITH CHECK (user_id = public.get_active_psychologist_id());

CREATE POLICY "Actualización de pacientes del psicólogo activo"
  ON public.patients FOR UPDATE
  USING (user_id = public.get_active_psychologist_id());

CREATE POLICY "Eliminación de pacientes del psicólogo activo"
  ON public.patients FOR DELETE
  USING (user_id = public.get_active_psychologist_id());

-- POLÍTICAS: CITAS (Accesible por Psicólogo y su Secretaría vinculada)
CREATE POLICY "Acceso a citas del psicólogo activo"
  ON public.appointments FOR SELECT
  USING (user_id = public.get_active_psychologist_id());

CREATE POLICY "Creación de citas para el psicólogo activo"
  ON public.appointments FOR INSERT
  WITH CHECK (user_id = public.get_active_psychologist_id());

CREATE POLICY "Actualización de citas del psicólogo activo"
  ON public.appointments FOR UPDATE
  USING (user_id = public.get_active_psychologist_id());

CREATE POLICY "Eliminación de citas del psicólogo activo"
  ON public.appointments FOR DELETE
  USING (user_id = public.get_active_psychologist_id());

-- POLÍTICAS: NOTAS DE SESIÓN (ESTRICTAMENTE CONFIDENCIAL - SOLO EL PSICÓLOGO)
-- La secretaría NO tiene permisos SELECT, INSERT, UPDATE ni DELETE en session_notes.
CREATE POLICY "Solo psicólogo puede ver sus notas clínicas"
  ON public.session_notes FOR SELECT
  USING (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'psicologo')
  );

CREATE POLICY "Solo psicólogo puede crear notas clínicas"
  ON public.session_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'psicologo')
  );

CREATE POLICY "Solo psicólogo puede actualizar sus notas clínicas"
  ON public.session_notes FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'psicologo')
  );

CREATE POLICY "Solo psicólogo puede eliminar sus notas clínicas"
  ON public.session_notes FOR DELETE
  USING (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'psicologo')
  );

-- ==============================================================================
-- REALTIME
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_notes;

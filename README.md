# 🧠 MenteSana - Plataforma de Gestión Clínica para Psicología

SaaS y panel de administración privado diseñado especialmente para psicólogos y terapeutas. Permite gestionar expedientes clínicos, programar sesiones, dar seguimiento a la evolución terapéutica y recibir alertas de citas.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS con paleta calmante clínica
- **Iconos & Componentes:** Lucide React + Componentes accesibles tipo shadcn/ui
- **Backend & Autenticación:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Fechas & Calendario:** `date-fns`

---

## ✨ Características Principales

1. **🔐 Autenticación y Seguridad:**
   - Inicio de sesión y registro protegido con Supabase Auth.
   - Rutas protegidas mediante Middleware de Next.js.
   - Políticas RLS (Row Level Security) para que cada psicólogo acceda exclusivamente a sus datos.
   - Acceso rápido en *Modo Demostración* para explorar la plataforma.

2. **📊 Dashboard Principal:**
   - Sección destacada con las **Citas de Hoy** (recordatorio matutino y diario).
   - Métricas en tiempo real: Pacientes activos, citas del día y citas programadas esta semana.
   - Acciones directas para registrar pacientes o agendar citas.

3. **👥 Directorio de Pacientes (CRUD Completo):**
   - Búsqueda en tiempo real por nombre, teléfono o email.
   - Filtros por estado terapéutico (*En Tratamiento*, *En Pausa*, *Alta Médica*).
   - Cálculo automático de edad según fecha de nacimiento.
   - Modales de creación, edición y confirmación de eliminación.

4. **📝 Expedientes Clínicos y Notas de Sesión:**
   - Línea de tiempo cronológica inversa de sesiones.
   - Registro clínico con: fecha, observaciones de evolución, diagnóstico/hipótesis clínica preliminar y tareas/recomendaciones.
   - Vista de impresión limpia del expediente.
   - Buscador global de notas clínicas en `/notas`.

5. **🗓️ Agenda y Calendario Terapéutico:**
   - Calendario interactivo mensual con selección de día.
   - Indicadores visuales y código de colores por estado (*Programada*, *Completada*, *Cancelada*).
   - Modal para agendar sesiones con duraciones configurables (30, 45, 50, 60 min).

6. **🔔 Sistema de Recordatorios:**
   - **In-App:** Componente de campanita con badge rojo para las citas de hoy y menú desplegable con accesos directos.
   - **Email:** Supabase Edge Function (`supabase/functions/daily-reminder`) preparada para enviar resúmenes por correo electrónico a las 8:00 AM.

---

## 🚀 Despliegue en Vercel

### 1. Variables de Entorno Requeridas en Vercel
En la configuración de tu proyecto en Vercel (**Settings** > **Environment Variables**), agrega:

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto en Supabase (ej. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon de Supabase |

### 2. Configurar Base de Datos en Supabase
Ejecuta el script SQL ubicado en [`supabase/schema.sql`](./supabase/schema.sql) en el **SQL Editor** de tu panel de Supabase.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno en .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) o el puerto asignado en tu navegador.

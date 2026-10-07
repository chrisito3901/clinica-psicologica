import { Appointment } from "@/types/database";

/**
 * Genera una URL de plantilla directa para abrir y guardar en Google Calendar.
 * Funciona en navegadores web y en la app de Google Calendar en móviles (Android e iOS).
 */
export function generateGoogleCalendarUrl(appointment: Appointment): string {
  const startDate = new Date(appointment.fecha_hora);
  const durationMs = (appointment.duracion_minutos || 50) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  // Formato ISO compacto para Google Calendar: YYYYMMDDTHHmmssZ
  const formatGCalDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const patientName = appointment.patients?.nombre || "Paciente";
  const title = encodeURIComponent(`Sesión Psicológica: ${patientName}`);

  const detailsText = [
    `Paciente: ${patientName}`,
    appointment.patients?.telefono ? `Teléfono: ${appointment.patients.telefono}` : "",
    appointment.patients?.email ? `Email: ${appointment.patients.email}` : "",
    appointment.motivo ? `Objetivo / Motivo: ${appointment.motivo}` : "",
    appointment.notas ? `Notas clínicas previas: ${appointment.notas}` : "",
    "",
    "Gestión realizada desde Clínica MenteSana",
  ]
    .filter(Boolean)
    .join("\n");

  const details = encodeURIComponent(detailsText);
  const location = encodeURIComponent("Consultorio Psicológico / Sesión Clínica");

  const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Genera y descarga un archivo estándar .ics compatible con Google Calendar, Apple Calendar y Outlook.
 */
export function downloadIcsFile(appointment: Appointment) {
  const startDate = new Date(appointment.fecha_hora);
  const durationMs = (appointment.duracion_minutos || 50) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const patientName = appointment.patients?.nombre || "Paciente";
  const summary = `Sesión Psicológica: ${patientName}`;
  const description = `Paciente: ${patientName}\\nMotivo: ${appointment.motivo || "Consulta terapéutica"}\\nClínica MenteSana`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MenteSana//Clinica Psicologica//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:appointment-${appointment.id}@mentesana.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M", // Alarma 30 minutos antes en el celular
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de sesión psicológica",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `cita-${patientName.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==============================================================================
// SUPABASE EDGE FUNCTION: RECORDATORIO MATUTINO DE CITAS (8:00 AM)
// ==============================================================================
// Esta función se puede invocar automáticamente todos los días a las 08:00 AM
// mediante pg_cron o un webhook programado de Supabase.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Obtener la fecha de hoy en formato UTC
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Consultar las citas programadas para el día de hoy junto con los datos del paciente y usuario
    const { data: appointments, error: apptError } = await supabase
      .from("appointments")
      .select(`
        id,
        user_id,
        fecha_hora,
        duracion_minutos,
        motivo,
        estado,
        patients (
          nombre,
          telefono,
          email
        )
      `)
      .eq("estado", "programada")
      .gte("fecha_hora", startOfDay.toISOString())
      .lte("fecha_hora", endOfDay.toISOString())
      .order("fecha_hora", { ascending: true });

    if (apptError) {
      throw new Error(`Error consultando citas: ${apptError.message}`);
    }

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hay citas programadas para hoy." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Agrupar citas por psicólogo (user_id)
    const appointmentsByUser: Record<string, typeof appointments> = {};
    for (const appt of appointments) {
      if (!appointmentsByUser[appt.user_id]) {
        appointmentsByUser[appt.user_id] = [];
      }
      appointmentsByUser[appt.user_id].push(appt);
    }

    // 4. Enviar un correo resumen a cada psicólogo
    const results = [];
    for (const userId of Object.keys(appointmentsByUser)) {
      // Obtener el correo del psicólogo desde auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData?.user?.email) {
        console.warn(`No se encontró email para el usuario ${userId}`);
        continue;
      }

      const userEmail = userData.user.email;
      const userAppointments = appointmentsByUser[userId];

      // Formatear la lista de citas en HTML
      const appointmentsListHtml = userAppointments
        .map((a: any) => {
          const time = new Date(a.fecha_hora).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const patientName = a.patients?.nombre || "Paciente";
          const patientPhone = a.patients?.telefono ? `(${a.patients.telefono})` : "";
          const motivo = a.motivo ? `<br><small style="color:#64748b;">Objetivo: ${a.motivo}</small>` : "";

          return `
            <li style="margin-bottom: 12px; padding: 10px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0284c7;">
              <strong>${time}</strong> - <strong>${patientName}</strong> ${patientPhone} ${motivo}
            </li>
          `;
        })
        .join("");

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #0369a1;">☀️ Buenos días, Especialista</h2>
          <p>Tienes <strong>${userAppointments.length} ${userAppointments.length === 1 ? "cita programada" : "citas programadas"}</strong> para el día de hoy:</p>
          <ul style="list-style: none; padding-left: 0;">
            ${appointmentsListHtml}
          </ul>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Recuerda ingresar a tu panel clínico para consultar los expedientes antes de cada sesión.<br>
            <em>Clínica Psicológica MenteSana</em>
          </p>
        </div>
      `;

      // Enviar correo a través de Resend API si la key está configurada
      if (RESEND_API_KEY) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Clínica MenteSana <recordatorios@tudominio.com>",
            to: [userEmail],
            subject: `🗓️ Recordatorio: Tienes ${userAppointments.length} citas hoy`,
            html: emailHtml,
          }),
        });

        const resData = await emailRes.json();
        results.push({ userId, status: "sent", resData });
      } else {
        console.log(`[SIMULACIÓN EMAIL a ${userEmail}]:`);
        console.log(`Citas: ${userAppointments.length}`);
        results.push({ userId, status: "simulated_logged", email: userEmail });
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: appointments.length, results }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

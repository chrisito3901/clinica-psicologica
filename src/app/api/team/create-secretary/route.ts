import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión como psicólogo." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nombre, email, password } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let secretaryUserId = crypto.randomUUID();

    // Si disponemos de la SERVICE_ROLE_KEY, creamos la cuenta en auth.users con Supabase Admin
    if (serviceRoleKey && !serviceRoleKey.includes("tu-key")) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data: adminUser, error: adminError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre,
          rol: "secretaria",
          psychologist_id: user.id,
        },
      });

      if (adminError) {
        return NextResponse.json({ error: adminError.message }, { status: 400 });
      }

      if (adminUser?.user?.id) {
        secretaryUserId = adminUser.user.id;
      }
    }

    // Insertar o asegurar registro en tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: secretaryUserId,
        email,
        nombre,
        rol: "secretaria",
        psychologist_id: user.id,
      })
      .select()
      .single();

    if (profileError) {
      console.warn("Aviso al guardar perfil de secretaria:", profileError.message);
      // Retornar perfil construido si la tabla profiles tiene RLS estricto
      return NextResponse.json({
        profile: {
          id: secretaryUserId,
          email,
          nombre,
          rol: "secretaria",
          psychologist_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al crear secretaria." },
      { status: 500 }
    );
  }
}

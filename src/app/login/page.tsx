"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartHandshake, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message === "Invalid login credentials"
          ? "Correo electrónico o contraseña incorrectos."
          : error.message);
      } else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Permite al psicólogo explorar la interfaz de inmediato
    document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-teal-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Clínica MenteSana
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Sistema privado de gestión de expedientes clínicos, pacientes y agenda psicológica.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </div>
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="psicologo@clinica.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={loading}
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="text-center">
              <span className="text-xs text-slate-500">
                ¿No tienes cuenta de especialista?{" "}
              </span>
              <Link
                href="/register"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Crear cuenta
              </Link>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              className="w-full text-xs text-slate-600 border-dashed"
            >
              Explorar panel en Modo Demostración
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Acceso seguro protegido con Supabase Auth y RLS</span>
        </div>
      </div>
    </div>
  );
}

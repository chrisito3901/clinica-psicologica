"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HeartHandshake } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.replace("/dashboard");
        } else {
          router.replace("/dashboard"); // Permitir explorar el dashboard en modo demo o redirigir
        }
      } catch {
        router.replace("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/20">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">MenteSana</h2>
          <p className="text-xs text-slate-500">Cargando sistema clínico...</p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenteSana | Gestión Clínica de Psicología",
  description: "Plataforma integral para psicólogos: expedientes clínicos, agenda interactiva, notas de evolución y gestión de pacientes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}

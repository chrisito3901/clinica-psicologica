import * as React from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 print:bg-white print:min-h-0">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen print:pl-0 print:min-h-0">
        <main className="flex-1 pb-16 print:pb-0">{children}</main>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 print:hidden">
      <div className="pl-12 lg:pl-0">
        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        <NotificationBell />
      </div>
    </header>
  );
}

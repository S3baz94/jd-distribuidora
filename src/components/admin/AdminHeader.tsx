"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AdminAuthService, AdminUserProfile } from "@/services/authService";
import {
  Menu,
  Download,
  LogOut,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { showToast } = useApp();
  const [currentUser, setCurrentUser] = useState<AdminUserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(AdminAuthService.getCurrentSession());
  }, []);

  const handleLogout = () => {
    AdminAuthService.logout();
    showToast("Sesión administrativa cerrada", "info");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f17]/95 backdrop-blur-2xl text-white border-b border-slate-800 shadow-2xl">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Navigation Links */}
          <div className="flex items-center gap-6">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/admin" className="flex items-center gap-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <img
                  src="/images/branding/logo-jd-comercializadora.png"
                  alt="Logo JD Comercializadora"
                  className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
                />
                <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />
                <img
                  src="/images/branding/logo-ahumados-gourmet-oficial.png"
                  alt="Logo Ahumados Gourmet"
                  className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(220,38,38,0.25)]"
                />
              </div>

              <div>
                <span className="font-bebas text-lg sm:text-xl tracking-wider text-white uppercase block leading-none">
                  JD COMERCIALIZADORA & GOURMET AHUMADOS
                </span>
                <span className="font-caveat text-sm text-gold-400 font-bold block mt-0.5">
                  Panel de Dirección Ejecutiva & Despacho
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Active Profile, Download PC & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active User Profile Badge matching Stitch */}
            <div className="flex items-center gap-2.5 glass-panel px-3 py-1.5 rounded-full border border-white/10 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] inline-block animate-pulse shadow-[0_0_8px_#4edea3]" />
              <div className="text-left">
                <p className="font-extrabold text-white leading-tight">
                  {currentUser?.name || "Dirección General"}
                </p>
                <p className="text-[10px] text-[#4edea3] font-mono leading-tight">
                  {currentUser?.roleTitle || "Administración"}
                </p>
              </div>
            </div>

            {/* Install Desktop App Button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.__triggerPWAInstall) {
                  window.__triggerPWAInstall();
                }
              }}
              className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Descargar e instalar como software de escritorio en Windows"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Instalar PC</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-700/60 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              title="Cerrar sesión administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

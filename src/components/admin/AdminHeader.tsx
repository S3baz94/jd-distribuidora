"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AdminAuthService, AdminUserProfile } from "@/services/authService";
import {
  ShieldAlert,
  RefreshCw,
  Truck,
  UserCheck,
  Menu,
  Receipt,
  Download,
  LogOut,
  User,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const { resetAllDemoData, allOrders, showToast } = useApp();
  const [currentUser, setCurrentUser] = useState<AdminUserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(AdminAuthService.getCurrentSession());
  }, []);

  const handleLogout = () => {
    AdminAuthService.logout();
    showToast("Sesión administrativa cerrada", "info");
    window.location.reload();
  };

  const pendingOrdersCount = allOrders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing"
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-500 text-base tracking-tight shadow-sm">
                JD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white uppercase">
                    Administración
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border border-slate-700">
                    Planta Central
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                  JD Distribuidora & Gourmet Ahumados
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active User Profile Badge */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <div className="text-left">
                  <p className="font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono leading-tight">{currentUser.roleTitle}</p>
                </div>
              </div>
            )}

            {/* Pending orders quick badge */}
            {pendingOrdersCount > 0 && (
              <Link
                href="/admin/pedidos"
                className="flex items-center gap-1.5 bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
                title="Pedidos pendientes de atención"
              >
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>{pendingOrdersCount} en curso</span>
              </Link>
            )}

            {/* POS Facturación shortcut */}
            <Link
              href="/admin/facturacion"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
              title="Módulo de Facturación & POS"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Facturación POS</span>
              <span className="lg:hidden">POS</span>
            </Link>

            {/* Install Desktop App Button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.__triggerPWAInstall) {
                  window.__triggerPWAInstall();
                }
              }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
              title="Instalar como software nativo de escritorio en Windows"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Instalar en PC</span>
              <span className="xl:hidden">Instalar</span>
            </button>

            {/* Reset Demo button */}
            <button
              onClick={resetAllDemoData}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors"
              title="Reiniciar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
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

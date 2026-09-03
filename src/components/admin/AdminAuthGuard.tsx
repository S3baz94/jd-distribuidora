"use client";

import React, { useState, useEffect } from "react";
import { AdminAuthService, AdminUserProfile, ADMIN_USERS } from "@/services/authService";
import { Lock, KeyRound, ShieldCheck, ArrowRight, Building2, AlertCircle } from "lucide-react";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const session = AdminAuthService.getCurrentSession();
    setCurrentUser(session);
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMessage("");

    const result = AdminAuthService.login(password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setPassword("");
    } else {
      setErrorMessage(result.error || "Contraseña incorrecta");
    }
    setIsLoggingIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Verificando acceso a Dirección...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, render children
  if (currentUser) {
    return <>{children}</>;
  }

  // Otherwise, render single-profile login form with Stitch Obsidian Glass
  return (
    <div className="min-h-screen bg-[#051424] flex items-center justify-center p-4 text-white font-sans selection:bg-[#4edea3] selection:text-[#051424]">
      <div className="max-w-md w-full glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-slate-950 text-2xl tracking-tight mb-4 shadow-xl shadow-emerald-950/50">
          JD
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d1c2d] border border-white/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso a Dirección Ejecutiva</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Administración Central
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          JD Distribuidora B2B & Gourmet Ahumados
        </p>

        {/* Single Profile Badge Card */}
        <div className="p-3.5 rounded-2xl bg-[#0d1c2d]/80 border border-white/10 flex items-center justify-between gap-3 text-left mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center text-xs font-black">
              DIR
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Perfil Autorizado</span>
              <p className="text-xs font-bold text-white">Dirección General</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40 font-mono">
            ● Activo
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Contraseña de Dirección:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu clave (direccion2026)..."
                required
                autoFocus
                className="w-full bg-[#08101a] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all tracking-wide"
          >
            <span>INGRESAR A ADMINISTRACIÓN</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            type="button"
            onClick={() => {
              const res = AdminAuthService.login("direccion2026");
              if (res.success && res.user) {
                setCurrentUser(res.user);
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>⚡ Ingreso Rápido (Clave: direccion2026)</span>
          </button>
        </form>
      </div>
    </div>
  );
};

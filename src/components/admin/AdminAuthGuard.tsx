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

  // Otherwise, render single-profile login form
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white selection:bg-brand-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80 relative overflow-hidden text-center">
        {/* Glow Header */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-2xl tracking-tighter shadow-xl shadow-amber-950/40 mb-3">
          JD
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-[10px] font-black uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Acceso Restringido
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
          ADMINISTRACIÓN
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          JD Distribuidora Cárnica & Gourmet Ahumados
        </p>

        {/* Single Profile Badge Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-left mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30 text-lg">
              🏢
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Perfil Autorizado</span>
              <p className="text-sm font-black text-white">Dirección</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            ● Activo
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-400" /> Contraseña de Dirección:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la clave de acceso..."
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono tracking-wider"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-brand-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <span>INGRESAR A ADMINISTRACIÓN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Hint */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Clave predeterminada: <span className="font-mono text-slate-400 font-bold">direccion2026</span>
          </p>
        </div>
      </div>
    </div>
  );
};

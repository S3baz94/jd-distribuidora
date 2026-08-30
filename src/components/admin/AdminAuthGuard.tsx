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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative text-center">
        {/* Logo */}
        <div className="w-14 h-14 mx-auto rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-bold text-amber-500 text-xl tracking-tight mb-4 shadow-sm">
          JD
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3 h-3 text-slate-400" /> Acceso Administrativo
        </div>

        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Administración Central
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          JD Distribuidora & Gourmet Ahumados
        </p>

        {/* Single Profile Badge Card */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-left mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center text-xs font-semibold">
              DIR
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Perfil</span>
              <p className="text-xs font-semibold text-slate-200">Dirección General</p>
            </div>
          </div>
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-mono">
            ● Activo
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Contraseña de Acceso:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu clave..."
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-white font-semibold text-xs border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>INGRESAR A ADMINISTRACIÓN</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </form>

        {/* Demo Hint */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Clave predeterminada: <span className="font-mono text-slate-400 font-medium">direccion2026</span>
          </p>
        </div>
      </div>
    </div>
  );
};

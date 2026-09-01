"use client";

import React, { useState } from "react";
import {
  OperationsAuthService,
  OperationsUserProfile,
  OPERATIONS_USERS,
} from "@/services/authService";
import {
  Truck,
  Scale,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  ThermometerSnowflake,
  Boxes,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface OperationsAuthGateProps {
  onAuthenticated: (user: OperationsUserProfile) => void;
}

export const OperationsAuthGate: React.FC<OperationsAuthGateProps> = ({
  onAuthenticated,
}) => {
  const [selectedRole, setSelectedRole] = useState<"operador" | "domiciliario">("operador");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProfile = OPERATIONS_USERS.find((u) => u.role === selectedRole) || OPERATIONS_USERS[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const result = OperationsAuthService.login(selectedRole, password);
    if (result.success && result.user) {
      onAuthenticated(result.user);
    } else {
      setErrorMsg(result.error || "Contraseña incorrecta. Verifique sus credenciales.");
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (role: "operador" | "domiciliario") => {
    const demoPass = role === "operador" ? "operador2026" : "domiciliario2026";
    const result = OperationsAuthService.login(role, demoPass);
    if (result.success && result.user) {
      onAuthenticated(result.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-brand-500/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>ACCESO OPERATIVO • CONTROL TOTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Herramienta de Operación
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Selecciona tu perfil de trabajo para acceder a tus pantallas operativas especializadas
          </p>
        </div>

        {/* 1. Selector de Perfiles Operativos */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 block">
            1. Selecciona tu Rol Operativo:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción 1: Operador de Planta */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole("operador");
                setErrorMsg("");
                setPassword("");
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                selectedRole === "operador"
                  ? "bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/50"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
                  👷
                </div>
                {selectedRole === "operador" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>

              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>Operador de Planta</span>
                </h3>
                <p className="text-[11px] text-emerald-300/90 font-medium leading-snug mt-1">
                  Alistamiento, Báscula digital, Precintos INVIMA, Inventario Frío y Cargas a furgones
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Clave: operador2026</span>
                {selectedRole === "operador" && (
                  <span className="text-emerald-400 font-bold">Seleccionado ✓</span>
                )}
              </div>
            </button>

            {/* Opción 2: Domiciliario / Conductor */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole("domiciliario");
                setErrorMsg("");
                setPassword("");
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                selectedRole === "domiciliario"
                  ? "bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-950/50"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl">
                  🚚
                </div>
                {selectedRole === "domiciliario" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>

              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>Domiciliario / Ruta</span>
                </h3>
                <p className="text-[11px] text-amber-300/90 font-medium leading-snug mt-1">
                  Hoja de Ruta GPS (5 paradas), Waze/Maps, Entrega con Firma, Cobro, Canastillas y Gastos
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Clave: domiciliario2026</span>
                {selectedRole === "domiciliario" && (
                  <span className="text-amber-400 font-bold">Seleccionado ✓</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 2. Formulario de Contraseña */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-400" />
                <span>2. Contraseña para {activeProfile.name}:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({selectedRole === "operador" ? "operador2026" : "domiciliario2026"})
              </span>
            </label>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Escribe la contraseña de ${selectedRole}...`}
                autoFocus
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono font-bold focus:outline-none focus:border-brand-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botón Principal de Ingreso */}
          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${
              selectedRole === "operador"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/60"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>INGRESAR A PANTALLAS DE {selectedRole.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* 3. Acceso Rápido con 1 Clic (Para pruebas y agilidad en planta) */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ingreso rápido de demostración:</span>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("operador")}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1"
            >
              <span>👷 Entrar como Operador</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("domiciliario")}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 hover:text-amber-300 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1"
            >
              <span>🚚 Entrar como Domiciliario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

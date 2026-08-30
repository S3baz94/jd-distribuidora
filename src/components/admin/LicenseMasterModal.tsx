"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  X,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface LicenseMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseMasterModal: React.FC<LicenseMasterModalProps> = ({ isOpen, onClose }) => {
  const {
    license,
    toggleRemoteLock,
    extendLicenseDays,
    updateLicenseConfig,
    verifyDeveloperPin,
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [customDays, setCustomDays] = useState(30);
  const [customReason, setCustomReason] = useState(license.lockReason || "");

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyDeveloperPin(pinInput)) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleToggleLock = (targetLocked: boolean) => {
    toggleRemoteLock(targetLocked, customReason);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Panel Maestro de Licencia</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Solo Desarrollador
              </span>
            </h2>
            <p className="text-xs text-slate-400">Control de Acceso Remoto & Kill-Switch Anti-Mora</p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Authentication step */
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-white mb-1">🔐 Acceso Reservado para Sebastián:</p>
              <p className="text-slate-400">
                Ingresa tu PIN Maestro de 4 dígitos para gestionar el estado de servicio de la empresa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                PIN Maestro:
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="****"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-brand-500"
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-1.5 font-semibold text-center">
                  PIN incorrecto. Ingresa el código maestro de desarrollador.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-950/40 transition-all"
            >
              Ingresar al Control de Licencia
            </button>
          </form>
        ) : (
          /* Master Controls */
          <div className="space-y-5">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Estado Actual del Software:</span>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                    license.isLocked || license.status === "suspended"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      : license.status === "grace_period"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {license.isLocked || license.status === "suspended"
                    ? "🔴 SUSPENDIDO (BLOQUEADO)"
                    : license.status === "grace_period"
                    ? "🟡 EN GRACIA"
                    : "🟢 100% ACTIVO & OPERATIVO"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Licenciado a:</span>
                  <span className="font-bold text-white truncate block">{license.licensedTo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vigencia hasta:</span>
                  <span className="font-mono text-white">
                    {new Date(license.validUntil).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Master Switch Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">
                Acción de Bloqueo Inmediato (Kill-Switch):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleLock(false)}
                  disabled={!license.isLocked && license.status === "active"}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                    !license.isLocked && license.status === "active"
                      ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400 opacity-60 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-950/40"
                  }`}
                >
                  <Unlock className="w-4 h-4" /> Desbloquear / Activar
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleLock(true)}
                  disabled={license.isLocked || license.status === "suspended"}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                    license.isLocked || license.status === "suspended"
                      ? "bg-rose-600/20 border-rose-500/40 text-rose-400 opacity-60 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-950/40 animate-pulse"
                  }`}
                >
                  <Lock className="w-4 h-4" /> BLOQUEAR ACCESO
                </button>
              </div>
            </div>

            {/* Extend Validity */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" /> Extender Vigencia de Licencia:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => extendLicenseDays(15)}
                  className="flex-1 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  +15 Días
                </button>
                <button
                  type="button"
                  onClick={() => extendLicenseDays(30)}
                  className="flex-1 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  +30 Días
                </button>
                <button
                  type="button"
                  onClick={() => extendLicenseDays(90)}
                  className="flex-1 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  +90 Días
                </button>
              </div>
            </div>

            {/* Lock Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Mensaje visible para la empresa en caso de bloqueo:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                placeholder="Motivo de suspensión..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Cerrar Panel Maestro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

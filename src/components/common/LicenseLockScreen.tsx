"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ShieldAlert, Lock, KeyRound, PhoneCall, Mail, CheckCircle2, ArrowRight } from "lucide-react";

export const LicenseLockScreen: React.FC = () => {
  const { license, verifyDeveloperPin, toggleRemoteLock, extendLicenseDays } = useApp();
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  if (!license.isLocked && license.status !== "suspended") {
    return null;
  }

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyDeveloperPin(pinInput)) {
      setUnlockedSuccess(true);
      setTimeout(() => {
        toggleRemoteLock(false);
        extendLicenseDays(30);
        setShowDeveloperModal(false);
        setPinInput("");
        setUnlockedSuccess(false);
      }, 1000);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 text-white select-none">
      <div className="max-w-xl w-full bg-slate-900 border-2 border-rose-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/60 relative overflow-hidden text-center">
        {/* Glow Header */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-6 shadow-inner animate-pulse">
          <Lock className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> Acceso Suspendido por Licencia
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
          Servicio Temporalmente Inactivo
        </h1>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {license.lockReason ||
            "El acceso al sistema operativo de administración, planta y furgones se encuentra pausado por estado de cuenta o licenciamiento comercial."}
        </p>

        {/* Info Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Entidad Licenciada:</span>
            <span className="font-bold text-white">{license.licensedTo}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Plan de Software:</span>
            <span className="font-semibold text-rose-300">{license.planName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Estado de Licencia:</span>
            <span className="font-black text-rose-400 uppercase bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
              SUSPENDIDO
            </span>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="space-y-3 mb-6">
          <a
            href={`https://wa.me/${license.contactDeveloperPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hola Sebastián, te contacto desde ${license.clientName} para gestionar el pago y reactivación del software de administración.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-950/40 transition-all"
          >
            <PhoneCall className="w-4 h-4" /> Contactar a Soporte / Pagos por WhatsApp
          </a>

          <a
            href={`mailto:${license.contactDeveloperEmail}?subject=Reactivación%20Software%20JD%20Distribuidora`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700"
          >
            <Mail className="w-3.5 h-3.5" /> {license.contactDeveloperEmail}
          </a>
        </div>

        {/* Hidden Developer Unlock Link */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Desarrollado y Administrado por Sebastián</span>
          <button
            onClick={() => setShowDeveloperModal(true)}
            className="hover:text-slate-300 underline underline-offset-2 flex items-center gap-1 font-mono transition-colors"
          >
            <KeyRound className="w-3 h-3" /> Llave Maestra
          </button>
        </div>
      </div>

      {/* Developer Master PIN Modal */}
      {showDeveloperModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Desbloqueo de Desarrollador</h3>
                <p className="text-xs text-slate-400">Ingresa tu PIN Maestro de Control</p>
              </div>
            </div>

            {unlockedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Acceso Restablecido con Éxito
              </div>
            ) : (
              <form onSubmit={handleUnlockWithPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PIN Maestro (Sebastián):
                  </label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="****"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-brand-500"
                  />
                  {pinError && (
                    <p className="text-xs text-rose-400 mt-1.5 font-semibold text-center">
                      PIN incorrecto. Acceso restringido.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeveloperModal(false);
                      setPinInput("");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-950/40"
                  >
                    Desbloquear <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share2, PlusSquare, Check } from "lucide-react";

export const InstallAppPrompt: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    if (typeof window !== "undefined") {
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check for iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));

      // Listen for Android install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating or Top Install Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-slate-900 border border-brand-500/30 rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 my-2 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white flex-shrink-0 font-black shadow-inner">
            📲
          </div>
          <div>
            <p className="font-extrabold text-white leading-tight">
              Instalar App de Pedidos en tu Celular
            </p>
            <p className="text-[10px] text-slate-300">
              Pide más rápido con 1 toque desde tu pantalla de inicio
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="flex-shrink-0 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
      </div>

      {/* Instructional Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-400" />
                <h3 className="font-black text-sm text-white">
                  Instalar App en tu Celular
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  Para instalar en tu iPhone / iPad:
                </p>
                <ol className="space-y-2 list-decimal list-inside text-slate-300">
                  <li className="flex items-center gap-2">
                    <span>1. Toca el botón <strong>Compartir</strong></span>
                    <Share2 className="w-4 h-4 text-brand-400 inline" />
                  </li>
                  <li className="flex items-center gap-2">
                    <span>2. Selecciona <strong>"Agregar a Inicio"</strong></span>
                    <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                  </li>
                  <li>
                    <span>3. Pulsa <strong>"Agregar"</strong> en la esquina superior.</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  Para instalar en tu Android:
                </p>
                <ol className="space-y-2 list-decimal list-inside text-slate-300">
                  <li>
                    <span>1. Pulsa los <strong>3 puntos (⋮)</strong> en Chrome.</span>
                  </li>
                  <li>
                    <span>2. Toca <strong>"Instalar aplicación"</strong> o "Agregar a pantalla principal".</span>
                  </li>
                  <li>
                    <span>3. ¡Listo! Tendrás el acceso directo para hacer pedidos diarios.</span>
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

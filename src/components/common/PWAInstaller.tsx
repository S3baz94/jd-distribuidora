"use client";

import React, { useEffect, useState } from "react";
import { Download, Monitor, CheckCircle2, X, Laptop, Sparkles, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    __pwaDeferredPrompt?: any;
    __triggerPWAInstall?: () => void;
  }
}

export const PWAInstaller: React.FC = () => {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone window
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Register Service Worker for PWA compliance
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("PWA Service Worker registered"))
        .catch((err) => console.log("PWA SW registration error:", err));
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__pwaDeferredPrompt = e;
      console.log("PWA beforeinstallprompt captured successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Global install trigger function
    window.__triggerPWAInstall = async () => {
      if (window.__pwaDeferredPrompt) {
        const promptEvent = window.__pwaDeferredPrompt;
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the PWA install prompt");
          window.__pwaDeferredPrompt = null;
        }
      } else {
        setShowGuideModal(true);
      }
    };

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <>
      {showGuideModal && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-white animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border-2 border-brand-500/50 rounded-3xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Instalar en este Computador</h3>
                <p className="text-xs text-slate-400">Aplicación Nativa de Escritorio para Windows</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block mb-0.5">En Google Chrome / Edge:</strong>
                  <span>
                    Ubica el icono de instalación <strong>(📥)</strong> o <strong>(⊕)</strong> que aparece en el extremo derecho de la barra de direcciones superior del navegador.
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Haz clic en &quot;Instalar&quot;:</strong>
                  <span>
                    El software se instalará inmediatamente en Windows y creará un acceso directo en tu Escritorio y Barra de Tareas.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.__pwaDeferredPrompt) {
                    window.__pwaDeferredPrompt.prompt();
                  }
                  setShowGuideModal(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-950/50"
              >
                <Download className="w-4 h-4" /> Entendido, Instalar Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { Download, Monitor, CheckCircle2, X, Laptop, ShieldCheck, ArrowRight, Play, FileCode2 } from "lucide-react";

declare global {
  interface Window {
    __pwaDeferredPrompt?: any;
    __triggerPWAInstall?: () => void;
  }
}

export const PWAInstaller: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const startDirectDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = "/downloads/Instalar_JD_Distribuidora_Windows.bat";
      link.download = "Instalar_JD_Distribuidora_Windows.bat";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStarted(true);
    } catch (e) {
      console.error("Error triggering download:", e);
    }
  };

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
      // 1. Immediately trigger the real file download on the computer
      startDirectDownload();

      // 2. Try native PWA prompt if primed in browser
      if (window.__pwaDeferredPrompt) {
        try {
          const promptEvent = window.__pwaDeferredPrompt;
          promptEvent.prompt();
          const choiceResult = await promptEvent.userChoice;
          if (choiceResult.outcome === "accepted") {
            window.__pwaDeferredPrompt = null;
          }
        } catch (err) {
          console.log("PWA prompt error:", err);
        }
      }

      // 3. Open executive confirmation modal
      setShowModal(true);
    };

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 text-white font-sans animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 text-amber-500 flex items-center justify-center font-bold text-lg shadow-sm">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Instalación en Computador</h3>
                <p className="text-xs text-slate-400">JD Distribuidora — Software de Escritorio</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 mb-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-200 block mb-0.5">1. Archivo descargado en tu equipo:</strong>
                  <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                    Instalar_JD_Distribuidora_Windows.bat
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Play className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-200 block mb-0.5">2. Ejecución e Instalación:</strong>
                  <span className="text-slate-400">
                    Abre tu carpeta de <strong>Descargas</strong> en Windows y haz doble clic sobre el archivo para crear el acceso directo oficial en tu Escritorio y abrir la aplicación.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startDirectDownload}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Volver a Descargar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Listo, Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

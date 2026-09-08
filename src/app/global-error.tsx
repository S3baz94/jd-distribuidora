"use client";
import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Excepcion global capturada:", error);
  }, [error]);

  const handleResetSession = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    } catch {
      reset();
    }
  };

  return (
    <html lang="es" className="h-full bg-[#0b0f17]">
      <body className="min-h-full flex items-center justify-center p-4 bg-[#0b0f17] text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
            🥩
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">
              JD Distribuidora & Gourmet
            </h1>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Restauración de Conexión y Datos
            </p>
            <p className="text-sm text-slate-300">
              Se detectó una discrepancia en la memoria de tu navegador. Haz clic en el botón de abajo para sincronizar la versión más reciente.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResetSession}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-950/40 transition-all active:scale-95"
            >
              RESTAURAR Y CONTINUAR AL PORTAL
            </button>

            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Reintentar operación
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

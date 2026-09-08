"use client";

import React, { useEffect } from "react";
import { RotateCcw, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Excepción en cliente capturada por ErrorBoundary:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== "undefined") {
        const keysToRemove = [
          "porcob2b_current_customer",
          "porcob2b_cart",
          "porcob2b_last_order",
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }
    } catch (e) {
      console.warn("No se pudo limpiar el almacenamiento local:", e);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">
            Ha ocurrido una pausa inesperada
          </h1>
          <p className="text-sm text-slate-300">
            El sistema detectó una discrepancia en los datos guardados en tu navegador. Puedes restaurar la sesión rápidamente con un solo clic.
          </p>
        </div>

        {error?.message && (
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-left">
            <p className="text-[11px] font-mono text-slate-400 break-words line-clamp-3">
              Detalle: {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer y Recargar Aplicación</span>
          </button>

          <Link
            href="/"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-2xl transition-colors text-xs flex items-center justify-center gap-2 border border-slate-700"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ir al Catálogo Principal</span>
          </Link>
        </div>

        <p className="text-[11px] text-slate-500">
          JD Distribuidora & Gourmet Ahumados • Sistema B2B
        </p>
      </div>
    </div>
  );
}

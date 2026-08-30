"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { BrandType } from "@/types";
import { Flame, CheckCircle2 } from "lucide-react";

export const BrandSwitcher: React.FC = () => {
  const { selectedBrand, setSelectedBrand } = useApp();

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-2.5 shadow-xl space-y-2">
      <div className="flex items-center justify-between px-2 pt-1">
        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
          Selecciona la Distribuidora / Catálogo:
        </span>
        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Líneas 100% Separadas</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Brand 1: JD Distribuidora (Cortes Crudos) */}
        <button
          type="button"
          onClick={() => setSelectedBrand("jd_distribuidora")}
          className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between relative overflow-hidden active:scale-95 ${
            selectedBrand === "jd_distribuidora"
              ? "bg-gradient-to-br from-rose-700 via-rose-800 to-rose-950 text-white shadow-xl ring-2 ring-rose-400"
              : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🥩</span>
            {selectedBrand === "jd_distribuidora" ? (
              <span className="bg-white text-rose-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                Catálogo Activo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Ver Crudos
              </span>
            )}
          </div>
          <div className="mt-3">
            <h3 className="font-black text-sm sm:text-base leading-tight text-white">
              JD Distribuidora
            </h3>
            <p className="text-[11px] sm:text-xs opacity-90 mt-0.5 font-medium">
              13 Cortes de Cerdo Crudo Fresco
            </p>
          </div>
        </button>

        {/* Brand 2: Gourmet Ahumados (Costillas y Chuletas) */}
        <button
          type="button"
          onClick={() => setSelectedBrand("gourmet_ahumados")}
          className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between relative overflow-hidden active:scale-95 ${
            selectedBrand === "gourmet_ahumados"
              ? "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 text-white shadow-xl ring-2 ring-amber-400"
              : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🪵🔥</span>
            {selectedBrand === "gourmet_ahumados" ? (
              <span className="bg-white text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                Catálogo Activo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Ver Ahumados
              </span>
            )}
          </div>
          <div className="mt-3">
            <h3 className="font-black text-sm sm:text-base leading-tight text-white flex items-center gap-1">
              <span>Gourmet Ahumados</span>
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-current" />
            </h3>
            <p className="text-[11px] sm:text-xs opacity-90 mt-0.5 font-medium">
              Costillas & Chuletas al Leño
            </p>
          </div>
        </button>
      </div>

      <div className="p-2 rounded-xl bg-slate-950/60 text-center text-[11px] text-slate-400 border border-slate-800">
        {selectedBrand === "jd_distribuidora" ? (
          <p>
            Viendo: <strong className="text-rose-400">🥩 JD Distribuidora (Solo Cortes de Cerdo Crudo)</strong>
          </p>
        ) : (
          <p>
            Viendo: <strong className="text-amber-400">🪵🔥 Gourmet Ahumados (Solo Costillas y Chuletas Ahumadas)</strong>
          </p>
        )}
      </div>
    </div>
  );
};

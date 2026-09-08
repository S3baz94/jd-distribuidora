"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { BrandType } from "@/types";
import { Flame, Layers } from "lucide-react";

export const BrandSwitcher: React.FC = () => {
  const { selectedBrand, setSelectedBrand } = useApp();

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-sm space-y-2">
      <div className="flex items-center justify-between px-1.5 pt-0.5">
        <span className="text-xs font-bold uppercase text-gold-400 tracking-wider">
          Seleccionar Línea de Producto:
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Toca un logo para cambiar de catálogo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Brand 1: JD Comercializadora (Cortes Crudos) */}
        <button
          type="button"
          onClick={() => setSelectedBrand("jd_distribuidora")}
          className={`p-3.5 rounded-2xl text-left transition-all border-2 group active:scale-[0.98] ${
            selectedBrand === "jd_distribuidora"
              ? "bg-gradient-to-br from-jdblue-950 via-slate-900 to-slate-950 border-gold-500 text-white ring-2 ring-gold-500/40 shadow-xl shadow-jdblue-950/60"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-12 flex items-center p-1 bg-black/40 rounded-xl border border-white/5">
                <img
                  src="/images/branding/logo-jd-comercializadora.png"
                  alt="Logo JD Comercializadora"
                  className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="w-8 h-10 relative hidden sm:block">
                <img
                  src="/images/branding/cerdito-saludo-bienvenida.png"
                  alt="Cerdito JD"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <span
              className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                selectedBrand === "jd_distribuidora"
                  ? "bg-gold-500 text-slate-950 font-black shadow-sm"
                  : "bg-slate-900 text-slate-500 border border-slate-800"
              }`}
            >
              {selectedBrand === "jd_distribuidora" ? "✓ Activo" : "Seleccionar"}
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="font-bebas text-lg sm:text-xl text-white tracking-wider">
              JD COMERCIALIZADORA
            </h3>
            <p className="font-caveat text-sm sm:text-base text-gold-400 font-bold leading-none mt-0.5">
              Cortes de Cerdo 100% Despostados
            </p>
          </div>
        </button>

        {/* Brand 2: Gourmet Ahumados */}
        <button
          type="button"
          onClick={() => setSelectedBrand("gourmet_ahumados")}
          className={`p-3.5 rounded-2xl text-left transition-all border-2 group active:scale-[0.98] ${
            selectedBrand === "gourmet_ahumados"
              ? "bg-gradient-to-br from-fire-950 via-slate-900 to-slate-950 border-fire-500 text-white ring-2 ring-fire-500/40 shadow-xl shadow-fire-950/60"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-12 flex items-center p-1 bg-black/40 rounded-xl border border-white/5">
                <img
                  src="/images/branding/logo-ahumados-gourmet-oficial.png"
                  alt="Logo Ahumados Gourmet"
                  className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="w-8 h-10 relative hidden sm:block">
                <img
                  src="/images/branding/cerdito-gourmet-ahumados.png"
                  alt="Cerdito Gourmet con Delantal Rojo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <span
              className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                selectedBrand === "gourmet_ahumados"
                  ? "bg-fire-600 text-white font-black shadow-sm"
                  : "bg-slate-900 text-slate-500 border border-slate-800"
              }`}
            >
              {selectedBrand === "gourmet_ahumados" ? "✓ Activo" : "Seleccionar"}
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="font-bebas text-lg sm:text-xl text-white tracking-wider">
              AHUMADOS GOURMET
            </h3>
            <p className="font-caveat text-sm sm:text-base text-fire-400 font-bold leading-none mt-0.5">
              Costillas & Asados al Leño
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

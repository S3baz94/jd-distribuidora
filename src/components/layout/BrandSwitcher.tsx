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
        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wide">
          Línea de Producto:
        </span>
        <span className="text-[11px] font-medium text-slate-500">
          Catálogos Independientes
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Brand 1: JD Distribuidora (Cortes Crudos) */}
        <button
          type="button"
          onClick={() => setSelectedBrand("jd_distribuidora")}
          className={`p-3.5 rounded-2xl text-left transition-all border ${
            selectedBrand === "jd_distribuidora"
              ? "bg-jdblue-950/90 border-jdblue-500 text-white shadow-lg shadow-jdblue-950/50"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-10 flex items-center">
              <img
                src="/images/branding/logo-jd-comercializadora.png"
                alt="Logo JD Comercializadora"
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_2px_6px_rgba(245,158,11,0.3)]"
              />
            </div>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                selectedBrand === "jd_distribuidora"
                  ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
                  : "text-slate-500"
              }`}
            >
              {selectedBrand === "jd_distribuidora" ? "Seleccionado" : "Ver"}
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
          className={`p-3.5 rounded-2xl text-left transition-all border ${
            selectedBrand === "gourmet_ahumados"
              ? "bg-fire-950/90 border-fire-500 text-white shadow-lg shadow-fire-950/50"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-10 flex items-center">
              <img
                src="/images/branding/logo-ahumados-gourmet-oficial.png"
                alt="Logo Ahumados Gourmet"
                className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_2px_6px_rgba(220,38,38,0.3)]"
              />
            </div>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                selectedBrand === "gourmet_ahumados"
                  ? "bg-fire-500/20 text-fire-300 border border-fire-500/40"
                  : "text-slate-500"
              }`}
            >
              {selectedBrand === "gourmet_ahumados" ? "Seleccionado" : "Ver"}
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

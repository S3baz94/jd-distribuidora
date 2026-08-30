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

      <div className="grid grid-cols-2 gap-2">
        {/* Brand 1: JD Distribuidora (Cortes Crudos) */}
        <button
          type="button"
          onClick={() => setSelectedBrand("jd_distribuidora")}
          className={`p-3.5 rounded-xl text-left transition-all border ${
            selectedBrand === "jd_distribuidora"
              ? "bg-slate-900 border-slate-700 text-white shadow-sm"
              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <Layers className="w-4 h-4 text-slate-400" />
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                selectedBrand === "jd_distribuidora"
                  ? "bg-slate-800 text-amber-400 border border-slate-700"
                  : "text-slate-500"
              }`}
            >
              {selectedBrand === "jd_distribuidora" ? "Seleccionado" : "Ver"}
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="font-semibold text-xs sm:text-sm text-slate-100">
              JD Distribuidora
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cortes de Cerdo Crudo
            </p>
          </div>
        </button>

        {/* Brand 2: Gourmet Ahumados */}
        <button
          type="button"
          onClick={() => setSelectedBrand("gourmet_ahumados")}
          className={`p-3.5 rounded-xl text-left transition-all border ${
            selectedBrand === "gourmet_ahumados"
              ? "bg-slate-900 border-slate-700 text-white shadow-sm"
              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <Flame className="w-4 h-4 text-slate-400" />
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                selectedBrand === "gourmet_ahumados"
                  ? "bg-slate-800 text-amber-400 border border-slate-700"
                  : "text-slate-500"
              }`}
            >
              {selectedBrand === "gourmet_ahumados" ? "Seleccionado" : "Ver"}
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="font-semibold text-xs sm:text-sm text-slate-100">
              Gourmet Ahumados
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Costillas & Ahumados al Leño
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

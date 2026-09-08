"use client";

import React from "react";
import { Award, ShieldCheck, Users } from "lucide-react";

export const TrustBadgesBar: React.FC = () => {
  return (
    <div className="bg-slateblack-900/90 border border-gold-500/30 rounded-3xl p-4 sm:p-5 gold-glow-card">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Sello 1: Productos de Calidad */}
        <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-950/60 border border-gold-500/20 hover:border-gold-400/50 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/30 flex items-center justify-center mb-2 shadow-inner">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase text-gold-300 tracking-wider">
            Productos de Calidad
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            100% Despostados
          </span>
        </div>

        {/* Sello 2: Cortes Frescos y Seleccionados */}
        <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-950/60 border border-gold-500/20 hover:border-gold-400/50 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/30 flex items-center justify-center mb-2 shadow-inner">
            {/* Silueta cerdito estilizada */}
            <span className="text-lg">🐷</span>
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase text-gold-300 tracking-wider">
            Cortes Frescos
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Selección Diaria
          </span>
        </div>

        {/* Sello 3: Confianza y Responsabilidad */}
        <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-950/60 border border-gold-500/20 hover:border-gold-400/50 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/30 flex items-center justify-center mb-2 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase text-gold-300 tracking-wider">
            Confianza Total
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Cadena de Frío 0°C - 4°C
          </span>
        </div>

        {/* Sello 4: Atención Personalizada */}
        <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-950/60 border border-gold-500/20 hover:border-gold-400/50 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/30 flex items-center justify-center mb-2 shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase text-gold-300 tracking-wider">
            Atención Directa
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Mayoristas & Restaurantes
          </span>
        </div>
      </div>
    </div>
  );
};

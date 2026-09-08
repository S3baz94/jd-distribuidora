"use client";

import React from "react";
import { Award, ShieldCheck, Users } from "lucide-react";

export const TrustBadgesBar: React.FC = () => {
  return (
    <div className="bg-slateblack-900/90 border border-gold-500/30 rounded-3xl p-4 sm:p-5 gold-glow-card">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Sello 1: Productos de Calidad */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-950/70 border border-gold-500/30 hover:border-gold-400 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-gold-500/15 text-gold-400 border border-gold-500/40 flex items-center justify-center mb-2 shadow-inner">
            <Award className="w-6 h-6 text-gold-400" />
          </div>
          <span className="font-bebas text-sm sm:text-base uppercase text-gold-300 tracking-wider">
            PRODUCTOS DE CALIDAD
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            100% Despostados
          </span>
        </div>

        {/* Sello 2: Cortes Frescos y Seleccionados */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-950/70 border border-gold-500/30 hover:border-gold-400 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-gold-500/15 text-gold-400 border border-gold-500/40 flex items-center justify-center mb-2 shadow-inner">
            <span className="text-xl">🐷</span>
          </div>
          <span className="font-bebas text-sm sm:text-base uppercase text-gold-300 tracking-wider">
            CORTES FRESCOS
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            Y SELECCIONADOS
          </span>
        </div>

        {/* Sello 3: Confianza y Responsabilidad */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-950/70 border border-gold-500/30 hover:border-gold-400 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-gold-500/15 text-gold-400 border border-gold-500/40 flex items-center justify-center mb-2 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-gold-400" />
          </div>
          <span className="font-bebas text-sm sm:text-base uppercase text-gold-300 tracking-wider">
            CONFIANZA Y
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            RESPONSABILIDAD
          </span>
        </div>

        {/* Sello 4: Atención Personalizada */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-950/70 border border-gold-500/30 hover:border-gold-400 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-gold-500/15 text-gold-400 border border-gold-500/40 flex items-center justify-center mb-2 shadow-inner">
            <Users className="w-6 h-6 text-gold-400" />
          </div>
          <span className="font-bebas text-sm sm:text-base uppercase text-gold-300 tracking-wider">
            ATENCIÓN
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            PERSONALIZADA
          </span>
        </div>
      </div>

      {/* Sello Inferior: ¡Gracias por preferirnos! */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2">
        <span className="w-7 h-7 rounded-full border border-fire-500 flex items-center justify-center text-fire-500 text-sm bg-fire-950/50">
          ♥
        </span>
        <span className="font-caveat text-xl sm:text-2xl text-white font-bold tracking-wide">
          ¡Gracias por preferirnos!
        </span>
      </div>
    </div>
  );
};

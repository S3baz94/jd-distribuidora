"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, Flame } from "lucide-react";

export const BrandMascotBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-blackboard border-2 border-fire-600/40 p-5 sm:p-7 shadow-2xl">
      {/* Resplandor decorativo de fondo */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-fire-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera del Banner: Logos y Lemas */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-slate-800/80 pb-4">
        {/* Co-Branding Oficial */}
        <div className="flex items-center gap-3">
          {/* Logo Gourmet Ahumados */}
          <div className="flex items-center gap-2 bg-fire-900/40 border border-fire-600/50 px-3 py-1.5 rounded-2xl shadow-inner">
            <span className="text-xl">🐷</span>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-fire-400 block leading-none">
                Ahumados
              </span>
              <span className="text-xs font-black text-white italic leading-tight">
                Gourmet
              </span>
            </div>
          </div>

          <span className="text-slate-600 font-black text-sm">&</span>

          {/* Logo JD Comercializadora */}
          <div className="flex items-center gap-2 bg-jdblue-900/60 border border-jdblue-600/60 px-3 py-1.5 rounded-2xl shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gold-500 text-jdblue-950 font-black text-xs flex items-center justify-center">
              JD
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-gold-400 block leading-none">
                Comercializadora
              </span>
              <span className="text-xs font-black text-white leading-tight">
                De Carnes
              </span>
            </div>
          </div>
        </div>

        {/* Lema manuscrito */}
        <div className="flex items-center gap-1.5 text-gold-400 font-brush-accent italic text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
          <span>¡Se viene algo especial en cada entrega!</span>
        </div>
      </div>

      {/* Contenido Central: Título Display + Mascota Chef + Calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5 relative z-10">
        {/* Columna Izquierda: Mensajes Promocionales */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <span className="brush-badge-red-sm inline-block px-3 py-1 text-white font-black text-xs uppercase tracking-widest shadow-md">
              LOS DÍAS DE PEDIDO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md">
              FRESCO AL CORTE <br />
              <span className="text-gold-400">Y AL LEÑO AHUMADO</span>
            </h2>
          </div>

          {/* Pincelada Roja de Promoción */}
          <div className="brush-badge-red px-4 py-2.5 rounded-lg inline-block transform -rotate-1 shadow-xl">
            <p className="text-white font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
              <Flame className="w-4 h-4 text-gold-300 fill-current" />
              <span>PRECIOS MAYORISTAS EN JD Y GOURMET</span>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            Cortes 100% despostados con peso exacto en báscula, sin mermas ni sorpresas. Programa hoy tu entrega y recibe en furgón refrigerado con temperatura certificada.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/comprar"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-fire-600 to-fire-700 hover:from-fire-500 hover:to-fire-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-fire-950/60 active:scale-95 transition-all"
            >
              <span>Ver Catálogo & Precios</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <span className="text-xs text-gold-400 font-brush-accent italic">
              ¡Grandes ofertas te esperan!
            </span>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Mascota & Calendario */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Calendario de Despacho */}
          <div className="w-36 bg-white text-slate-900 rounded-2xl shadow-2xl p-3 border-t-4 border-fire-600 text-center flex flex-col items-center flex-shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-fire-700 tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Despacho</span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">LUN - SÁB</p>
            <span className="text-[10px] bg-fire-100 text-fire-800 font-bold px-2 py-0.5 rounded-full mt-1">
              Rutas 06:00 AM
            </span>
            <p className="text-[9px] text-slate-500 italic mt-1.5 font-brush-accent">
              ¡Marca tu día!
            </p>
          </div>

          {/* Tarjeta de Mascota Oficial Cerdito Chef JD */}
          <div className="bg-gradient-to-b from-jdblue-950 to-slateblack-900 border-2 border-gold-500/40 rounded-3xl p-4 text-center flex flex-col items-center relative shadow-xl">
            {/* Sombrero y Chef Badge */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-slate-200 border-2 border-gold-400 flex items-center justify-center shadow-lg relative">
              <span className="text-4xl">👨‍🍳</span>
              <span className="absolute -bottom-1 -right-1 text-base">🐷</span>
            </div>

            {/* Delantal Azul JD */}
            <div className="mt-2 bg-jdblue-900 border border-jdblue-600 px-2.5 py-0.5 rounded-full">
              <span className="text-[9px] font-black uppercase tracking-wider text-gold-300">
                Delantal Oficial JD
              </span>
            </div>

            <p className="font-black text-white text-xs mt-2">
              Chef Porcicultor
            </p>
            <p className="text-[10px] text-slate-400">
              Calidad JD Garantizada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

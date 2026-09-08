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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Logo Gourmet Ahumados con Imagen Real */}
          <div className="flex items-center gap-2 sm:gap-2.5 bg-fire-950/70 border border-fire-500/40 px-2.5 sm:px-3 py-1.5 rounded-2xl shadow-md">
            <img
              src="/images/branding/logo-ahumados-gourmet-oficial.png"
              alt="Logo Oficial Ahumados Gourmet"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow"
            />
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
          <div className="flex items-center gap-2.5 bg-jdblue-950/80 border border-jdblue-500/40 px-3 py-1.5 rounded-2xl shadow-md">
            <img
              src="/images/branding/logo-jd-comercializadora.png"
              alt="Logo JD Comercializadora de Alimentos"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow"
            />
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-gold-400 block leading-none">
                JD Comercializadora
              </span>
              <span className="text-xs font-black text-white leading-tight">
                De Alimentos
              </span>
            </div>
          </div>
        </div>

        {/* Lema manuscrito */}
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-gold-400 animate-spin" />
          <span className="font-caveat text-xl sm:text-2xl font-bold tracking-wide text-white drop-shadow">
            ¡Se viene algo especial!
          </span>
        </div>
      </div>

      {/* Contenido Central: Título Display + Mascota Chef + Calendario */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5 relative z-10">
        {/* Columna Izquierda: Mensajes Promocionales Fieles al Post */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <div className="inline-block">
              <span className="brush-badge-red px-3 sm:px-3.5 py-0.5 text-white font-bebas text-base sm:text-lg tracking-widest shadow-md">
                LOS
              </span>
            </div>
            <h2 className="font-bebas text-2xl sm:text-4xl lg:text-5xl text-white tracking-wide uppercase leading-tight sm:leading-none drop-shadow-xl mt-1 break-words">
              MIÉRCOLES <br className="hidden sm:inline" />
              <span className="text-fire-500 chalk-text-red"> DE SEPTIEMBRE</span>
            </h2>
          </div>

          <p className="font-bebas text-xs sm:text-sm text-slate-300 tracking-widest">
            TENDREMOS UNA
          </p>

          {/* Pincelada Roja de Promoción Oficial */}
          <div className="brush-badge-red px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl inline-flex items-center shadow-2xl">
            <p className="font-bebas text-base sm:text-2xl text-white tracking-widest flex items-center gap-2">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-gold-300 fill-current animate-pulse flex-shrink-0" />
              <span>PROMOCIÓN ESPECIAL</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-white font-bebas text-sm sm:text-lg tracking-widest">
            <span className="text-fire-500">❖</span>
            <span>EN JD Y GOURMET</span>
            <span className="text-fire-500">❖</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg font-medium">
            Cortes 100% despostados con peso exacto en báscula y costillas ahumadas al leño. Programa tu entrega con furgón refrigerado INVIMA.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/comprar"
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-fire-600 via-fire-500 to-amber-600 hover:from-fire-500 hover:to-amber-500 text-white font-bebas text-base sm:text-lg tracking-wider flex items-center gap-2 shadow-xl shadow-fire-950/60 active:scale-95 transition-all flex-shrink-0"
            >
              <span>Ver Catálogo & Precios</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <span className="font-caveat text-xl sm:text-2xl lg:text-3xl text-gold-400 font-bold tracking-wide drop-shadow-sm text-center sm:text-left">
              ¡Grandes ofertas te esperan!
            </span>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Mascota & Calendario Oficial */}
        <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center gap-4 mt-4 md:mt-0">
          {/* Calendario de Despacho Idéntico al Post */}
          <div className="w-full sm:w-48 md:w-full lg:w-48 bg-white text-slate-900 rounded-3xl shadow-2xl p-4 border-t-8 border-fire-600 text-center flex flex-col items-center flex-shrink-0 relative overflow-hidden cartoon-card">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-fire-700 tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Despacho</span>
            </div>
            
            <p className="font-caveat text-xl text-slate-900 font-bold leading-tight mt-1">
              ¡Marca tus miércoles!
            </p>

            {/* Icono Calendario Rojo del Post */}
            <div className="w-16 h-16 my-1.5 border-2 border-fire-600 rounded-2xl flex flex-col items-center justify-center bg-fire-50 shadow-inner">
              <span className="text-[10px] font-black uppercase text-fire-700 leading-none">MIÉRCOLES</span>
              <span className="text-2xl text-fire-600">★</span>
            </div>

            <span className="font-bebas text-sm sm:text-base bg-fire-600 text-white font-bold px-3 py-0.5 rounded-full mt-1 tracking-wider">
              RUTAS 06:00 AM
            </span>
            <p className="font-caveat text-sm sm:text-base text-slate-600 font-bold mt-1">
              Todo el mes de septiembre
            </p>
          </div>

          {/* Dúo de Mascotas Oficiales: Cerdito JD (Azul) & Cerdito Gourmet (Rojo) */}
          <div className="relative flex flex-col items-center justify-center w-full sm:w-auto">
            {/* Resplandor sutil de fondo */}
            <div className="absolute inset-0 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Contenedor Lado a Lado Sin Solapamiento */}
            <div className="relative flex items-end justify-center gap-2 sm:gap-3 group cursor-pointer py-1">
              {/* Cerdito JD: Señalando Ofertas */}
              <div className="relative text-center flex-shrink-0">
                <img
                  src="/images/branding/cerdito-senala-ofertas.png"
                  alt="El Cerdito JD con Delantal Azul"
                  className="w-20 sm:w-24 md:w-28 max-w-[120px] h-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)] animate-float-slow group-hover:scale-105 transition-transform duration-300"
                />
                <span className="text-[10px] font-bold text-cyan-300 block mt-1 font-caveat">
                  JD Crudos
                </span>
              </div>

              {/* Cerdito Gourmet: Voceando Promociones al Leño */}
              <div className="relative text-center flex-shrink-0">
                <img
                  src="/images/branding/cerdito-gourmet-ahumados.png"
                  alt="El Cerdito Gourmet con Delantal Rojo"
                  className="w-20 sm:w-24 md:w-28 max-w-[120px] h-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.6)] animate-float-slow group-hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: "1.2s" }}
                />
                <span className="text-[10px] font-bold text-fire-400 block mt-1 font-caveat">
                  Gourmet Ahumados
                </span>
              </div>
            </div>

            <div className="text-center mt-2">
              <span className="font-caveat text-lg sm:text-xl text-gold-400 font-bold tracking-wide drop-shadow block">
                ¡JD & Gourmet juntos para ti!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

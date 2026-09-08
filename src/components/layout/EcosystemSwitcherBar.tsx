"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Truck, Navigation, ShieldCheck } from "lucide-react";

export const EcosystemSwitcherBar: React.FC = () => {
  const pathname = usePathname();

  const tools = [
    {
      id: "ventas",
      name: "Ventas B2B",
      href: "/",
      icon: ShoppingBag,
      color: "from-amber-500 to-amber-600",
      activeBorder: "border-amber-400",
      badge: "Catálogo & Pedidos",
      mascot: "/images/branding/cerdito-saludo-bienvenida.png",
      isActive:
        pathname === "/" ||
        pathname === "/comprar" ||
        pathname === "/confirmacion" ||
        pathname?.startsWith("/pedidos") ||
        pathname === "/cuenta",
    },
    {
      id: "operacion",
      name: "Operación & Planta",
      href: "/operacion",
      icon: Truck,
      color: "from-cyan-600 to-blue-600",
      activeBorder: "border-cyan-400",
      badge: "Báscula & Frío 1.8°C",
      mascot: "/images/branding/cerdito-furgon-despacho.png",
      isActive: pathname === "/operacion",
    },
    {
      id: "domicilios",
      name: "Domicilios & Ruta",
      href: "/domiciliario",
      icon: Navigation,
      color: "from-emerald-500 to-emerald-700",
      activeBorder: "border-emerald-400",
      badge: "GPS & Entregas",
      mascot: "/images/branding/cerdito-moto-domiciliario.png",
      isActive: pathname === "/domiciliario" || pathname === "/reparto",
    },
    {
      id: "admin",
      name: "Administración",
      href: "/admin",
      icon: ShieldCheck,
      color: "from-rose-600 to-rose-800",
      activeBorder: "border-rose-400",
      badge: "Facturación & POS",
      mascot: "/images/branding/cerdito-bascula-pesaje.png",
      isActive: pathname?.startsWith("/admin"),
    },
  ];

  return (
    <div className="w-full bg-slate-950/95 border-b-2 border-slate-800/90 backdrop-blur-md sticky top-0 z-50 shadow-xl select-none">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Cabecera Co-Branding Articulada con Logos Representativos */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            {/* Logos Corporativos en Dúo */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-black/45 rounded-2xl border border-slate-700/60 shadow-inner flex-shrink-0">
              <img
                src="/images/branding/logo-jd-comercializadora.png"
                alt="Logo JD Comercializadora"
                className="h-7 sm:h-9 w-auto object-contain drop-shadow group-hover:scale-105 transition-transform"
              />
              <span className="text-slate-600 font-black text-[10px] sm:text-xs">&</span>
              <img
                src="/images/branding/logo-ahumados-gourmet-oficial.png"
                alt="Logo Ahumados Gourmet"
                className="h-7 sm:h-9 w-auto object-contain drop-shadow group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-gold-400 uppercase block leading-none truncate">
                ECOSISTEMA CONECTADO
              </span>
              <span className="font-bebas text-xs sm:text-base text-white tracking-wider leading-none block mt-0.5 truncate">
                <span className="inline sm:hidden">JD & GOURMET</span>
                <span className="hidden sm:inline">JD COMERCIALIZADORA & GOURMET AHUMADOS</span>
              </span>
            </div>
          </Link>

          {/* Badge móvil de conectividad */}
          <div className="flex md:hidden items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[9px] sm:text-[10px] font-black text-emerald-400 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden xs:inline">4 APPS CONECTADAS</span>
            <span className="inline xs:hidden">EN VIVO</span>
          </div>
        </div>

        {/* Barra Articulada de Herramientas (Scroll Horizontal Suave en Móviles) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-0.5 md:pb-0 justify-start md:justify-end px-0.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`relative h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl flex items-center gap-2 transition-all flex-shrink-0 border-2 whitespace-nowrap ${
                  tool.isActive
                    ? `bg-gradient-to-r ${tool.color} ${tool.activeBorder} text-white shadow-lg ring-2 ring-white/20 scale-[1.02]`
                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700"
                }`}
                title={`Cambiar a herramienta de ${tool.name}`}
              >
                {/* Icono de la Herramienta */}
                <div
                  className={`p-1.5 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tool.isActive ? "bg-white/20 text-white" : "bg-slate-800/80 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-bebas text-xs sm:text-sm tracking-wider leading-none block">
                      {tool.name}
                    </span>
                    {tool.isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] font-caveat font-bold opacity-90 block leading-tight hidden lg:block">
                    {tool.badge}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

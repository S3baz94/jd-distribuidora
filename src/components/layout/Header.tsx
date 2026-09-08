"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { DEMO_COMPANY } from "@/services/mockData";
import {
  ShoppingBag,
  Building2,
  User,
  Package,
  Layers,
  Home,
  ThermometerSnowflake,
  Store,
} from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    customer,
    allCustomers,
    switchCustomer,
    cartTotal,
    cartKg,
    cartItemsCount,
    setIsCartOpen,
  } = useApp();

  const navLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/comprar", label: "Comprar", icon: Layers },
    { href: "/pedidos", label: "Mis Pedidos", icon: Package },
    { href: "/cuenta", label: "Mi Negocio", icon: Store },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top micro-bar for client app */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-300">{DEMO_COMPANY.name}</span>
          <span className="hidden sm:inline text-slate-500">| Clientes</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px]">
          <ThermometerSnowflake className="w-3 h-3 text-slate-500" />
          <span>Cadena de Frío 0°C a 4°C</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo Oficial */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img
              src="/images/branding/logo-jd-comercializadora.png"
              alt="Logo JD Comercializadora de Alimentos"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform"
            />
            <div className="h-7 w-[1px] bg-slate-700/80 hidden sm:block" />
            <img
              src="/images/branding/logo-ahumados-gourmet-oficial.png"
              alt="Logo Ahumados Gourmet Oficial"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(220,38,38,0.3)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="font-bebas text-lg sm:text-2xl tracking-wider text-white flex items-center gap-2 leading-none">
              <span>JD COMERCIALIZADORA</span>
              <span className="text-[10px] font-black bg-fire-600/30 text-fire-300 px-2 py-0.5 rounded-full border border-fire-500/40 uppercase tracking-widest">
                OFICIAL
              </span>
            </div>
            <p className="font-caveat text-sm sm:text-base text-gold-400 font-bold leading-none mt-1 flex items-center gap-1.5">
              <span>Cortes de Cerdo 100% Despostados</span>
              <span className="text-slate-500">•</span>
              <span className="text-fire-400">Ahumados Gourmet</span>
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Client Business Badge & Cart Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer info selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm max-w-[150px] sm:max-w-[220px]">
              <Store className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <select
                value={customer.id}
                onChange={(e) => switchCustomer(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer truncate w-full"
                title="Cambiar cliente o probar como Cliente Nuevo"
              >
                {allCustomers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
                    {c.id === "cust-nuevo" ? "🆕 " : "🏪 "}
                    {c.businessName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Button with vibrant counter */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-md transition-all active:scale-95 relative flex-shrink-0 ${
              cartItemsCount > 0
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-amber-950/30"
                : "bg-slate-800 hover:bg-slate-750 text-white border-slate-700"
            }`}
            title="Ver pedido actual"
          >
            <ShoppingBag className={`w-4 h-4 ${cartItemsCount > 0 ? "text-amber-400" : "text-slate-300"}`} />
            <span className="hidden sm:inline">
              {cartKg > 0 ? `${cartKg.toFixed(1)} kg` : "Pedido"}
            </span>
            {cartTotal > 0 && (
              <span className="hidden lg:inline text-amber-300 font-mono font-black">
                ({priceService.formatCurrency(cartTotal)})
              </span>
            )}
            {cartItemsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center -mr-1 shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

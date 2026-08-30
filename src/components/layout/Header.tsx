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
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[10px]">
          <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />
          <span>Cadena de Frío 0°C a 4°C</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-lg tracking-tighter shadow-lg shadow-amber-950/40 group-hover:scale-105 transition-all">
            JD
          </div>
          <div>
            <div className="font-black text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                JD DISTRIBUIDORA
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-widest shadow-sm">
                VENTAS
              </span>
            </div>
            <p className="text-[11px] text-amber-400/90 font-bold leading-none mt-0.5 flex items-center gap-1.5">
              <span>Cortes Crudos</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-extrabold">Gourmet Ahumados 🔥</span>
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Client Business Badge & Cart Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer info pill */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs shadow-inner">
            <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="hidden sm:block leading-tight">
              <p className="font-extrabold text-white truncate max-w-[130px]">
                {customer.businessName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{customer.contactName}</p>
            </div>
            <span className="sm:hidden font-extrabold text-slate-200 truncate max-w-[90px]">
              {customer.businessName.split(" ")[0]}
            </span>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/50 active:scale-95 border border-emerald-400/30"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            <div className="hidden sm:flex flex-col items-start text-left leading-tight">
              <span className="text-xs font-black">{priceService.formatCurrency(cartTotal)}</span>
              <span className="text-[10px] text-emerald-200 font-bold">{cartKg} kg</span>
            </div>
            {cartItemsCount > 0 && (
              <span className="sm:hidden absolute -top-1.5 -right-1.5 bg-white text-emerald-700 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

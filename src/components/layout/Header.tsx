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
        <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px]">
          <ThermometerSnowflake className="w-3 h-3 text-slate-500" />
          <span>Cadena de Frío 0°C a 4°C</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-amber-500 text-base tracking-tight shadow-sm">
            JD
          </div>
          <div>
            <div className="font-bold text-base leading-tight tracking-tight text-white flex items-center gap-2">
              <span>JD DISTRIBUIDORA</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded-md border border-slate-700 uppercase tracking-wide">
                VENTAS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-none mt-1 flex items-center gap-1.5">
              <span>Cortes Cárnicos</span>
              <span className="text-slate-600">•</span>
              <span>Gourmet Ahumados</span>
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
          {/* Customer info pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <div className="hidden sm:block">
              <p className="font-semibold text-slate-200 leading-none truncate max-w-[130px]">
                {customer.businessName}
              </p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                {customer.assignedPriceListName || customer.contactName}
              </p>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold shadow-sm transition-all relative"
            title="Ver pedido actual"
          >
            <ShoppingBag className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">
              {cartKg > 0 ? `${cartKg.toFixed(1)} kg` : "Pedido"}
            </span>
            {cartTotal > 0 && (
              <span className="hidden lg:inline text-slate-300 font-mono">
                ({priceService.formatCurrency(cartTotal)})
              </span>
            )}
            {cartItemsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center justify-center -mr-1">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

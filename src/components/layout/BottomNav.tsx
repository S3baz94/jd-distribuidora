"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Home, Layers, Package, Store, ShoppingBag } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { activeOrder, cartItemsCount, cartKg, setIsCartOpen } = useApp();

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/comprar", label: "Cortes", icon: Layers },
    {
      href: "/pedidos",
      label: "Mis Pedidos",
      icon: Package,
      hasBadge: Boolean(activeOrder),
    },
    { href: "/cuenta", label: "Mi Negocio", icon: Store },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 px-1.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 relative ${
                isActive
                  ? "text-emerald-400 font-black"
                  : "text-slate-400 hover:text-slate-200 font-semibold"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "stroke-[2.5] text-emerald-400 scale-110" : "stroke-[1.75]"
                  }`}
                />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
              )}
            </Link>
          );
        })}

        {/* Mobile Integrated Cart button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex-1 flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 relative text-amber-400 hover:text-amber-300 font-bold"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-bounce">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-black">
            {cartKg > 0 ? `${cartKg.toFixed(0)} kg` : "Pedido"}
          </span>
        </button>
      </div>
    </nav>
  );
};

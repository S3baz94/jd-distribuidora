"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Home, Layers, Package, Store } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { activeOrder } = useApp();

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-18 px-2">
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
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors relative ${
                isActive
                  ? "text-brand-700 font-black"
                  : "text-slate-600 hover:text-slate-900 font-bold"
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? "stroke-[3] text-brand-600" : "stroke-[2]"}`} />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-xs mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-8 h-1 bg-brand-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { ShoppingBag, ArrowRight } from "lucide-react";

export const FloatingCartBar: React.FC = () => {
  const { cart, cartTotal, cartKg, cartItemsCount, setIsCartOpen } = useApp();

  if (cartItemsCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-30 px-3 sm:px-4 pointer-events-none flex justify-center">
      <button
        onClick={() => setIsCartOpen(true)}
        className="pointer-events-auto w-full max-w-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-3xl p-4 shadow-2xl shadow-emerald-950/40 border-2 border-emerald-400 flex items-center justify-between gap-3 transition-all transform active:scale-98 animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-lg relative flex-shrink-0 shadow">
            <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {cartItemsCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
              {cartKg} kilos de carne en tu lista
            </p>
            <p className="text-lg sm:text-xl font-black text-white leading-tight">
              {priceService.formatCurrency(cartTotal)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white text-emerald-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-md">
          <span>VER PEDIDO</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      </button>
    </div>
  );
};

"use client";

import React from "react";
import { Order, OrderStatus } from "@/types";
import { useApp } from "@/context/AppContext";
import { Sparkles, Sliders, Check } from "lucide-react";

interface DemoStatusControllerProps {
  order: Order;
}

export const DemoStatusController: React.FC<DemoStatusControllerProps> = ({ order }) => {
  const { updateOrderStatus } = useApp();

  const statuses: { key: OrderStatus; label: string }[] = [
    { key: "pending", label: "1. Recibido" },
    { key: "confirmed", label: "2. Confirmado" },
    { key: "preparing", label: "3. En preparación" },
    { key: "dispatched", label: "4. Despachado" },
    { key: "delivered", label: "5. Entregado" },
    { key: "cancelled", label: "Anulado" },
  ];

  return (
    <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Simulador Demo de Estados
            </h4>
            <p className="text-[11px] text-slate-400">
              Cambia el estado de este pedido para ver cómo reacciona la interfaz
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {statuses.map((st) => {
          const isActive = order.status === st.key;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => updateOrderStatus(order.id, st.key)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold ring-2 ring-amber-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              <span>{st.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

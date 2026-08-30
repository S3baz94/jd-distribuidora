import React from "react";
import { OrderStatus } from "@/types";
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ status }) => {
  if (status === "cancelled") {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
        <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm">Pedido Cancelado</p>
          <p className="text-xs text-rose-700">Este pedido fue anulado de común acuerdo con la distribuidora.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "pending", label: "Pedido recibido", desc: "Registrado en sistema" },
    { key: "confirmed", label: "Confirmado", desc: "Validado en planta" },
    { key: "preparing", label: "En preparación", desc: "Desposte y pesaje" },
    { key: "dispatched", label: "Despachado", desc: "En ruta de frío" },
    { key: "delivered", label: "Entregado", desc: "Recibido en local" },
  ];

  const statusOrder: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 2, // grouped with preparing
    dispatched: 3,
    delivered: 4,
  };

  const currentLevel = statusOrder[status] ?? 0;

  return (
    <div className="py-2">
      {/* Horizontal on desktop, compact on mobile */}
      <div className="relative flex items-center justify-between">
        {/* Continuous background bar */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-0" />
        <div
          className="absolute top-4 left-4 h-1 bg-brand-600 transition-all duration-500 -z-0"
          style={{
            width: `${(currentLevel / (steps.length - 1)) * 92}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentLevel;
          const isCurrent = idx === currentLevel;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? "bg-brand-600 text-white ring-4 ring-brand-100"
                    : isCurrent
                    ? "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                    : "bg-white border-2 border-slate-300 text-slate-400"
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 bg-white rounded-full" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <p
                className={`text-[11px] mt-1.5 text-center font-bold tracking-tight max-w-[65px] sm:max-w-none leading-tight ${
                  isDone || isCurrent ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
              <p className="hidden sm:block text-[10px] text-slate-500 text-center">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from "react";
import { OrderStatus } from "@/types";
import { Clock, CheckCircle2, Package, Truck, Check, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "Pendiente de confirmación",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: <Clock className="w-3.5 h-3.5 mr-1" />,
    },
    confirmed: {
      label: "Confirmado",
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
    },
    preparing: {
      label: "En preparación",
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: <Package className="w-3.5 h-3.5 mr-1" />,
    },
    ready: {
      label: "Listo para despacho",
      bg: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
    },
    dispatched: {
      label: "En ruta / Despachado",
      bg: "bg-indigo-50",
      text: "text-indigo-800",
      border: "border-indigo-200",
      icon: <Truck className="w-3.5 h-3.5 mr-1" />,
    },
    delivered: {
      label: "Entregado",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      icon: <Check className="w-3.5 h-3.5 mr-1" />,
    },
    cancelled: {
      label: "Cancelado",
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-300",
      icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
    },
  };

  const config = configs[status] || configs.pending;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

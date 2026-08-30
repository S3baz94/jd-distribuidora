import React from "react";
import { StockAvailabilityStatus } from "@/types";

interface AvailabilityBadgeProps {
  status: StockAvailabilityStatus;
  availableKg: number;
  showKg?: boolean;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  status,
  availableKg,
  showKg = true,
}) => {
  if (status === "out_of_stock" || availableKg <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        🔴 Agotado
      </span>
    );
  }

  if (status === "limited" || availableKg <= 15) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        🟡 Disp. limitada {showKg && `(${availableKg} kg)`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      🟢 Disponible {showKg && `(${availableKg} kg)`}
    </span>
  );
};

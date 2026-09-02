"use client";

import React, { useState } from "react";
import { Order } from "@/types";
import { priceService } from "@/services/priceService";
import { Scale, X, Check, AlertCircle } from "lucide-react";
import { CratesTareScaleModal } from "@/components/operations/CratesTareScaleModal";

interface WeightAdjustmentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSave: (realQuantities: { productId: string; realQuantity: number }[]) => void;
}

export const WeightAdjustmentModal: React.FC<WeightAdjustmentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const [isTareModalOpen, setIsTareModalOpen] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    order.items.forEach((item) => {
      initial[item.productId] = item.realQuantity !== undefined ? item.realQuantity : item.quantity;
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleWeightChange = (productId: string, val: string) => {
    const parsed = parseFloat(val);
    setWeights((prev) => ({
      ...prev,
      [productId]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const calculatedTotal = order.items.reduce((sum, item) => {
    const qty = weights[item.productId] !== undefined ? weights[item.productId] : item.quantity;
    return sum + qty * item.unitPrice;
  }, 0);

  const calculatedTotalKg = order.items.reduce((sum, item) => {
    const qty = weights[item.productId] !== undefined ? weights[item.productId] : item.quantity;
    return sum + qty;
  }, 0);

  const originalTotalKg = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirm = () => {
    const payload = order.items.map((item) => ({
      productId: item.productId,
      realQuantity: weights[item.productId] || item.quantity,
    }));
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Ajuste de Pesaje Real en Báscula
              </h3>
              <p className="text-xs text-slate-400">
                Pedido {order.orderNumber} • {order.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Ingresa el peso exacto registrado en la báscula digital de planta antes de sellar la canastilla. El valor total de la remisión se recalculará automáticamente.
            </p>
          </div>

          {/* Botón directo para Báscula con Tara de Canastillas */}
          <button
            type="button"
            onClick={() => setIsTareModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black text-xs flex items-center justify-center gap-2 border border-amber-500/40 transition-all shadow-md active:scale-95"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>⚖️ Abrir Báscula Digital: Restar Tara de Canastillas Vacías</span>
          </button>

          <div className="space-y-3">
            {order.items.map((item) => {
              const currentWeight = weights[item.productId] !== undefined ? weights[item.productId] : item.quantity;
              const subtotal = currentWeight * item.unitPrice;
              const diff = currentWeight - item.quantity;

              return (
                <div
                  key={item.productId}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{item.productName}</p>
                    <p className="text-xs text-slate-400">
                      Pedido original: <span className="text-slate-200 font-semibold">{item.quantity} kg</span> • {priceService.formatCurrency(item.unitPrice)}/kg
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={currentWeight}
                        onChange={(e) => handleWeightChange(item.productId, e.target.value)}
                        className="w-24 bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2 text-right font-extrabold text-white text-sm focus:outline-none"
                      />
                      <span className="absolute right-8 top-2 text-xs text-slate-400 pointer-events-none">
                        kg
                      </span>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-xs font-bold text-white">
                        {priceService.formatCurrency(subtotal)}
                      </p>
                      {diff !== 0 && (
                        <p
                          className={`text-[10px] font-bold ${
                            diff > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">
              Kilos: <span className="text-white font-bold">{calculatedTotalKg.toFixed(1)} kg</span> (orig. {originalTotalKg} kg)
            </p>
            <p className="text-base font-extrabold text-white">
              Total Remisión: <span className="text-emerald-400">{priceService.formatCurrency(calculatedTotal)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Pesaje</span>
            </button>
          </div>
        </div>
      </div>

      {/* Crates Tare Scale Modal */}
      <CratesTareScaleModal
        isOpen={isTareModalOpen}
        onClose={() => setIsTareModalOpen(false)}
        order={order}
        onApplyWeights={(_, payload) => {
          onSave(payload);
          setIsTareModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
};

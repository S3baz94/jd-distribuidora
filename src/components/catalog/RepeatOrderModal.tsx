"use client";

import React from "react";
import { RepeatOrderValidationResult } from "@/types";
import { priceService } from "@/services/priceService";
import { AlertTriangle, CheckCircle2, X, ArrowRight } from "lucide-react";

interface RepeatOrderModalProps {
  validationResult: RepeatOrderValidationResult;
  isOpen: boolean;
  onClose: () => void;
  onContinueToCart: () => void;
}

export const RepeatOrderModal: React.FC<RepeatOrderModalProps> = ({
  validationResult,
  isOpen,
  onClose,
  onContinueToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Actualización de Repetir Pedido
              </h3>
              <p className="text-xs text-slate-500">
                Verificamos disponibilidad y precios en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {validationResult.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
              <p className="font-bold text-amber-900">Avisos importantes:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                {validationResult.warnings.map((w, idx) => (
                  <li key={idx} className="leading-snug">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-slate-700 font-bold flex justify-between">
              <span>Producto</span>
              <span>Cantidad / Precio</span>
            </div>
            <div className="divide-y divide-slate-100">
              {validationResult.adjustedItems.map((item) => (
                <div key={item.productId} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.stockLimited ? (
                        <span className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-semibold border border-rose-200">
                          {item.finalQty === 0
                            ? "Agotado (0 kg)"
                            : `Ajustado a ${item.finalQty} kg disp.`}
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {item.finalQty} kg disponibles
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">
                      {priceService.formatCurrency(item.currentPrice * item.finalQty)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {priceService.formatCurrency(item.currentPrice)}/kg
                      {item.priceChanged && (
                        <span className="line-through text-slate-400 ml-1">
                          {priceService.formatCurrency(item.oldPrice)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onContinueToCart();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>Continuar al Carrito</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

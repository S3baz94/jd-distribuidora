"use client";

import React, { useState } from "react";
import { Product, InventoryItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { Calendar, Package, Clock, CheckCircle2, X } from "lucide-react";

interface FutureStockModalProps {
  product: Product;
  stock: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
}

export const FutureStockModal: React.FC<FutureStockModalProps> = ({
  product,
  stock,
  isOpen,
  onClose,
}) => {
  const { showToast } = useApp();
  const [reserved, setReserved] = useState(false);
  const [reserveKg, setReserveKg] = useState(product.minimumQuantity || 10);

  if (!isOpen) return null;

  const handleReserve = () => {
    setReserved(true);
    showToast(
      `Solicitud de reserva de ${reserveKg} kg de ${product.name} registrada para el ${stock.nextAvailabilityDate}`,
      "success"
    );
    setTimeout(() => {
      onClose();
      setReserved(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
              Próxima Disponibilidad
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{product.name}</h3>
            <p className="text-xs text-slate-500">SKU: {product.sku}</p>
          </div>
        </div>

        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-slate-400" />
              Estado actual:
            </span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              🔴 Agotado en bodega
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-brand-600" />
              Fecha estimada de llegada:
            </span>
            <span className="font-bold text-slate-900">
              {stock.nextAvailabilityDate || "Próximos días"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Package className="w-4 h-4 text-slate-400" />
              Volumen esperado del lote:
            </span>
            <span className="font-bold text-slate-900">
              {stock.futureQuantity} kg frescos
            </span>
          </div>
        </div>

        {reserved ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
            <p className="font-bold text-emerald-900 text-sm">¡Reserva de lote solicitada!</p>
            <p className="text-xs text-emerald-700 mt-1">
              Tu asesor comercial te contactará al recibir el lote fresco.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cantidad a separar / apartar:
              </label>
              <div className="flex items-center gap-2">
                {[10, 20, 30, 50].map((kg) => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => setReserveKg(kg)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      reserveKg === kg
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {kg} kg
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleReserve}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>
                RESERVAR {reserveKg} KG PARA EL{" "}
                {stock.nextAvailabilityDate?.toUpperCase() || "LOTE"}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Sin cobro anticipado. Se confirmará al recepcionar en planta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

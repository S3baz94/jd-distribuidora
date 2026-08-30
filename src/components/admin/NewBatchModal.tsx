"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { PlusCircle, X, Check, Boxes, Scale } from "lucide-react";

interface NewBatchModalProps {
  products: Product[];
  initialProductId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, addedKg: number, note?: string) => void;
}

export const NewBatchModal: React.FC<NewBatchModalProps> = ({
  products,
  initialProductId,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || products[0]?.id || "");
  const [addedKg, setAddedKg] = useState<number>(50);
  const [note, setNote] = useState<string>("Lote fresco de beneficio diario JD");

  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProductId, products, selectedProductId]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || addedKg <= 0) return;
    onSave(selectedProductId, addedKg, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Scale className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Ingreso de Lote Cárnico
              </h3>
              <p className="text-xs text-slate-400">
                Registro de pesaje y entrada a cámaras de frío JD
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              1. Selecciona el Corte a Ingresar:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand === "gourmet_ahumados" ? "🪵 Gourmet" : "🥩 JD"} - {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-600 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-black text-xs text-white truncate">{selectedProduct.name}</p>
                <p className="text-[11px] text-emerald-400 font-semibold">{selectedProduct.temperature}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              2. Kilos Pesados en Báscula de Entrada:
            </label>
            <div className="relative">
              <input
                type="number"
                step="5"
                min="1"
                required
                value={addedKg}
                onChange={(e) => setAddedKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border-2 border-emerald-500/50 focus:border-emerald-500 rounded-xl px-4 py-3 text-lg text-white font-black focus:outline-none"
              />
              <span className="absolute right-3.5 top-3 text-xs text-emerald-400 font-extrabold pointer-events-none">
                KG NETOS
              </span>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[25, 50, 100, 200].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setAddedKg(k)}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-lg border border-slate-700"
                >
                  {k} kg
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              3. Guía Sanitaria / Lote / Origen:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Guía Sanitaria ICA #9821 - Beneficio Guadalupe"
              className="w-full bg-slate-800 border border-slate-700 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Entrada en Bodega</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

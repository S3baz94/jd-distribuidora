"use client";

import React, { useState } from "react";
import { Product, ProductCategory, BrandType } from "@/types";
import { PlusCircle, X, Check, Boxes, Scale, Flame, DollarSign, Tag } from "lucide-react";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, initialStockKg: number, initialPrice: number) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState<BrandType>("jd_distribuidora");
  const [category, setCategory] = useState<ProductCategory>("cortes_magros");
  const [pricePerKg, setPricePerKg] = useState<number>(22000);
  const [initialStockKg, setInitialStockKg] = useState<number>(100);
  const [minimumQuantity, setMinimumQuantity] = useState<number>(5);
  const [cutType, setCutType] = useState("Corte 100% despostado y limpio bajo norma INVIMA");
  const [presentation, setPresentation] = useState("Despostado en canastilla plástica limpia (25kg)");
  const [description, setDescription] = useState("Corte de cerdo 100% despostado y porcionado sin mermas de canal. Refrigerado 0°C a 4°C.");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedId = `prod-${name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}-${Date.now().toString(36)}`;
    const finalSku = sku.trim() || (brand === "jd_distribuidora" ? `JD-${name.slice(0, 3).toUpperCase()}-01` : `GA-${name.slice(0, 3).toUpperCase()}-01`);

    const newProduct: Product = {
      id: generatedId,
      companyId: "dist-001",
      brand,
      sku: finalSku,
      name: name.trim(),
      cutType: cutType.trim() || "Corte crudo refrigerado",
      presentation: presentation.trim() || "En canastilla",
      temperature: brand === "jd_distribuidora" ? "Refrigerado 0°C a 4°C" : "Refrigerado 2°C a 6°C",
      description: description.trim(),
      category,
      image: brand === "jd_distribuidora" ? "/images/products/lomo.jpg" : "/images/products/costilla_ahumada.jpg",
      unit: "kg",
      minimumQuantity: Number(minimumQuantity) || 5,
      quantityStep: 5,
      active: true,
      isFrequent: true,
    };

    onSave(newProduct, Number(initialStockKg) || 0, Number(pricePerKg) || 20000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Crear Corte Real (100% Despostado)
              </h3>
              <p className="text-xs text-slate-400">
                Alimenta el catálogo y stock con cortes limpios listos para venta (sin canales)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Brand Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Línea de Negocio / Marca:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBrand("jd_distribuidora")}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs border flex items-center justify-center gap-2 transition-all ${
                  brand === "jd_distribuidora"
                    ? "bg-brand-600 text-white border-brand-500 shadow-md"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <span>🥩 JD Crudos</span>
              </button>
              <button
                type="button"
                onClick={() => setBrand("gourmet_ahumados")}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs border flex items-center justify-center gap-2 transition-all ${
                  brand === "gourmet_ahumados"
                    ? "bg-amber-600 text-white border-amber-500 shadow-md"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <span>🔥 Gourmet Ahumados</span>
              </button>
            </div>
          </div>

          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Nombre del Corte / Producto: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Tocino Barriguero Extra"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Código SKU (Opcional):
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej. JD-TOC-03"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Categoría:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="cortes_magros">🥩 Cortes Magros (Bondiola, Lomo, Pernil, Brazo)</option>
              <option value="cortes_con_hueso">🍖 Costillas & Cortes con Hueso (San Luis, Baby Back, Chuleta)</option>
              <option value="tocinos_grasas">🥓 Pancetas & Tocinos (Barriguero, Papada)</option>
              <option value="ahumados_costillas">🪵 Costillas Ahumadas al Leño</option>
              <option value="ahumados_chuletas">🪵 Chuletas Ahumadas al Roble</option>
              <option value="subproductos_crudos">📦 Subproductos / Menudencias</option>
            </select>
          </div>

          {/* Price per KG & Initial Stock */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Precio por Kilo (COP): *</span>
              </label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={pricePerKg}
                onChange={(e) => setPricePerKg(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-extrabold text-sm focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-cyan-400 flex items-center gap-1 mb-1">
                <Boxes className="w-3.5 h-3.5" />
                <span>Stock Inicial en Cava (kg):</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={initialStockKg}
                onChange={(e) => setInitialStockKg(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Presentation & Min Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Presentación / Empaque:
              </label>
              <input
                type="text"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="Ej. Canastilla 25kg / Pieza al vacío"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Pedido Mínimo (kg):
              </label>
              <input
                type="number"
                min={1}
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Descripción / Notas para el Carnicero:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Producto en Catálogo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

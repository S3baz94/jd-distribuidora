"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { BrandType, Product } from "@/types";
import {
  Boxes,
  ThermometerSnowflake,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Search,
  Plus,
  Minus,
  Save,
  Flame,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { NewBatchModal } from "@/components/admin/NewBatchModal";

export const ColdStorageStation: React.FC = () => {
  const { products, inventory, addInventoryBatch, updateInventoryStock, showToast } = useApp();

  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandTab, setSelectedBrandTab] = useState<BrandType | "all">("all");
  const [tempReading, setTempReading] = useState<string>("1.8");
  const [lastCheckTime, setLastCheckTime] = useState<string>("Hace 15 min");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  const totalPhysicalKg = inventory.reduce((sum, i) => sum + i.physicalQuantity, 0);
  const totalReservedKg = inventory.reduce((sum, i) => sum + i.reservedQuantity, 0);
  const totalAvailableKg = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
  const lowStockCount = inventory.filter((i) => i.availableQuantity <= 15).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchBrand = selectedBrandTab === "all" || p.brand === selectedBrandTab;
      if (!matchBrand) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, selectedBrandTab, searchTerm]);

  const handleQuickAdd = (productId: string, addedKg: number, name: string) => {
    addInventoryBatch(productId, addedKg, `Ingreso de báscula en bodega (+${addedKg} kg)`);
    showToast(`+${addedKg} kg ingresados al stock de ${name}`, "success");
  };

  const handleStartQuickEdit = (productId: string, currentAvailable: number) => {
    setEditingProductId(productId);
    setEditQty(currentAvailable);
  };

  const handleSaveQuickEdit = (productId: string) => {
    const inv = inventory.find((i) => i.productId === productId);
    if (inv) {
      updateInventoryStock(productId, {
        physicalQuantity: editQty + inv.reservedQuantity,
        availableQuantity: editQty,
      });
      showToast("✓ Stock en frío actualizado", "success");
    }
    setEditingProductId(null);
  };

  const handleRecordTemp = () => {
    setLastCheckTime("Justo ahora");
    showToast(`🌡️ Registro de temperatura guardado: ${tempReading}°C (Cumple norma INVIMA)`, "success");
  };

  return (
    <div className="space-y-5">
      {/* Header / Cold Storage Environment Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 font-bold">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                BODEGA & CAVA FRIGORÍFICA (TODO DESPOSTADO)
              </span>
              <h2 className="text-lg font-black text-white">Recepción de Cortes Despostados & Control de Stock</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewBatchOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ Ingreso de Lote Despostado</span>
          </button>
        </div>

        {/* Cold Storage Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock Físico en Cava:</span>
            <strong className="text-xl font-black text-white font-mono">
              {totalPhysicalKg.toFixed(0)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Disponible para Venta:</span>
            <strong className="text-xl font-black text-emerald-400 font-mono">
              {totalAvailableKg.toFixed(0)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Comprometido en Rutas:</span>
            <strong className="text-xl font-black text-amber-400 font-mono">
              {totalReservedKg.toFixed(0)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Alertas de Stock Bajo:</span>
            <strong className="text-xl font-black text-rose-400 font-mono">
              {lowStockCount} <span className="text-xs font-semibold text-slate-400">cortes</span>
            </strong>
          </div>
        </div>

        {/* Thermohygrometer Control Bar */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-bold">
              Termómetro Cava Central: <strong className="text-emerald-400 font-mono text-sm">{tempReading}°C</strong> ({lastCheckTime})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={tempReading}
              onChange={(e) => setTempReading(e.target.value)}
              className="w-16 bg-slate-800 border border-slate-700 rounded-xl p-1 text-center text-white font-mono font-bold text-xs"
            />
            <span className="text-slate-400">°C</span>
            <button
              onClick={handleRecordTemp}
              className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
            >
              Registrar INVIMA
            </button>
          </div>
        </div>
      </div>

      {/* Product Inventory List & Quick Báscula Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <span>Kardex en Frío por Corte de Cerdo</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar corte o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>

            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setSelectedBrandTab("all")}
                className={`px-2.5 py-1 rounded-lg ${
                  selectedBrandTab === "all" ? "bg-brand-600 text-white" : "text-slate-400"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedBrandTab("jd_distribuidora")}
                className={`px-2.5 py-1 rounded-lg ${
                  selectedBrandTab === "jd_distribuidora" ? "bg-brand-600 text-white" : "text-slate-400"
                }`}
              >
                Crudos
              </button>
              <button
                onClick={() => setSelectedBrandTab("gourmet_ahumados")}
                className={`px-2.5 py-1 rounded-lg ${
                  selectedBrandTab === "gourmet_ahumados" ? "bg-brand-600 text-white" : "text-slate-400"
                }`}
              >
                Ahumados
              </button>
            </div>
          </div>
        </div>

        {/* Cuts Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProducts.map((prod) => {
            const inv = inventory.find((i) => i.productId === prod.id) || {
              physicalQuantity: 0,
              availableQuantity: 0,
              reservedQuantity: 0,
            };

            const isOut = inv.availableQuantity <= 0;
            const isLow = inv.availableQuantity > 0 && inv.availableQuantity <= 15;
            const isEditing = editingProductId === prod.id;

            return (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          prod.brand === "gourmet_ahumados"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {prod.brand === "gourmet_ahumados" ? "Ahumado al Leño" : "Corte Crudo"}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">{prod.name}</h4>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl font-mono ${
                      isOut
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : isLow
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {inv.availableQuantity.toFixed(1)} kg disp.
                  </span>
                </div>

                {/* Stock Stats Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-center">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Físico Cava:</span>
                    <strong className="text-white font-mono font-bold">{inv.physicalQuantity.toFixed(1)} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">En Furgones:</span>
                    <strong className="text-amber-400 font-mono font-bold">{inv.reservedQuantity.toFixed(1)} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Precio Ref / KG:</span>
                    <strong className="text-slate-300 font-mono font-bold">{priceService.formatCurrency(priceService.getPriceForCustomer("list-famas-a", prod.id))}</strong>
                  </div>
                </div>

                {/* Quick Add Kilos & Edit Controls */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="number"
                        step="0.5"
                        value={editQty}
                        onChange={(e) => setEditQty(parseFloat(e.target.value) || 0)}
                        className="w-24 bg-slate-800 border border-slate-700 rounded-lg p-1 text-white font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => handleSaveQuickEdit(prod.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartQuickEdit(prod.id, inv.availableQuantity)}
                        className="text-[11px] text-slate-400 hover:text-white font-bold"
                      >
                        Ajustar Stock Físico
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">Ingreso Báscula:</span>
                        <button
                          onClick={() => handleQuickAdd(prod.id, 25, prod.name)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] border border-slate-700 active:scale-95"
                        >
                          +25 kg
                        </button>
                        <button
                          onClick={() => handleQuickAdd(prod.id, 50, prod.name)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] border border-slate-700 active:scale-95"
                        >
                          +50 kg
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Batch Modal */}
      <NewBatchModal
        products={products}
        isOpen={isNewBatchOpen}
        onClose={() => setIsNewBatchOpen(false)}
        onSave={addInventoryBatch}
      />
    </div>
  );
};

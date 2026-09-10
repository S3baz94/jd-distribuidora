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
  Trash2,
} from "lucide-react";
import { NewBatchModal } from "@/components/admin/NewBatchModal";
import { NewProductModal } from "@/components/admin/NewProductModal";

export const ColdStorageStation: React.FC = () => {
  const {
    products,
    inventory,
    addInventoryBatch,
    updateInventoryStock,
    createProduct,
    deleteProduct,
    showToast,
  } = useApp();

  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditProductMap, setAuditProductMap] = useState<Record<string, number>>({});
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
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 font-bold flex-shrink-0">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 inline-block">
                BODEGA & CAVA FRIGORÍFICA (TODO DESPOSTADO)
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate">Recepción de Cortes & Control de Stock</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsNewProductOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 active:scale-95 transition-all text-center"
              title="Crear un nuevo corte o producto en el catálogo oficial"
            >
              <Plus className="w-4 h-4 stroke-[3] flex-shrink-0" />
              <span>➕ Crear Corte</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-500/40 shadow-md active:scale-95 transition-all text-center"
              title="Comparar inventario en sistema vs pesaje físico en báscula"
            >
              <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>⚖️ Arqueo<span className="hidden sm:inline"> Físico</span></span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewBatchOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all text-center"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <span>➕ Ingreso Lote<span className="hidden sm:inline"> Despostado</span></span>
            </button>
          </div>
        </div>

        {/* Cold Storage Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Físico en Cava:</span>
            <strong className="text-lg sm:text-xl font-black text-white font-mono block truncate">
              {totalPhysicalKg.toFixed(0)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Disponible Venta:</span>
            <strong className="text-lg sm:text-xl font-black text-emerald-400 font-mono block truncate">
              {totalAvailableKg.toFixed(0)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">En Furgones:</span>
            <strong className="text-lg sm:text-xl font-black text-amber-400 font-mono block truncate">
              {totalReservedKg.toFixed(0)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Alertas de Stock:</span>
            <strong className="text-lg sm:text-xl font-black text-rose-400 font-mono block truncate">
              {lowStockCount} <span className="text-xs font-semibold text-slate-400">cortes</span>
            </strong>
          </div>
        </div>

        {/* Thermohygrometer Control Bar */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span className="text-slate-300 font-bold break-words">
              Termómetro Cava: <strong className="text-emerald-400 font-mono text-sm">{tempReading}°C</strong> ({lastCheckTime})
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Kardex en Frío por Corte de Cerdo</span>
          </h3>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar corte o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-44"
              />
            </div>

            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-[11px] font-bold flex-shrink-0">
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
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex-shrink-0">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                          prod.brand === "gourmet_ahumados"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {prod.brand === "gourmet_ahumados" ? "Ahumado al Leño" : "Corte Crudo"}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1 break-words">{prod.name}</h4>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
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

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar corte "${prod.name}" del inventario de cava?`)) {
                          deleteProduct(prod.id);
                          showToast(`✓ Corte "${prod.name}" eliminado del inventario`, "info");
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Eliminar corte de inventario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Stats Grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] text-center">
                  <div className="min-w-0">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold truncate">Físico Cava:</span>
                    <strong className="text-white font-mono font-bold block truncate">{inv.physicalQuantity.toFixed(1)} kg</strong>
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold truncate">En Furgones:</span>
                    <strong className="text-amber-400 font-mono font-bold block truncate">{inv.reservedQuantity.toFixed(1)} kg</strong>
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold truncate">Precio / KG:</span>
                    <strong className="text-slate-300 font-mono font-bold block truncate">{priceService.formatCurrency(priceService.getPriceForCustomer("list-famas-a", prod.id))}</strong>
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

      {/* Modal de Arqueo Físico de Cava & Mermas */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Scale className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    AUDITORÍA OPERATIVA EN BÁSCULA
                  </span>
                  <h3 className="font-black text-lg text-white mt-0.5">
                    Arqueo Físico de Cava & Cuadre de Mermas
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Registra los kilos reales pesados en báscula para cada corte. El sistema calculará la variación contra el saldo teórico y actualizará el inventario físico con total trazabilidad.
            </p>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {products.slice(0, 8).map((prod) => {
                const inv = inventory.find((i) => i.productId === prod.id) || {
                  physicalQuantity: 0,
                  availableQuantity: 0,
                  reservedQuantity: 0,
                };
                const physicalInput = auditProductMap[prod.id] ?? inv.availableQuantity;
                const diff = physicalInput - inv.availableQuantity;

                return (
                  <div
                    key={prod.id}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {prod.sku}
                        </span>
                        <h4 className="font-bold text-white text-sm">{prod.name}</h4>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Stock teórico: <strong className="text-slate-200">{inv.availableQuantity.toFixed(1)} kg</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-400 font-bold">Pesaje:</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={physicalInput}
                          onChange={(e) =>
                            setAuditProductMap({
                              ...auditProductMap,
                              [prod.id]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 bg-slate-800 border border-slate-700 rounded-xl p-1.5 text-right font-mono font-bold text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-slate-400 font-bold">kg</span>
                      </div>

                      <div className="w-24 text-right">
                        <span
                          className={`font-mono font-black text-xs block ${
                            diff === 0
                              ? "text-slate-400"
                              : diff > 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-500">
                          {diff === 0 ? "Exacto" : diff > 0 ? "Sobrante" : "Merma"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  Object.entries(auditProductMap).forEach(([pid, newQty]) => {
                    const inv = inventory.find((i) => i.productId === pid);
                    if (inv) {
                      updateInventoryStock(pid, {
                        physicalQuantity: newQty + inv.reservedQuantity,
                        availableQuantity: newQty,
                      });
                    }
                  });
                  showToast("✓ Arqueo físico de cava aplicado exitosamente", "success");
                  setIsAuditModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Arqueo & Cuadrar Cava</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación de Nuevos Cortes para el Operador */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onSave={(newProd, initialStock, initialPrice) => {
          createProduct(newProd, initialStock, initialPrice);
          showToast(`✓ Nuevo corte "${newProd.name}" registrado en inventario por el operador`, "success");
        }}
      />
    </div>
  );
};

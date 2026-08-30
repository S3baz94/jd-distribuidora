"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { exportService } from "@/services/exportService";
import { BrandType, Product } from "@/types";
import {
  Boxes,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Save,
  RefreshCw,
  Search,
  Filter,
  Download,
  Flame,
  Plus,
  Minus,
  Sparkles,
  Scale,
  ThermometerSnowflake,
} from "lucide-react";
import { NewBatchModal } from "@/components/admin/NewBatchModal";

export default function AdminInventoryPage() {
  const { products, inventory, addInventoryBatch, updateInventoryStock, showToast } = useApp();
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState<string | undefined>(undefined);
  const [selectedBrandTab, setSelectedBrandTab] = useState<BrandType | "all">("jd_distribuidora");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    physicalQuantity: number;
    availableQuantity: number;
    futureQuantity: number;
    nextAvailabilityDate: string;
    canReserveFuture: boolean;
  }>({
    physicalQuantity: 0,
    availableQuantity: 0,
    futureQuantity: 0,
    nextAvailabilityDate: "",
    canReserveFuture: true,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchBrand = selectedBrandTab === "all" || p.brand === selectedBrandTab;
      if (!matchBrand) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, selectedBrandTab, searchTerm]);

  // Inventory Totals
  const totalPhysicalKg = inventory.reduce((sum, i) => sum + i.physicalQuantity, 0);
  const totalReservedKg = inventory.reduce((sum, i) => sum + i.reservedQuantity, 0);
  const totalAvailableKg = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
  const lowStockCount = inventory.filter((i) => i.availableQuantity <= 15).length;
  const outOfStockCount = inventory.filter((i) => i.availableQuantity <= 0).length;

  const handleStartEdit = (productId: string) => {
    const inv = inventory.find((i) => i.productId === productId);
    if (inv) {
      setEditingStockId(productId);
      setEditValues({
        physicalQuantity: inv.physicalQuantity,
        availableQuantity: inv.availableQuantity,
        futureQuantity: inv.futureQuantity,
        nextAvailabilityDate: inv.nextAvailabilityDate || "",
        canReserveFuture: inv.canReserveFuture,
      });
    }
  };

  const handleSaveEdit = (productId: string) => {
    updateInventoryStock(productId, editValues);
    setEditingStockId(null);
    showToast("✓ Stock actualizado correctamente", "success");
  };

  const handleQuickAddKg = (productId: string, addedKg: number, productName: string) => {
    addInventoryBatch(productId, addedKg, `Ingreso rápido de báscula (+${addedKg} kg)`);
    showToast(`+${addedKg} kg ingresados al stock de ${productName}`, "success");
  };

  const handleOpenBatchForProduct = (productId?: string) => {
    setSelectedProductForBatch(productId);
    setIsNewBatchOpen(true);
  };

  const handleExportCSV = () => {
    exportService.exportInventoryToCSV(inventory, products);
    showToast("📥 Base de datos de inventario exportada a Excel (CSV)", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Control de Inventario & Lotes en Frío
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Entrada de canales despostadas, pesaje en báscula, reservas de clientes y stock para venta
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            title="Descargar inventario para Excel"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Descargar Inventario (.CSV)</span>
          </button>

          <button
            onClick={() => handleOpenBatchForProduct(undefined)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>➕ INGRESAR LOTE DE CARNE (BÁSCULA)</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Kilos en Bodega:</span>
          <p className="text-xl sm:text-2xl font-black text-white">
            {totalPhysicalKg.toFixed(0)} kg
          </p>
          <span className="text-[11px] text-slate-400 font-semibold">Pesaje físico en cámaras de frío</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Kilos Comprometidos:</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400">
            {totalReservedKg.toFixed(0)} kg
          </p>
          <span className="text-[11px] text-amber-500/90 font-semibold">Reservados en pedidos activos</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Disponible para Venta Hoy:</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">
            {totalAvailableKg.toFixed(0)} kg
          </p>
          <span className="text-[11px] text-emerald-500/90 font-semibold">Listos para despachar de inmediato</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Alertas de Reposición:</span>
          <p className="text-xl sm:text-2xl font-black text-rose-400">
            {outOfStockCount > 0 ? `${outOfStockCount} agotados` : `${lowStockCount} bajos`}
          </p>
          <span className="text-[11px] text-rose-400 font-semibold">
            {outOfStockCount > 0 ? "Requiere programar beneficio" : "Stock en nivel óptimo"}
          </span>
        </div>
      </div>

      {/* Brand Navigation Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedBrandTab("jd_distribuidora")}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                selectedBrandTab === "jd_distribuidora"
                  ? "bg-rose-600 text-white shadow-lg ring-1 ring-rose-400"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white"
              }`}
            >
              <span>🥩 JD Cerdo Crudo (13 Cortes)</span>
            </button>

            <button
              onClick={() => setSelectedBrandTab("gourmet_ahumados")}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                selectedBrandTab === "gourmet_ahumados"
                  ? "bg-amber-600 text-white shadow-lg ring-1 ring-amber-400"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Gourmet Ahumados (Costillas & Chuletas)</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por corte o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Product Inventory Cards (Intuitive Visual Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const inv = inventory.find((i) => i.productId === product.id) || {
            productId: product.id,
            companyId: "dist-001",
            physicalQuantity: 0,
            reservedQuantity: 0,
            availableQuantity: 0,
            futureQuantity: 0,
            canReserveFuture: true,
          };

          const isEditing = editingStockId === product.id;
          const isOut = inv.availableQuantity <= 0;
          const isLow = inv.availableQuantity > 0 && inv.availableQuantity <= 15;

          return (
            <div
              key={product.id}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:border-slate-700 ${
                isOut
                  ? "border-rose-900/50 bg-rose-950/10"
                  : isLow
                  ? "border-amber-900/50 bg-amber-950/10"
                  : "border-slate-800"
              }`}
            >
              <div className="space-y-3">
                {/* Image & Title Header */}
                <div className="flex items-start gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-700 flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {product.sku}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          isOut
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : isLow
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isOut ? "🔴 Agotado" : isLow ? "🟡 Stock Bajo" : "🟢 Disponible"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight mt-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {product.cutType}
                    </p>
                  </div>
                </div>

                {/* 3-Pillar Stock Counters */}
                <div className="grid grid-cols-3 gap-2 bg-slate-850 p-3 rounded-2xl border border-slate-750 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      En Bodega:
                    </span>
                    <strong className="text-sm font-black text-white">
                      {inv.physicalQuantity} kg
                    </strong>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Reservado:
                    </span>
                    <strong className="text-sm font-black text-amber-400">
                      {inv.reservedQuantity} kg
                    </strong>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Para Venta:
                    </span>
                    <strong
                      className={`text-sm font-black ${
                        isOut
                          ? "text-rose-400"
                          : isLow
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {inv.availableQuantity} kg
                    </strong>
                  </div>
                </div>

                {/* Inline Quick Editor if Editing */}
                {isEditing && (
                  <div className="p-3 bg-slate-800 rounded-2xl border border-brand-500/50 space-y-2.5 text-xs animate-in zoom-in-95">
                    <p className="font-bold text-brand-300 text-[11px]">
                      Ajuste Manual de Inventario:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Kilos Físicos:</label>
                        <input
                          type="number"
                          value={editValues.physicalQuantity}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              physicalQuantity: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-center text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Disponibles:</label>
                        <input
                          type="number"
                          value={editValues.availableQuantity}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              availableQuantity: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-center text-emerald-400 font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveEdit(product.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center justify-center gap-1 text-xs shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Ajuste</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons (Add Kilos with 1 tap) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Ingreso Rápido de Báscula (+kg):
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleQuickAddKg(product.id, 25, product.name)}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    +25 kg
                  </button>
                  <button
                    onClick={() => handleQuickAddKg(product.id, 50, product.name)}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    +50 kg
                  </button>
                  <button
                    onClick={() => handleQuickAddKg(product.id, 100, product.name)}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    +100 kg
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenBatchForProduct(product.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Ingresar con Lote</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(product.id)}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Batch Modal */}
      <NewBatchModal
        products={products}
        initialProductId={selectedProductForBatch}
        isOpen={isNewBatchOpen}
        onClose={() => {
          setIsNewBatchOpen(false);
          setSelectedProductForBatch(undefined);
        }}
        onSave={addInventoryBatch}
      />
    </div>
  );
}

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
  ClipboardList,
  Check,
  Eye,
  Edit3,
} from "lucide-react";
import { NewBatchModal } from "@/components/admin/NewBatchModal";
import { NewProductModal } from "@/components/admin/NewProductModal";

interface PlantPackingStationProps {
  selectedRouteId?: string;
  onRouteChange?: (routeId: string) => void;
}

export const PlantPackingStation: React.FC<PlantPackingStationProps> = () => {
  const {
    products,
    inventory,
    addInventoryBatch,
    updateInventoryStock,
    createProduct,
    deleteProduct,
    showToast,
  } = useApp();

  // Estados para modales de modificación de inventario
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditProductMap, setAuditProductMap] = useState<Record<string, number>>({});

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandTab, setSelectedBrandTab] = useState<BrandType | "all">("all");

  // Telemetría de cava
  const [tempReading, setTempReading] = useState<string>("1.8");
  const [lastCheckTime, setLastCheckTime] = useState<string>("Hace 15 min");

  // Modificación rápida directa de stock
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  // 1. CÁLCULO DEL RESUMEN DE INVENTARIO
  const totalPhysicalKg = inventory.reduce((sum, i) => sum + (i.physicalQuantity || 0), 0);
  const totalReservedKg = inventory.reduce((sum, i) => sum + (i.reservedQuantity || 0), 0);
  const totalAvailableKg = inventory.reduce((sum, i) => sum + (i.availableQuantity || 0), 0);
  const lowStockCount = inventory.filter((i) => i.availableQuantity <= 15).length;
  const outOfStockCount = inventory.filter((i) => i.availableQuantity <= 0).length;

  // 2. FILTRADO PARA MIRAR EL INVENTARIO
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchBrand = selectedBrandTab === "all" || p.brand === selectedBrandTab;
      if (!matchBrand) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, selectedBrandTab, searchTerm]);

  // 3. FUNCIONES PARA MODIFICAR EL INVENTARIO
  const handleQuickAdd = (productId: string, addedKg: number, name: string) => {
    addInventoryBatch(productId, addedKg, `Ajuste de báscula en alistamiento (+${addedKg} kg)`);
    showToast(`⚖️ +${addedKg} kg agregados al stock de ${name}`, "success");
  };

  const handleQuickSubtract = (productId: string, subKg: number, name: string) => {
    const inv = inventory.find((i) => i.productId === productId);
    if (!inv) return;
    const currentAvailable = inv.availableQuantity;
    const newAvailable = Math.max(0, currentAvailable - subKg);
    const newPhysical = Math.max(0, inv.physicalQuantity - subKg);

    updateInventoryStock(productId, {
      physicalQuantity: newPhysical,
      availableQuantity: newAvailable,
    });
    showToast(`⚖️ -${subKg} kg descontados del stock de ${name}`, "info");
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
      showToast("✓ Stock físico y disponible actualizado exitosamente", "success");
    }
    setEditingProductId(null);
  };

  const handleRecordTemp = () => {
    setLastCheckTime("Justo ahora");
    showToast(`🌡️ Registro de temperatura de cava guardado: ${tempReading}°C (Norma INVIMA)`, "success");
  };

  return (
    <div className="space-y-5">
      {/* SECCIÓN 1: CABECERA & ACCIONES DE MODIFICACIÓN */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold flex-shrink-0 shadow-md">
              <ClipboardList className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block">
                ESTACIÓN DE ALISTAMIENTO & CONTROL DE CAVA
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                Inventario en Frío, Modificación & Resumen de Stock
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Visualización en tiempo real de cortes, ajuste directo de pesaje y control de lotes.
              </p>
            </div>
          </div>

          {/* Botones principales para MODIFICAR EL INVENTARIO */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsNewProductOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 active:scale-95 transition-all text-center"
              title="Crear un nuevo corte o producto cárnico en el inventario"
            >
              <Plus className="w-4 h-4 stroke-[3] flex-shrink-0" />
              <span>➕ Crear Corte</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const initialMap: Record<string, number> = {};
                products.forEach((p) => {
                  const inv = inventory.find((i) => i.productId === p.id);
                  initialMap[p.id] = inv ? inv.availableQuantity : 0;
                });
                setAuditProductMap(initialMap);
                setIsAuditModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-500/40 shadow-md active:scale-95 transition-all text-center"
              title="Comparar inventario en sistema contra pesaje físico de báscula"
            >
              <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>⚖️ Arqueo Físico</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewBatchOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all text-center"
              title="Ingresar un nuevo lote despostado pesado en báscula"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <span>➕ Ingreso de Lote Despostado</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: VER EL RESUMEN (TARJETAS DE MÉTRICAS CONSOLIDADAS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Total Físico en Cava:</span>
            <strong className="text-lg sm:text-xl font-black text-white font-mono block truncate">
              {totalPhysicalKg.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
            <span className="text-[9px] text-slate-500 font-semibold block truncate mt-0.5">
              Stock total pesado en cava
            </span>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Disponible para Venta:</span>
            <strong className="text-lg sm:text-xl font-black text-emerald-400 font-mono block truncate">
              {totalAvailableKg.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
            <span className="text-[9px] text-emerald-500/80 font-semibold block truncate mt-0.5">
              Listo para facturar
            </span>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Comprometido en Pedidos:</span>
            <strong className="text-lg sm:text-xl font-black text-amber-400 font-mono block truncate">
              {totalReservedKg.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
            <span className="text-[9px] text-amber-500/80 font-semibold block truncate mt-0.5">
              Reservado para entrega
            </span>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold truncate">Alertas de Stock:</span>
            <strong className="text-lg sm:text-xl font-black text-rose-400 font-mono block truncate">
              {lowStockCount} <span className="text-xs font-semibold text-slate-400">cortes</span>
            </strong>
            <span className="text-[9px] text-rose-500/80 font-semibold block truncate mt-0.5">
              {outOfStockCount > 0 ? `${outOfStockCount} agotados` : "Existencias bajo umbral"}
            </span>
          </div>
        </div>

        {/* Barra de Monitoreo Térmico de Cava */}
        <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span className="text-slate-300 font-bold break-words">
              Temperatura Cava Frigorífica: <strong className="text-emerald-400 font-mono text-sm">{tempReading}°C</strong> ({lastCheckTime})
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
            <span className="text-slate-400 font-bold">°C</span>
            <button
              onClick={handleRecordTemp}
              className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              Registrar INVIMA
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: MIRAR EL INVENTARIO & CONTROLES DE MODIFICACIÓN */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <h3 className="font-extrabold text-sm text-white">
              Cortes de Cerdo en Cava ({filteredProducts.length} referencias)
            </h3>
          </div>

          {/* Barra de búsqueda y selector de marcas */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar corte o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-48"
              />
            </div>

            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-[11px] font-bold flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBrandTab("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedBrandTab === "all" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandTab("jd_distribuidora")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedBrandTab === "jd_distribuidora" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Crudos (JD)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandTab("gourmet_ahumados")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedBrandTab === "gourmet_ahumados" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Ahumados
              </button>
            </div>
          </div>
        </div>

        {/* LISTADO DE CORTES CÁRNICOS CON OPCIONES DE MODIFICACIÓN DIRECTA */}
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
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 min-w-0 shadow-md"
              >
                {/* Cabecera del corte */}
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
                      title="Eliminar corte del inventario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Métricas de Stock por Corte */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] text-center">
                  <div className="min-w-0">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold truncate">Físico Cava:</span>
                    <strong className="text-white font-mono font-bold block truncate">
                      {inv.physicalQuantity.toFixed(1)} kg
                    </strong>
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold truncate">En Pedidos:</span>
                    <strong className="text-amber-400 font-mono font-bold block truncate">
                      {inv.reservedQuantity.toFixed(1)} kg
                    </strong>
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold truncate">Precio / KG:</span>
                    <strong className="text-slate-300 font-mono font-bold block truncate">
                      {priceService.formatCurrency(priceService.getPriceForCustomer("list-famas-a", prod.id))}
                    </strong>
                  </div>
                </div>

                {/* CONTROLES PARA MODIFICAR EL INVENTARIO DE ESTE CORTE */}
                <div className="space-y-2 pt-1 border-t border-slate-800/90">
                  {/* Fila A: Edición directa del stock disponible */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full bg-slate-900 p-2 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">Nuevo Disponible:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={editQty}
                        onChange={(e) => setEditQty(parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-slate-950 border border-slate-600 rounded-lg p-1 text-white font-mono font-bold text-xs"
                      />
                      <span className="text-xs text-slate-400 font-bold">kg</span>
                      <button
                        type="button"
                        onClick={() => handleSaveQuickEdit(prod.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProductId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">Ajuste de Báscula:</span>
                      <button
                        type="button"
                        onClick={() => handleStartQuickEdit(prod.id, inv.availableQuantity)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar Kilos Directo</span>
                      </button>
                    </div>
                  )}

                  {/* Fila B: Botones táctiles de adición y resta rápida de pesaje */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Restar:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickSubtract(prod.id, 10, prod.name)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-[10px] font-bold border border-slate-800 transition-colors"
                        title="Descontar 10 kg de stock"
                      >
                        -10 kg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSubtract(prod.id, 25, prod.name)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-[10px] font-bold border border-slate-800 transition-colors"
                        title="Descontar 25 kg de stock"
                      >
                        -25 kg
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Sumar Báscula:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod.id, 10, prod.name)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-400 text-[10px] font-bold border border-slate-800 transition-colors"
                        title="Agregar 10 kg por pesaje"
                      >
                        +10 kg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod.id, 25, prod.name)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-400 text-[10px] font-bold border border-slate-800 transition-colors"
                        title="Agregar 25 kg (1 canastilla completa aprox.)"
                      >
                        +25 kg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod.id, 50, prod.name)}
                        className="px-2 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-[10px] font-bold border border-emerald-800/40 transition-colors"
                        title="Agregar 50 kg (2 canastillas completas)"
                      >
                        +50 kg
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: INGRESO DE NUEVO LOTE DESPOSTADO (MODIFICAR INVENTARIO) */}
      <NewBatchModal
        isOpen={isNewBatchOpen}
        onClose={() => setIsNewBatchOpen(false)}
        products={products}
        onSave={(productId, qty, notes) => {
          addInventoryBatch(productId, qty, notes);
          showToast(`✓ Lote despostado de ${qty} kg ingresado con éxito al inventario`, "success");
        }}
      />

      {/* MODAL 2: CREACIÓN DE NUEVO CORTE / PRODUCTO (MODIFICAR INVENTARIO) */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onSave={(newProd, initialStock, initialPrice) => {
          createProduct(newProd, initialStock, initialPrice);
          showToast(`✓ Nuevo corte "${newProd.name}" registrado en inventario por el operador`, "success");
        }}
      />

      {/* MODAL 3: ARQUEO FÍSICO DE INVENTARIO CON BÁSCULA */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Arqueo Físico de Inventario en Cava</h3>
                  <p className="text-xs text-slate-400">
                    Compara el stock teórico contra el pesaje físico real de báscula.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {products.map((prod) => {
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
                        Stock registrado: <strong className="text-slate-200">{inv.availableQuantity.toFixed(1)} kg</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-400 font-bold">Pesaje Físico:</label>
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
    </div>
  );
};

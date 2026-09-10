"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  CheckCircle2,
  Truck,
  RotateCcw,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  ShieldCheck,
  Building2,
  Store,
  RefreshCw,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { cratesService, CratesInventoryState, CrateMovement } from "@/services/cratesService";
import { useApp } from "@/context/AppContext";

export const CratesInventoryManager: React.FC = () => {
  const { showToast } = useApp();
  const [cratesState, setCratesState] = useState<CratesInventoryState>(() => cratesService.getState());
  const [modalType, setModalType] = useState<"lavado" | "retorno" | "ajuste" | null>(null);
  const [inputQuantity, setInputQuantity] = useState<number>(20);
  const [inputSource, setInputSource] = useState<string>("Área de Lavado & Desinfección");
  const [inputNotes, setInputNotes] = useState<string>("");

  useEffect(() => {
    setCratesState(cratesService.getState());
  }, []);

  const handleOpenModal = (type: "lavado" | "retorno" | "ajuste") => {
    setModalType(type);
    if (type === "lavado") {
      setInputQuantity(25);
      setInputSource("Lavandería & Desinfección Planta");
      setInputNotes("Canastillas plásticas limpias y desinfectadas");
    } else if (type === "retorno") {
      setInputQuantity(15);
      setInputSource("Furgón NQR-482 (Carlos Pérez)");
      setInputNotes("Canastillas vacías recogidas en ruta");
    } else {
      setInputQuantity(cratesState.totalFleet);
      setInputSource("Auditoría General de Planta");
      setInputNotes("Ajuste de inventario físico");
    }
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuantity <= 0) {
      showToast("La cantidad debe ser mayor a 0", "warning");
      return;
    }

    if (modalType === "lavado") {
      const updated = cratesService.recordCleaningBatch(inputQuantity, "Operador de Planta", inputNotes);
      setCratesState(updated);
      showToast(`✓ +${inputQuantity} canastillas limpias agregadas al inventario de planta`, "success");
    } else if (modalType === "retorno") {
      const updated = cratesService.returnToPlant(inputQuantity, inputSource, inputNotes);
      setCratesState(updated);
      showToast(`✓ +${inputQuantity} canastillas devueltas recibidas en planta`, "success");
    } else if (modalType === "ajuste") {
      const updated = cratesService.adjustFleetCounts({ inPlantClean: inputQuantity });
      setCratesState(updated);
      showToast(`✓ Inventario de canastillas en planta ajustado a ${inputQuantity} unidades`, "success");
    }

    setModalType(null);
  };

  // Porcentajes de balance
  const total = cratesState.totalFleet || 300;
  const pctClean = Math.round((cratesState.inPlantClean / total) * 100);
  const pctPacking = Math.round((cratesState.inPacking / total) * 100);
  const pctTransit = Math.round((cratesState.inTransit / total) * 100);
  const pctCust = Math.round((cratesState.withCustomers / total) * 100);

  return (
    <div className="space-y-5">
      {/* Cabecera del Panel de Canastillas */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0 shadow-md">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-block">
                  CONTROL LOGÍSTICO & EMBALAJE
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Tara estándar: 2.00 kg c/u
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1 truncate">
                Contabilidad & Censo de Canastillas JD
              </h2>
              <p className="text-xs text-slate-300">
                Seguimiento en tiempo real de las canastillas plásticas en planta, pedidos, furgones y clientes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenModal("lavado")}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all text-center"
            >
              <ArrowDownToLine className="w-4 h-4 flex-shrink-0" />
              <span>+ Canastillas Lavadas</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal("retorno")}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950/40 active:scale-95 transition-all text-center"
            >
              <RotateCcw className="w-4 h-4 flex-shrink-0" />
              <span>Descargar Retorno</span>
            </button>
          </div>
        </div>

        {/* Las 4 Tarjetas Métricas Clave */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. En Planta Limpias */}
          <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border-2 border-emerald-500/40 shadow-md flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span className="flex items-center gap-1 truncate">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" /> En Planta
              </span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                {pctClean}%
              </span>
            </div>
            <div className="my-2">
              <span className="text-xl sm:text-3xl font-black text-white font-mono block truncate">
                {cratesState.inPlantClean}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 block font-medium truncate">Canastillas limpias</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 block truncate text-center">
              Listas para empaque
            </span>
          </div>

          {/* 2. En Alistamiento (Con carne) */}
          <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border-2 border-amber-500/40 shadow-md flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
              <span className="flex items-center gap-1 truncate">
                <Boxes className="w-3.5 h-3.5 flex-shrink-0" /> En Pedidos
              </span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                {pctPacking}%
              </span>
            </div>
            <div className="my-2">
              <span className="text-xl sm:text-3xl font-black text-white font-mono block truncate">
                {cratesState.inPacking}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 block font-medium truncate">Con carne pesada</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 block truncate text-center">
              En sala de pesaje
            </span>
          </div>

          {/* 3. En Furgones (En Tránsito) */}
          <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border-2 border-blue-500/40 shadow-md flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
              <span className="flex items-center gap-1 truncate">
                <Truck className="w-3.5 h-3.5 flex-shrink-0" /> En Furgones
              </span>
              <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                {pctTransit}%
              </span>
            </div>
            <div className="my-2">
              <span className="text-xl sm:text-3xl font-black text-white font-mono block truncate">
                {cratesState.inTransit}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 block font-medium truncate">En ruta de frío</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-blue-300 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40 block truncate text-center">
              Vehículos en ruta
            </span>
          </div>

          {/* 4. En Clientes (En Calle) */}
          <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border-2 border-rose-500/40 shadow-md flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
              <span className="flex items-center gap-1 truncate">
                <Store className="w-3.5 h-3.5 flex-shrink-0" /> En Clientes
              </span>
              <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                {pctCust}%
              </span>
            </div>
            <div className="my-2">
              <span className="text-xl sm:text-3xl font-black text-white font-mono block truncate">
                {cratesState.withCustomers}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 block font-medium truncate">En locales</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-rose-300 font-semibold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 block truncate text-center">
              Por recolectar en ruta
            </span>
          </div>
        </div>

        {/* Barra Visual de Balance de Flota */}
        <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Balance Total de la Flota: <strong className="text-white font-mono">{total} canastillas</strong></span>
            </span>
            <button
              type="button"
              onClick={() => handleOpenModal("ajuste")}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold self-start sm:self-auto"
            >
              Ajustar Inventario Físico
            </button>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${pctClean}%` }} className="bg-emerald-500 h-full" title={`En Planta: ${cratesState.inPlantClean}`} />
            <div style={{ width: `${pctPacking}%` }} className="bg-amber-500 h-full" title={`En Pedidos: ${cratesState.inPacking}`} />
            <div style={{ width: `${pctTransit}%` }} className="bg-blue-500 h-full" title={`En Furgones: ${cratesState.inTransit}`} />
            <div style={{ width: `${pctCust}%` }} className="bg-rose-500 h-full" title={`En Clientes: ${cratesState.withCustomers}`} />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between text-[10px] text-slate-400 gap-1.5 pt-0.5">
            <span className="flex items-center gap-1 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" /> Planta ({cratesState.inPlantClean})
            </span>
            <span className="flex items-center gap-1 truncate">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" /> Pedidos ({cratesState.inPacking})
            </span>
            <span className="flex items-center gap-1 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" /> Furgones ({cratesState.inTransit})
            </span>
            <span className="flex items-center gap-1 truncate">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" /> Clientes ({cratesState.withCustomers})
            </span>
          </div>
        </div>
      </div>

      {/* Bitácora de Movimientos Recientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-white text-base">
              Bitácora de Movimientos de Canastillas
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {cratesState.movements.length} registros
          </span>
        </div>

        <div className="space-y-2">
          {cratesState.movements.map((mov) => (
            <div
              key={mov.id}
              className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    mov.type === "lavado_ingreso"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : mov.type === "cargue_furgon"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : mov.type === "descarga_retorno"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {mov.type === "lavado_ingreso" ? "🧼" : mov.type === "cargue_furgon" ? "🚚" : mov.type === "descarga_retorno" ? "↩️" : "📦"}
                </span>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white text-sm">
                      {mov.quantity > 0 ? `+${mov.quantity}` : `${mov.quantity}`} canastillas
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                      {mov.type.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {mov.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-300 mt-0.5 text-xs font-medium">
                    {mov.source} ➔ <strong className="text-amber-300">{mov.destination}</strong>
                  </p>
                  {mov.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      "{mov.notes}" • Resp: {mov.responsible}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  {mov.responsible}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Registro de Movimiento */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">
                  {modalType === "lavado"
                    ? "Recepción de Canastillas Lavadas"
                    : modalType === "retorno"
                    ? "Descargar Retorno de Furgón / Cliente"
                    : "Ajuste Físico de Canastillas en Planta"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black block text-slate-300 mb-1">
                  Cantidad de Canastillas: *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(Number(e.target.value))}
                    className="flex-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono font-black text-xl text-center focus:border-amber-500 focus:outline-none"
                  />
                  <div className="flex gap-1">
                    {[10, 20, 50].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setInputQuantity(quick)}
                        className="px-2.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
                      >
                        +{quick}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-black block text-slate-300 mb-1">
                  Origen / Ubicación: *
                </label>
                <input
                  type="text"
                  required
                  value={inputSource}
                  onChange={(e) => setInputSource(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black block text-slate-300 mb-1">
                  Observaciones / Motivo:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Limpieza completa, canastillas desinfectadas"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Movimiento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

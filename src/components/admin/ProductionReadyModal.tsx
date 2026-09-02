"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Database,
  ShieldAlert,
  Layers,
} from "lucide-react";

interface ProductionReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionReadyModal: React.FC<ProductionReadyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    clearDemoData,
    exportSystemBackup,
    importSystemBackup,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"clean" | "backup" | "templates">("clean");
  const [wipeOrders, setWipeOrders] = useState(true);
  const [wipeInvoices, setWipeInvoices] = useState(true);
  const [wipeDemoCustomers, setWipeDemoCustomers] = useState(false);
  const [isConfirmingClean, setIsConfirmingClean] = useState(false);

  if (!isOpen) return null;

  const handleExecuteClean = () => {
    clearDemoData({
      wipeOrders,
      wipeInvoices,
      wipeDemoCustomers,
    });
    setIsConfirmingClean(false);
    onClose();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importSystemBackup(content);
        if (success) {
          onClose();
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadClientsTemplate = () => {
    const csvContent =
      "RazonSocial,NIT,Telefono,Direccion,Zona,Contacto\n" +
      "Carniceria Central La 72,900.884.219-1,3124567890,Calle 72 # 13-24,Zona Centro,Don Carlos\n" +
      "Fama y Salsamentaria El Roble,800.123.456-7,3158891234,Calle 140 # 15-32,Zona Norte,Pedro Gomez\n" +
      "Restaurante Parrilla Criolla,901.654.321-0,3107778899,Carrera 68 # 45-10,Zona Occidente,Marta Lopez\n";

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Plantilla_Clientes_JD_Distribuidora.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("📄 Plantilla de clientes descargada en formato Excel CSV", "success");
  };

  const handleDownloadProductsTemplate = () => {
    const csvContent =
      "Nombre,SKU,Marca,Categoria,PrecioKiloCOP,StockInicialKg,MinimoPedidoKg\n" +
      "Bondiola de Cerdo Fresca,JD-BON-01,jd_distribuidora,cortes_magros,23000,150,5\n" +
      "Lomo Limpio Extra Magro,JD-LOM-02,jd_distribuidora,cortes_magros,22000,200,5\n" +
      "Costilla San Luis Carnuda,JD-CST-04,jd_distribuidora,cortes_con_hueso,20000,120,10\n" +
      "Costilla Ahumada al Leno,GA-CST-01,gourmet_ahumados,ahumados_costillas,28000,80,5\n" +
      "Chuleta Ahumada al Roble,GA-CHL-02,gourmet_ahumados,ahumados_chuletas,20500,100,5\n";

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Plantilla_Productos_Inventario_JD.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("📄 Plantilla de productos descargada en formato Excel CSV", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Puesta en Marcha con Datos Reales
              </h3>
              <p className="text-xs text-slate-400">
                Limpieza de pruebas, respaldo de seguridad y plantillas Excel
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab("clean")}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "clean"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>1. Limpiar Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "backup"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>2. Respaldo JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "templates"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Plantillas Excel</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "clean" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-white block font-black">
                    Preparar Sistema para Salir a Producción
                  </strong>
                  <p>
                    Esta acción remueve los pedidos y facturas de demostración simulados para que tu historial contable y de despachos comience desde cero con las ventas reales de la empresa.
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wipeOrders}
                    onChange={(e) => setWipeOrders(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span>Borrar pedidos de prueba (deja el panel en 0 pedidos pendientes)</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wipeInvoices}
                    onChange={(e) => setWipeInvoices(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span>Borrar facturas simuladas (iniciar numeración de facturas en limpio)</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wipeDemoCustomers}
                    onChange={(e) => setWipeDemoCustomers(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span>
                    Remover carnicerías de demostración (se conserva tu cuenta VIP principal <strong>323 321 8831</strong>)
                  </span>
                </label>
              </div>

              {isConfirmingClean ? (
                <div className="p-4 bg-slate-950 border-2 border-rose-500 rounded-2xl space-y-3 text-center animate-in zoom-in-95">
                  <p className="text-xs font-black text-rose-300">
                    ¿Estás seguro de que deseas limpiar los datos de prueba ahora?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClean(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteClean}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-950/60 transition-all active:scale-95"
                    >
                      Sí, Limpiar y Salir a Producción
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClean(true)}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>LIMPIAR DATOS DE PRUEBA AHORA</span>
                </button>
              )}
            </div>
          )}

          {activeTab === "backup" && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl space-y-1 text-slate-300">
                <strong className="text-white block font-black">
                  Copia de Seguridad y Migración de Empresa
                </strong>
                <p>
                  Descarga una copia completa de tus productos, stock, clientes, rutas, tarifas y facturación en un archivo seguro `.json`. Puedes restaurarla en cualquier computador o navegador en segundos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={exportSystemBackup}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <strong className="text-white text-xs font-black">Descargar Copia JSON</strong>
                  <span className="text-[11px] text-slate-400">Guarda un respaldo en tu computador</span>
                </button>

                <label className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 group cursor-pointer shadow-lg">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <strong className="text-white text-xs font-black">Restaurar Copia JSON</strong>
                  <span className="text-[11px] text-slate-400">Carga un archivo de respaldo previo</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-1 text-slate-300">
                <strong className="text-white block font-black">
                  Plantillas Oficiales en Formato Excel (CSV)
                </strong>
                <p>
                  Descarga las plantillas estándar para diligenciar tus clientes y catálogo en Excel y prepararlos para importación directa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadClientsTemplate}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-400 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 shadow-lg group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <strong className="text-white text-xs font-black">Plantilla de Clientes</strong>
                  <span className="text-[11px] text-slate-400">Razón Social, NIT, Celular, Dirección, Zona</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadProductsTemplate}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 shadow-lg group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <strong className="text-white text-xs font-black">Plantilla de Productos</strong>
                  <span className="text-[11px] text-slate-400">Nombre, SKU, Marca, Precio/kg, Stock Inicial</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Customer } from "@/types";
import { Users, Upload, Check, X, FileSpreadsheet, AlertCircle } from "lucide-react";

interface BulkCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkCustomerModal: React.FC<BulkCustomerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createCustomer, showToast } = useApp();
  const [csvText, setCsvText] = useState("");

  if (!isOpen) return null;

  const handleProcessImport = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split("\n");
    let count = 0;

    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes("razon") || line.toLowerCase().includes("nombre"))) {
        return;
      }

      const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length >= 2 && parts[0]) {
        const businessName = parts[0];
        const nit = parts[1] || `901.${Math.floor(100000 + Math.random() * 900000)}-${idx % 9}`;
        const phone = parts[2] || "310 000 0000";
        const address = parts[3] || "Bogotá D.C.";
        const zone = parts[4] || "Zona Norte";
        const contactName = parts[5] || "Encargado de Compras";

        const newCust: Customer = {
          id: `cust-${Date.now().toString(36)}-${count}`,
          companyId: "dist-001",
          businessName,
          contactName,
          nit,
          phone,
          email: `${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}@gmail.com`,
          address,
          city: "Bogotá D.C.",
          zone,
          priceListId: "list-famas-a",
          assignedPriceListName: "Tarifa Institucional Famas",
          status: "active",
          paymentTerms: "Contado contra entrega / Transferencia",
          minOrderAmount: 300000,
          deliveryDays: "Lunes a Sábado",
        };

        createCustomer(newCust);
        count++;
      }
    });

    if (count > 0) {
      showToast(`✓ ${count} clientes reales importados exitosamente`, "success");
      onClose();
    } else {
      showToast("No se detectaron líneas válidas con Nombre y NIT", "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Carga Masiva de Clientes Reales
              </h3>
              <p className="text-xs text-slate-400">
                Pega tu lista de carnicerías o sube un archivo Excel CSV
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
        <div className="p-5 space-y-4 text-xs">
          {/* File Upload Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <strong className="text-white block font-bold">Subir archivo .CSV</strong>
              <span className="text-slate-400 text-[11px]">Desde Excel o bloc de notas</span>
            </div>
            <label className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar CSV</span>
            </label>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              O Pega el Texto Separado por Comas (1 cliente por línea):
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5 font-mono">
              Formato: Razón Social, NIT, Celular, Dirección, Zona, Contacto
            </p>
            <textarea
              rows={7}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Carnicería El Buen Corte, 901234567, 3123456789, Calle 68 # 14-20, Zona Centro, Don Pedro&#10;Fama y Distribuciones La Sabana, 800987654, 3105554321, Carrera 15 # 134-22, Zona Norte, Carlos"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleProcessImport}
              disabled={!csvText.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Importar Clientes al Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

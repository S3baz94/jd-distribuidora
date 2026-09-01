"use client";

import React, { useState } from "react";
import { Invoice, BillingSettings } from "@/types";
import {
  COMPANY_JD_SETTINGS,
  COMPANY_GOURMET_SETTINGS,
} from "@/services/billingService";
import {
  Printer,
  FileText,
  X,
  Receipt,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  Ban,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Flame,
} from "lucide-react";

interface InvoiceModalProps {
  invoice: Invoice | null;
  settings: BillingSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  settings,
  isOpen,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<"pos" | "carta">("pos");

  if (!isOpen || !invoice) return null;

  const isGourmet = invoice.brand === "gourmet_ahumados";
  const activeCompany = isGourmet
    ? COMPANY_GOURMET_SETTINGS
    : invoice.brand === "jd_distribuidora"
    ? COMPANY_JD_SETTINGS
    : settings;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "pagada":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pagada
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> A Crédito / Cartera
          </span>
        );
      case "anulada":
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200">
            <Ban className="w-3.5 h-3.5" /> Anulada
          </span>
        );
      case "devuelta_total":
        return (
          <span className="inline-flex items-center gap-1 text-purple-700 font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200">
            <Ban className="w-3.5 h-3.5" /> Devolución Total (100%)
          </span>
        );
      case "devuelta_parcial":
        return (
          <span className="inline-flex items-center gap-1 text-indigo-700 font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Devolución Parcial
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Screen only) */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-sm sm:text-base">
              {invoice.number}
            </span>
            {getStatusBadge(invoice.status)}
          </div>

          <div className="flex items-center gap-2">
            {/* Format selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintFormat("pos")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  printFormat === "pos"
                    ? "bg-brand-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Tirilla POS (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat("carta")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  printFormat === "carta"
                    ? "bg-brand-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Formato Carta
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Viewable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/50 flex justify-center">
          {printFormat === "pos" ? (
            /* =========================================================
               FORMATO 1: TIRILLA TÉRMICA POS (80mm)
               ========================================================= */
            <div
              id="printable-pos-ticket"
              className="w-full max-w-[340px] bg-white text-black p-5 rounded-xl font-mono text-[11px] leading-tight shadow-xl select-all border border-slate-300"
            >
              {/* Header Empresa */}
              <div className="text-center pb-3 border-b border-dashed border-gray-400">
                <div className="inline-flex items-center gap-1 mb-1">
                  {isGourmet ? (
                    <span className="bg-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>Gourmet Ahumados</span>
                    </span>
                  ) : (
                    <span className="bg-rose-700 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase">
                      🥩 JD Distribuidora
                    </span>
                  )}
                </div>
                <h2 className="font-black text-sm uppercase tracking-tight">{activeCompany.companyName}</h2>
                <p className="text-[10px] font-bold text-gray-800">{activeCompany.tradeName}</p>
                <p className="text-[10px] font-bold">NIT: {activeCompany.nit}</p>
                <p className="text-[9px] text-gray-600 leading-snug">{activeCompany.address}</p>
                <p className="text-[9px] text-gray-600">{activeCompany.city} • Tel: {activeCompany.phone}</p>
                <p className="text-[8px] text-gray-500 mt-1 italic leading-tight">{activeCompany.regime}</p>
              </div>

              {/* Info Factura */}
              <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1">
                <div className="flex justify-between font-bold text-xs">
                  <span>FACTURA VENTA:</span>
                  <span className="font-mono font-black">{invoice.number}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Fecha Emisión:</span>
                  <span>{new Date(invoice.issuedAt).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Atendido por:</span>
                  <span>{invoice.sellerName}</span>
                </div>
              </div>

              {/* Info Cliente */}
              <div className="py-2.5 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
                <p className="font-black uppercase">{invoice.customerName}</p>
                <p>NIT/CC: {invoice.customerNit}</p>
                {invoice.customerPhone && <p>Tel: {invoice.customerPhone}</p>}
                {invoice.customerAddress && <p>Dir: {invoice.customerAddress}</p>}
                {invoice.customerZone && <p>Zona: {invoice.customerZone}</p>}
              </div>

              {/* Tabla de Cortes */}
              <div className="py-2.5 border-b border-dashed border-gray-400">
                <div className="flex justify-between font-black text-[10px] pb-1 border-b border-gray-300">
                  <span>DESCRIPCIÓN / KG</span>
                  <span>TOTAL</span>
                </div>
                <div className="space-y-1.5 pt-1.5">
                  {invoice.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between font-bold text-[10px]">
                        <span className="truncate max-w-[200px]">{item.productName}</span>
                        <span>${item.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-600">
                        <span>
                          {item.quantityKg.toFixed(2)} kg x ${item.unitPrice.toLocaleString()}/kg
                        </span>
                        <span className="font-bold">
                          {item.brand === "gourmet_ahumados" ? "🔥 AHUMADO" : "🥩 CRUDO"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>KILOS TOTALES:</span>
                  <span>{invoice.totalKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>SUBTOTAL:</span>
                  <span>${invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>DESCUENTO:</span>
                    <span>-${invoice.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 text-[10px]">
                  <span>IVA CARNES CRUDAS (0%):</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                  <span>TOTAL A PAGAR:</span>
                  <span>${invoice.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Forma de Pago */}
              <div className="py-2.5 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                <div className="flex justify-between font-bold uppercase">
                  <span>FORMA DE PAGO:</span>
                  <span className="font-black text-black">
                    {invoice.paymentType === "efectivo"
                      ? "💵 EFECTIVO"
                      : invoice.paymentType === "banco"
                      ? "🏦 TRANSFERENCIA / QR"
                      : invoice.paymentType === "credito"
                      ? `📝 CRÉDITO (${invoice.paymentDetails.creditDays || 30} DÍAS)`
                      : "MIXTO"}
                  </span>
                </div>
                {invoice.paymentType === "efectivo" && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Recibido en efectivo:</span>
                      <span>${(invoice.paymentDetails.cashGiven || invoice.total).toLocaleString()}</span>
                    </div>
                    {invoice.paymentDetails.cashChange ? (
                      <div className="flex justify-between font-bold">
                        <span>Cambio / Vueltas:</span>
                        <span>${invoice.paymentDetails.cashChange.toLocaleString()}</span>
                      </div>
                    ) : null}
                  </>
                )}
                {invoice.paymentType === "banco" && invoice.paymentDetails.bankReference && (
                  <div className="flex justify-between text-gray-600">
                    <span>Comprobante / Ref:</span>
                    <span>{invoice.paymentDetails.bankReference}</span>
                  </div>
                )}
                {invoice.paymentType === "credito" && invoice.paymentDetails.creditDueDate && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Vencimiento Cartera:</span>
                    <span>{invoice.paymentDetails.creditDueDate}</span>
                  </div>
                )}
              </div>

              {/* Footer Legal & Agradecimiento */}
              <div className="pt-3 text-center space-y-1 text-[8px] text-gray-600 leading-tight">
                <p className="font-bold text-gray-800 uppercase tracking-wide">
                  DOCUMENTO COMERCIAL DE VENTA & REMISIÓN DE DESPACHO
                </p>
                <p>{activeCompany.posFooterNote}</p>
                <div className="pt-3 text-center border-t border-dashed border-gray-300 mt-2">
                  <p className="font-mono tracking-widest text-[9px] font-bold text-black">
                    *** {activeCompany.tradeName.toUpperCase()} ***
                  </p>
                  <p className="text-[8px] text-gray-600">Línea de Atención & Facturación: {activeCompany.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================
               FORMATO 2: FACTURA COMERCIAL TAMAÑO CARTA OFICIAL
               ========================================================= */
            <div
              id="printable-carta-invoice"
              className="w-full bg-white text-black p-6 sm:p-8 rounded-2xl font-sans text-xs leading-normal shadow-xl select-all border border-slate-300"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl font-black text-2xl flex items-center justify-center shadow-md ${
                      isGourmet
                        ? "bg-amber-600 text-white shadow-amber-200"
                        : "bg-brand-600 text-white"
                    }`}
                  >
                    {isGourmet ? "GA" : "JD"}
                  </div>
                  <div>
                    <h1 className="text-xl font-black uppercase text-slate-900">{activeCompany.companyName}</h1>
                    <p className="text-xs font-bold text-brand-700">{activeCompany.tradeName}</p>
                    <p className="text-xs text-slate-600 font-bold">NIT: {activeCompany.nit}</p>
                    <p className="text-xs text-slate-600">{activeCompany.address} • {activeCompany.city}</p>
                    <p className="text-xs text-slate-600">PBX: {activeCompany.phone} • {activeCompany.email}</p>
                  </div>
                </div>

                <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 w-full sm:w-auto">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    FACTURA COMERCIAL DE VENTA
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono block">
                    {invoice.number}
                  </span>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p><span className="font-semibold text-slate-600">Fecha:</span> {new Date(invoice.issuedAt).toLocaleDateString("es-CO")}</p>
                    <p><span className="font-semibold text-slate-600">Vence:</span> {invoice.paymentDetails.creditDueDate || new Date(invoice.issuedAt).toLocaleDateString("es-CO")}</p>
                    <p><span className="font-semibold text-slate-600">Estado:</span> <span className="font-bold uppercase text-emerald-700">{invoice.status}</span></p>
                  </div>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    DATOS DEL ADQUIRIENTE / CLIENTE:
                  </span>
                  <p className="text-sm font-black text-slate-900">{invoice.customerName}</p>
                  <p className="text-slate-700">NIT / CC: <span className="font-mono font-bold">{invoice.customerNit}</span></p>
                  <p className="text-slate-700">Dirección: {invoice.customerAddress || "En planta"}</p>
                  <p className="text-slate-700">Teléfono: {invoice.customerPhone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    DATOS LOGÍSTICOS & DESPACHO:
                  </span>
                  <p className="text-slate-700">Zona de Entrega: <span className="font-bold">{invoice.customerZone || "Directo"}</span></p>
                  <p className="text-slate-700">Forma de Pago: <span className="font-bold uppercase text-brand-700">{invoice.paymentType}</span></p>
                  <p className="text-slate-700">Vendedor / Despachador: <span className="font-bold">{invoice.sellerName}</span></p>
                  <p className="text-slate-700">Origen de Orden: <span className="font-bold uppercase">{invoice.origin}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase font-bold">
                      <th className="p-2.5 rounded-l-lg">Ítem / SKU</th>
                      <th className="p-2.5">Descripción del Corte</th>
                      <th className="p-2.5 text-center">Línea</th>
                      <th className="p-2.5 text-right">Kilos (KG)</th>
                      <th className="p-2.5 text-right">Precio / KG</th>
                      <th className="p-2.5 text-right rounded-r-lg">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600">{item.sku}</td>
                        <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.brand === "gourmet_ahumados"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {item.brand === "gourmet_ahumados" ? "Ahumado" : "Crudo"}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">{item.quantityKg.toFixed(2)} kg</td>
                        <td className="p-2.5 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          ${item.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Bottom */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t-2 border-slate-200">
                {/* Notes & Legal */}
                <div className="flex-1 space-y-2 text-[10px] text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 uppercase mb-0.5">Observaciones & Régimen:</p>
                    <p>{invoice.notes || "Carne fresca cruda de cerdo refrigerada en cadena de frío (0°C a 4°C). Bienes exentos de IVA conforme al Art. 477 del Estatuto Tributario."}</p>
                    <p className="mt-1 text-slate-500 italic">
                      Resolución DIAN N° {settings.resolutionNumber} habilitada del {settings.prefix} {settings.fromNumber} al {settings.prefix} {settings.toNumber}.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-4 pt-6 text-center">
                    <div className="border-t border-slate-400 pt-1">
                      <span className="font-bold block text-slate-800">Firma Emisor / Despacho</span>
                      <span className="text-[9px] text-slate-500">{settings.tradeName}</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <span className="font-bold block text-slate-800">Firma y Sello Cliente</span>
                      <span className="text-[9px] text-slate-500">{invoice.customerName}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Totals Box */}
                <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>KILOS TOTALES:</span>
                    <span className="font-mono">{invoice.totalKg.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SUBTOTAL BRUTO:</span>
                    <span className="font-mono">${invoice.subtotal.toLocaleString()}</span>
                  </div>
                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>DESCUENTO APLICADO:</span>
                      <span className="font-mono">-${invoice.discountTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (0% Exento):</span>
                    <span className="font-mono">$0</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t-2 border-slate-300">
                    <span>TOTAL FACTURA:</span>
                    <span className="font-mono text-brand-700">${invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

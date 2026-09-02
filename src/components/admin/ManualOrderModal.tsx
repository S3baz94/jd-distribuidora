"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Product, Order, BrandType } from "@/types";
import { priceService } from "@/services/priceService";
import {
  ClipboardList,
  Plus,
  Trash2,
  Check,
  X,
  Scale,
  DollarSign,
  User,
  Calendar,
  MapPin,
  FileText,
  Boxes,
} from "lucide-react";

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { allCustomers, products, createManualOrder, showToast } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    allCustomers[0]?.id || ""
  );
  const [customCustomerName, setCustomCustomerName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customZone, setCustomZone] = useState("Zona Norte (Cedritos - Usaquén)");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "banco" | "credito">("efectivo");
  const [deliveryDate, setDeliveryDate] = useState("Hoy / Entrega Inmediata");
  const [notes, setNotes] = useState("");

  const [orderItems, setOrderItems] = useState<
    {
      productId: string;
      productName: string;
      sku: string;
      brand: BrandType;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[]
  >([]);

  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>(
    products[0]?.id || ""
  );
  const [quantityToAdd, setQuantityToAdd] = useState<number>(10);

  if (!isOpen) return null;

  const currentCustomer = allCustomers.find((c) => c.id === selectedCustomerId);

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod || quantityToAdd <= 0) return;

    const priceListId = currentCustomer?.priceListId || "list-famas-a";
    const unitPrice = priceService.getPriceForCustomer(priceListId, prod.id);
    const subtotal = unitPrice * quantityToAdd;

    const existingIndex = orderItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += quantityToAdd;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * unitPrice;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          brand: prod.brand,
          quantity: quantityToAdd,
          unitPrice,
          subtotal,
        },
      ]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const totalOrderAmount = orderItems.reduce((s, i) => s + i.subtotal, 0);
  const totalOrderKg = orderItems.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      showToast("Agrega al menos un corte con sus kilos al pedido", "error");
      return;
    }

    const finalCustomerName = currentCustomer
      ? currentCustomer.businessName
      : customCustomerName.trim() || "Cliente Mostrador";

    const finalAddress = currentCustomer
      ? currentCustomer.address
      : customAddress.trim() || "Entrega en Mostrador / Planta";

    const finalZone = currentCustomer ? currentCustomer.zone : customZone;

    const hasGourmet = orderItems.some((i) => i.brand === "gourmet_ahumados");
    const hasJd = orderItems.some((i) => i.brand === "jd_distribuidora");
    const orderBrand = hasGourmet && hasJd ? "mixed" : hasGourmet ? "gourmet_ahumados" : "jd_distribuidora";

    createManualOrder({
      customerId: currentCustomer ? currentCustomer.id : `cust-${Date.now().toString(36)}`,
      customerName: finalCustomerName,
      brand: orderBrand,
      items: orderItems.map((item) => ({
        ...item,
        unit: "kg",
      })),
      subtotal: totalOrderAmount,
      total: totalOrderAmount,
      deliveryDate,
      deliveryAddress: finalAddress,
      zone: finalZone,
      notes: notes.trim() || "Pedido manual tomado por teléfono / mostrador",
      paymentMethod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ClipboardList className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Tomar Pedido Manual de Venta
              </h3>
              <p className="text-xs text-slate-400">
                Registra ventas telefónicas, de mostrador o de urgencia
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Customer Selection */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <label className="font-bold text-slate-300 block">
              Seleccionar Cliente Registrado:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            >
              {allCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.phone || c.nit}) - {c.zone}
                </option>
              ))}
              <option value="custom">-- OTRO / CLIENTE NUEVO (DIGITAR) --</option>
            </select>

            {selectedCustomerId === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Razón Social / Nombre del Local"
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Celular (ej. 312 456 7890)"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Dirección de Entrega"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
            )}
          </div>

          {/* Add Product Line */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <label className="font-bold text-slate-300 block">
              Agregar Cortes al Pedido:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedProductToAdd}
                onChange={(e) => setSelectedProductToAdd(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              >
                {products.map((p) => {
                  const price = priceService.getPriceForCustomer(
                    currentCustomer?.priceListId || "list-famas-a",
                    p.id
                  );
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand === "jd_distribuidora" ? "🥩 JD" : "🔥 Gourmet"}) - {priceService.formatCurrency(price)}/kg
                    </option>
                  );
                })}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-black text-center text-xs"
                />
                <span className="text-slate-400 font-bold">kg</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-850 p-2.5 font-black text-slate-300 grid grid-cols-12 gap-2 border-b border-slate-800">
              <span className="col-span-6">Corte / Producto</span>
              <span className="col-span-2 text-center">Kilos</span>
              <span className="col-span-3 text-right">Subtotal</span>
              <span className="col-span-1"></span>
            </div>

            {orderItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No has agregado productos a este pedido.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 bg-slate-950">
                {orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 grid grid-cols-12 gap-2 items-center text-slate-300"
                  >
                    <div className="col-span-6">
                      <p className="font-bold text-white truncate">{item.productName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.sku} • {priceService.formatCurrency(item.unitPrice)}/kg
                      </span>
                    </div>
                    <span className="col-span-2 text-center font-black text-emerald-400">
                      {item.quantity} kg
                    </span>
                    <span className="col-span-3 text-right font-black text-white">
                      {priceService.formatCurrency(item.subtotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="col-span-1 text-slate-500 hover:text-rose-400 flex justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Total Row */}
            {orderItems.length > 0 && (
              <div className="bg-slate-850 p-3 flex items-center justify-between border-t border-slate-800">
                <span className="text-slate-300 font-bold">
                  Total Pedido: <strong>{totalOrderKg} kg</strong> (~{Math.ceil(totalOrderKg / 25)} canastillas JD)
                </span>
                <strong className="text-emerald-400 font-black text-base">
                  {priceService.formatCurrency(totalOrderAmount)}
                </strong>
              </div>
            )}
          </div>

          {/* Payment & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Forma de Pago:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="efectivo">💵 Efectivo contra entrega</option>
                <option value="banco">🏦 Transferencia Bancaria / QR</option>
                <option value="credito">📝 Crédito Comercial a 15/30 días</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Fecha / Franja de Despacho:
              </label>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Observaciones Internas o de Desposte:
            </label>
            <input
              type="text"
              placeholder="Ej. Dejar en 2 canastillas, sellar precinto con chofer Carlos"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={orderItems.length === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Crear Pedido & Enviar a Alistamiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

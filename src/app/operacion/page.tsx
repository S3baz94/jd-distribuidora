"use client";

import React, { useState, useRef, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { DeliveryRoute, Order, DriverExpense } from "@/types";
import { RouteMap } from "@/components/admin/RouteMap";
import {
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  Navigation,
  DollarSign,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Box,
  PenTool,
  RotateCcw,
  Check,
  Camera,
  Receipt,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Map as MapIcon,
  ListOrdered,
  Layers,
  Compass,
  CornerDownRight,
} from "lucide-react";

export default function OperacionPage() {
  const {
    routes,
    allOrders,
    expenses,
    addDriverExpense,
    updateOrderStatus,
    confirmDelivery,
    updateRouteStatus,
    showToast,
  } = useApp();

  // Active driver selection
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    routes[0]?.driverId || "drv-carlos"
  );
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<Order | null>(null);
  const [incidentModalOrder, setIncidentModalOrder] = useState<Order | null>(null);
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<DriverExpense | null>(null);

  // Delivery confirmation fields
  const [receivedByName, setReceivedByName] = useState<string>("Carlos Pérez");
  const [paymentMethodCollected, setPaymentMethodCollected] = useState<string>("Efectivo");
  const [deliveredBaskets, setDeliveredBaskets] = useState<number>(2);
  const [returnedBaskets, setReturnedBaskets] = useState<number>(2);
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [hasSignature, setHasSignature] = useState(false);

  // Delivery & Customer Purchase Invoice fields
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState<"efectivo" | "banco" | "credito">("efectivo");
  const [deliveryInvoicePhoto, setDeliveryInvoicePhoto] = useState<string>("");
  const deliveryPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Delivery Return state (Devoluciones en punto de entrega)
  const [hasDeliveryReturn, setHasDeliveryReturn] = useState(false);
  const [deliveryReturnType, setDeliveryReturnType] = useState<"parcial" | "total">("parcial");
  const [deliveryReturnReason, setDeliveryReturnReason] = useState("Rechazo de calidad / Merma en pesaje");
  const [deliveryReturnNote, setDeliveryReturnNote] = useState("");
  const [deliveryReturnedKgMap, setDeliveryReturnedKgMap] = useState<{ [productId: string]: number }>({});

  // Return calculations for modal
  const deliveryReturnSummary = useMemo(() => {
    if (!deliveryModalOrder || !hasDeliveryReturn) {
      const base = deliveryModalOrder ? (deliveryModalOrder.realTotal || deliveryModalOrder.total) : 0;
      return { totalReturnedKg: 0, totalReturnedAmount: 0, returnedItems: [], finalTotalToCollect: base };
    }

    const orderBaseTotal = deliveryModalOrder.realTotal || deliveryModalOrder.total;
    const orderTotalKg = deliveryModalOrder.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);

    if (deliveryReturnType === "total") {
      const items = deliveryModalOrder.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantityKg: i.realQuantity || i.quantity,
        amount: (i.realQuantity || i.quantity) * i.unitPrice,
      }));
      return {
        totalReturnedKg: orderTotalKg,
        totalReturnedAmount: orderBaseTotal,
        returnedItems: items,
        finalTotalToCollect: 0,
      };
    }

    const returnedItems = deliveryModalOrder.items
      .map((i) => {
        const maxQty = i.realQuantity || i.quantity;
        const returnedKg = Math.min(maxQty, Math.max(0, deliveryReturnedKgMap[i.productId] || 0));
        if (returnedKg <= 0) return null;
        return {
          productId: i.productId,
          productName: i.productName,
          quantityKg: returnedKg,
          amount: returnedKg * i.unitPrice,
        };
      })
      .filter(Boolean) as { productId: string; productName: string; quantityKg: number; amount: number }[];

    const totalReturnedKg = returnedItems.reduce((s, i) => s + i.quantityKg, 0);
    const totalReturnedAmount = returnedItems.reduce((s, i) => s + i.amount, 0);
    const finalTotalToCollect = Math.max(0, orderBaseTotal - totalReturnedAmount);

    return {
      totalReturnedKg,
      totalReturnedAmount,
      returnedItems,
      finalTotalToCollect,
    };
  }, [deliveryModalOrder, hasDeliveryReturn, deliveryReturnType, deliveryReturnedKgMap]);

  // Incident reporting fields
  const [incidentReason, setIncidentReason] = useState<string>("Local cerrado / No abren");
  const [incidentNote, setIncidentNote] = useState<string>("");

  // Driver Road Expense fields (Combustible, Peajes, Parqueadero)
  const [expenseCategory, setExpenseCategory] = useState<DriverExpense["category"]>("combustible");
  const [expenseAmount, setExpenseAmount] = useState<number>(50000);
  const [expenseDesc, setExpenseDesc] = useState<string>("Tanqueada ACPM Estación de Servicio");
  const [expenseReceiptPhoto, setExpenseReceiptPhoto] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Signature canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Find active route for selected driver
  const activeRoute =
    routes.find((r) => r.driverId === selectedDriverId) || routes[0];

  const routeOrders = allOrders.filter(
    (o) => o.routeId === activeRoute?.id || activeRoute?.orderIds.includes(o.id)
  );

  const completedOrders = routeOrders.filter((o) => o.status === "delivered");
  const pendingOrders = routeOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );
  const totalKg = routeOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
    0
  );

  const totalInvoiced = routeOrders.reduce(
    (sum, o) => sum + (o.realTotal || o.total),
    0
  );

  // Customer purchase payment collections breakdown
  const totalCashCollected = completedOrders
    .filter((o) => o.paymentMethod === "efectivo" || !o.paymentMethod)
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalBankCollected = completedOrders
    .filter((o) => o.paymentMethod === "banco")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalCreditBalance = completedOrders
    .filter((o) => o.paymentMethod === "credito")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalCreditCollected = totalCreditBalance;

  const totalCashToCollect = pendingOrders.reduce(
    (sum, o) => sum + (o.realTotal || o.total),
    0
  );

  // Net Cash Balance in Vehicle Cabin (Recaudos en Efectivo - Gastos Operativos)
  const driverExpenses = expenses.filter((e) => e.driverId === selectedDriverId);
  const totalExpenses = driverExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesAmount = totalExpenses;
  const netCashInCabin = totalCashCollected - totalExpenses;
  const netCashInHand = netCashInCabin;
  const nextStop = pendingOrders[0];

  // Google Maps Dynamic multi-stop route calculation
  const getGoogleMapsMultiStopUrl = () => {
    if (pendingOrders.length === 0) return "https://www.google.com/maps";

    const origin = encodeURIComponent("Planta Frigorífica JD Distribuidora, Bogotá");
    const destination = encodeURIComponent(
      pendingOrders[pendingOrders.length - 1].deliveryAddress
    );
    const waypoints = pendingOrders
      .slice(0, pendingOrders.length - 1)
      .map((o) => encodeURIComponent(o.deliveryAddress))
      .join("|");

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
  };

  const getFullGoogleMapsRouteUrl = getGoogleMapsMultiStopUrl;

  const handleOpenDeliverModal = (order: Order) => {
    setDeliveryModalOrder(order);
    setReceivedByName(order.customerName);
    setDeliveryPaymentMethod(order.paymentMethod || "efectivo");
    setDeliveryInvoicePhoto(order.invoicePhoto || "");
    setDeliveredBaskets(Math.ceil(order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0) / 25) || 1);
    setReturnedBaskets(Math.ceil(order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0) / 25) || 1);
    setDeliveryNote("");
    setHasSignature(false);

    // Reset return fields
    setHasDeliveryReturn(false);
    setDeliveryReturnType("parcial");
    setDeliveryReturnReason("Rechazo de calidad / Merma en pesaje");
    setDeliveryReturnNote("");
    setDeliveryReturnedKgMap({});
  };

  // Handle Customer Purchase Invoice Photo Capture
  const handleDeliveryPhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setDeliveryInvoicePhoto(base64);
      showToast("📸 Foto de factura de compra del cliente capturada", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalOrder) return;

    const returnDetailsObj = hasDeliveryReturn
      ? {
          hasReturn: true,
          type: deliveryReturnType,
          returnedKg: deliveryReturnSummary.totalReturnedKg,
          returnedAmount: deliveryReturnSummary.totalReturnedAmount,
          returnNote: `${deliveryReturnReason}${deliveryReturnNote ? ` - ${deliveryReturnNote}` : ""}`,
          returnedAt: new Date().toISOString(),
          returnedItems: deliveryReturnSummary.returnedItems,
        }
      : undefined;

    confirmDelivery(deliveryModalOrder.id, {
      paymentMethod: deliveryPaymentMethod,
      receivedByName: receivedByName || deliveryModalOrder.customerName,
      deliveredBasketsLeft: deliveredBaskets,
      emptyBasketsCollected: returnedBaskets,
      invoicePhoto: deliveryInvoicePhoto,
      customerSignature: hasSignature ? "signature-captured" : undefined,
      returnDetails: returnDetailsObj,
    });

    // Recalculate remaining stops
    const remaining = pendingOrders.filter((o) => o.id !== deliveryModalOrder.id);
    if (remaining.length === 0 && activeRoute) {
      updateRouteStatus(activeRoute.id, "completed");
      showToast(`🏁 ¡Ruta completada! Todas las ${routeOrders.length} entregas fueron realizadas.`, "success");
    } else {
      const nextTarget = remaining[0];
      showToast(
        `📍 Parada completada. Recorrido actualizado hacia: ${nextTarget ? nextTarget.customerName : "Fin de ruta"}`,
        "success"
      );
    }

    setDeliveryModalOrder(null);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentModalOrder) return;

    showToast(`⚠️ Novedad reportada para ${incidentModalOrder.customerName}: ${incidentReason}`, "warning");
    setIncidentModalOrder(null);
  };

  // Handle Driver Expense Photo Capture
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setExpenseReceiptPhoto(base64);
      showToast("📸 Foto del recibo de gasto cargada correctamente", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    addDriverExpense({
      driverId: selectedDriverId,
      driverName: activeRoute?.driverName || "Carlos Pérez",
      routeId: activeRoute?.id,
      routeName: activeRoute?.name,
      category: expenseCategory,
      amount: expenseAmount,
      description: expenseDesc || "Gasto de operación en ruta",
      receiptPhoto: expenseReceiptPhoto,
    });

    setExpenseModalOpen(false);
    setExpenseReceiptPhoto("");
    setExpenseAmount(50000);
    setExpenseDesc("");
    showToast(`📸 Gasto de ruta de ${priceService.formatCurrency(expenseAmount)} registrado con éxito`, "success");
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 font-sans">
      {/* Top Driver Header */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-500 font-bold shadow-sm flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 tracking-wide">
                  Operación
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Despacho en Ruta
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-semibold text-slate-100 leading-tight mt-0.5 flex items-center gap-2">
                <span>{activeRoute?.driverName || "Carlos Pérez"}</span>
                <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {activeRoute?.vehiclePlate || "KLP-541"}
                </span>
              </h1>
            </div>
          </div>

          {/* Switch Driver / Route Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-slate-600 transition-colors"
            >
              {routes.map((r) => (
                <option key={r.driverId} value={r.driverId}>
                  {r.driverName} ({r.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Prominent Assigned Route Details Card */}
        {activeRoute && (
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeRoute.zone}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Salida: {activeRoute.departureTime || "07:00 AM"}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-1">
                  {activeRoute.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Frigorífico Central JD ➔ <strong className="text-slate-200 font-mono">{routeOrders.length} Paradas</strong>
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase inline-flex items-center gap-1.5 ${
                    activeRoute.status === "in_transit"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                      : activeRoute.status === "completed"
                      ? "bg-slate-800 text-slate-300 border border-slate-700"
                      : "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeRoute.status === "in_transit"
                        ? "bg-emerald-400"
                        : activeRoute.status === "completed"
                        ? "bg-slate-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <span>
                    {activeRoute.status === "in_transit"
                      ? "En Recorrido"
                      : activeRoute.status === "completed"
                      ? "Ruta Lista"
                      : "Planificada"}
                  </span>
                </span>
              </div>
            </div>

            {/* Cold Chain Temp Indicator */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">❄️ Temperatura Cava Térmica:</span>
              </div>
              <div className="flex items-center gap-2">
                <strong className="text-slate-200 font-mono text-xs font-semibold">1.8°C</strong>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ÓPTIMO</span>
              </div>
            </div>

            {/* Google Maps Master Launch Button */}
            <div className="pt-1">
              <a
                href={getFullGoogleMapsRouteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-98"
              >
                <Navigation className="w-4 h-4 text-slate-300" />
                <span>
                  {pendingOrders.length > 0
                    ? `Abrir Recorrido en Google Maps GPS (${pendingOrders.length} paradas restantes)`
                    : `Ruta 100% Completada (${completedOrders.length}/${routeOrders.length} paradas)`}
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Interactive GPS Route Map */}
        {activeRoute && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Trazado de Ruta Satelital (Paso a Paso)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {completedOrders.length}/{routeOrders.length} Paradas Listas
              </span>
            </div>

            <RouteMap route={activeRoute} orders={routeOrders} />
          </div>
        )}

        {/* Immediate Next Stop Callout Banner or Route Completed Celebration */}
        {nextStop ? (
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-semibold uppercase flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-amber-400" />
                  <span>Siguiente Parada</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  #{routeOrders.findIndex((o) => o.id === nextStop.id) + 1} de {routeOrders.length}
                </span>
              </div>

              <strong className="text-slate-100 font-mono font-bold text-sm">
                {priceService.formatCurrency(nextStop.realTotal || nextStop.total)}
              </strong>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-100">{nextStop.customerName}</h4>
              <p className="text-xs text-slate-400 flex items-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
                <span>{nextStop.deliveryAddress}</span>
              </p>
            </div>

            {/* Meat cuts summary for this stop */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Descarga: <strong className="text-slate-200 font-mono">{nextStop.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0)} kg</strong>
              </span>
              <span className="text-slate-400 text-[11px]">
                ~{Math.ceil(nextStop.items.reduce((s, i) => s + i.quantity, 0) / 25) || 1} canastillas JD
              </span>
            </div>

            {/* Quick Action Navigation & Delivery for Next Stop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  nextStop.deliveryAddress
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                <span>Navegar GPS</span>
              </a>

              <a
                href={`https://wa.me/573233218831?text=${encodeURIComponent(
                  `Hola ${nextStop.customerName}, soy ${activeRoute?.driverName || "Carlos Pérez"} de JD Distribuidora. Ya voy en camino con su pedido de carne (${nextStop.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0)} kg).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Avisar Llegada</span>
              </a>

              <button
                type="button"
                onClick={() => handleOpenDeliverModal(nextStop)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirmar Entrega</span>
              </button>
            </div>
          </div>
        ) : routeOrders.length > 0 ? (
          /* Route Completed Celebration Card */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-center text-lg font-bold">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Turno Finalizado
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Todas las entregas han sido completadas
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Se han entregado satisfactoriamente los <strong className="text-slate-200">{totalKg} kg</strong> de carne en las <strong className="text-slate-200">{routeOrders.length} paradas</strong> del recorrido.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Recaudo Efectivo:</span>
                <strong className="text-slate-100 font-mono text-sm">{priceService.formatCurrency(totalCashCollected)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Efectivo Neto en Sobre:</span>
                <strong className="text-emerald-400 font-mono text-sm">{priceService.formatCurrency(netCashInHand)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCashoutModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>Ver Cuadre de Caja de Ruta</span>
            </button>
          </div>
        ) : null}

        {/* Route Progress & Cash Collection Widget */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                Resumen del Turno
              </span>
              <h3 className="text-sm font-bold text-slate-100">Progreso de Entregas</h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                <span>Recibos</span>
              </button>

              <button
                onClick={() => setCashoutModalOpen(true)}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Cuadre</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-slate-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  routeOrders.length > 0
                    ? (completedOrders.length / routeOrders.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Carga Total:</span>
              <strong className="text-slate-200 text-xs font-mono font-semibold">{totalKg} kg</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Por Recaudar:</span>
              <strong className="text-amber-400 text-xs font-mono font-semibold">
                {priceService.formatCurrency(totalCashToCollect)}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Recaudado:</span>
              <strong className="text-emerald-400 text-xs font-mono font-semibold">
                {priceService.formatCurrency(totalCashCollected)}
              </strong>
            </div>
          </div>
        </div>

        {/* Road Expenses Bar */}
        {driverExpenses.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">
                  Gastos de Ruta Reportados ({driverExpenses.length})
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-rose-400">
                Total: -{priceService.formatCurrency(totalExpensesAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {driverExpenses.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setViewReceiptModal(exp)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex-shrink-0 text-left transition-colors"
                >
                  {exp.receiptPhoto ? (
                    <img
                      src={exp.receiptPhoto}
                      alt="Recibo"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center text-xs flex-shrink-0 border border-slate-800">
                      🧾
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {exp.category === "combustible"
                        ? "⛽ Gasolina"
                        : exp.category === "peajes"
                        ? "🛣️ Peaje"
                        : exp.category === "parqueadero"
                        ? "🅿️ Parking"
                        : "📦 Gasto"}
                    </span>
                    <p className="text-[11px] font-medium text-slate-200 truncate max-w-[140px] mt-0.5">
                      {exp.description}
                    </p>
                    <p className="text-[11px] text-slate-300 font-mono font-semibold">
                      {priceService.formatCurrency(exp.amount)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sequential Stop Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Itinerario de Paradas en Orden</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {pendingOrders.length} pendientes • {completedOrders.length} listas
            </span>
          </div>

          {routeOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Truck className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-semibold text-slate-200 text-sm">No tienes entregas asignadas en esta ruta</p>
              <p className="text-xs text-slate-500">
                Espera a que la administración de planta cargue pedidos a tu furgón.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {routeOrders.map((order, idx) => {
                const isDelivered = order.status === "delivered";
                const isNextActive = nextStop?.id === order.id;
                const orderKg = order.items.reduce(
                  (sum, i) => sum + (i.realQuantity || i.quantity),
                  0
                );
                const estimatedBaskets = Math.ceil(orderKg / 25) || 1;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border transition-all p-4 space-y-3 shadow-sm ${
                      isDelivered
                        ? "bg-slate-900/60 border-slate-800/80 opacity-80"
                        : isNextActive
                        ? "bg-slate-900 border-slate-700 shadow-md"
                        : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    {/* Stop Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                            isDelivered
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : isNextActive
                              ? "bg-slate-800 text-amber-300 border-slate-600"
                              : "bg-slate-950 text-slate-400 border-slate-800"
                          }`}
                        >
                          {isDelivered ? `✓ ${idx + 1}` : `#${idx + 1}`}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-100 text-sm">
                              {order.customerName}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                              {order.orderNumber}
                            </span>
                            {isNextActive && (
                              <span className="text-[10px] font-semibold uppercase text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                Siguiente
                              </span>
                            )}
                          </div>

                          {/* Customer Address */}
                          <p className="text-xs text-slate-400 flex items-start gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
                            <span>{order.deliveryAddress}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isDelivered ? (
                          <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md border border-slate-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            <span>Entregada</span>
                          </span>
                        ) : isNextActive ? (
                          <span className="text-[10px] font-medium bg-amber-950/40 text-amber-400 px-2.5 py-0.5 rounded-md border border-amber-800/40">
                            En Curso
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md border border-slate-700">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cuts to download from fridge */}
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Cortes a entregar ({orderKg} kg):
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ~{estimatedBaskets} canastillas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {order.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex justify-between items-center bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800"
                          >
                            <span className="font-medium text-slate-300 truncate pr-2 flex items-center gap-1.5">
                              {item.brand === "gourmet_ahumados" ? (
                                <span className="text-[9px] bg-slate-800 text-amber-400 px-1 py-0.5 rounded border border-slate-700">Ahumado</span>
                              ) : (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700">Crudo</span>
                              )}
                              <span className="truncate">{item.productName}</span>
                            </span>
                            <span className="font-mono text-slate-200 text-xs">
                              {item.realQuantity || item.quantity} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment to collect or Completed POD summary */}
                    {isDelivered ? (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-300 font-medium">Entrega Registrada:</span>
                          </div>
                          <strong className="text-slate-100 font-mono font-bold text-xs">
                            {priceService.formatCurrency(order.realTotal || order.total)}
                          </strong>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-slate-850 text-[11px] text-slate-400">
                          <span>
                            Pago: <strong className="text-slate-200 uppercase">{order.paymentMethod === "efectivo" ? "💵 Efectivo" : order.paymentMethod === "banco" ? "🏦 Banco / QR" : "📝 Crédito"}</strong>
                          </span>
                          <span>
                            Canastillas: <strong className="text-slate-200">{order.deliveredBasketsLeft || 2} dejadas / {order.emptyBasketsCollected || 2} recogidas</strong>
                          </span>
                          <span>
                            Firma: <strong className="text-slate-200">Capturada</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-400 font-medium">Cobro al recibir:</span>
                        <strong className="text-slate-100 font-mono font-bold text-xs">
                          {priceService.formatCurrency(order.realTotal || order.total)}
                        </strong>
                      </div>
                    )}

                    {/* Driver Action Buttons */}
                    {!isDelivered && (
                      <div className="space-y-1.5 pt-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {/* GPS Button */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              order.deliveryAddress
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5 text-slate-400" />
                            <span>GPS</span>
                          </a>

                          {/* WhatsApp / Call Button */}
                          <a
                            href={`https://wa.me/573233218831?text=${encodeURIComponent(
                              `Hola ${order.customerName}, soy ${activeRoute?.driverName || "Carlos Pérez"} de JD Distribuidora. Ya estoy afuera con su pedido de carne (${orderKg} kg).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Avisar</span>
                          </a>

                          {/* Big Deliver Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeliverModal(order)}
                            className="col-span-2 sm:col-span-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Entregar</span>
                          </button>
                        </div>

                        {/* Incident / Problem button */}
                        <button
                          type="button"
                          onClick={() => setIncidentModalOrder(order)}
                          className="w-full py-1 text-slate-500 hover:text-slate-400 text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Reportar Novedad</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Confirm Delivery & Customer Purchase Invoice */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl space-y-4 animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Entrega de Pedido
                </span>
                <h3 className="font-bold text-base text-slate-100 mt-1">
                  {deliveryModalOrder.customerName}
                </h3>
              </div>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-[11px] block">Total de Factura:</span>
                  <strong className="text-base font-mono font-bold text-slate-100">
                    {priceService.formatCurrency(
                      deliveryModalOrder.realTotal || deliveryModalOrder.total
                    )}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Kilos a entregar:</span>
                  <strong className="text-slate-200 font-mono text-sm">
                    {deliveryModalOrder.items.reduce(
                      (s, i) => s + (i.realQuantity || i.quantity),
                      0
                    )}{" "}
                    kg
                  </strong>
                </div>
              </div>

              {/* 1. Recipient Name */}
              <div>
                <label className="font-medium block text-slate-300 mb-1">
                  1. ¿Quién recibe en el local? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de quien recibe..."
                  value={receivedByName}
                  onChange={(e) => setReceivedByName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-slate-600 focus:outline-none"
                />
              </div>

              {/* 2. Forma de Pago de la Factura de Compra del Cliente */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="font-medium block text-slate-300 text-xs flex items-center justify-between">
                  <span>2. Forma de Pago del Cliente *</span>
                  <span className="text-[10px] text-slate-400">
                    {deliveryPaymentMethod === "efectivo"
                      ? "Efectivo en sobre"
                      : deliveryPaymentMethod === "banco"
                      ? "Transferencia / QR"
                      : "Factura a Crédito"}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("efectivo")}
                    className={`p-2.5 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      deliveryPaymentMethod === "efectivo"
                        ? "bg-slate-800 border-slate-600 text-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-sm">💵</span>
                    <span className="font-semibold text-xs">Efectivo</span>
                    <span className="text-[9px] text-slate-400">En sobre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("banco")}
                    className={`p-2.5 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      deliveryPaymentMethod === "banco"
                        ? "bg-slate-800 border-slate-600 text-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-sm">🏦</span>
                    <span className="font-semibold text-xs">Banco</span>
                    <span className="text-[9px] text-slate-400">Transf./QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("credito")}
                    className={`p-2.5 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      deliveryPaymentMethod === "credito"
                        ? "bg-slate-800 border-slate-600 text-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-sm">📝</span>
                    <span className="font-semibold text-xs">Crédito</span>
                    <span className="text-[9px] text-slate-400">15-30 días</span>
                  </button>
                </div>
              </div>

              {/* 3. Gestión de Devoluciones en Punto de Entrega */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>3. ¿Hubo Devolución o Rechazo de Producto?</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDeliveryReturn}
                      onChange={(e) => setHasDeliveryReturn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-600"></div>
                  </label>
                </div>

                {hasDeliveryReturn && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                    {/* Tipo de devolución */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryReturnType("parcial")}
                        className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                          deliveryReturnType === "parcial"
                            ? "bg-slate-800 border-slate-600 text-slate-100"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Devolución Parcial
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryReturnType("total")}
                        className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                          deliveryReturnType === "total"
                            ? "bg-slate-800 border-slate-600 text-slate-100"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Rechazo Total (100%)
                      </button>
                    </div>

                    {/* Motivo de devolución */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Motivo Principal del Rechazo:
                      </label>
                      <select
                        value={deliveryReturnReason}
                        onChange={(e) => setDeliveryReturnReason(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Rechazo de calidad / Merma en pesaje">Rechazo de calidad / Merma en pesaje</option>
                        <option value="Exceso de grasa según cliente">Exceso de grasa según cliente</option>
                        <option value="Ajuste de báscula en el local del cliente">Ajuste de báscula en el local del cliente</option>
                        <option value="Cliente no tenía el dinero completo">Cliente no tenía el dinero completo</option>
                        <option value="Error en corte o tipo de producto">Error en corte o tipo de producto</option>
                        <option value="Devolución voluntaria acordada">Devolución voluntaria acordada</option>
                      </select>
                    </div>

                    {/* Observación adicional del chofer */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Observación / Detalle de la Devolución: *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. El cliente devolvió 5 kg por merma en balanza del local"
                        value={deliveryReturnNote}
                        onChange={(e) => setDeliveryReturnNote(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
                      />
                    </div>

                    {/* Selector de cortes si es parcial */}
                    {deliveryReturnType === "parcial" && deliveryModalOrder && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-medium text-slate-400 block">
                          Digita los kilos devueltos por cada corte:
                        </span>
                        {deliveryModalOrder.items.map((it) => {
                          const maxQty = it.realQuantity || it.quantity;
                          const currentReturned = deliveryReturnedKgMap[it.productId] ?? 0;
                          const itemSubtotalDevuelto = currentReturned * it.unitPrice;

                          return (
                            <div
                              key={it.productId}
                              className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-200 truncate">{it.productName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Entregado: {maxQty} kg • ${it.unitPrice.toLocaleString()}/kg
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">Devuelve:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={maxQty}
                                  step="0.5"
                                  value={currentReturned}
                                  onChange={(e) => {
                                    const val = Math.min(maxQty, Math.max(0, parseFloat(e.target.value) || 0));
                                    setDeliveryReturnedKgMap((prev) => ({ ...prev, [it.productId]: val }));
                                  }}
                                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono font-medium text-slate-100 text-xs"
                                />
                                <span className="text-slate-500 font-mono text-[10px]">kg</span>
                              </div>

                              <div className="w-16 text-right font-mono font-semibold text-rose-400 text-xs">
                                -${itemSubtotalDevuelto.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Resumen de la Devolución */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Kilos Devueltos:</span>
                        <strong className="text-slate-200 font-mono">
                          {deliveryReturnSummary.totalReturnedKg.toFixed(1)} kg
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px] block">Nuevo Total a Cobrar:</span>
                        <strong className="text-emerald-400 font-mono text-sm font-semibold">
                          ${deliveryReturnSummary.finalTotalToCollect.toLocaleString()} COP
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Foto de la Factura de Compra / Remisión */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-300 text-xs flex items-center justify-between">
                  <span>Foto de Remisión / Soporte:</span>
                  <span className="text-[10px] text-slate-500 font-mono">Opcional</span>
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={deliveryPhotoInputRef}
                  onChange={handleDeliveryPhotoCapture}
                  className="hidden"
                />

                {deliveryInvoicePhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex items-center justify-between">
                    <img
                      src={deliveryInvoicePhoto}
                      alt="Factura"
                      className="h-12 w-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 px-3">
                      <p className="text-[11px] font-medium text-slate-300">✓ Foto adjuntada</p>
                      <button
                        type="button"
                        onClick={() => deliveryPhotoInputRef.current?.click()}
                        className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => deliveryPhotoInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span>Tomar Foto de Remisión</span>
                  </button>
                )}
              </div>

              {/* Control de Canastillas */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="font-medium text-slate-300 block text-xs flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-slate-400" />
                  <span>4. Control de Canastillas JD:</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Dejadas:</span>
                    <input
                      type="number"
                      min={0}
                      value={deliveredBaskets}
                      onChange={(e) => setDeliveredBaskets(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Recogidas:</span>
                    <input
                      type="number"
                      min={0}
                      value={returnedBaskets}
                      onChange={(e) => setReturnedBaskets(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Firma en Pantalla */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-300 text-xs flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-slate-400" />
                    <span>5. Firma de Recibido en Pantalla:</span>
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="border border-dashed border-slate-800 rounded-xl bg-slate-950 overflow-hidden relative touch-none">
                  <canvas
                    ref={canvasRef}
                    width={350}
                    height={90}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[80px] cursor-crosshair"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs">
                      Firma aquí con el dedo
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Registrar Entrega</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Report Incident / Problem */}
      {incidentModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Reportar Novedad en Entrega
                </h3>
                <p className="text-xs text-slate-400">{incidentModalOrder.customerName}</p>
              </div>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
              <div>
                <label className="font-medium block text-slate-300 mb-1.5">
                  Motivo de la Novedad:
                </label>
                <div className="space-y-1.5">
                  {[
                    "Local cerrado / No responden al teléfono",
                    "Cliente no tiene el dinero completo hoy",
                    "Horario de recibo cerrado (llegada tarde)",
                    "Cliente solicita cambio de corte de carne",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setIncidentReason(reason)}
                      className={`w-full p-2.5 rounded-xl border text-left font-medium text-xs transition-colors flex items-center justify-between ${
                        incidentReason === reason
                          ? "bg-slate-800 border-slate-600 text-slate-100"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{reason}</span>
                      {incidentReason === reason && <Check className="w-3.5 h-3.5 text-slate-300" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium block text-slate-300 mb-1">
                  Detalle adicional:
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre la novedad..."
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIncidentModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-750"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 font-semibold"
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Cashout Summary for Driver */}
      {cashoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Cuadre de Caja & Recaudo de Ruta
                  </h3>
                  <p className="text-[11px] text-slate-400">Liquidación final del turno de entrega</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-medium block">(+) Facturas en Efectivo:</span>
                  <span className="text-[10px] text-slate-500">Cobrado de contado</span>
                </div>
                <strong className="text-slate-100 font-mono font-semibold">
                  {priceService.formatCurrency(totalCashCollected)}
                </strong>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-medium block">(-) Gastos de Ruta:</span>
                  <span className="text-[10px] text-slate-500">{driverExpenses.length} recibos registrados</span>
                </div>
                <strong className="text-rose-400 font-mono font-semibold">
                  -{priceService.formatCurrency(totalExpensesAmount)}
                </strong>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <span className="text-slate-200 font-semibold block text-xs uppercase">
                    (=) Efectivo Neto en Sobre:
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    Dinero a entregar en planta
                  </span>
                </div>
                <strong className="text-emerald-400 font-mono font-bold text-base">
                  {priceService.formatCurrency(netCashInHand)}
                </strong>
              </div>

              {(totalBankCollected > 0 || totalCreditCollected > 0) && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <span className="text-slate-500 font-medium block">Otras Formas de Liquidación:</span>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pagos Banco / QR:</span>
                    <strong className="text-slate-200 font-mono">{priceService.formatCurrency(totalBankCollected)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Facturas a Crédito:</span>
                    <strong className="text-slate-200 font-mono">{priceService.formatCurrency(totalCreditCollected)}</strong>
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Saldo Pendiente en Calle:</span>
                <strong className="text-amber-400 font-mono font-semibold">
                  {priceService.formatCurrency(totalCashToCollect)}
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setCashoutModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Cerrar Cuadre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Capture Driver Expense with Camera & Receipt Photo */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl space-y-4 animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                  <Camera className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Gasto de Ruta
                  </span>
                  <h3 className="font-bold text-sm text-slate-100 mt-0.5">
                    Registrar Recibo / Combustible
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              {/* Category */}
              <div>
                <label className="font-medium block text-slate-300 mb-1.5">
                  1. Tipo de Gasto:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "combustible", label: "⛽ Combustible" },
                    { id: "peajes", label: "🛣️ Peajes" },
                    { id: "parqueadero", label: "🅿️ Parqueadero" },
                    { id: "mantenimiento", label: "🔧 Taller" },
                    { id: "viaticos", label: "🍽️ Alimentación" },
                    { id: "otros", label: "📦 Otros" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setExpenseCategory(cat.id as DriverExpense["category"])}
                      className={`p-2 rounded-xl border text-left font-medium text-[11px] transition-colors flex items-center justify-between ${
                        expenseCategory === cat.id
                          ? "bg-slate-800 border-slate-600 text-slate-100"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {expenseCategory === cat.id && <Check className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="font-medium block text-slate-300 mb-1">
                  2. Valor del Gasto: *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-semibold focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono pointer-events-none">
                    COP
                  </span>
                </div>

                {/* Quick amount pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {[20000, 50000, 100000, 150000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setExpenseAmount(val)}
                      className="py-1 px-2 bg-slate-950 hover:bg-slate-850 text-slate-400 font-mono text-[10px] rounded-lg border border-slate-800"
                    >
                      ${val / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Trigger & Photo Upload */}
              <div className="space-y-1.5">
                <label className="font-medium block text-slate-300 mb-1 flex items-center justify-between">
                  <span>3. Foto del Recibo: *</span>
                  {expenseReceiptPhoto && (
                    <button
                      type="button"
                      onClick={() => setExpenseReceiptPhoto("")}
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Borrar foto
                    </button>
                  )}
                </label>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                {expenseReceiptPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-40 flex items-center justify-center">
                    <img
                      src={expenseReceiptPhoto}
                      alt="Recibo"
                      className="w-full h-36 object-contain"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-300">Tomar foto de recibo</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="font-medium block text-slate-300 mb-1">
                  4. Descripción:
                </label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej. Tanqueada ACPM Estación..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-300" />
                  <span>Guardar Recibo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: View Captured Receipt Photo */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-3 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {viewReceiptModal.category === "combustible" ? "Combustible" : viewReceiptModal.category === "peajes" ? "Peaje" : "Gasto de Ruta"}
                </span>
                <h4 className="font-semibold text-sm text-slate-100 mt-1">{viewReceiptModal.description}</h4>
                <p className="text-xs font-mono text-slate-300">
                  {priceService.formatCurrency(viewReceiptModal.amount)} • {new Date(viewReceiptModal.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={() => setViewReceiptModal(null)}
                className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            {viewReceiptModal.receiptPhoto ? (
              <div className="rounded-xl overflow-hidden bg-black p-1 border border-slate-800 max-h-80 flex items-center justify-center">
                <img
                  src={viewReceiptModal.receiptPhoto}
                  alt="Comprobante"
                  className="w-full h-auto max-h-72 object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No se adjuntó fotografía física para este recibo.
              </div>
            )}

            <button
              onClick={() => setViewReceiptModal(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

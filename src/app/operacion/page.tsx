"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import {
  OperationsAuthService,
  OperationsUserProfile,
} from "@/services/authService";
import { OperationsAuthGate } from "@/components/operations/OperationsAuthGate";
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
  Scale,
  ThermometerSnowflake,
  Boxes,
  LogOut,
  UserCheck,
  Share2,
} from "lucide-react";
import { PlantPackingStation } from "@/components/operations/PlantPackingStation";
import { ColdStorageStation } from "@/components/operations/ColdStorageStation";

export default function OperacionPage() {
  const {
    routes,
    allOrders,
    allCustomers,
    getMagicLinkForCustomer,
    expenses,
    addDriverExpense,
    updateOrderStatus,
    confirmDelivery,
    updateRouteStatus,
    reorderRouteOrders,
    showToast,
  } = useApp();

  // Active operations authenticated user: Operador vs Domiciliario
  const [currentUser, setCurrentUser] = useState<OperationsUserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Active operations role mode: Domiciliario / Chofer vs Operario de Planta vs Operario de Bodega
  const [operationsMode, setOperationsMode] = useState<"domiciliario" | "planta" | "bodega">("domiciliario");

  // GPS Route Map visibility in driver cab
  const [showRouteMap, setShowRouteMap] = useState(true);

  useEffect(() => {
    const session = OperationsAuthService.getCurrentSession();
    if (session) {
      setCurrentUser(session);
      setOperationsMode(session.role === "operador" ? "planta" : "domiciliario");
    }
    setIsAuthChecking(false);
  }, []);

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

  const handleLogout = () => {
    OperationsAuthService.logout();
    setCurrentUser(null);
    showToast("Turno cerrado correctamente", "info");
  };

  // Render Gate if no authenticated session
  if (!currentUser && !isAuthChecking) {
    return (
      <OperationsAuthGate
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setOperationsMode(user.role === "operador" ? "planta" : "domiciliario");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 font-sans">
      {/* Top Operations Header */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                {currentUser?.role === "operador" ? "👷" : "🚚"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border tracking-wide ${
                      currentUser?.role === "operador"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {currentUser?.role === "operador"
                      ? "PANTALLA DE OPERADOR DE PLANTA"
                      : "PANTALLA DE DOMICILIARIO / CONDUCTOR"}
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-bold text-slate-100 leading-tight mt-0.5">
                  {currentUser?.role === "operador"
                    ? operationsMode === "planta"
                      ? "Alistamiento, Báscula Digital & Precintos INVIMA"
                      : "Kardex en Frío (1.8°C) & Recepción de Canales"
                    : `${activeRoute?.driverName || "Carlos Pérez"} • Furgón ${activeRoute?.vehiclePlate || "KLP-541"}`}
                </h1>
              </div>
            </div>

            {/* Quick Driver switcher only if in domiciliario mode */}
            {currentUser?.role === "domiciliario" && (
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-slate-600 sm:hidden"
              >
                {routes.map((r) => (
                  <option key={r.driverId} value={r.driverId}>
                    {r.driverName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action buttons based on active role */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {currentUser?.role === "operador" ? (
              <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800 flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => setOperationsMode("planta")}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    operationsMode === "planta"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Alistamiento & Báscula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperationsMode("bodega")}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    operationsMode === "bodega"
                      ? "bg-cyan-600 text-white shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  <span>Bodega & Frío</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  {routes.map((r) => (
                    <option key={r.driverId} value={r.driverId}>
                      🚚 {r.driverName} ({r.vehiclePlate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Logout / Switch Role button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs font-bold border border-slate-800 hover:border-rose-700/60 transition-colors flex items-center gap-1.5 flex-shrink-0"
              title="Cerrar turno o cambiar a otro perfil de operación"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Turno</span>
            </button>
          </div>
        </div>
      </div>

      {currentUser?.role === "domiciliario" || operationsMode === "domiciliario" ? (
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
                    className={`w-2 h-2 rounded-full ${
                      activeRoute.status === "in_transit"
                        ? "bg-emerald-400 animate-pulse"
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
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                  ❄️
                </span>
                <span className="text-slate-300 text-xs font-bold">Temperatura Furgón Térmico:</span>
              </div>
              <strong className="text-emerald-400 font-mono font-black text-xs sm:text-sm">
                1.8°C <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/30">ÓPTIMO</span>
              </strong>
            </div>

            {/* Google Maps Master Launch Button (Dynamically Recalculated) */}
            <div className="pt-1">
              <a
                href={getFullGoogleMapsRouteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full min-h-[54px] py-4 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xl transition-all active:scale-98 text-center border-2 ${
                  pendingOrders.length > 0
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 glow-master-btn border-emerald-300"
                    : "bg-emerald-700/80 text-white border-emerald-500/60 shadow-emerald-950/50"
                }`}
              >
                <Navigation className={`w-5 h-5 flex-shrink-0 ${pendingOrders.length > 0 ? "text-slate-950 fill-current animate-bounce" : "text-white"}`} />
                <span>
                  {pendingOrders.length > 0
                    ? `🗺️ ABRIR RECORRIDO ACTUALIZADO EN GOOGLE MAPS GPS (${pendingOrders.length} PARADAS RESTANTES)`
                    : `🏁 RUTA 100% COMPLETADA (${completedOrders.length}/${routeOrders.length} PARADAS ENTREGADAS)`}
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Interactive GPS Route Map (Always Visible & Prominent) */}
        {activeRoute && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Trazado de Ruta en Mapa Satelital (Paso a Paso)</span>
              </h3>
              <span className="text-[11px] text-cyan-300 font-bold">
                {completedOrders.length}/{routeOrders.length} Paradas Listas
              </span>
            </div>

            <RouteMap route={activeRoute} orders={routeOrders} />
          </div>
        )}

        {/* Immediate Next Stop Callout Banner or Route Completed Celebration */}
        {nextStop ? (
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-emerald-950/60 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-2xl ring-2 ring-amber-500/30 glow-amber-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-md flex items-center gap-1.5 animate-pulse">
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                  <span>📍 Siguiente Parada Activa</span>
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                  Parada #{routeOrders.findIndex((o) => o.id === nextStop.id) + 1} de {routeOrders.length}
                </span>
              </div>

              <strong className="text-emerald-400 font-black text-sm sm:text-base">
                {priceService.formatCurrency(nextStop.realTotal || nextStop.total)}
              </strong>
            </div>

            <div>
              <h4 className="text-lg font-black text-white">{nextStop.customerName}</h4>
              <p className="text-xs text-emerald-300 font-bold flex items-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{nextStop.deliveryAddress}</span>
              </p>
            </div>

            {/* Meat cuts summary for this stop */}
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                🥩 Descarga: <strong className="text-white">{nextStop.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0)} kg</strong>
              </span>
              <span className="text-brand-300 font-bold">
                ~{Math.ceil(nextStop.items.reduce((s, i) => s + i.quantity, 0) / 25) || 1} canastillas JD
              </span>
            </div>

            {/* Quick Action Navigation & Delivery for Next Stop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  nextStop.deliveryAddress
                )}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-black text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Navegar GPS</span>
              </a>

              <a
                href={`https://wa.me/573233218831?text=${encodeURIComponent(
                  `Hola ${nextStop.customerName}, soy ${activeRoute?.driverName || "Carlos Pérez"} de JD Distribuidora. Ya voy en camino con su pedido de carne (${nextStop.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0)} kg).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Avisar Llegada</span>
              </a>

              <button
                type="button"
                onClick={() => handleOpenDeliverModal(nextStop)}
                className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>CONFIRMAR ENTREGA</span>
              </button>
            </div>
          </div>
        ) : routeOrders.length > 0 ? (
          /* Route Completed Celebration Card */
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900/50 border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-2xl glow-emerald-card text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black border border-emerald-500/40">
                🏁
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Turno de Entregas Finalizado
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  ¡Todas las paradas han sido completadas!
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Has entregado satisfactoriamente los <strong>{totalKg} kg</strong> de carne en las <strong>{routeOrders.length} paradas</strong> del recorrido.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Recaudo Efectivo:</span>
                <strong className="text-emerald-400 font-black text-sm">{priceService.formatCurrency(totalCashCollected)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Efectivo Neto en Sobre:</span>
                <strong className="text-emerald-300 font-black text-sm">{priceService.formatCurrency(netCashInHand)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCashoutModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>VER CUADRE DE CAJA FINAL DE PLANTA</span>
            </button>
          </div>
        ) : null}

        {/* Route Progress & Cash Collection Widget */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-brand-400">
                Resumen del Turno
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">Progreso de Entregas</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="text-xs font-black bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/40 shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📸 Recibos</span>
              </button>

              <button
                onClick={() => setCashoutModalOpen(true)}
                className="text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full border border-emerald-400 shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Cuadre</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  routeOrders.length > 0
                    ? (completedOrders.length / routeOrders.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-800">
            <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Carga Total:</span>
              <strong className="text-white text-xs sm:text-sm font-black">{totalKg} kg</strong>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Por Recaudar:</span>
              <strong className="text-amber-400 text-xs sm:text-sm font-black">
                {priceService.formatCurrency(totalCashToCollect)}
              </strong>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Recaudado:</span>
              <strong className="text-emerald-400 text-xs sm:text-sm font-black">
                {priceService.formatCurrency(totalCashCollected)}
              </strong>
            </div>
          </div>
        </div>

        {/* Road Expenses Bar */}
        {driverExpenses.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-200">
                  Gastos de Ruta Reportados ({driverExpenses.length})
                </h3>
              </div>
              <span className="text-xs font-black text-rose-400">
                Total: -{priceService.formatCurrency(totalExpensesAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {driverExpenses.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setViewReceiptModal(exp)}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 flex-shrink-0 text-left transition-all active:scale-95 shadow-md"
                >
                  {exp.receiptPhoto ? (
                    <img
                      src={exp.receiptPhoto}
                      alt="Recibo"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-750 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      🧾
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {exp.category === "combustible"
                        ? "⛽ Gasolina"
                        : exp.category === "peajes"
                        ? "🛣️ Peaje"
                        : exp.category === "parqueadero"
                        ? "🅿️ Parking"
                        : "📦 Gasto"}
                    </span>
                    <p className="text-[11px] font-bold text-white truncate max-w-[140px] mt-0.5">
                      {exp.description}
                    </p>
                    <p className="text-[11px] text-amber-400 font-black">
                      {priceService.formatCurrency(exp.amount)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Satellite Map with Real-time GPS & Reordering */}
        {activeRoute && routeOrders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-cyan-400" />
                <span>Mapa Satelital de Ruta (GPS en Cabina)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRouteMap(!showRouteMap)}
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              >
                {showRouteMap ? "Ocultar Mapa" : "Ver Mapa Satelital"}
              </button>
            </div>

            {showRouteMap && (
              <RouteMap
                route={activeRoute}
                orders={routeOrders}
                titlePrefix="Navegación GPS del Furgón"
                onReorderFromLocation={(reordered) => reorderRouteOrders(activeRoute.id, reordered)}
              />
            )}
          </div>
        )}

        {/* Sequential Stop Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Itinerario de Paradas en Orden</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {pendingOrders.length} pendientes • {completedOrders.length} listas
            </span>
          </div>

          {routeOrders.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Truck className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-black text-white text-base">No tienes entregas asignadas en esta ruta</p>
              <p className="text-xs text-slate-400">
                Espera a que la administración de planta cargue pedidos a tu furgón.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    className={`rounded-3xl border transition-all p-4 sm:p-5 space-y-4 shadow-xl ${
                      isDelivered
                        ? "bg-slate-900/50 border-emerald-500/40 opacity-90"
                        : isNextActive
                        ? "bg-slate-900 border-amber-500 ring-2 ring-amber-500/40 glow-amber-card"
                        : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    {/* Stop Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 ${
                            isDelivered
                              ? "bg-emerald-600 text-white"
                              : isNextActive
                              ? "bg-amber-500 text-slate-950 animate-pulse"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {isDelivered ? `✓ #${idx + 1}` : `#${idx + 1}`}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-white text-base sm:text-lg">
                              {order.customerName}
                            </h4>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {order.orderNumber}
                            </span>
                            {isNextActive && (
                              <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                                📍 Siguiente en Ruta
                              </span>
                            )}
                          </div>

                          {/* Customer Address */}
                          <p className="text-xs text-emerald-400 font-extrabold flex items-start gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-400" />
                            <span>{order.deliveryAddress}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isDelivered ? (
                          <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✓ Parada Lista</span>
                          </span>
                        ) : isNextActive ? (
                          <span className="text-xs font-black bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40">
                            En Curso
                          </span>
                        ) : (
                          <span className="text-xs font-black bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cuts to download from fridge with Brand differentiation */}
                    <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          🥩 Cortes a bajar ({orderKg} kg en total):
                        </p>
                        <span className="text-[11px] text-brand-300 font-bold bg-brand-500/20 px-2 py-0.5 rounded-md border border-brand-500/30 flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          <span>~{estimatedBaskets} canastillas JD</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {order.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
                          >
                            <span className="font-bold text-slate-200 truncate pr-2 flex items-center gap-1.5">
                              {item.brand === "gourmet_ahumados" ? (
                                <span className="text-amber-400 text-xs flex items-center gap-0.5">
                                  <Flame className="w-3.5 h-3.5 fill-current" />
                                  <strong className="text-[10px] bg-amber-500/20 px-1 rounded uppercase">Ahumado</strong>
                                </span>
                              ) : (
                                <span className="text-rose-400 text-[10px] bg-rose-500/20 px-1 rounded uppercase font-bold">Crudo</span>
                              )}
                              <span className="truncate">{item.productName}</span>
                            </span>
                            <span className="font-extrabold text-brand-400 whitespace-nowrap">
                              {item.realQuantity || item.quantity} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment to collect or Completed POD summary */}
                    {isDelivered ? (
                      <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-300 font-bold">Entrega y Cobro Completados:</span>
                          </div>
                          <strong className="text-emerald-400 font-black text-base">
                            {priceService.formatCurrency(order.realTotal || order.total)}
                          </strong>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-500/20 text-[11px]">
                          <span className="text-slate-300">
                            💳 Pago: <strong className="text-emerald-400 uppercase">{order.paymentMethod === "efectivo" ? "💵 Efectivo" : order.paymentMethod === "banco" ? "🏦 Banco / QR" : "📝 Crédito"}</strong>
                          </span>
                          <span className="text-slate-300">
                            📦 Canastillas: <strong className="text-white">{order.deliveredBasketsLeft || 2} dejadas / {order.emptyBasketsCollected || 2} recogidas</strong>
                          </span>
                          <span className="text-slate-300">
                            ✍️ Firma: <strong className="text-emerald-300">Digital Validada</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-850 p-3 rounded-2xl border border-slate-750 text-xs">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300 font-bold">Cobro al recibir:</span>
                        </div>
                        <strong className="text-emerald-400 font-black text-base">
                          {priceService.formatCurrency(order.realTotal || order.total)}
                        </strong>
                      </div>
                    )}

                    {/* Driver Action Buttons */}
                    {!isDelivered && (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {/* GPS Button */}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                              order.deliveryAddress
                            )}&travelmode=driving`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                          >
                            <Navigation className="w-4 h-4 text-cyan-400" />
                            <span>Navegar GPS</span>
                          </a>

                          {/* WhatsApp / Call Button */}
                          <a
                            href={`https://wa.me/57${
                              (allCustomers.find((c) => c.id === order.customerId || c.businessName === order.customerName)?.phone || "3233218831").replace(/\D/g, "")
                            }?text=${encodeURIComponent(
                              `Hola ${order.customerName}, soy ${activeRoute?.driverName || "Carlos Pérez"} de JD Distribuidora. Ya estoy afuera con su pedido de carne (${orderKg} kg).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-black text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-all active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4 fill-current" />
                            <span>Avisar Llegada</span>
                          </a>

                          {/* Big Deliver Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeliverModal(order)}
                            className="col-span-2 sm:col-span-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            <span>CONFIRMAR ENTREGA</span>
                          </button>
                        </div>

                        {/* Extra Driver Row: Share App Link with Customer & Report Incident */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                          <a
                            href={`https://wa.me/57${
                              (allCustomers.find((c) => c.id === order.customerId || c.businessName === order.customerName)?.phone || "3233218831").replace(/\D/g, "")
                            }?text=${encodeURIComponent(
                              `Hola ${order.customerName}, te comparto tu enlace exclusivo para pedir carne fresca en JD Distribuidora & Gourmet con los precios mayoristas de tu local:\n\n${getMagicLinkForCustomer(order.customerId)}\n\n¡Ábrelo desde tu celular para hacer pedidos en 1 toque!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                            title="Compartir link exclusivo con el dueño o administrador del local"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Compartir Enlace con Cliente</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setIncidentModalOrder(order)}
                            className="w-full sm:w-auto py-2 px-3 rounded-xl text-slate-400 hover:text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reportar Novedad</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      ) : operationsMode === "planta" ? (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <PlantPackingStation
            selectedRouteId={activeRoute?.id}
            onRouteChange={(rid) => {
              const r = routes.find((x) => x.id === rid);
              if (r) setSelectedDriverId(r.driverId);
            }}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ColdStorageStation />
        </div>
      )}

      {/* Modal 1: Confirm Delivery & Customer Purchase Invoice */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Factura de Compra & Entrega de Carne
                </span>
                <h3 className="font-black text-lg text-white mt-1">
                  {deliveryModalOrder.customerName}
                </h3>
              </div>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-855 rounded-2xl border border-slate-750 text-slate-300 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-[11px] block font-bold">Total Factura de Compra:</span>
                  <strong className="text-xl font-black text-emerald-400">
                    {priceService.formatCurrency(
                      deliveryModalOrder.realTotal || deliveryModalOrder.total
                    )}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block font-bold">Kilos a entregar:</span>
                  <strong className="text-white font-black text-sm">
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
                <label className="font-black block text-slate-300 mb-1">
                  1. ¿Quién recibió la carne en el local? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Don Carlos / Administrador"
                  value={receivedByName}
                  onChange={(e) => setReceivedByName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* 2. Forma de Pago de la Factura de Compra del Cliente (Crédito, Banco, Efectivo) */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border-2 border-emerald-500/40 space-y-2">
                <label className="font-black block text-emerald-300 text-xs flex items-center justify-between">
                  <span>2. ¿Cómo paga el cliente esta Factura? *</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {deliveryPaymentMethod === "efectivo"
                      ? "💵 Suma a caja física"
                      : deliveryPaymentMethod === "banco"
                      ? "🏦 Transferencia / QR"
                      : "📝 Factura Crédito"}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("efectivo")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      deliveryPaymentMethod === "efectivo"
                        ? "bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-500/40"
                        : "bg-slate-850 border-slate-750 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-base">💵</span>
                    <span className="font-black text-xs">Efectivo</span>
                    <span className="text-[9px] opacity-80">En sobre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("banco")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      deliveryPaymentMethod === "banco"
                        ? "bg-cyan-600 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-500/40"
                        : "bg-slate-850 border-slate-750 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-base">🏦</span>
                    <span className="font-black text-xs">Banco</span>
                    <span className="text-[9px] opacity-80">Transf. / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("credito")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      deliveryPaymentMethod === "credito"
                        ? "bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-500/40"
                        : "bg-slate-850 border-slate-750 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-base">📝</span>
                    <span className="font-black text-xs">Crédito</span>
                    <span className="text-[9px] opacity-80">15-30 días</span>
                  </button>
                </div>
              </div>

              {/* 3. Gestión de Devoluciones en Punto de Entrega (Total o Parcial) */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-200 flex items-center gap-1.5 cursor-pointer">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>3. ¿Hubo Devolución o Rechazo de Producto?</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDeliveryReturn}
                      onChange={(e) => setHasDeliveryReturn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {hasDeliveryReturn && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 space-y-3">
                    {/* Tipo de devolución */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryReturnType("parcial")}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          deliveryReturnType === "parcial"
                            ? "bg-amber-600/30 border-amber-500 text-amber-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Devolución Parcial
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryReturnType("total")}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          deliveryReturnType === "total"
                            ? "bg-rose-600/30 border-rose-500 text-rose-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Rechazo Total (100%)
                      </button>
                    </div>

                    {/* Motivo de devolución */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Motivo Principal del Rechazo:
                      </label>
                      <select
                        value={deliveryReturnReason}
                        onChange={(e) => setDeliveryReturnReason(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
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
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Observación / Detalle de la Devolución: *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. El cliente devolvió 5 kg por merma en balanza del local"
                        value={deliveryReturnNote}
                        onChange={(e) => setDeliveryReturnNote(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Selector de cortes si es parcial */}
                    {deliveryReturnType === "parcial" && deliveryModalOrder && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-300 block">
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
                                <p className="font-bold text-slate-200 truncate">{it.productName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
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
                                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono font-bold text-white text-xs"
                                />
                                <span className="text-slate-500 font-mono text-[10px]">kg</span>
                              </div>

                              <div className="w-16 text-right font-mono font-bold text-amber-400 text-xs">
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
                        <strong className="text-amber-400 font-mono">
                          {deliveryReturnSummary.totalReturnedKg.toFixed(1)} kg
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px] block">Nuevo Total a Cobrar al Cliente:</span>
                        <strong className="text-emerald-400 font-mono text-sm font-black">
                          ${deliveryReturnSummary.finalTotalToCollect.toLocaleString()} COP
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Foto de la Factura de Compra / Remisión Firmada */}
              <div className="space-y-1.5">
                <label className="font-black text-slate-300 text-xs flex items-center justify-between">
                  <span>3. Foto de Factura de Compra / Remisión:</span>
                  <span className="text-[10px] text-brand-400 font-bold">Opcional / Soporte</span>
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
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 p-1 flex items-center justify-between">
                    <img
                      src={deliveryInvoicePhoto}
                      alt="Factura de compra"
                      className="h-14 w-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 px-3">
                      <p className="text-[11px] font-bold text-emerald-400">✓ Factura fotografiada</p>
                      <button
                        type="button"
                        onClick={() => deliveryPhotoInputRef.current?.click()}
                        className="text-[10px] text-slate-400 hover:text-white underline"
                      >
                        Cambiar foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => deliveryPhotoInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Tomar Foto a la Factura / Remisión 📸</span>
                  </button>
                )}
              </div>

              {/* 4. Plastic Baskets Exchange Control */}
              <div className="bg-slate-850 p-3 rounded-2xl border border-slate-750 space-y-2">
                <label className="font-black text-slate-200 block text-xs flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-brand-400" />
                  <span>4. Control de Canastillas Plásticas JD:</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Canastillas Dejadas:</span>
                    <input
                      type="number"
                      min={0}
                      value={deliveredBaskets}
                      onChange={(e) => setDeliveredBaskets(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Vacías Recogidas:</span>
                    <input
                      type="number"
                      min={0}
                      value={returnedBaskets}
                      onChange={(e) => setReturnedBaskets(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-center"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Digital Finger Signature on Canvas */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-black text-slate-300 text-xs flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-brand-400" />
                    <span>5. Firma de Recibido en Pantalla (Dedo del Cliente):</span>
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-slate-400 hover:text-rose-400 font-bold"
                    >
                      Limpiar firma
                    </button>
                  )}
                </div>

                <div className="border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950 overflow-hidden relative touch-none">
                  <canvas
                    ref={canvasRef}
                    width={350}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[90px] cursor-crosshair"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs font-bold">
                      Firma aquí con el dedo ✍️
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOrder(null)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                  <span>REGISTRAR ENTREGA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Report Incident / Problem */}
      {incidentModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  Reportar Novedad en Entrega
                </h3>
                <p className="text-xs text-slate-400">{incidentModalOrder.customerName}</p>
              </div>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block text-slate-300 mb-1.5">
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
                      className={`w-full p-2.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                        incidentReason === reason
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-black"
                          : "bg-slate-800 border-slate-750 text-slate-300"
                      }`}
                    >
                      <span>{reason}</span>
                      {incidentReason === reason && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block text-slate-300 mb-1">
                  Detalle adicional para la central:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. El encargado dice que vuelve a las 2pm..."
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIncidentModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black"
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black">
                  💵
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Cuadre de Caja & Recaudo de Ruta
                  </h3>
                  <p className="text-[11px] text-slate-400">Liquidación final del turno de entrega</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-850 rounded-2xl border border-slate-750 flex justify-between items-center">
                <div>
                  <span className="text-slate-300 font-bold block">(+) Recaudo Facturas Efectivo:</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Cobrado de contado en ruta</span>
                </div>
                <strong className="text-emerald-400 font-black text-base">
                  {priceService.formatCurrency(totalCashCollected)}
                </strong>
              </div>

              <div className="p-3 bg-slate-850 rounded-2xl border border-slate-750 flex justify-between items-center">
                <div>
                  <span className="text-slate-300 font-bold block">(-) Gastos de Ruta (Gasolina/Peajes):</span>
                  <span className="text-[10px] text-rose-400">{driverExpenses.length} recibos con foto</span>
                </div>
                <strong className="text-rose-400 font-black text-base">
                  -{priceService.formatCurrency(totalExpensesAmount)}
                </strong>
              </div>

              <div className="p-3.5 bg-emerald-950/40 rounded-2xl border-2 border-emerald-500/50 flex justify-between items-center shadow-lg">
                <div>
                  <span className="text-emerald-300 font-black block text-xs uppercase">
                    (=) EFECTIVO NETO A ENTREGAR EN PLANTA:
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Dinero físico a entregar en sobre cerrado en bodega
                  </span>
                </div>
                <strong className="text-emerald-300 font-black text-xl">
                  {priceService.formatCurrency(netCashInHand)}
                </strong>
              </div>

              {(totalBankCollected > 0 || totalCreditCollected > 0) && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-slate-400 font-bold block">Otras Formas de Liquidación de Clientes:</span>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-300 font-bold">🏦 Pagos Banco / QR:</span>
                    <strong className="text-cyan-300 font-black">{priceService.formatCurrency(totalBankCollected)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-300 font-bold">📝 Facturas a Crédito:</span>
                    <strong className="text-amber-300 font-black">{priceService.formatCurrency(totalCreditCollected)}</strong>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-850 rounded-2xl border border-slate-750 flex justify-between items-center">
                <span className="text-slate-400">Saldo Pendiente por Cobrar en Calle:</span>
                <strong className="text-amber-400 font-black text-base">
                  {priceService.formatCurrency(totalCashToCollect)}
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setCashoutModalOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs shadow-md"
              >
                Cerrar Resumen de Cuadre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Capture Driver Expense with Camera & Receipt Photo */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    Gasto Operativo de Ruta
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-white mt-0.5">
                    Registrar Recibo / Combustible
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              {/* Category */}
              <div>
                <label className="font-bold block text-slate-300 mb-1.5">
                  1. Tipo de Gasto de Ruta:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "combustible", label: "⛽ Combustible / ACPM" },
                    { id: "peajes", label: "🛣️ Peajes" },
                    { id: "parqueadero", label: "🅿️ Parqueadero" },
                    { id: "mantenimiento", label: "🔧 Mantenimiento / Taller" },
                    { id: "viaticos", label: "🍽️ Viáticos / Alimentación" },
                    { id: "otros", label: "📦 Otros Gastos" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setExpenseCategory(cat.id as DriverExpense["category"])}
                      className={`p-2 rounded-xl border text-left font-bold text-[11px] transition-all flex items-center justify-between ${
                        expenseCategory === cat.id
                          ? "bg-amber-600/30 border-amber-500 text-amber-300 font-black shadow-sm"
                          : "bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {expenseCategory === cat.id && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="font-bold block text-slate-300 mb-1">
                  2. Valor Total del Gasto: *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border-2 border-amber-500/50 focus:border-amber-500 rounded-xl px-4 py-3 text-lg text-white font-black focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-amber-400 font-extrabold pointer-events-none">
                    COP
                  </span>
                </div>

                {/* Quick amount pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[20000, 50000, 100000, 150000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setExpenseAmount(val)}
                      className="py-1 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[10px] rounded-lg border border-slate-700"
                    >
                      ${val / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Trigger & Photo Upload */}
              <div className="space-y-1.5">
                <label className="font-bold block text-slate-300 mb-1 flex items-center justify-between">
                  <span>3. Foto del Recibo / Tirilla Física: *</span>
                  {expenseReceiptPhoto && (
                    <button
                      type="button"
                      onClick={() => setExpenseReceiptPhoto("")}
                      className="text-[10px] text-rose-400 font-bold"
                    >
                      Borrar foto
                    </button>
                  )}
                </label>

                {/* Hidden input for direct camera access */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                {expenseReceiptPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-950 max-h-48 flex items-center justify-center">
                    <img
                      src={expenseReceiptPhoto}
                      alt="Foto de Recibo"
                      className="w-full h-44 object-contain"
                    />
                    <span className="absolute bottom-2 right-2 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Foto Capturada</span>
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 transition-all flex flex-col items-center justify-center gap-2 group active:scale-98"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 group-hover:bg-amber-500/30 flex items-center justify-center text-amber-400 transition-colors">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xs sm:text-sm text-white">
                        TOCAR AQUÍ PARA ABRIR LA CÁMARA 📸
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Toma la foto clara de la tirilla de gasolina o peaje
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="font-bold block text-slate-300 mb-1">
                  4. Descripción / Observación:
                </label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej. Tanqueada ACPM Estación El Sol..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>GUARDAR RECIBO DE GASTO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: View Captured Receipt Photo */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-3 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {viewReceiptModal.category === "combustible" ? "⛽ COMBUSTIBLE" : viewReceiptModal.category === "peajes" ? "🛣️ PEAJE" : "📦 GASTO DE RUTA"}
                  </span>
                </div>
                <h4 className="font-black text-sm text-white">{viewReceiptModal.description}</h4>
                <p className="text-xs text-amber-400 font-extrabold">
                  {priceService.formatCurrency(viewReceiptModal.amount)} • {new Date(viewReceiptModal.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={() => setViewReceiptModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-black"
              >
                ✕
              </button>
            </div>

            {viewReceiptModal.receiptPhoto ? (
              <div className="rounded-2xl overflow-hidden bg-black p-1 border border-slate-800 max-h-96 flex items-center justify-center">
                <img
                  src={viewReceiptModal.receiptPhoto}
                  alt="Comprobante"
                  className="w-full h-auto max-h-80 object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-850 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold">
                No se adjuntó fotografía física para este recibo.
              </div>
            )}

            <button
              onClick={() => setViewReceiptModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

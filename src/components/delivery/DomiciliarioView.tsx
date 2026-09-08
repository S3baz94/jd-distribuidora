"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { Order, DriverExpense } from "@/types";
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Camera,
  PenTool,
  RotateCcw,
  Boxes,
  DollarSign,
  Fuel,
  CreditCard,
  Building2,
  ChevronRight,
  Clock,
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Send,
  Zap,
} from "lucide-react";

export default function DomiciliarioView() {
  const {
    routes,
    allOrders,
    expenses,
    confirmDelivery,
    updateRouteStatus,
    addDriverExpense,
    showToast,
  } = useApp();

  // Estados de conexión en vivo
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        showToast("📶 Conexión restaurada en ruta", "success");
      };
      const handleOffline = () => {
        setIsOnline(false);
        showToast("⚠️ Sin conexión a internet. Los datos se guardan localmente.", "warning");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [showToast]);

  // Conductor asignado por defecto
  const selectedDriverId = "driver-1";
  const activeRoute = routes.find((r) => r.driverId === selectedDriverId) || routes[0];

  // Pedidos asignados a la ruta del conductor ordenados por secuencia de paradas
  const routeOrders = useMemo(() => {
    if (!activeRoute) return [];
    const orders = allOrders.filter(
      (o) => o.routeId === activeRoute.id || activeRoute.orderIds.includes(o.id)
    );
    return orders.sort((a, b) => {
      const idxA = activeRoute.orderIds.indexOf(a.id);
      const idxB = activeRoute.orderIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.stopOrder || 999) - (b.stopOrder || 999);
    });
  }, [allOrders, activeRoute]);

  // Detección en vivo de paradas agregadas dinámicamente durante el recorrido
  const previousOrderCountRef = useRef<number>(routeOrders.length);
  const [newOrderAlert, setNewOrderAlert] = useState<{
    count: number;
    orderNumber: string;
    customerName: string;
    address: string;
  } | null>(null);

  useEffect(() => {
    if (routeOrders.length > previousOrderCountRef.current && previousOrderCountRef.current > 0) {
      const newlyAdded = routeOrders[0];
      setNewOrderAlert({
        count: routeOrders.length - previousOrderCountRef.current,
        orderNumber: newlyAdded?.orderNumber || "Nuevo Pedido",
        customerName: newlyAdded?.customerName || "Cliente Asignado",
        address: newlyAdded?.deliveryAddress || "Dirección en ruta",
      });
      showToast("🚨 Despacho agregó una nueva parada cercana a tu recorrido", "warning");
    }
    previousOrderCountRef.current = routeOrders.length;
  }, [routeOrders.length, routeOrders, showToast]);

  const completedOrders = useMemo(
    () => routeOrders.filter((o) => o.status === "delivered"),
    [routeOrders]
  );
  const pendingOrders = useMemo(
    () => routeOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),
    [routeOrders]
  );

  const nextStop = pendingOrders[0];

  // Métricas financieras y arqueo de ruta
  const totalCashCollected = completedOrders
    .filter((o) => o.paymentMethod === "efectivo" || !o.paymentMethod)
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalBankCollected = completedOrders
    .filter((o) => o.paymentMethod === "banco")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalCreditCollected = completedOrders
    .filter((o) => o.paymentMethod === "credito")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const driverExpenses = useMemo(
    () => expenses.filter((e) => e.driverId === selectedDriverId),
    [expenses, selectedDriverId]
  );
  const totalExpenses = driverExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashInCabin = totalCashCollected - totalExpenses;

  // Estados de Modales
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<Order | null>(null);
  const [incidentModalOrder, setIncidentModalOrder] = useState<Order | null>(null);
  const [showArqueoModal, setShowArqueoModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);

  // Formulario de Entrega
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState<"efectivo" | "banco" | "credito">("efectivo");
  const [receivedByName, setReceivedByName] = useState<string>("");
  const [deliveredBaskets, setDeliveredBaskets] = useState<number>(2);
  const [returnedBaskets, setReturnedBaskets] = useState<number>(2);
  const [deliveryInvoicePhoto, setDeliveryInvoicePhoto] = useState<string>("");
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Formulario de Devolución opcional en entrega
  const [hasReturn, setHasReturn] = useState<boolean>(false);
  const [returnReason, setReturnReason] = useState<string>("Rechazo de calidad / Merma en pesaje");
  const [returnNote, setReturnNote] = useState<string>("");
  const [returnedKg, setReturnedKg] = useState<number>(0);

  // Formulario de Incidente
  const [incidentReason, setIncidentReason] = useState<string>("Local cerrado / No abren");
  const [incidentNote, setIncidentNote] = useState<string>("");

  // Formulario de Gastos de Ruta
  const [expenseCategory, setExpenseCategory] = useState<DriverExpense["category"]>("combustible");
  const [expenseAmount, setExpenseAmount] = useState<number>(50000);
  const [expenseDesc, setExpenseDesc] = useState<string>("Tanqueada ACPM Estación de Servicio");
  const [expenseReceiptPhoto, setExpenseReceiptPhoto] = useState<string>("");

  // Abrir Modal de Entrega
  const handleOpenDelivery = (order: Order) => {
    setDeliveryModalOrder(order);
    setDeliveryPaymentMethod(order.paymentMethod === "credito" ? "credito" : "efectivo");
    setReceivedByName(order.customerName);
    setDeliveredBaskets(2);
    setReturnedBaskets(2);
    setDeliveryInvoicePhoto("");
    setHasSignature(false);
    setHasReturn(false);
    setReturnedKg(0);
    setReturnNote("");
  };

  // Compresión de fotos en canvas cliente
  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          callback(compressed);
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Captura fotográfica de factura firmada
  const handleDeliveryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (base64) => {
      setDeliveryInvoicePhoto(base64);
      showToast("📸 Foto de factura firmada guardada", "success");
    });
  };

  // Captura fotográfica de recibo de gasto
  const handleExpensePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (base64) => {
      setExpenseReceiptPhoto(base64);
      showToast("📸 Foto de recibo de gasto cargada", "success");
    });
  };

  // Manejo de lienzo de firma táctil
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

    ctx.strokeStyle = "#4edea3";
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

  // Confirmar Entrega
  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalOrder || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const returnDetailsObj = hasReturn && returnedKg > 0
        ? {
            hasReturn: true,
            type: "parcial" as const,
            returnedKg: returnedKg,
            returnedAmount: returnedKg * 18000,
            returnNote: `${returnReason}${returnNote ? ` - ${returnNote}` : ""}`,
            returnedAt: new Date().toISOString(),
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

      const remaining = pendingOrders.filter((o) => o.id !== deliveryModalOrder.id);
      if (remaining.length === 0 && activeRoute) {
        updateRouteStatus(activeRoute.id, "completed");
        showToast("🏁 ¡Ruta completada! Todas las entregas fueron finalizadas con éxito.", "success");
      } else {
        const next = remaining[0];
        showToast(
          `📍 Parada completada. Próxima entrega: ${next ? next.customerName : "Fin de ruta"}`,
          "success"
        );
      }
      setDeliveryModalOrder(null);
    } catch {
      showToast("Error al registrar la entrega", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reportar Novedad / Incidente
  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentModalOrder || isSubmitting) return;

    showToast(`⚠️ Novedad reportada para ${incidentModalOrder.customerName}: ${incidentReason}`, "warning");
    setIncidentModalOrder(null);
  };

  // Guardar Gasto de Ruta
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
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

      setShowExpenseModal(false);
      setExpenseReceiptPhoto("");
      setExpenseAmount(50000);
      setExpenseDesc("");
      showToast(`⛽ Gasto de ${priceService.formatCurrency(expenseAmount)} registrado en cabina`, "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enlaces de Navegación
  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address + ", Bogotá")}`;
  };

  const getWazeUrl = (address: string) => {
    return `https://waze.com/ul?q=${encodeURIComponent(address + ", Bogotá")}`;
  };

  return (
    <div className="min-h-screen bg-[#051424] text-slate-100 pb-24 font-sans selection:bg-[#4edea3] selection:text-[#051424]">
      {/* Cabecera Móvil de Chofer */}
      <header className="sticky top-0 z-40 bg-[#051424]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0 group">
              <img
                src="/images/branding/cerdito-moto-domiciliario.png"
                alt="Cerdito Domiciliario Oficial"
                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  {activeRoute?.driverName || "Carlos Pérez"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#4edea3] font-bold border border-emerald-500/30">
                  {activeRoute?.vehiclePlate || "NQR-482"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  1.8°C INVIMA
                </span>
                <span>•</span>
                {isOnline ? (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Wifi className="w-3 h-3 text-emerald-400" /> En línea
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <WifiOff className="w-3 h-3" /> Sin conexión
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-amber-400 hover:bg-slate-800 transition-all text-xs font-bold flex items-center gap-1"
              title="Registrar Gasto de Ruta"
            >
              <Fuel className="w-4 h-4" />
              <span className="hidden sm:inline">Gasto</span>
            </button>
            <button
              onClick={() => setShowArqueoModal(true)}
              className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[#4edea3] hover:bg-emerald-500/30 transition-all text-xs font-bold flex items-center gap-1"
              title="Cierre de Ruta y Arqueo"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Arqueo</span>
            </button>
          </div>
        </div>

        {/* Barra Informativa de Despacho Central */}
        <div className="max-w-md mx-auto mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Ruta Asignada por Central de Despacho</span>
          </span>
          <span className="font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            {activeRoute?.status === "planned" ? "En Planta (Por salir)" : "En Tránsito"} • {routeOrders.length}/10 paradas
          </span>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Alerta de Nueva Parada Asignada en Cabina */}
        {newOrderAlert && (
          <div className="bg-gradient-to-r from-red-600/25 via-amber-600/20 to-slate-900 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl text-amber-200 animate-in fade-in zoom-in-95 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                  <Zap className="w-4 h-4 fill-current text-white" />
                </div>
                <div>
                  <span className="font-black text-[10px] uppercase bg-red-600 text-white px-2 py-0.5 rounded-full tracking-wider">
                    {activeRoute?.status === "planned" ? "⚡ PEDIDO URGENTE DE ÚLTIMO MINUTO" : "¡NUEVA PARADA CERCANA ASIGNADA!"}
                  </span>
                  <h3 className="font-black text-white text-sm mt-1">
                    {newOrderAlert.customerName} ({newOrderAlert.orderNumber})
                  </h3>
                  <p className="text-xs text-amber-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{newOrderAlert.address}</span>
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {activeRoute?.status === "planned"
                      ? "Despacho sumó este cliente urgente antes de tu salida de bodega. La parada ya está lista en tu GPS."
                      : "Despacho sumó este cliente a tu recorrido. El GPS y la lista de paradas ya se actualizaron."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNewOrderAlert(null)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shrink-0 active:scale-95 shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Banner de Siguiente Entrega */}
        {nextStop ? (
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-[#4edea3]/40 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden cartoon-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/10 mb-3 gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#4edea3]">
                  SIGUIENTE ENTREGA EN RUTA
                </span>
                {nextStop.urgency === "urgente" && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse">
                    🚨 URGENTE
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-700/50 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Meta: {nextStop.deliveryTimeWindow || "07:30 AM"}</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/10">
                  Factura #{nextStop.invoiceNumber || nextStop.orderNumber}
                </span>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="space-y-1.5">
              <h2 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider leading-none">
                {nextStop.customerName}
              </h2>
              <p className="text-xs text-slate-300 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{nextStop.deliveryAddress}</span>
              </p>
            </div>

            {/* Resumen de Carga y Cobro */}
            <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div>
                <p className="font-bebas text-xs text-slate-400 uppercase tracking-wider">KILOS A ENTREGAR</p>
                <p className="font-bebas text-2xl font-bold text-white">
                  {nextStop.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0).toFixed(1)} <span className="font-sans text-xs">kg</span>
                </p>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <p className="font-bebas text-xs text-slate-400 uppercase tracking-wider">VALOR A COBRAR</p>
                <p className="font-bebas text-2xl text-gold-400 tracking-wider">
                  {priceService.formatCurrency(nextStop.realTotal || nextStop.total)}
                </p>
              </div>
            </div>

            {/* Botones de Navegación y Contacto Táctiles */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <a
                href={getGoogleMapsUrl(nextStop.deliveryAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-extrabold transition-all active:scale-95 shadow-md"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps</span>
              </a>
              <a
                href={getWazeUrl(nextStop.deliveryAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-extrabold transition-all active:scale-95 shadow-md"
              >
                <Navigation className="w-4 h-4" />
                <span>Waze</span>
              </a>
            </div>

            {/* Acciones Principales */}
            <div className="space-y-2">
              <button
                onClick={() => handleOpenDelivery(nextStop)}
                className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all active:scale-95 cartoon-btn"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRMAR ENTREGA Y COBRO</span>
              </button>

              <button
                onClick={() => {
                  setIncidentModalOrder(nextStop);
                  setIncidentReason("Local cerrado / No abren");
                  setIncidentNote("");
                }}
                className="w-full min-h-[44px] py-2 px-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Reportar Novedad o Incidente</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-emerald-500/40 rounded-3xl p-6 text-center shadow-xl space-y-4 relative overflow-hidden">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <img
                src="/images/branding/cerdito-moto-domiciliario.png"
                alt="Cerdito Domiciliario Misión Cumplida"
                className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-bounce"
              />
            </div>
            <div>
              <span className="font-caveat text-xl text-emerald-400 font-bold block">
                ¡Misión cumplida en ruta!
              </span>
              <h2 className="text-2xl font-black text-white font-bebas tracking-wide mt-0.5">
                ¡TODAS LAS ENTREGAS COMPLETADAS!
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Todas las paradas programadas en este furgón han sido finalizadas con éxito. Procede con el arqueo de cabina y entrega del sobre con efectivo.
            </p>
            <button
              onClick={() => setShowArqueoModal(true)}
              className="w-full min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-950/60 active:scale-95 transition-all"
            >
              VER RESUMEN DE ARQUEO EN SOBRE
            </button>
          </div>
        )}

        {/* Resumen de Progreso de la Ruta */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Progreso de Ruta</p>
            <p className="text-white font-extrabold text-sm">
              {completedOrders.length} de {routeOrders.length} entregadas
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Efectivo en Cabina</p>
            <p className="text-[#4edea3] font-mono font-black text-sm">
              {priceService.formatCurrency(netCashInCabin)}
            </p>
          </div>
        </div>

        {/* Lista de Siguientes Paradas (Pendientes) */}
        {pendingOrders.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Próximas Paradas Pendientes ({pendingOrders.length - 1})
            </h3>
            {pendingOrders.slice(1).map((ord, idx) => (
              <div
                key={ord.id}
                className="bg-slate-900/70 border border-white/5 hover:border-white/20 rounded-xl p-3 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold">
                    {idx + 2}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-white leading-tight">{ord.customerName}</p>
                      {ord.urgency === "urgente" && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse">
                          🚨 URGENTE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{ord.deliveryAddress}</span>
                      <span className="text-cyan-400 font-bold ml-1 shrink-0">⏰ {ord.deliveryTimeWindow || "07:30 AM"}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-extrabold text-[#4edea3]">
                    {priceService.formatCurrency(ord.realTotal || ord.total)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {ord.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0).toFixed(1)} kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Paradas Entregadas */}
        {completedOrders.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider px-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Entregadas Exitosamente ({completedOrders.length})
            </h3>
            {completedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between opacity-80"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white line-through leading-tight">{ord.customerName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ord.paymentMethod === "banco"
                        ? "Transferencia QR"
                        : ord.paymentMethod === "credito"
                        ? "Factura a Crédito"
                        : "Efectivo"}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-mono font-bold text-slate-300">
                  {priceService.formatCurrency(ord.realTotal || ord.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: CONFIRMACIÓN DE ENTREGA TÁCTIL                    */}
      {/* ======================================================== */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#051424] border border-white/20 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Cabecera del Modal */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#4edea3] block">
                  ENTREGA EN CABINA
                </span>
                <h3 className="text-base font-black text-white leading-tight">
                  {deliveryModalOrder.customerName}
                </h3>
              </div>
              <button
                onClick={() => setDeliveryModalOrder(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Formulario con scroll */}
            <form onSubmit={handleConfirmDelivery} className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Resumen de cobro */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Factura</p>
                  <p className="text-lg font-black text-[#4edea3] font-mono">
                    {priceService.formatCurrency(deliveryModalOrder.realTotal || deliveryModalOrder.total)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Factura Nº</p>
                  <p className="text-xs font-mono font-bold text-white">
                    {deliveryModalOrder.invoiceNumber || deliveryModalOrder.orderNumber}
                  </p>
                </div>
              </div>

              {/* Nombre de quien recibe */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">
                  Persona que recibe la carne en la fama:
                </label>
                <input
                  type="text"
                  required
                  value={receivedByName}
                  onChange={(e) => setReceivedByName(e.target.value)}
                  placeholder="Nombre del carnicero o encargado"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-[#4edea3] focus:outline-none text-xs"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">
                  Método de Recaudo:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("efectivo")}
                    className={`py-2 px-2 rounded-xl font-extrabold border text-center transition-all ${
                      deliveryPaymentMethod === "efectivo"
                        ? "bg-emerald-500/20 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    💵 Efectivo (Sobre)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("banco")}
                    className={`py-2 px-2 rounded-xl font-extrabold border text-center transition-all ${
                      deliveryPaymentMethod === "banco"
                        ? "bg-emerald-500/20 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    📱 QR / Banco
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPaymentMethod("credito")}
                    className={`py-2 px-2 rounded-xl font-extrabold border text-center transition-all ${
                      deliveryPaymentMethod === "credito"
                        ? "bg-emerald-500/20 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    📝 Crédito (30d)
                  </button>
                </div>
              </div>

              {/* Control de Canastillas JD */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <span>Control de Canastillas Plásticas JD (2.0 kg c/u)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Dejadas con carne:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveredBaskets(Math.max(0, deliveredBaskets - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-sm text-white w-6 text-center">
                        {deliveredBaskets}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeliveredBaskets(deliveredBaskets + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Vacías recogidas:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReturnedBaskets(Math.max(0, returnedBaskets - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-sm text-white w-6 text-center">
                        {returnedBaskets}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReturnedBaskets(returnedBaskets + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fotografía de Factura Firmada */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">
                  Foto de la Factura / Remisión Física Firmada:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl bg-slate-900 border border-dashed border-emerald-500/40 hover:bg-slate-800/80 text-center flex items-center justify-center gap-2 text-emerald-400 font-bold transition-all">
                    <Camera className="w-4 h-4" />
                    <span>{deliveryInvoicePhoto ? "Cambiar Fotografía" : "Tomar Foto con Cámara"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleDeliveryPhoto}
                      className="hidden"
                    />
                  </label>
                  {deliveryInvoicePhoto && (
                    <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Foto lista
                    </span>
                  )}
                </div>
              </div>

              {/* Firma Digital en Canvas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Firma táctil del cliente en pantalla:</span>
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Borrar
                    </button>
                  )}
                </div>
                <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950/80 touch-none">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[120px] cursor-crosshair"
                  />
                </div>
              </div>

              {/* Botón de Enviar Entrega con Prevención de Doble Clic */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando entrega en sistema...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>FINALIZAR Y REGISTRAR ENTREGA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REGISTRO DE GASTOS EN RUTA                       */}
      {/* ======================================================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#051424] border border-white/20 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-400" />
                <span>Registrar Gasto de Ruta</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Categoría:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as DriverExpense["category"])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="combustible">Combustible (ACPM)</option>
                  <option value="peaje">Peaje</option>
                  <option value="parqueadero">Parqueadero</option>
                  <option value="mantenimiento_menor">Mantenimiento menor</option>
                  <option value="otro">Otro gasto de ruta</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Monto Pagado ($ COP):</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Descripción / Estación:</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej: Estación Terpel Calle 80"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Foto del Recibo / Ticket:</label>
                <label className="cursor-pointer py-2.5 px-3 rounded-xl bg-slate-900 border border-dashed border-amber-500/40 text-amber-400 font-bold flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>{expenseReceiptPhoto ? "Foto de recibo guardada" : "Tomar foto al ticket"}</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleExpensePhoto} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50"
              >
                {isSubmitting ? "Guardando..." : "REGISTRAR GASTO EN CABINA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ARQUEO DE CAJA EN CABINA Y CIERRE DE RUTA         */}
      {/* ======================================================== */}
      {showArqueoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#051424] border border-white/20 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#4edea3]" />
                <span>Arqueo y Cierre de Caja en Cabina</span>
              </h3>
              <button onClick={() => setShowArqueoModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Recaudado en Efectivo:</span>
                  <span className="font-mono font-bold text-white">
                    {priceService.formatCurrency(totalCashCollected)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pagos en Banco/QR:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {priceService.formatCurrency(totalBankCollected)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Facturas a Crédito:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {priceService.formatCurrency(totalCreditCollected)}
                  </span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) Gastos de Ruta (Gasolina/Peajes):</span>
                  <span className="font-mono font-bold">
                    -{priceService.formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
                  <span className="font-extrabold text-[#4edea3]">EFECTIVO NETO EN SOBRE:</span>
                  <span className="font-mono font-black text-base text-[#4edea3]">
                    {priceService.formatCurrency(netCashInCabin)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300">
                📌 Al entregar el sobre en la oficina de administración, el encargado cotejará este valor contra los recibos de gasto firmados y los comprobantes de entrega.
              </div>

              <button
                onClick={() => {
                  showToast(" Sobre físico listo para entrega en administración", "success");
                  setShowArqueoModal(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wide"
              >
                ENTENDIDO Y CONCILIADO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: REPORTE DE NOVEDAD O INCIDENTE                    */}
      {/* ======================================================== */}
      {incidentModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#051424] border border-white/20 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Reportar Novedad en Parada</span>
              </h3>
              <button onClick={() => setIncidentModalOrder(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Motivo del Incidente:</label>
                <select
                  value={incidentReason}
                  onChange={(e) => setIncidentReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="Local cerrado / No abren">Local cerrado / No abren</option>
                  <option value="Cliente no tiene el dinero en efectivo">Cliente no tiene el dinero en efectivo</option>
                  <option value="Dirección errónea o inaccesible">Dirección errónea o inaccesible</option>
                  <option value="Rechazo total del pedido">Rechazo total del pedido</option>
                  <option value="Falla mecánica en el furgón">Falla mecánica en el furgón</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Observaciones adicionales:</label>
                <textarea
                  rows={3}
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  placeholder="Detalles sobre lo ocurrido para notificar a la mesa de despacho..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide"
              >
                NOTIFICAR A DESPACHO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

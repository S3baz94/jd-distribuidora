"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { DeliveryRoute, Order } from "@/types";
import { RouteMap } from "@/components/admin/RouteMap";
import {
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Flame,
} from "lucide-react";

export default function AdminRutasPage() {
  const {
    allOrders,
    routes,
    assignOrderToRoute,
    updateRouteStatus,
    createRoute,
    updateOrderStatus,
    showToast,
  } = useApp();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || "");
  const [isNewRouteModalOpen, setIsNewRouteModalOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteZone, setNewRouteZone] = useState("Zona Norte");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  const [newDepartureTime, setNewDepartureTime] = useState("07:00 AM");

  // Filter orders for active logistics
  const unassignedOrders = allOrders.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "cancelled" &&
      (!o.routeId || !routes.some((r) => r.id === o.routeId))
  );

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const getRouteOrders = (route: DeliveryRoute): Order[] => {
    return allOrders.filter(
      (o) => o.routeId === route.id || route.orderIds.includes(o.id)
    );
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim() || !newDriverName.trim()) {
      showToast("Por favor ingresa nombre de ruta y domiciliario", "error");
      return;
    }

    const newRoute: DeliveryRoute = {
      id: `route-${Date.now().toString(36)}`,
      name: newRouteName.trim(),
      zone: newRouteZone,
      driverId: `drv-${Date.now().toString(36)}`,
      driverName: newDriverName.trim(),
      driverPhone: newDriverPhone.trim() || "+57 310 000 0000",
      vehiclePlate: newVehiclePlate.trim() || "Furgón Refrigerado JD",
      vehicleType: "furgon_frio",
      orderIds: [],
      status: "planned",
      departureTime: newDepartureTime,
      date: "Jueves 27 de agosto",
    };

    createRoute(newRoute);
    setSelectedRouteId(newRoute.id);
    setIsNewRouteModalOpen(false);
    setNewRouteName("");
    setNewDriverName("");
    setNewDriverPhone("");
    setNewVehiclePlate("");
  };

  const handleStartRoute = (route: DeliveryRoute) => {
    updateRouteStatus(route.id, "in_transit");
    // Update all assigned orders to "dispatched" (en ruta de frío)
    const routeOrders = getRouteOrders(route);
    routeOrders.forEach((ord) => {
      updateOrderStatus(ord.id, "dispatched");
    });
    showToast(`🚚 ${route.name} ha iniciado recorrido. Pedidos marcados en ruta de frío.`, "success");
  };

  const handleCompleteRoute = (route: DeliveryRoute) => {
    updateRouteStatus(route.id, "completed");
    const routeOrders = getRouteOrders(route);
    routeOrders.forEach((ord) => {
      updateOrderStatus(ord.id, "delivered");
    });
    showToast(`🏁 ${route.name} completada. Todos los pedidos entregados.`, "success");
  };

  const handlePrintManifest = (route: DeliveryRoute) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Slide 3 Executive Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl glow-cyan-card">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30 tracking-wider">
                ADMINISTRACIÓN • FLEET TRACKING & AUDIT
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                Control & Monitoreo de Domiciliarios en Vivo
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Supervisión satelital de furgones, telemetría de frío (1.8°C), recaudo en calle y auditoría de recibos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/movimientos"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-2 border border-amber-500/40 shadow-lg transition-all active:scale-95"
          >
            <span>📸 Auditoría Recibos ACPM</span>
          </Link>
          <button
            onClick={() => setIsNewRouteModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all active:scale-95 border border-cyan-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Planificar Nueva Ruta</span>
          </button>
        </div>
      </div>

      {/* Live Fleet Monitoring KPI Cards (Matching Slide 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl glow-emerald-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Furgones en Calle:</span>
          <p className="text-lg sm:text-xl font-black text-white flex items-center gap-2 font-mono">
            <span>{routes.filter((r) => r.status === "in_transit").length || 1} activos</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </p>
          <span className="text-[11px] text-emerald-400 font-bold">{routes.length} rutas programadas hoy</span>
        </div>

        <div className="bg-slate-900 border border-cyan-500/40 p-4 rounded-3xl space-y-1 shadow-xl glow-cyan-card">
          <span className="text-[10px] uppercase font-bold text-cyan-300 block">Cadena de Frío Telemetría:</span>
          <p className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
            ❄️ 1.8°C <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase font-black">ÓPTIMO</span>
          </p>
          <span className="text-[11px] text-slate-400 font-bold">Rango seguro 0°C a 4°C</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl glow-emerald-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Cash Collection:</span>
          <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
            {priceService.formatCurrency(
              allOrders
                .filter((o) => o.status === "delivered")
                .reduce((sum, o) => sum + (o.realTotal || o.total), 0)
            )}
          </p>
          <span className="text-[11px] text-slate-400 font-bold">Cobrado en efectivo hoy</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Avance de Entregas:</span>
          <p className="text-lg sm:text-xl font-black text-amber-400 font-mono">
            {allOrders.filter((o) => o.status === "delivered").length} de {allOrders.length}
          </p>
          <span className="text-[11px] text-slate-400 font-bold">Paradas completadas</span>
        </div>
      </div>

      {/* Route Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {routes.map((route) => {
          const isActive = selectedRoute?.id === route.id;
          const orderCount = getRouteOrders(route).length;

          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`px-4 py-3 rounded-2xl text-left border transition-all flex items-center gap-3 flex-shrink-0 active:scale-95 ${
                isActive
                  ? "bg-slate-800 border-brand-500 text-white shadow-lg ring-1 ring-brand-500/50"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  route.status === "in_transit"
                    ? "bg-emerald-400 animate-pulse"
                    : route.status === "completed"
                    ? "bg-slate-500"
                    : "bg-amber-400"
                }`}
              />
              <div>
                <p className="font-black text-xs sm:text-sm text-white">
                  {route.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {route.driverName} • <strong className="text-brand-300">{orderCount} paradas</strong>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Route Detail Card */}
      {selectedRoute && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
          {/* Route Header Info */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-850 p-5 rounded-2xl border border-slate-750">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                  {selectedRoute.zone}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                    selectedRoute.status === "in_transit"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : selectedRoute.status === "completed"
                      ? "bg-slate-700 text-slate-300"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {selectedRoute.status === "in_transit"
                    ? "🚚 En Recorrido"
                    : selectedRoute.status === "completed"
                    ? "✅ Completada"
                    : "📋 Planificada"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {selectedRoute.name}
              </h2>
              <p className="text-xs text-slate-400">
                Fecha: <strong>{selectedRoute.date}</strong> • Hora programada de salida:{" "}
                <strong>{selectedRoute.departureTime}</strong>
              </p>
            </div>

            {/* Driver Contact & Vehicle */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-750 text-xs text-slate-300">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Domiciliario / Chofer:</p>
                <p className="font-extrabold text-white text-sm">{selectedRoute.driverName}</p>
              </div>
              <div className="h-6 w-px bg-slate-700 hidden sm:block" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Vehículo / Placa:</p>
                <p className="font-extrabold text-emerald-400">{selectedRoute.vehiclePlate}</p>
              </div>
              <div className="h-6 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedRoute.driverPhone.replace(/\s+/g, "")}`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5"
                  title="Llamar domiciliario"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedRoute.driverPhone}</span>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrintManifest(selectedRoute)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                title="Imprimir manifiesto para el chofer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Planilla de Ruta</span>
              </button>

              <a
                href={`https://wa.me/${selectedRoute.driverPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hola ${selectedRoute.driverName}, te compartimos tu hoja de ruta asignada (${selectedRoute.name}). Puedes ver tus paradas y GPS en vivo en la App de Operación: https://jd-distribuidora.vercel.app/operacion`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
                title="Enviar link al chofer por WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
                <span>Enviar al Chofer</span>
              </a>

              {selectedRoute.status === "planned" && (
                <button
                  onClick={() => handleStartRoute(selectedRoute)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  <span>Iniciar Salida</span>
                </button>
              )}

              {selectedRoute.status === "in_transit" && (
                <button
                  onClick={() => handleCompleteRoute(selectedRoute)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marcar Finalizada</span>
                </button>
              )}
            </div>
          </div>

          {/* Logistics & Cashout Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-750">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kilos Totales en Furgón:</span>
              <strong className="text-base font-black text-white">
                {getRouteOrders(selectedRoute).reduce(
                  (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
                  0
                )}{" "}
                kg
              </strong>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-750">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Facturado:</span>
              <strong className="text-base font-black text-brand-400">
                {priceService.formatCurrency(
                  getRouteOrders(selectedRoute).reduce((sum, o) => sum + (o.realTotal || o.total), 0)
                )}
              </strong>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-750">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Canastillas Plásticas JD:</span>
              <strong className="text-base font-black text-cyan-300">
                ~{Math.ceil(
                  getRouteOrders(selectedRoute).reduce(
                    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
                    0
                  ) / 25
                ) || 1}{" "}
                unidades
              </strong>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-750">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado de Paradas:</span>
              <strong className="text-base font-black text-emerald-400">
                {getRouteOrders(selectedRoute).filter((o) => o.status === "delivered").length} de{" "}
                {getRouteOrders(selectedRoute).length} entregadas
              </strong>
            </div>
          </div>

          {/* Interactive Route Map with GPS & Stops */}
          <RouteMap route={selectedRoute} orders={getRouteOrders(selectedRoute)} />

          {/* Sequence of Delivery Stops */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Secuencia de Entregas por Dirección</span>
              </h3>
              <span className="text-xs text-slate-400">
                {getRouteOrders(selectedRoute).length} paradas asignadas
              </span>
            </div>

            {getRouteOrders(selectedRoute).length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-850 border border-slate-800 text-center text-slate-400 space-y-2">
                <Truck className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-bold text-sm text-slate-300">
                  No hay pedidos asignados a esta ruta todavía.
                </p>
                <p className="text-xs text-slate-500">
                  Selecciona pedidos de la bolsa de pendientes abajo para asignarlos a este domiciliario.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {getRouteOrders(selectedRoute).map((order, idx) => {
                  const totalKg = order.items.reduce((sum, i) => sum + i.quantity, 0);
                  const hasGourmet = order.items.some((i) => i.brand === "gourmet_ahumados");
                  const hasCrudo = order.items.some((i) => i.brand === "jd_distribuidora" || !i.brand);

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-850 border border-slate-750 hover:border-slate-600 rounded-2xl p-4 sm:p-5 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-white text-base">
                                {order.customerName}
                              </h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {order.orderNumber}
                              </span>
                            </div>

                            {/* Customer Delivery Address */}
                            <div className="flex items-start gap-1.5 text-xs text-emerald-400 font-bold mt-1">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{order.deliveryAddress}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary & Pricing */}
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                          <p className="text-xs text-slate-400 font-medium">
                            Total a entregar: <strong className="text-white">{totalKg} kg</strong>
                          </p>
                          <p className="font-black text-brand-400 text-base sm:text-lg">
                            {priceService.formatCurrency(order.realTotal || order.total)}
                          </p>
                        </div>
                      </div>

                      {/* Meat Items Breakdown */}
                      <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {order.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex justify-between items-center bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-750"
                          >
                            <div className="truncate pr-2">
                              <p className="font-bold text-slate-200 truncate flex items-center gap-1">
                                {item.brand === "gourmet_ahumados" && (
                                  <Flame className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />
                                )}
                                <span>{item.productName}</span>
                              </p>
                            </div>
                            <span className="font-extrabold text-brand-300 flex-shrink-0">
                              {item.quantity} kg
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Driver Actions & Quick Links */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">
                            Notas: <em>{order.notes || "Ninguna"}</em>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Waze / Google Maps Link */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              order.deliveryAddress
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Ver en GPS</span>
                          </a>

                          {/* Quick WhatsApp Driver-to-Customer Link */}
                          <a
                            href={`https://wa.me/573124567890?text=${encodeURIComponent(
                              `Hola ${order.customerName}, soy ${selectedRoute.driverName} de JD Distribuidora. Estoy en camino con su pedido de carne (${order.orderNumber}) a ${order.deliveryAddress}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold flex items-center gap-1.5 border border-emerald-500/30"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>Avisar llegada</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unassigned Orders Pool (Bolsa de Pedidos por Asignar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Bolsa de Pedidos Pendientes por Asignar a Ruta</span>
              {unassignedOrders.length > 0 && (
                <span className="text-xs font-black bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {unassignedOrders.length} sin furgón
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Asigna los pedidos listos a las rutas de los domiciliarios según la dirección
            </p>
          </div>
        </div>

        {unassignedOrders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-850 border border-slate-800 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-200">
              ¡Todos los pedidos activos ya tienen ruta y domiciliario asignado!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unassignedOrders.map((ord) => {
              const totalKg = ord.items.reduce((sum, i) => sum + i.quantity, 0);

              return (
                <div
                  key={ord.id}
                  className="bg-slate-850 border border-slate-750 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-base">
                        {ord.customerName}
                      </h4>
                      <span className="text-xs font-bold text-slate-400">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-brand-300 font-extrabold">
                        ({totalKg} kg)
                      </span>
                    </div>

                    <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ord.deliveryAddress}</span>
                    </p>
                  </div>

                  {/* Route Assign Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          assignOrderToRoute(ord.id, e.target.value);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold focus:outline-none focus:border-brand-500"
                    >
                      <option value="" disabled>
                        ➕ Asignar a Furgón / Ruta...
                      </option>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.driverName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Crear Nueva Ruta */}
      {isNewRouteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-black text-lg text-white">
              Crear Nueva Ruta de Entrega
            </h3>

            <form onSubmit={handleCreateRoute} className="space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="font-bold block mb-1">Nombre de la Ruta:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Ruta 4 - Zona Sur (Kennedy / Bosa)"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sector / Zona:</label>
                <select
                  value={newRouteZone}
                  onChange={(e) => setNewRouteZone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-brand-500 focus:outline-none"
                >
                  <option value="Zona Norte">Zona Norte (Usaquén - Suba - Cedritos)</option>
                  <option value="Zona Centro">Zona Centro & Chapinero (Galerías - Teusaquillo)</option>
                  <option value="Zona Occidente">Zona Occidente (Fontibón - Engativá)</option>
                  <option value="Zona Sur">Zona Sur (Kennedy - Bosa - Restrepo)</option>
                  <option value="Sabana Norte">Sabana Norte (Chía - Cota - Cajicá)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Nombre del Domiciliario / Chofer:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Gabriel Martínez"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    placeholder="315 123 4567"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Placa Furgón:</label>
                  <input
                    type="text"
                    placeholder="ej. KLP-541"
                    value={newVehiclePlate}
                    onChange={(e) => setNewVehiclePlate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRouteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black"
                >
                  Guardar Ruta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

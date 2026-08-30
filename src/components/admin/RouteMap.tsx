"use client";

import React, { useEffect, useRef, useState } from "react";
import { DeliveryRoute, Order } from "@/types";
import { priceService } from "@/services/priceService";
import {
  MapPin,
  Truck,
  ExternalLink,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

interface RouteMapProps {
  route: DeliveryRoute;
  orders: Order[];
}

const HUB_LOCATION = {
  name: "Planta & Frigorífico Central JD",
  address: "Central de Carnes / Frigorífico Guadalupe",
  lat: 4.6097,
  lng: -74.135,
};

export const RouteMap: React.FC<RouteMapProps> = ({ route, orders }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      // If map instance already exists, cleanup before re-initializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!isMounted || !mapContainerRef.current) return;

      // Initialize Leaflet Map centered in Bogota
      const map = L.map(mapContainerRef.current, {
        center: [4.65, -74.08],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Sleek Tile Layer (OpenStreetMap standard / Carto style)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom Zoom Control
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polyline whenever selected route or orders change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const renderMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      // Clear previous markers & lines
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      const points: [number, number][] = [[HUB_LOCATION.lat, HUB_LOCATION.lng]];

      // 1. Add Central Hub Marker (Bodega JD)
      const hubIcon = L.divIcon({
        className: "custom-hub-icon",
        html: `
          <div style="
            background: #0f172a;
            color: white;
            border: 3px solid #10b981;
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer;
          ">
            🏢
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const hubMarker = L.marker([HUB_LOCATION.lat, HUB_LOCATION.lng], { icon: hubIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <p style="font-weight: 900; font-size: 13px; margin: 0; color: #0f172a;">🏢 ${HUB_LOCATION.name}</p>
            <p style="font-size: 11px; margin: 4px 0 0 0; color: #64748b;">${HUB_LOCATION.address}</p>
            <p style="font-size: 10px; font-weight: bold; color: #10b981; margin: 4px 0 0 0;">PUNTO DE SALIDA DEL FURGÓN</p>
          </div>
        `);

      markersRef.current.push(hubMarker);

      // 2. Add Customer Stop Markers
      const firstPendingIndex = orders.findIndex((o) => o.status !== "delivered" && o.status !== "cancelled");

      orders.forEach((ord, idx) => {
        // Coordinates fallback if not directly provided
        const defaultLats = [4.6525, 4.7215, 4.675, 4.668, 4.708, 4.693];
        const defaultLngs = [-74.072, -74.032, -74.138, -74.055, -74.076, -74.051];
        const lat = ord.lat || defaultLats[idx % defaultLats.length];
        const lng = ord.lng || defaultLngs[idx % defaultLngs.length];

        points.push([lat, lng]);

        const totalKg = ord.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);
        const isDelivered = ord.status === "delivered";
        const isNextActive = idx === firstPendingIndex;

        const bgColor = isDelivered ? "#059669" : isNextActive ? "#f59e0b" : "#3b82f6";
        const badgeLabel = isDelivered ? `✓ #${idx + 1}` : `#${idx + 1}`;
        const pulseEffect = isNextActive ? "box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.4);" : "";

        const stopIcon = L.divIcon({
          className: `custom-stop-icon-${ord.id}`,
          html: `
            <div style="
              background: ${bgColor};
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 13px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              cursor: pointer;
              ${pulseEffect}
            ">
              ${badgeLabel}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const stopMarker = L.marker([lat, lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; min-width: 200px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="background: ${bgColor}; color: white; font-weight: 900; font-size: 10px; padding: 2px 8px; border-radius: 9999px;">
                  ${isDelivered ? "✓ PARADA COMPLETADA" : isNextActive ? "📍 SIGUIENTE PARADA" : `PARADA #${idx + 1}`}
                </span>
                <span style="font-size: 11px; font-weight: 800; color: #64748b;">${ord.orderNumber}</span>
              </div>
              <p style="font-weight: 900; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">${ord.customerName}</p>
              <p style="font-size: 11px; margin: 0; color: #64748b;">📍 ${ord.deliveryAddress}</p>
              <p style="font-size: 12px; font-weight: bold; color: ${bgColor}; margin: 4px 0 0 0;">
                Carga: ${totalKg} kg • ${priceService.formatCurrency(ord.realTotal || ord.total)}
              </p>
              ${ord.paymentMethod ? `<p style="font-size: 10px; font-weight: bold; color: #059669; margin: 2px 0 0 0;">Forma de Pago: ${ord.paymentMethod.toUpperCase()}</p>` : ""}
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ord.deliveryAddress)}" target="_blank" style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: bold; color: #0284c7; text-decoration: none;">Abrir en Waze / Google Maps →</a>
            </div>
          `);

        stopMarker.on("click", () => {
          setActiveStopId(ord.id);
        });

        markersRef.current.push(stopMarker);
      });

      // 3. Draw Route Polyline
      if (points.length > 1) {
        const polyline = L.polyline(points, {
          color: "#0284c7",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 8",
        }).addTo(map);

        polylineRef.current = polyline;

        // Auto-fit bounds to frame all stops
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    renderMarkers();
  }, [route, orders, isLoaded]);

  const handleCenterStop = async (ord: Order, idx: number) => {
    if (!mapInstanceRef.current) return;
    const defaultLats = [4.6525, 4.7215, 4.675, 4.668];
    const defaultLngs = [-74.072, -74.032, -74.138, -74.055];
    const lat = ord.lat || defaultLats[idx % defaultLats.length];
    const lng = ord.lng || defaultLngs[idx % defaultLngs.length];

    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    setActiveStopId(ord.id);

    // Open popup
    if (markersRef.current[idx + 1]) {
      markersRef.current[idx + 1].openPopup();
    }
  };

  const handleResetView = async () => {
    if (!mapInstanceRef.current) return;
    const L = (await import("leaflet")).default;
    const defaultLats = [4.6525, 4.7215, 4.675, 4.668];
    const defaultLngs = [-74.072, -74.032, -74.138, -74.055];

    const points: [number, number][] = [[HUB_LOCATION.lat, HUB_LOCATION.lng]];
    orders.forEach((ord, idx) => {
      points.push([
        ord.lat || defaultLats[idx % defaultLats.length],
        ord.lng || defaultLngs[idx % defaultLngs.length],
      ]);
    });

    if (points.length > 1) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-0">
      {/* Map Header Controls */}
      <div className="p-4 bg-slate-850 border-b border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>Mapa Satelital de Entregas en Vivo</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase font-black">
                GPS Activo
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ruta: <strong className="text-white">{route.name}</strong> • Conductor:{" "}
              <strong className="text-emerald-400">{route.driverName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Encuadrar Toda la Ruta</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Legend Overlay */}
        <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-750 text-xs text-white shadow-xl space-y-1.5 hidden sm:block">
          <p className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">
            Leyenda de Ruta:
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block border border-white" />
            <span>Planta Central (Salida)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white" />
            <span>Parada Completada / Entregada</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block border border-white" />
            <span>Siguiente Parada Activa</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block border border-white" />
            <span>Paradas Pendientes en Secuencia</span>
          </div>
        </div>
      </div>

      {/* Horizontal List of Stops with 1-Click Fly-to-Stop */}
      <div className="p-4 bg-slate-850 border-t border-slate-750">
        <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span>Toca una parada para enfocarla en el mapa:</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {orders.map((ord, idx) => {
            const isSelected = activeStopId === ord.id;
            const isDelivered = ord.status === "delivered";
            const firstPendingIdx = orders.findIndex((o) => o.status !== "delivered" && o.status !== "cancelled");
            const isNextActive = idx === firstPendingIdx;
            const totalKg = ord.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);

            return (
              <button
                key={ord.id}
                type="button"
                onClick={() => handleCenterStop(ord, idx)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-2.5 active:scale-95 ${
                  isSelected
                    ? "bg-slate-800 border-brand-500 shadow-md ring-1 ring-brand-500/50"
                    : isDelivered
                    ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200"
                    : isNextActive
                    ? "bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/20 text-white"
                    : "bg-slate-900 border-slate-750 hover:bg-slate-800 text-slate-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-white ${
                    isDelivered ? "bg-emerald-600" : isNextActive ? "bg-amber-500" : "bg-blue-600"
                  }`}
                >
                  {isDelivered ? "✓" : `#${idx + 1}`}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-extrabold text-xs text-white truncate">
                      {ord.customerName}
                    </p>
                    {isDelivered && (
                      <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                        Listo
                      </span>
                    )}
                    {isNextActive && (
                      <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded animate-pulse">
                        Sig.
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {ord.deliveryAddress}
                  </p>
                  <p className="text-[11px] font-bold text-brand-300 mt-1">
                    {totalKg} kg • {priceService.formatCurrency(ord.realTotal || ord.total)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useRef, useState } from "react";
import { DeliveryRoute, Order } from "@/types";
import { priceService } from "@/services/priceService";
import { calculateDistanceKm, reorderRouteByLocation } from "@/services/routeOptimizer";
import {
  MapPin,
  Truck,
  ExternalLink,
  Navigation,
  Layers,
  Locate,
  Crosshair,
  Sparkles,
  Building2,
  CheckCircle2,
  Compass,
} from "lucide-react";

interface RouteMapProps {
  route: DeliveryRoute;
  orders: Order[];
  onReorderFromLocation?: (reorderedOrders: Order[]) => void;
  titlePrefix?: string;
  showReorderButton?: boolean;
}

const HUB_LOCATION = {
  name: "Planta & Frigorífico Central JD",
  address: "Central de Carnes / Frigorífico Guadalupe",
  lat: 4.6097,
  lng: -74.135,
};

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  orders,
  onReorderFromLocation,
  titlePrefix,
  showReorderButton = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Current Location / GPS State
  const [originMode, setOriginMode] = useState<"hub" | "gps">("hub");
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

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

      const points: [number, number][] = [];

      // 1. Determine Origin Point: GPS vs Central Hub
      if (originMode === "gps" && gpsLocation) {
        const originCoord: [number, number] = [gpsLocation.lat, gpsLocation.lng];
        points.push(originCoord);

        const gpsIcon = L.divIcon({
          className: "custom-gps-icon",
          html: `
            <div style="
              background: #0284c7;
              color: white;
              border: 3px solid #38bdf8;
              border-radius: 50%;
              width: 42px;
              height: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.4), 0 4px 12px rgba(0,0,0,0.5);
              cursor: pointer;
            ">
              📍
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        const gpsMarker = L.marker(originCoord, { icon: gpsIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <p style="font-weight: 900; font-size: 13px; margin: 0; color: #0284c7;">📍 TU UBICACIÓN ACTUAL (GPS)</p>
              <p style="font-size: 11px; margin: 4px 0 0 0; color: #64748b;">Coordenadas: ${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}</p>
              <p style="font-size: 10px; font-weight: bold; color: #0284c7; margin: 4px 0 0 0;">ORIGEN SELECCIONADO PARA FORMAR RUTAS</p>
            </div>
          `);

        markersRef.current.push(gpsMarker);
      } else {
        const hubCoord: [number, number] = [HUB_LOCATION.lat, HUB_LOCATION.lng];
        points.push(hubCoord);

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

        const hubMarker = L.marker(hubCoord, { icon: hubIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <p style="font-weight: 900; font-size: 13px; margin: 0; color: #0f172a;">🏢 ${HUB_LOCATION.name}</p>
              <p style="font-size: 11px; margin: 4px 0 0 0; color: #64748b;">${HUB_LOCATION.address}</p>
              <p style="font-size: 10px; font-weight: bold; color: #10b981; margin: 4px 0 0 0;">PUNTO DE SALIDA DEL FURGÓN</p>
            </div>
          `);

        markersRef.current.push(hubMarker);
      }

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

      // 3. Draw Route Polyline from Selected Origin to All Stops
      if (points.length > 1) {
        const polyline = L.polyline(points, {
          color: originMode === "gps" ? "#38bdf8" : "#0284c7",
          weight: 4,
          opacity: 0.9,
          dashArray: originMode === "gps" ? "6, 6" : "8, 8",
        }).addTo(map);

        polylineRef.current = polyline;

        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    renderMarkers();
  }, [route, orders, originMode, gpsLocation, isLoaded]);

  // Handle GPS Button
  const handleUseGps = () => {
    setIsLocating(true);
    setLocationMessage(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      const fallback = { lat: 4.6525, lng: -74.072, accuracy: 30 };
      setGpsLocation(fallback);
      setOriginMode("gps");
      setIsLocating(false);
      setLocationMessage("📍 Ubicación fijada en punto central de Bogotá (Galerías)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setGpsLocation(coords);
        setOriginMode("gps");
        setIsLocating(false);
        setLocationMessage(
          `📍 Ubicación GPS satelital activa (Precisión: ±${Math.round(pos.coords.accuracy || 15)}m)`
        );

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, { duration: 1.2 });
        }
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        const fallback = { lat: 4.6525, lng: -74.072, accuracy: 40 };
        setGpsLocation(fallback);
        setOriginMode("gps");
        setIsLocating(false);
        setLocationMessage("📍 Ubicación fijada en coordenadas de zona central de Bogotá");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleUseHub = () => {
    setOriginMode("hub");
    setLocationMessage("🏢 Punto de partida establecido en Planta Central JD (Guadalupe)");
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([HUB_LOCATION.lat, HUB_LOCATION.lng], 13, { duration: 1 });
    }
  };

  const handleReorderStops = () => {
    const origin =
      originMode === "gps" && gpsLocation
        ? gpsLocation
        : { lat: HUB_LOCATION.lat, lng: HUB_LOCATION.lng };

    const reordered = reorderRouteByLocation(orders, origin);
    if (onReorderFromLocation) {
      onReorderFromLocation(reordered);
    }
  };

  const handleCenterStop = async (ord: Order, idx: number) => {
    if (!mapInstanceRef.current) return;
    const defaultLats = [4.6525, 4.7215, 4.675, 4.668];
    const defaultLngs = [-74.072, -74.032, -74.138, -74.055];
    const lat = ord.lat || defaultLats[idx % defaultLats.length];
    const lng = ord.lng || defaultLngs[idx % defaultLngs.length];

    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    setActiveStopId(ord.id);

    if (markersRef.current[idx + 1]) {
      markersRef.current[idx + 1].openPopup();
    }
  };

  const handleResetView = async () => {
    if (!mapInstanceRef.current) return;
    const L = (await import("leaflet")).default;
    const defaultLats = [4.6525, 4.7215, 4.675, 4.668];
    const defaultLngs = [-74.072, -74.032, -74.138, -74.055];

    const origin =
      originMode === "gps" && gpsLocation
        ? [gpsLocation.lat, gpsLocation.lng]
        : [HUB_LOCATION.lat, HUB_LOCATION.lng];

    const points: [number, number][] = [origin as [number, number]];
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

  // Distance from selected origin to first stop
  const firstStop = orders[0];
  const distanceToFirstStop =
    firstStop && (originMode === "gps" ? gpsLocation : HUB_LOCATION)
      ? calculateDistanceKm(
          originMode === "gps" && gpsLocation ? gpsLocation.lat : HUB_LOCATION.lat,
          originMode === "gps" && gpsLocation ? gpsLocation.lng : HUB_LOCATION.lng,
          firstStop.lat || 4.6525,
          firstStop.lng || -74.072
        ).toFixed(1)
      : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-0">
      {/* Map Header Controls */}
      <div className="p-4 bg-slate-850 border-b border-slate-750 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>{titlePrefix || "Mapa Satelital de Entregas"}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-black ${
                    originMode === "gps"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {originMode === "gps" ? "📍 GPS Ubicación Actual" : "🏢 Planta Guadalupe"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ruta: <strong className="text-white">{route.name}</strong> • Conductor:{" "}
                <strong className="text-emerald-400">{route.driverName}</strong>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Origin Mode Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={handleUseHub}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  originMode === "hub"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Planta JD</span>
              </button>

              <button
                type="button"
                onClick={handleUseGps}
                disabled={isLocating}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  originMode === "gps"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-cyan-300"
                }`}
                title="Tomar ubicación satelital GPS actual como punto de partida"
              >
                <Locate className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : "text-cyan-300"}`} />
                <span>{isLocating ? "Buscando GPS..." : "Mi Ubicación"}</span>
              </button>
            </div>

            {/* Reorder Button */}
            {showReorderButton && onReorderFromLocation && orders.length > 1 && (
              <button
                type="button"
                onClick={handleReorderStops}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="Reorganizar las paradas en orden de menor distancia desde el punto de partida"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formar Ruta por Cercanía</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetView}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
              title="Encuadrar paradas"
            >
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              <span>Encuadrar</span>
            </button>
          </div>
        </div>

        {/* Status / Distance Bar */}
        {(locationMessage || distanceToFirstStop) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
              <span className="font-semibold">{locationMessage || "Punto de salida activo"}</span>
            </div>
            {distanceToFirstStop && (
              <span className="text-cyan-300 font-black text-[11px] bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60 self-start sm:self-auto">
                ⚡ Distancia a Parada #1 ({firstStop.customerName}): ~{distanceToFirstStop} km
              </span>
            )}
          </div>
        )}
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

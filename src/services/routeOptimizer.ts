import { DeliveryRoute, Order, Customer } from "@/types";

export const MAX_STOPS_PER_ROUTE = 5;

export interface ZoneFleetConfig {
  zone: string;
  namePrefix: string;
  defaultDriver: string;
  defaultPhone: string;
  defaultPlate: string;
  keywords: string[];
}

export const ZONE_CONFIGS: ZoneFleetConfig[] = [
  {
    zone: "Zona Norte",
    namePrefix: "Ruta Norte",
    defaultDriver: "Carlos Pérez",
    defaultPhone: "+57 314 200 1122",
    defaultPlate: "KLP-541 (Furgón Térmico 0°C a 4°C)",
    keywords: ["norte", "usaquén", "usaquen", "cedritos", "suba", "niza", "mazurén", "mazuren", "toberín", "toberin", "calle 140", "calle 170", "santa bárbara", "santa barbara", "unicentro", "pepe sierra", "polo"],
  },
  {
    zone: "Zona Centro",
    namePrefix: "Ruta Centro",
    defaultDriver: "Juan Camilo Méndez",
    defaultPhone: "+57 318 555 4321",
    defaultPlate: "SZK-915 (Furgón Frigorífico Grande)",
    keywords: ["centro", "chapinero", "galerías", "galerias", "teusaquillo", "palermo", "carrera 13", "calle 53", "calle 63", "calle 45", "la soledad", "parkway", "santa fe", "mártires", "martires", "san victorino"],
  },
  {
    zone: "Zona Occidente",
    namePrefix: "Ruta Occidente",
    defaultDriver: "Andrés Roa",
    defaultPhone: "+57 311 987 6543",
    defaultPlate: "UFR-210 (Furgón Mediano)",
    keywords: ["occidente", "fontibón", "fontibon", "modelia", "normandía", "normandia", "salitre", "engativá", "engativa", "calle 26", "álamos", "alamos", "boyacá", "boyaca", "corabastos", "plaza de las américas"],
  },
  {
    zone: "Zona Sur",
    namePrefix: "Ruta Sur",
    defaultDriver: "Fabián Gómez",
    defaultPhone: "+57 310 443 8899",
    defaultPlate: "UYZ-314 (Furgón Frio Express)",
    keywords: ["sur", "kennedy", "restrepo", "1 de mayo", "primera de mayo", "américas", "americas", "venecia", "bosa", "antonio nariño", "ciudad montes", "tunal", "san carlos", "olaya", "fátima"],
  },
  {
    zone: "Sabana Norte",
    namePrefix: "Ruta Sabana",
    defaultDriver: "Mauricio Castro",
    defaultPhone: "+57 315 776 2211",
    defaultPlate: "HJK-678 (Camión Refrigerado)",
    keywords: ["chía", "chia", "cota", "cajicá", "cajica", "zipaquirá", "zipaquira", "sopó", "sopo", "tabio", "tenjo", "la calera"],
  },
];

export function detectOrderZone(order: Order, customer?: Customer): string {
  const addressText = `${order.deliveryAddress || ""} ${order.zone || ""} ${customer?.address || ""} ${customer?.zone || ""}`.toLowerCase();

  for (const config of ZONE_CONFIGS) {
    if (config.keywords.some((kw) => addressText.includes(kw))) {
      return config.zone;
    }
  }

  return order.zone || "Zona Norte";
}

export interface OptimizationResult {
  updatedOrders: Order[];
  updatedRoutes: DeliveryRoute[];
  stats: {
    totalOrdersAssigned: number;
    totalRoutesCreatedOrUpdated: number;
    maxStopsPerRoute: number;
    routesBreakdown: {
      routeId: string;
      routeName: string;
      zone: string;
      driverName: string;
      stopsCount: number;
      totalKg: number;
    }[];
  };
}

export function autoAssignOrdersToRoutes(
  allOrders: Order[],
  existingRoutes: DeliveryRoute[],
  allCustomers: Customer[] = []
): OptimizationResult {
  const custMap = new Map<string, Customer>();
  allCustomers.forEach((c) => custMap.set(c.id, c));

  const activeOrders = allOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );

  const zoneGroups = new Map<string, Order[]>();
  ZONE_CONFIGS.forEach((zc) => zoneGroups.set(zc.zone, []));

  activeOrders.forEach((order) => {
    const cust = custMap.get(order.customerId);
    const detectedZone = detectOrderZone(order, cust);
    const list = zoneGroups.get(detectedZone) || [];
    list.push(order);
    zoneGroups.set(detectedZone, list);
  });

  const finalRoutes: DeliveryRoute[] = [];
  const updatedOrdersMap = new Map<string, Order>();

  zoneGroups.forEach((ordersInZone, zoneName) => {
    if (ordersInZone.length === 0) return;

    const zoneConfig =
      ZONE_CONFIGS.find((zc) => zc.zone === zoneName) || ZONE_CONFIGS[0];

    const chunks: Order[][] = [];
    for (let i = 0; i < ordersInZone.length; i += MAX_STOPS_PER_ROUTE) {
      chunks.push(ordersInZone.slice(i, i + MAX_STOPS_PER_ROUTE));
    }

    chunks.forEach((chunk, chunkIdx) => {
      const subIndex = chunkIdx + 1;
      const cleanZone = zoneName.toLowerCase().replace(/\s+/g, "-");
      const routeId = `route-${cleanZone}-${subIndex}`;
      const routeName = `${zoneConfig.namePrefix} 0${subIndex} (${zoneConfig.zone})`;

      const existing = existingRoutes.find(
        (r) => r.id === routeId || (r.zone === zoneName && chunkIdx === 0)
      );

      const driverName = existing?.driverName || zoneConfig.defaultDriver;
      const driverPhone = existing?.driverPhone || zoneConfig.defaultPhone;
      const vehiclePlate = existing?.vehiclePlate || zoneConfig.defaultPlate;
      const driverId = existing?.driverId || `drv-${cleanZone}-${subIndex}`;

      const orderIds = chunk.map((o) => o.id);

      const routeObj: DeliveryRoute = {
        id: routeId,
        name: routeName,
        zone: zoneName,
        driverId,
        driverName,
        driverPhone,
        vehiclePlate,
        vehicleType: "furgon_frio",
        orderIds,
        status: existing?.status || "planned",
        departureTime: existing?.departureTime || `${6 + chunkIdx}:30 AM`,
        date: existing?.date || "Jueves 27 de agosto",
        notes: `Ruta optimizada automáticamente: ${chunk.length} paradas asignadas (Máx. ${MAX_STOPS_PER_ROUTE} paradas por furgón).`,
      };

      finalRoutes.push(routeObj);

      chunk.forEach((ord, stopIdx) => {
        const updatedOrd: Order = {
          ...ord,
          routeId: routeObj.id,
          routeName: routeObj.name,
          driverName: routeObj.driverName,
          driverPhone: routeObj.driverPhone,
          stopOrder: stopIdx + 1,
          zone: zoneName,
        };
        updatedOrdersMap.set(ord.id, updatedOrd);
      });
    });
  });

  const updatedOrders = allOrders.map((o) => updatedOrdersMap.get(o.id) || o);

  const routesBreakdown = finalRoutes.map((r) => {
    const rOrders = updatedOrders.filter((o) => r.orderIds.includes(o.id));
    const totalKg = rOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
      0
    );
    return {
      routeId: r.id,
      routeName: r.name,
      zone: r.zone,
      driverName: r.driverName,
      stopsCount: r.orderIds.length,
      totalKg,
    };
  });

  return {
    updatedOrders,
    updatedRoutes: finalRoutes.length > 0 ? finalRoutes : existingRoutes,
    stats: {
      totalOrdersAssigned: updatedOrdersMap.size,
      totalRoutesCreatedOrUpdated: finalRoutes.length,
      maxStopsPerRoute: MAX_STOPS_PER_ROUTE,
      routesBreakdown,
    },
  };
}

/**
 * Haversine formula to compute great-circle distance between two points in km
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Reorders orders of a route starting from an origin point (Current GPS location)
 * using Nearest-Neighbor heuristic so the closest stops are visited first.
 */
export function reorderRouteByLocation(
  orders: Order[],
  origin: { lat: number; lng: number }
): Order[] {
  if (orders.length <= 1) return orders;

  const remaining = [...orders];
  const ordered: Order[] = [];
  let currentPos = { lat: origin.lat, lng: origin.lng };

  const defaultLats = [4.6525, 4.7215, 4.675, 4.668, 4.708, 4.693];
  const defaultLngs = [-74.072, -74.032, -74.138, -74.055, -74.076, -74.051];

  while (remaining.length > 0) {
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const ord = remaining[i];
      const ordLat = ord.lat || defaultLats[i % defaultLats.length];
      const ordLng = ord.lng || defaultLngs[i % defaultLngs.length];
      const dist = calculateDistanceKm(currentPos.lat, currentPos.lng, ordLat, ordLng);

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const [nextOrder] = remaining.splice(closestIndex, 1);
    const nextLat = nextOrder.lat || defaultLats[ordered.length % defaultLats.length];
    const nextLng = nextOrder.lng || defaultLngs[ordered.length % defaultLngs.length];
    currentPos = { lat: nextLat, lng: nextLng };

    ordered.push({
      ...nextOrder,
      stopOrder: ordered.length + 1,
    });
  }

  return ordered;
}

import { DeliveryHourSlot, SlotAvailabilityResult, Order } from "@/types";

export const MAX_ORDERS_PER_SLOT = 2;

export const STANDARD_DELIVERY_TIME_SLOTS: DeliveryHourSlot[] = [
  {
    id: "slot-0600-0730",
    label: "06:00 AM - 07:30 AM",
    shortLabel: "06:00 AM",
    startHour: 6.0,
    endHour: 7.5,
    description: "Apertura temprana y desposte madrugador",
    isUrgentSlot: true,
  },
  {
    id: "slot-0730-0900",
    label: "07:30 AM - 09:00 AM",
    shortLabel: "07:30 AM",
    startHour: 7.5,
    endHour: 9.0,
    description: "Primera hora comercial (Ideal famas y asaderos)",
  },
  {
    id: "slot-0900-1030",
    label: "09:00 AM - 10:30 AM",
    shortLabel: "09:00 AM",
    startHour: 9.0,
    endHour: 10.5,
    description: "Media mañana / Surtido estándar",
  },
  {
    id: "slot-1030-1200",
    label: "10:30 AM - 12:00 PM",
    shortLabel: "10:30 AM",
    startHour: 10.5,
    endHour: 12.0,
    description: "Mediodía previo al almuerzo",
  },
  {
    id: "slot-1200-1400",
    label: "12:00 PM - 02:00 PM",
    shortLabel: "12:00 PM",
    startHour: 12.0,
    endHour: 14.0,
    description: "Turno tarde 1 / Restaurantes y asaderos",
  },
  {
    id: "slot-1400-1600",
    label: "02:00 PM - 04:00 PM",
    shortLabel: "02:00 PM",
    startHour: 14.0,
    endHour: 16.0,
    description: "Turno tarde 2 / Reposición final",
  },
];

export const deliverySlotService = {
  getStandardSlots: (): DeliveryHourSlot[] => {
    return STANDARD_DELIVERY_TIME_SLOTS;
  },

  parseSlotStartHour: (timeWindowOrLabel?: string): number => {
    if (!timeWindowOrLabel) return 8.0;

    const matched = STANDARD_DELIVERY_TIME_SLOTS.find(
      (s) =>
        s.id === timeWindowOrLabel ||
        s.label === timeWindowOrLabel ||
        timeWindowOrLabel.includes(s.shortLabel)
    );
    if (matched) return matched.startHour;

    // Fallback parsing: "07:30 AM" -> 7.5
    const match = timeWindowOrLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPM = match[3] && match[3].toUpperCase() === "PM";
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      return h + m / 60;
    }

    return 8.0;
  },

  getSlotAvailability: (
    date: string,
    zone?: string,
    existingOrders: Order[] = []
  ): SlotAvailabilityResult[] => {
    const cleanZone = zone ? zone.toLowerCase().trim() : "";

    // Filtramos órdenes activas para la fecha solicitada
    const activeOrdersForDate = existingOrders.filter(
      (o) =>
        o.status !== "cancelled" &&
        (o.deliveryDate === date || !date)
    );

    const results: SlotAvailabilityResult[] = STANDARD_DELIVERY_TIME_SLOTS.map((slot) => {
      // Contar pedidos que ocupan esta franja
      const matchingOrders = activeOrdersForDate.filter((o) => {
        const orderSlotMatch =
          o.deliverySlotId === slot.id ||
          o.deliveryTimeWindow === slot.label ||
          (o.notes && o.notes.includes(slot.shortLabel));

        if (!orderSlotMatch) return false;

        // Si se especifica zona, comparar concordancia
        if (cleanZone && o.zone) {
          const ordZone = o.zone.toLowerCase().trim();
          return ordZone.includes(cleanZone) || cleanZone.includes(ordZone);
        }
        return true;
      });

      const occupiedCount = matchingOrders.length;
      const isAvailable = occupiedCount < MAX_ORDERS_PER_SLOT;

      return {
        slot,
        isAvailable,
        occupiedCount,
        maxCapacity: MAX_ORDERS_PER_SLOT,
      };
    });

    // Para los slots ocupados, calcular y anexar la siguiente hora más cercana
    return results.map((res) => {
      if (res.isAvailable) return res;

      const nextClosest = deliverySlotService.findNextClosestAvailableSlot(
        res.slot.id,
        date,
        zone,
        existingOrders
      );

      return {
        ...res,
        nextClosestSlot: nextClosest || undefined,
      };
    });
  },

  findNextClosestAvailableSlot: (
    requestedSlotIdOrLabel: string,
    date: string,
    zone?: string,
    existingOrders: Order[] = []
  ): DeliveryHourSlot | null => {
    const target =
      STANDARD_DELIVERY_TIME_SLOTS.find(
        (s) => s.id === requestedSlotIdOrLabel || s.label === requestedSlotIdOrLabel
      ) || STANDARD_DELIVERY_TIME_SLOTS[0];

    const cleanZone = zone ? zone.toLowerCase().trim() : "";
    const activeOrdersForDate = existingOrders.filter(
      (o) =>
        o.status !== "cancelled" &&
        (o.deliveryDate === date || !date)
    );

    // Identificar slots que SÍ tienen cupo disponible
    const availableSlots = STANDARD_DELIVERY_TIME_SLOTS.filter((slot) => {
      if (slot.id === target.id) return false; // Excluimos el ocupado

      const matchingOrders = activeOrdersForDate.filter((o) => {
        const orderSlotMatch =
          o.deliverySlotId === slot.id ||
          o.deliveryTimeWindow === slot.label ||
          (o.notes && o.notes.includes(slot.shortLabel));

        if (!orderSlotMatch) return false;

        if (cleanZone && o.zone) {
          const ordZone = o.zone.toLowerCase().trim();
          return ordZone.includes(cleanZone) || cleanZone.includes(ordZone);
        }
        return true;
      });

      return matchingOrders.length < MAX_ORDERS_PER_SLOT;
    });

    if (availableSlots.length === 0) return null;

    // Ordenar disponibles por proximidad absoluta de horario
    availableSlots.sort((a, b) => {
      const diffA = Math.abs(a.startHour - target.startHour);
      const diffB = Math.abs(b.startHour - target.startHour);
      if (diffA !== diffB) return diffA - diffB;
      // En caso de empate (ej. 1.5h antes vs 1.5h después), preferir posterior
      return b.startHour - a.startHour;
    });

    return availableSlots[0] || null;
  },
};

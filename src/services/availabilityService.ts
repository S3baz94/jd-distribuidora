import { DeliverySlot } from "@/types";
import { INITIAL_DELIVERY_SLOTS } from "./mockData";

export const availabilityService = {
  getDeliverySlots: (): DeliverySlot[] => {
    return INITIAL_DELIVERY_SLOTS;
  },

  getAvailableSlots: (): DeliverySlot[] => {
    return INITIAL_DELIVERY_SLOTS.filter((s) => s.status !== "unavailable");
  },
};

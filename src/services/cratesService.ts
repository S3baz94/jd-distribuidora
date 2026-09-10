export interface CrateMovement {
  id: string;
  timestamp: string;
  type: "lavado_ingreso" | "cargue_furgon" | "descarga_retorno" | "ajuste_baja" | "asignacion_pedido";
  quantity: number;
  source: string; // ej. "Lavandería Planta", "Furgón NQR-482", "Carnicería El Roble"
  destination: string; // ej. "Sala de Desposte", "Furgón NQR-482", "Bodega"
  responsible: string; // ej. "Operador de Planta"
  notes?: string;
}

export interface CratesInventoryState {
  totalFleet: number; // Total de la flota de canastillas plásticas JD
  inPlantClean: number; // Disponibles y limpias en sala de desposte
  inPacking: number; // Con carne en pedidos alistados esperando cargue
  inTransit: number; // En los furgones refrigerados en ruta
  withCustomers: number; // En locales de clientes pendientes de recolección
  lastUpdated: string;
  movements: CrateMovement[];
}

const STORAGE_KEY = "porcob2b_crates_state_v1";

const INITIAL_CRATES_STATE: CratesInventoryState = {
  totalFleet: 300,
  inPlantClean: 120,
  inPacking: 35,
  inTransit: 65,
  withCustomers: 80,
  lastUpdated: "Hoy, Turno Matutino",
  movements: [
    {
      id: "mov-01",
      timestamp: "06:15 AM",
      type: "lavado_ingreso",
      quantity: 50,
      source: "Zona de Lavado y Desinfección",
      destination: "Sala de Desposte",
      responsible: "Operador de Planta",
      notes: "Canastillas limpias y sanitizadas con hipoclorito grado alimentario",
    },
    {
      id: "mov-02",
      timestamp: "06:45 AM",
      type: "cargue_furgon",
      quantity: 35,
      source: "Sala de Desposte",
      destination: "Furgón Refrigerado NQR-482",
      responsible: "Carlos Pérez (Chofer)",
      notes: "Cargue de Ruta Norte (5 pedidos con precinto INVIMA)",
    },
    {
      id: "mov-03",
      timestamp: "07:10 AM",
      type: "cargue_furgon",
      quantity: 30,
      source: "Sala de Desposte",
      destination: "Furgón Refrigerado KLP-541",
      responsible: "Andrés Gómez (Chofer)",
      notes: "Cargue de Ruta Centro & Chapinero",
    },
    {
      id: "mov-04",
      timestamp: "08:30 AM",
      type: "descarga_retorno",
      quantity: 18,
      source: "Furgón NQR-482 (Retorno ruta anterior)",
      destination: "Zona de Lavado",
      responsible: "Operador de Planta",
      notes: "Canastillas vacías recogidas en Restaurante Don Jorge y Salsamentaria",
    },
  ],
};

export const cratesService = {
  getState: (): CratesInventoryState => {
    if (typeof window === "undefined") return INITIAL_CRATES_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.totalFleet === "number") {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error leyendo inventario de canastillas:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CRATES_STATE));
    return INITIAL_CRATES_STATE;
  },

  saveState: (state: CratesInventoryState) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("Error guardando inventario de canastillas:", e);
      }
    }
  },

  // 1. Ingreso de canastillas lavadas a sala de desposte
  recordCleaningBatch: (quantity: number, responsible = "Operador de Planta", notes = ""): CratesInventoryState => {
    const current = cratesService.getState();
    const newMovement: CrateMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "lavado_ingreso",
      quantity,
      source: "Lavandería & Desinfección",
      destination: "Sala de Desposte",
      responsible,
      notes: notes || "Canastillas sanitizadas listas para empaque",
    };

    const updated: CratesInventoryState = {
      ...current,
      inPlantClean: current.inPlantClean + quantity,
      lastUpdated: "Justo ahora",
      movements: [newMovement, ...current.movements.slice(0, 40)],
    };
    cratesService.saveState(updated);
    return updated;
  },

  // 2. Asignación a pedidos pesados en báscula
  assignToPacking: (quantity: number, orderNumber: string): CratesInventoryState => {
    const current = cratesService.getState();
    const effectiveQty = Math.min(quantity, current.inPlantClean);

    const newMovement: CrateMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "asignacion_pedido",
      quantity: effectiveQty,
      source: "Sala de Desposte",
      destination: `Pedido ${orderNumber}`,
      responsible: "Operador de Báscula",
      notes: `Canastillas con carne pesada al peso neto`,
    };

    const updated: CratesInventoryState = {
      ...current,
      inPlantClean: Math.max(0, current.inPlantClean - effectiveQty),
      inPacking: current.inPacking + effectiveQty,
      lastUpdated: "Justo ahora",
      movements: [newMovement, ...current.movements.slice(0, 40)],
    };
    cratesService.saveState(updated);
    return updated;
  },

  // 3. Cargue de canastillas al furgón refrigerado
  loadToVehicle: (quantity: number, vehiclePlate: string, driverName: string): CratesInventoryState => {
    const current = cratesService.getState();
    const effectiveQty = Math.min(quantity, current.inPacking > 0 ? current.inPacking : current.inPlantClean);

    const newMovement: CrateMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "cargue_furgon",
      quantity: effectiveQty,
      source: "Sala de Desposte / Alistamiento",
      destination: `Furgón ${vehiclePlate}`,
      responsible: driverName,
      notes: `Despacho en frío con precinto INVIMA`,
    };

    const updated: CratesInventoryState = {
      ...current,
      inPacking: Math.max(0, current.inPacking - effectiveQty),
      inTransit: current.inTransit + effectiveQty,
      lastUpdated: "Justo ahora",
      movements: [newMovement, ...current.movements.slice(0, 40)],
    };
    cratesService.saveState(updated);
    return updated;
  },

  // 4. Descarga de canastillas vacías devueltas por chofer o cliente
  returnToPlant: (quantity: number, sourceName: string, notes = ""): CratesInventoryState => {
    const current = cratesService.getState();
    const newMovement: CrateMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "descarga_retorno",
      quantity,
      source: sourceName,
      destination: "Área de Lavado / Planta",
      responsible: "Operador de Recepción",
      notes: notes || "Devolución física recibida y contada",
    };

    const updated: CratesInventoryState = {
      ...current,
      withCustomers: Math.max(0, current.withCustomers - quantity),
      inPlantClean: current.inPlantClean + quantity,
      lastUpdated: "Justo ahora",
      movements: [newMovement, ...current.movements.slice(0, 40)],
    };
    cratesService.saveState(updated);
    return updated;
  },

  // 5. Ajuste manual de inventario físico de canastas
  adjustFleetCounts: (newCounts: Partial<Omit<CratesInventoryState, "movements">>): CratesInventoryState => {
    const current = cratesService.getState();
    const updated: CratesInventoryState = {
      ...current,
      ...newCounts,
      lastUpdated: "Ajuste físico manual",
      movements: [
        {
          id: `mov-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "ajuste_baja",
          quantity: 0,
          source: "Conteo Físico General",
          destination: "Auditoría de Planta",
          responsible: "Operador Jefe de Planta",
          notes: "Arqueo y balance físico de canastillas cuadradas",
        },
        ...current.movements.slice(0, 40),
      ],
    };
    cratesService.saveState(updated);
    return updated;
  },
};

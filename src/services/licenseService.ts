import { LicenseConfig } from "@/types";

const LICENSE_STORAGE_KEY = "jd_distribuidora_license_config_v1";
const MASTER_PIN = "9401"; // PIN Maestro del Desarrollador (Sebastián)

export const DEFAULT_LICENSE_CONFIG: LicenseConfig = {
  status: "active",
  clientName: "JD Distribuidora Cárnica & Gourmet Ahumados",
  licensedTo: "JD DISTRIBUIDORA S.A.S.",
  planName: "Enterprise Suite Dedicada (Administración, Operación & Ventas)",
  validUntil: "2026-12-31T23:59:59.000Z",
  gracePeriodDays: 5,
  lastPaymentDate: "2026-08-25",
  monthlyFee: 1500000,
  isLocked: false,
  lockReason: "Servicio suspendido por mora en licenciamiento o acuerdo de desarrollo. Para reactivar el software de forma inmediata, comuníquese con el desarrollador del sistema.",
  contactDeveloperPhone: "+57 323 321 8831",
  contactDeveloperEmail: "sebastiansachezramos@gmail.com",
  masterPin: MASTER_PIN,
  updatedAt: new Date().toISOString(),
};

export class LicenseService {
  static getConfig(): LicenseConfig {
    if (typeof window === "undefined") return DEFAULT_LICENSE_CONFIG;
    try {
      const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LicenseConfig;
        return this.evaluateExpiration(parsed);
      }
    } catch (e) {
      console.error("Error reading license config:", e);
    }
    return DEFAULT_LICENSE_CONFIG;
  }

  static saveConfig(config: LicenseConfig): void {
    if (typeof window === "undefined") return;
    try {
      config.updatedAt = new Date().toISOString();
      localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Error saving license config:", e);
    }
  }

  static evaluateExpiration(config: LicenseConfig): LicenseConfig {
    if (config.isLocked || config.status === "suspended") {
      return { ...config, isLocked: true, status: "suspended" };
    }

    const now = new Date().getTime();
    const expiry = new Date(config.validUntil).getTime();

    if (now > expiry) {
      const graceEnd = expiry + config.gracePeriodDays * 24 * 60 * 60 * 1000;
      if (now > graceEnd) {
        return {
          ...config,
          status: "suspended",
          isLocked: true,
          lockReason: "Licencia vencida. El periodo de gracia ha expirado. Comuníquese con el desarrollador para habilitar el servicio.",
        };
      } else {
        return {
          ...config,
          status: "grace_period",
          isLocked: false,
        };
      }
    }

    return { ...config, isLocked: false, status: config.status || "active" };
  }

  static verifyMasterPin(inputPin: string): boolean {
    return inputPin.trim() === MASTER_PIN;
  }

  static setLockStatus(locked: boolean, reason?: string): LicenseConfig {
    const current = this.getConfig();
    const updated: LicenseConfig = {
      ...current,
      isLocked: locked,
      status: locked ? "suspended" : "active",
      lockReason: reason || current.lockReason,
    };
    this.saveConfig(updated);
    return updated;
  }

  static extendValidity(days: number): LicenseConfig {
    const current = this.getConfig();
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const updated: LicenseConfig = {
      ...current,
      validUntil: newDate.toISOString(),
      isLocked: false,
      status: "active",
    };
    this.saveConfig(updated);
    return updated;
  }
}

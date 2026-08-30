export interface AdminUserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "gerencia" | "comercial";
  roleTitle: string;
  avatar: string;
}

const ADMIN_AUTH_KEY = "jd_admin_authenticated_session_v1";

export const ADMIN_USERS: (AdminUserProfile & { passwordHash: string; validPasswords: string[] })[] = [
  {
    id: "dir-01",
    username: "direccion",
    name: "Dirección",
    email: "direccion@jddistribuidora.com",
    role: "admin",
    roleTitle: "Dirección General & Administración",
    avatar: "🏢",
    passwordHash: "direccion2026",
    validPasswords: ["direccion2026", "direccion", "admin2026", "jd2026", "123456"],
  },
];

export class AdminAuthService {
  static getCurrentSession(): AdminUserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(ADMIN_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading admin session:", e);
    }
    return null;
  }

  static login(passwordInput: string, usernameOrEmail?: string): { success: boolean; user?: AdminUserProfile; error?: string } {
    const cleanPass = passwordInput.trim();
    const targetUser = ADMIN_USERS[0];

    const isValid =
      targetUser.passwordHash === cleanPass ||
      targetUser.validPasswords.includes(cleanPass);

    if (isValid) {
      const { passwordHash, validPasswords, ...safeProfile } = targetUser;
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(safeProfile));
      }
      return { success: true, user: safeProfile };
    }

    return { success: false, error: "Contraseña incorrecta. Verifique la clave de Dirección." };
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }
}

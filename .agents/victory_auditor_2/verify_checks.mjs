import fs from 'fs';
import path from 'path';

const projectRoot = 'C:\\Users\\Sebastián\\.gemini\\antigravity\\scratch\\porcob2b-app';

console.log("=== EJECUCIÓN FORENSE DE VALIDACIÓN DE COMPONENTES ===");

// 1. Verificar manifest.json
const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
console.log("[CHECK 1] Manifest PWA:", {
  name: manifest.name,
  start_url: manifest.start_url,
  display: manifest.display,
  shortcuts_count: manifest.shortcuts?.length
});

// 2. Verificar authService.ts contenido clave
const authFile = fs.readFileSync(path.join(projectRoot, 'src', 'services', 'authService.ts'), 'utf-8');
const hasDireccion2026 = authFile.includes('"direccion2026"');
console.log("[CHECK 2] Clave 'direccion2026' en authService:", hasDireccion2026);

// 3. Verificar licenseService.ts contenido clave
const licenseFile = fs.readFileSync(path.join(projectRoot, 'src', 'services', 'licenseService.ts'), 'utf-8');
const hasMasterPin9401 = licenseFile.includes('"9401"');
console.log("[CHECK 3] PIN maestro '9401' en licenseService:", hasMasterPin9401);

// 4. Verificar WhatsApp en whatsappService.ts
const whatsappFile = fs.readFileSync(path.join(projectRoot, 'src', 'services', 'whatsappService.ts'), 'utf-8');
const hasWhatsAppPhone = whatsappFile.includes('573233218831') || whatsappFile.includes('3233218831');
console.log("[CHECK 4] WhatsApp oficial (+57 323 321 8831) en whatsappService:", hasWhatsAppPhone);

// 5. Verificar BroadcastChannel en AppContext.tsx
const appContextFile = fs.readFileSync(path.join(projectRoot, 'src', 'context', 'AppContext.tsx'), 'utf-8');
const hasBroadcast = appContextFile.includes('"porcob2b_realtime_sync"');
const hasLocalStorage = appContextFile.includes('localStorage');
console.log("[CHECK 5] BroadcastChannel y localStorage en AppContext:", { hasBroadcast, hasLocalStorage });

// 6. Verificar 21 rutas en src/app
const routes = [
  'src/app/page.tsx',
  'src/app/_not-found/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/alistamiento/page.tsx',
  'src/app/admin/clientes/page.tsx',
  'src/app/admin/entregas/page.tsx',
  'src/app/admin/facturacion/page.tsx',
  'src/app/admin/inventario/page.tsx',
  'src/app/admin/movimientos/page.tsx',
  'src/app/admin/pedidos/page.tsx',
  'src/app/admin/pedidos/[id]/page.tsx',
  'src/app/admin/rutas/page.tsx',
  'src/app/api/sync/route.ts',
  'src/app/comprar/page.tsx',
  'src/app/confirmacion/page.tsx',
  'src/app/cuenta/page.tsx',
  'src/app/domiciliario/page.tsx',
  'src/app/login/page.tsx',
  'src/app/operacion/page.tsx',
  'src/app/pedidos/page.tsx',
  'src/app/pedidos/[id]/page.tsx',
  'src/app/reparto/page.tsx',
];

let existingRoutes = 0;
for (const r of routes) {
  const fullPath = path.join(projectRoot, r);
  if (fs.existsSync(fullPath)) {
    existingRoutes++;
  } else {
    console.warn("Ruta no encontrada en disco:", r);
  }
}
console.log(`[CHECK 6] Rutas físicas verificadas en disco: ${existingRoutes} / ${routes.length}`);

console.log("=== FIN DE VALIDACIÓN FORENSE ===");

# Original User Request

## 2026-08-30T21:16:26Z

Auditoría integral técnica, funcional, de seguridad, arquitectura y de experiencia de usuario sobre las 3 herramientas del ecosistema tecnológico de JD Distribuidora & Gourmet Ahumados (Administración, Operación y Ventas).

Working directory: C:\Users\Sebastián\.gemini\antigravity\scratch\porcob2b-app
Integrity mode: development

## Requirements

### R1. Auditoría Funcional de los 3 Módulos
Evaluar exhaustivamente el flujo de trabajo en cada herramienta:
1. **🏢 ADMINISTRACIÓN (/admin):**
   - Autenticación con perfil único de **Dirección** (contraseña `direccion2026`).
   - Centro de Control & Despacho (Báscula manual, Precintos INVIMA, Telemetría 1.8°C).
   - Módulo de Facturación & POS (`/admin/facturacion`): emisión por kilos, consecutivo automático, cálculo de vueltas en efectivo, crédito comercial a 30 días, formatos de impresión (Tirilla 80mm y Carta) y exportación de libro en .CSV.
   - Auditoría y Arqueo de Movimientos (`/admin/movimientos`), Inventario en frío (`/admin/inventario`), Clientes (`/admin/clientes`) y Pedidos (`/admin/pedidos`).
   - Panel Maestro de Licenciamiento y Bloqueo Remoto (PIN `9401`).
2. **🚚 OPERACIÓN (/operacion):**
   - App móvil táctil de cabina para choferes y furgones refrigerados.
   - Navegación GPS a Google Maps y Waze con recálculo dinámico sobre paradas restantes.
   - Modal de entrega: soporte fotográfico de facturas, medios de pago (Efectivo en sobre, Banco/QR, Factura a Crédito), control de canastillas JD (dejadas vs recogidas) y firma táctil con el dedo.
   - Arqueo de caja de ruta y reporte fotográfico de gastos operativos (combustible y peajes).
3. **🛍️ VENTAS (/):**
   - Portal de clientes con separación de catálogos: JD Distribuidora (Crudos) vs Gourmet Ahumados (Ahumados al leño).
   - Botón de Repetir Pedido en 1 Clic para recompra ágil.
   - Catálogo con precios por kilo, stock en frío y carrito de compras.
   - Seguimiento satelital de pedidos en tiempo real (`/pedidos/[id]`).

### R2. Auditoría Técnica, Seguridad y Arquitectura
- Verificar compilación completa y limpia en Next.js 14 / TypeScript (`npm run build`) con cero errores.
- Validar la integridad del sistema de licenciamiento y pantalla de bloqueo remoto (`LicenseLockScreen`).
- Evaluar la configuración de instalación nativa en Windows Desktop (PWA, `manifest.json`, `sw.js`).
- Comprobar la integración del número de WhatsApp oficial (`+57 323 321 8831`).
- Revisar la sincronización de estado local (`localStorage`) y endpoints (`/api/sync`).

### R3. Informe Ejecutivo y Matriz de Calidad
- Generar un informe estructurado con puntaje de calidad (0 a 100) para cada una de las 3 herramientas.
- Detallar hallazgos clasificados por severidad (Crítico, Medio, Menor, Optimización).
- Proveer recomendaciones técnicas y operativas para el despliegue final en la empresa.

## Acceptance Criteria

### Integridad Funcional & Visual
- [ ] Las 21 rutas de la aplicación están operativas, responden con código 200 y no presentan errores en consola.
- [ ] El login de Administración restringe el acceso no autenticado y acepta la clave de Dirección.
- [ ] La facturación POS emite facturas con cálculo exacto de subtotales, 0% IVA y cambio de efectivo.
- [ ] La app de operación permite registrar entregas completas con firma, foto de factura y canastillas.
- [ ] El portal de ventas permite navegar ambos catálogos y completar órdenes sin fallos.

### Integridad Técnica & Seguridad
- [ ] `npm run build` compila con 0 errores y 0 warnings bloqueantes.
- [ ] El mecanismo de bloqueo remoto suspende la interfaz inmediatamente al activarse y se restaura con el PIN `9401`.
- [ ] El botón de instalación en computador interactúa correctamente con el prompt de PWA en Windows.
- [ ] El informe final de auditoría queda documentado de forma clara y accesible.

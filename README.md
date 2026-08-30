# 🥩 JD Distribuidora & Gourmet Ahumados — Ecosistema Tecnológico

Sistema integral de gestión logística cárnica, automatización de despacho, trazabilidad de ruta en furgones térmicos y portal B2B de pedidos.

---

## 🌟 Estructura de las Herramientas

1. **🏢 ADMINISTRACIÓN (/admin)**
   - Centro de Control y Despacho en tiempo real.
   - Registro y ajuste manual de kilos de báscula de frigorífico.
   - Precintos INVIMA de seguridad y telemetría térmica (1.8°C).
   - Consola de Chequeo y Auditoría de Entregas (POD) con firmas táctiles.
   - Bitácora de movimientos y conciliación diaria con arqueo de caja (Efectivo / Banco / Crédito / Gastos de choferes).
   - Control de inventario en frío, lotes y reservas.
   - Directorio comercial de clientes con listas de precios y condiciones de cartera.
   - Gestión y picking de órdenes de corte.

2. **🚚 OPERACIÓN (/operacion)**
   - App móvil táctil en cabina para domiciliarios y furgones refrigerados.
   - Trazado satelital en Google Maps GPS y Waze con recálculo dinámico sobre paradas restantes.
   - Confirmación de parada y soporte fotográfico de facturas de compra/remisiones.
   - Clasificación táctil del medio de pago (**Efectivo en sobre**, **Banco/QR**, **Factura a Crédito**).
   - Control de canastillas plásticas JD (dejadas llenas vs vacías recogidas).
   - Firma digital en pantalla con el dedo del cliente receptor.
   - Arqueo de caja de ruta y reporte fotográfico de gastos de combustible/peajes.

3. **🛍️ VENTAS (/)**
   - Portal web para clientes (famas, restaurantes, salsamentarias y asaderos).
   - Selección de catálogos 100% separados: **JD Distribuidora** (Cortes Crudos) y **Gourmet Ahumados** (Ahumados al leño).
   - Botón de **Repetir Pedido en 1 Clic** para recompra semanal rápida.
   - Catálogo de productos con precios por kilo y stock en frío en tiempo real.
   - Seguimiento satelital de pedido (*En preparación ➔ En báscula ➔ En furgón refrigerado ➔ Entregado*).

---

## 🌐 Enlaces en Producción (Vercel)

- **🏢 ADMINISTRACIÓN:** [https://jd-distribuidora.vercel.app/admin](https://jd-distribuidora.vercel.app/admin)
- **🚚 OPERACIÓN:** [https://jd-distribuidora.vercel.app/operacion](https://jd-distribuidora.vercel.app/operacion)
- **🛍️ VENTAS:** [https://jd-distribuidora.vercel.app](https://jd-distribuidora.vercel.app)
- **Dominio Alternativo:** [https://jddistribuidora.vercel.app](https://jddistribuidora.vercel.app)

---

## 🛠️ Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS, Lucide Icons, Framer Motion
- **Mapas:** Leaflet / OpenStreetMap con integración GPS a Google Maps & Waze
- **Despliegue:** Vercel

# 🎨 Resumen de Ajustes de UI en Landing Page (Burger Factory) y PWA Móvil (Modo Dual & Nutrición)

Documento que registra los ajustes visuales y funcionales aplicados a la Landing Page E-commerce y a la PWA Móvil basándose en el diseño de referencia *Burger Factory* y los requerimientos de la masterclass Nextcollege 2027.

---

### 📄 1. Documentación de Diagnóstico y Sincronización ERP Guardada
Se generó y guardó el archivo técnico completo en:
- `referencias/docs/5-Sincronizando_Products_SQLite.md`

---

### 🎨 2. Ajustes en Landing Page E-commerce (`apps/ecommerce`)

Tomando como referencia el diseño y tipografías del proyecto de referencia (`Bebas Neue`, `Caveat`, `Plus Jakarta Sans`):

1. **Nuevo Menú / Top Navbar (`apps/ecommerce/src/pages/index.astro`)**:
   - **Logo Oficial Replicado**: Ícono artesanal de 3 capas (`.bun-top`, `.cheese-meat`, `.bun-bottom`) con titular **`BURGER FACTORY`** y subtítulo **`• EST. 2016 • Nextcollege 2027`** enlazado directamente a `#hero`.
   - **Opciones de Navegación Exactas**:
     - **Menú** (`#menu`)
     - **Nosotros** (`#about`)
     - **PWA APP (Móvil)** (`/app`)
     - **ADMIN (Dashboard)** (`/admin`)
   - **Acciones Rápidas**:
     - 🔍 Búsqueda en vivo.
     - 🛒 **Icono de Carrito de Compras** con contador reactivo (`#cartBadgeCount`).
     - 🛰️ Botón **Rastrear** en vivo con radar satelital GPS (`#gpsNavTriggerBtn`).
   - Se eliminó la opción **Inicio / Home** y se retiró el botón **Pedir Ahora** de la cabecera.

2. **Sección Hero & Pilares de Confianza ("Pillars Grid")**:
   - Titular display en `Bebas Neue`: **`BURGERS DONE RIGHT`** con acento dorado `RIGHT`.
   - Etiqueta manuscrita en `Caveat`: *Hecho Fresco. Hecho con Pasión. \|/*
   - Fotografía de hamburguesa insignia sobre fondo oscuro Charcoal gourmet (`#0D0D0D`).
   - Sello circular rotativo artesanal: **`100% CARNE FRESCA • NUNCA CONGELADA 🍔`**.
   - Barra de 4 Pilares de Calidad con `id="about"`:
     - 🍔 **CALIDAD PREMIUM**: *100% carne de res Angus y Wagyu fresca, nunca congelada.*
     - 🍟 **PAPAS RÚSTICAS**: *Cortadas a mano diariamente, doradas y sazonadas a punto.*
     - 🥤 **SHAKES ARTESANALES**: *Malteadas espesas y cremosas con helado recién batido.*
     - 🌿 **FRESCO CADA DÍA**: *Ingredientes seleccionados recibidos a primera hora de la mañana.*

---

### 📱 3. Ajustes en la PWA Móvil (`apps/pwa`)

1. **Soporte de Modo Claro y Modo Oscuro (Dual Theme)**:
   - Implementado en `apps/pwa/src/index.css` mediante tokens CSS completos (`[data-theme="dark"]` y `[data-theme="light"]`) con transiciones suaves a 60 FPS.
   - Botón toggle en cabecera: **`☀️ Claro` / `🌙 Oscuro`** con sincronización automática en `localStorage ('hamburger_theme')` y atributos de documento.
   - Branding adaptado: Logotipo de hamburguesa artesanal con titular **`BURGER FACTORY`** y subtítulo `• EST. 2016 • Nextcollege 2027`.

2. **Tarjetas de Productos Gastronómicos Enriquecidas (`apps/pwa/src/App.jsx`)**:
   - **Detalle de Tiempo & Calorías**: Se agregó en cada tarjeta el indicador exacto: `⏱️ 8-10 min • 🔥 980 kcal`.
   - **Botón "Personalizar"**: Se conservó intacto para la apertura fluida del modal de ingredientes y extras gourmet (+queso añejado, +bacon, +dip de trufa).
   - **Botón "+ Agregar"**: Añadido con estilo botón amber gold para suma directa al carrito.
   - Se mantiene plenamente operativo el modal de **Seguimiento GPS Satelital en Tiempo Real** para las órdenes activas.

---

### 🚀 4. Compilación, Sincronización y Git

1. **Build & Sincronización**: Se ejecutó `npm run build:all` sincronizando los artefactos generados en `server/public/ecommerce` y `server/public/pwa`.
2. **Documento Maestro**: Se actualizó `AGENTS.md` con las nuevas especificaciones de las capas 1 y 2.
3. **Control de Versiones**: Se creó el commit y se realizó `git push` a `origin main` exitosamente:
   ```
   [main 458ead3] feat(ui): replicate Burger Factory design, Nextcollege 2027 navbar & hero, PWA dual theme & calories
   ```

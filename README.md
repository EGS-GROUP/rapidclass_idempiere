# 🍔 Hamburger Rapid — Fast Food Gourmet

Primera versión comercial de la plataforma omnicanal para **Hamburger Rapid**, estructurada como un monorepo arquitectónico de alto rendimiento con estilo de **paleta clara premium**.

---

## 🏗️ Arquitectura de la Solución

El monorepo cuenta con tres aplicaciones frontend desacopladas y un servidor backend centralizado:

| Aplicación | Tecnología | Ruta de Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **Landing E-commerce** | [Astro](https://astro.build/) | `http://localhost:3000/` | Landing page moderna con catálogo de 10 variantes de autor, badges de especialidad, modal interactivo de ingredientes y llamado a la acción comercial. |
| **PWA Mobile** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) | `http://localhost:3000/app` | Aplicación móvil con navegación por 4 pestañas inferiores (**Menú**, **Ofertas**, **Órdenes**, **Perfil**), simulador de carrito, personalizador de ingredientes y tracking de pedidos en vivo. |
| **Operations Dashboard** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) | `http://localhost:3000/admin` | Panel de control con gestión de inventario/stock de hamburguesas, métricas de consumidores por tiers de consumo (Oro VIP, Plata, Bronce) y telemetría de base de datos. |
| **Backend REST API** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) + [MySQL](https://www.mysql.com/) | `http://localhost:3000/api/*` | API con endpoints de salud, productos, actualización de stock y métricas de consumo con fallback in-memory automático. |

---

## 🍔 Catálogo de las 10 Hamburguesas Destacadas

1. **Rey de las Burgers** ($14.99) — `👑 Corona de Oro • Edición Legendaria` (Doble Angus Black 100%, cheddar inglés añejo 12 meses, bacon jam al bourbon).
2. **Burger Real Clásica** ($9.99) — `⭐ Clásica de Autor` (Res seleccionada a la plancha de hierro fundido, doble cheddar fundido, pepinillos encurtidos).
3. **Burger Real Doble** ($12.50) — `🔥 Doble Impacto` (Doble smash caramelizada, cuádruple queso americano, bacon crocante, salsa BBQ ahumada).
4. **Burger Doble Especial** ($13.50) — `✨ Edición Especial` (Doble blend picaña, queso Monterrey Jack, huevo de campo frito con yema trufada, jamón serrano).
5. **Burger Trufa & Portobello** ($15.50) — `💎 Gourmet Select` (Carne madurada Dry-Aged 30 días, Portobello al vino tinto, mayonesa de trufa negra silvestre).
6. **Burger Crispy Smokehouse** ($11.99) — `🍗 Pollo Crujiente` (Pechuga campera en tempura ultracrujiente con especias cajún, coleslaw morada y miel habanero-maple).
7. **Burger BBQ Bourbon Flame** ($13.99) — `🔥 Ahumada a la Leña` (Ahumada con virutas de roble, aros de cebolla rebozados a la cerveza, salsa barbacoa bourbon).
8. **Burger Bacon Cheese Deluxe** ($10.99) — `🥓 Favorita Clásica` (Res parrillera, triple tocino ahumado grueso extra crocante, mix de quesos gouda y cheddar).
9. **Burger Guacamole & Chipotle Crunch** ($12.99) — `🥑 Fusión Picante` (Res a la brasa, guacamole rústico, totopos crocantes de maíz y emulsión chipotle morita).
10. **Burger Green Garden Truffle** ($11.50) — `🌱 100% Plant-Based` (Medallón artesanal de quinoa, lentejas francesas y hongos, crema de trufa en pan rústico).

---

## 🎨 Paleta Clara Premium

- **Lienzo Principal:** Warm Whites & Cream (`#F8FAFC`, `#FFFFFF`, `#FAFAF9`)
- **Acentos Gastronómicos:** Warm Amber & Gold (`#D97706`, `#B45309`, `#FEF3C7`), Flame Orange (`#EA580C`)
- **Tipografía & Contraste:** Slate Charcoal (`#0F172A`, `#334155`, `#64748B`)
- **Badges Semánticos:** Pasteles cálidos con alto contraste para categorización inmediata de especialidad.

---

## 🚀 Comandos de Ejecución

### 1. Compilación de todas las capas
```bash
npm run build:all
```
*Compila Astro, la PWA en Vite y el Admin en Vite, sincronizando los artefactos generados en `server/public`.*

### 2. Iniciar Servidor Unificado
```bash
npm start
```
*Levanta el servidor Express en el puerto 3000 con soporte para MySQL y fallback en memoria.*

### 3. Desarrollo Individual
- **Landing (Astro):** `npm run dev --prefix apps/ecommerce` (Puerto 4321)
- **PWA (Vite):** `npm run dev --prefix apps/pwa`
- **Admin (Vite):** `npm run dev --prefix apps/admin`

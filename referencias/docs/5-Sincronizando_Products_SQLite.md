# 🔍 Resolución de Error HTTP 400 Bad Request en Retorno de Sincronización iDempiere REST hacia SQLite

Documento técnico que detalla el diagnóstico, causa raíz y solución definitiva del error `HTTP 400 Bad Request` presentado durante la sincronización de retorno desde iDempiere hacia SQLite Datamart.

---

### 🔍 Diagnóstico de la Causa Raíz

Al consultar el cuerpo de error exacto devuelto por la API REST v1 de iDempiere:

```json
{
  "title": null,
  "status": 400,
  "detail": "id is not a valid column of table M_Product"
}
```

1. **Incompatibilidad de `$select=id,...` con el Diccionario de Aplicación iDempiere:**
   - La API REST v1 de iDempiere valida los campos del parámetro `$select` contra la tabla `AD_Column` del Diccionario de Aplicación.
   - `id` es un alias sintético generado en la serialización JSON del endpoint REST, pero **no existe como columna física ni en el diccionario de datos** de `M_Product` ni de `M_Product_Category`.
   - La columna clave primaria oficial en el diccionario es **`M_Product_ID`** (y **`M_Product_Category_ID`** para categorías).
2. **Filtro Booleano OData:**
   - Se utilizaba `IsActive eq 'Y'`. En iDempiere REST los booleanos se evalúan como literales `true` o `false` (`IsActive eq true and AD_Client_ID eq 11`).
3. **Ausencia de Soporte de Proxy CORS en `syncProductsFromIdempiere`:**
   - La llamada no utilizaba el enrutador `buildUrl(...)`, impidiendo el paso a través del proxy CORS cuando está habilitado en el perfil.

---

### 🛠️ Correcciones Implementadas

1. **`server/src/services/productSyncService.js`:**
   - Se incorporó la función helper `buildUrl(...)` para soporte de proxy CORS y normalización de URLs.
   - Se corrigió el query OData para usar columnas oficiales del diccionario:
     ```javascript
     const endpoint = `api/v1/models/m_product?$filter=IsActive eq true and AD_Client_ID eq ${clientId}&$select=M_Product_ID,Value,Name,Description,C_UOM_ID,M_Product_Category_ID`;
     ```
   - Se añadió extracción descriptiva del cuerpo de error para que la API reporte el detalle legible si ocurre un fallo.
   - En el `updateStmt` local, se aseguró la actualización de `idempiere_product_id` al hacer match por SKU.

2. **`server/src/services/idempiereSeedService.js`:**
   - En la verificación de categorías previas: `$select=M_Product_Category_ID,Value,Name`.
   - En la verificación de productos previos: `$select=M_Product_ID,Value,Name`.
   - Se propagan `proxyUrl`, `useCorsProxy`, `corsProxyUrl` y `clientId` al invocar `syncProductsFromIdempiere(...)`.

3. **`AGENTS.md`:**
   - Se documentó la **Regla 6** (Convenciones OData en consultas REST iDempiere: uso exclusivo de columnas de `AD_Column` en `$select` y booleanos `true`/`false`) y la **Regla 7** (Comillas simples obligatorias en literales SQLite).

---

### 🧪 Verificación en Vivo

Ejecución del ciclo completo de validación contra el servidor de pruebas con credenciales corporativas:

```
1. Sincronización Directa:
📡 [Sync ERP] Consultando iDempiere REST: .../m_product?$filter=IsActive eq true and AD_Client_ID eq 11&$select=M_Product_ID,Value,Name,Description,C_UOM_ID,M_Product_Category_ID
✅ [Sync ERP] Sincronización completada: 78 procesados (68 creados, 10 actualizados)

2. Sembrado y Retorno a SQLite:
🔍 Verificando categorías existentes en iDempiere...
ℹ️ Categoría existente en ERP: [CAT-ESP] Especiales de la Casa (ID: 1000002)
...
🍔 Verificando productos de autor en iDempiere...
ℹ️ Producto existente en ERP: [BUR-001] Rey de las Burgers (M_Product_ID: 1000013)
...
ℹ️ Producto existente en ERP: [BUR-010] Burger Green Garden Truffle (M_Product_ID: 1000022)
🔄 Sincronizando catálogo desde iDempiere hacia SQLite Datamart...
✨ Datamart SQLite sincronizado: 78 procesados.
```

---

### 🚀 Despliegue y Commit
- **Build Unificado:** `npm run build:all` compiló Astro, PWA y Admin hacia `server/public`.
- **Servidor Activo:** Daemon en puerto 3000 con estado saludable y 78 productos sincronizados en SQLite.
- **Control de Versiones:** Confirmado y enviado a GitHub en el commit `ec371f9`.

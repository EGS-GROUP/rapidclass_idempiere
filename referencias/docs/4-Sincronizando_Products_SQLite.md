# 🔍 Resolución de Errores en Sincronización y Siembra de Productos iDempiere ➔ SQLite

Documento técnico que detalla el diagnóstico y resolución de los dos errores encontrados durante la integración bidireccional del catálogo:
1. **Error de Sintaxis SQLite**: `no such column: "synced"`
2. **Error HTTP 400 Bad Request en iDempiere REST**: `"id is not a valid column of table M_Product"`

---

## 🛑 Incidencia 1: Error de Sintaxis SQLite (`"synced"`)

### 1.1 Diagnóstico
El error se originó en la sentencia SQL de actualización local dentro de `server/src/services/idempiereSeedService.js`:

```javascript
// ❌ Causa: comillas dobles en "synced"
db.prepare('UPDATE products SET idempiere_product_id = ?, sync_status = "synced", last_synced_at = CURRENT_TIMESTAMP WHERE sku = ?');
```

En el estándar SQL de SQLite:
- Las **comillas dobles (`"`)** se reservan para nombres de identificadores (tablas o columnas). Por ello SQLite interpretó `"synced"` como una columna de la tabla `products` y arrojó el mensaje:
  > *`no such column: "synced" - should this be a string literal in single-quotes?`*
- Los **literales de cadena de texto** deben encerrarse obligatoriamente entre **comillas simples (`'`)**.

### 1.2 Solución Aplicada
Se corrigió la instrucción en `idempiereSeedService.js`:
```javascript
// ✅ Corregido con comillas simples para el literal de texto:
const updateProdStmt = db.prepare("UPDATE products SET idempiere_product_id = ?, sync_status = 'synced', last_synced_at = CURRENT_TIMESTAMP WHERE sku = ?");
```

---

## 🛑 Incidencia 2: Error HTTP 400 Bad Request en iDempiere REST

### 2.1 Diagnóstico
Al ejecutar la siembra del catálogo, los productos y categorías se crearon exitosamente en iDempiere (`CAT-ESP`..`CAT-VEG`, `BUR-001`..`BUR-010`), pero al ejecutar el paso final de retorno:
```
🔄 Sincronizando catálogo desde iDempiere hacia SQLite Datamart...
⚠️ Aviso al sincronizar de vuelta a SQLite: Error en API iDempiere: HTTP 400 Bad Request
```

Al inspeccionar la respuesta detallada devuelta por el servidor de pruebas iDempiere:
```json
{
  "title": null,
  "status": 400,
  "detail": "id is not a valid column of table M_Product"
}
```

### 2.2 Causa Raíz
1. **Incompatibilidad del parámetro `$select=id,...` con el Diccionario de Aplicación iDempiere**:
   - En la API REST v1 de iDempiere, los nombres de campo pasados a `$select` se validan directamente contra las columnas de la tabla en `AD_Column`.
   - `id` es una propiedad sintética generada por la serialización JSON del endpoint REST, pero **NO es una columna física ni un campo del diccionario** de la tabla `M_Product` ni de `M_Product_Category`.
   - La columna clave primaria oficial en el diccionario es `M_Product_ID` y `M_Product_Category_ID`.
2. **Filtro OData de Tipo Booleano**:
   - Se utilizaba `$filter=IsActive eq 'Y'`. En el OData de iDempiere, los campos booleanos se evalúan como literales `true` o `false` (ej. `IsActive eq true`). Al filtrar con `'Y'`, no coincidía ningún registro booleano.
3. **Ausencia de Soporte de Proxy CORS en `syncProductsFromIdempiere`**:
   - La función construía la URL de forma directa sin pasar por el helper `buildUrl()`, lo cual impedía canalizar las peticiones a través del proxy CORS configurado en el panel.

---

## 🛠️ Solución Definitiva Implementada

### 1. Corrección en `server/src/services/productSyncService.js`

1. **Uso de Columnas del Diccionario de iDempiere**:
   Se reemplazó `$select=id,Value,...` por las columnas canónicas:
   ```javascript
   const endpoint = `api/v1/models/m_product?$filter=IsActive eq true and AD_Client_ID eq ${clientId}&$select=M_Product_ID,Value,Name,Description,C_UOM_ID,M_Product_Category_ID`;
   ```

2. **Integración con `buildUrl()` y Proxy CORS**:
   Se incorporó la función de ruteo con soporte para proxy CORS configurable:
   ```javascript
   const productsUrl = buildUrl(serverUrl, endpoint, proxyUrl);
   ```

3. **Manejo Descriptivo de Errores REST**:
   Se extrae el cuerpo JSON de error emitido por iDempiere para visibilidad inmediata:
   ```javascript
   if (!res.ok) {
     const errText = await res.text().catch(() => '');
     let detail = res.statusText;
     try {
       const parsed = JSON.parse(errText);
       detail = parsed.detail || parsed.message || detail;
     } catch {
       if (errText) detail = errText.slice(0, 150);
     }
     throw new Error(`Error en API iDempiere: HTTP ${res.status} - ${detail}`);
   }
   ```

4. **Persistencia Garantizada de `idempiere_product_id` en el UPSERT**:
   En `updateStmt`, se asegura que si el producto ya existía por SKU en SQLite, se le asigne su `M_Product_ID` oficial:
   ```javascript
   const updateStmt = db.prepare(`
     UPDATE products SET
       idempiere_product_id = COALESCE(idempiere_product_id, ?),
       erp_name = ?,
       price = COALESCE(?, price),
       price_list = COALESCE(?, price_list),
       is_active = 1,
       sync_status = 'synced',
       last_synced_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
   `);
   ```

### 2. Corrección en `server/src/services/idempiereSeedService.js`

- **Verificación de Categorías**:
  `api/v1/models/m_product_category?$filter=AD_Client_ID eq ${clientId}&$select=M_Product_Category_ID,Value,Name`
- **Verificación de Productos**:
  `api/v1/models/m_product?$filter=AD_Client_ID eq ${clientId}&$select=M_Product_ID,Value,Name`
- **Paso de Opciones a la Sincronización**:
  Se trasladan `proxyUrl`, `useCorsProxy`, `corsProxyUrl` y `clientId` en la llamada a `syncProductsFromIdempiere(...)`.

---

## 🧪 Pruebas de Verificación y Resultados

Se ejecutó la prueba de ciclo completo contra el servidor corporativo de iDempiere (`GardenWorld` / `admin @ gardenworld.com`):

```
1. Running syncProductsFromIdempiere...
🔌 [SQLite] Conectando a base de datos local en: rapidfood.sqlite
✅ [SQLite] Base de datos operativa y sincronizada con éxito.
📡 [Sync ERP] Consultando iDempiere REST: https://test.idempiere.org:443/api/v1/models/m_product?$filter=IsActive eq true and AD_Client_ID eq 11&$select=M_Product_ID,Value,Name,Description,C_UOM_ID,M_Product_Category_ID
✅ [Sync ERP] Sincronización completada: 78 procesados (68 creados, 10 actualizados)
Sync Results: {
  success: true,
  itemsTotal: 78,
  itemsCreated: 68,
  itemsUpdated: 10
}

2. Running seedIdempiereCatalog...
🔍 Verificando categorías existentes en iDempiere...
ℹ️ Categoría existente en ERP: [CAT-ESP] Especiales de la Casa (ID: 1000002)
ℹ️ Categoría existente en ERP: [CAT-CLA] Clásicas (ID: 1000003)
ℹ️ Categoría existente en ERP: [CAT-GOU] Gourmet (ID: 1000004)
ℹ️ Categoría existente en ERP: [CAT-POL] Pollo & Crispy (ID: 1000005)
ℹ️ Categoría existente en ERP: [CAT-VEG] Vegetariana (ID: 1000006)
🍔 Verificando productos de autor en iDempiere...
ℹ️ Producto existente en ERP: [BUR-001] Rey de las Burgers (M_Product_ID: 1000013)
ℹ️ Producto existente en ERP: [BUR-002] Burger Real Clásica (M_Product_ID: 1000014)
...
ℹ️ Producto existente en ERP: [BUR-010] Burger Green Garden Truffle (M_Product_ID: 1000022)
🔄 Sincronizando catálogo desde iDempiere hacia SQLite Datamart...
✨ Datamart SQLite sincronizado: 78 procesados.
```

**Conclusión:** El ciclo completo de siembra, verificación y sincronización bidireccional opera al 100% sin advertencias ni errores.

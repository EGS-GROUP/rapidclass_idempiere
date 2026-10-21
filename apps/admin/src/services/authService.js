/**
 * apps/admin/src/services/authService.js
 * 
 * Servicio modular de Autenticación y Control de Acceso con iDempiere REST API v1.
 * Diseñado como librería desacoplada y reutilizable para el Panel de Administración y la PWA de Pedidos.
 */

const STORAGE_KEY = 'idempiere_session_context';

/**
 * Normaliza y construye la URL destino aplicando el Proxy CORS si está habilitado
 */
export function buildApiUrl(baseUrl, endpoint, useCorsProxy = false, corsProxyUrl = '') {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const targetUrl = `${cleanBase}/${cleanEndpoint}`;

  if (!useCorsProxy || !corsProxyUrl) {
    return targetUrl;
  }

  // Si el proxy contiene '?' al final (ej: https://corsproxy.io/? o /api/proxy?url=)
  if (corsProxyUrl.endsWith('?') || corsProxyUrl.endsWith('=')) {
    return `${corsProxyUrl}${encodeURIComponent(targetUrl)}`;
  }
  return `${corsProxyUrl.replace(/\/+$/, '')}/${encodeURIComponent(targetUrl)}`;
}

/**
 * Normaliza los parámetros de login respetando la firma de iDempiere REST API v1
 * (Notar: iDempiere v1 usa 'organizationId' en lugar de 'orgId' en LoginParameters)
 */
export function normalizeLoginParameters(params = {}) {
  const organizationId = params.organizationId !== undefined 
    ? Number(params.organizationId) 
    : (params.orgId !== undefined ? Number(params.orgId) : 11);

  return {
    clientId: Number(params.clientId || 11),
    roleId: Number(params.roleId || 102),
    organizationId: organizationId,
    warehouseId: Number(params.warehouseId || 103),
    language: params.language || 'en_US'
  };
}

/**
 * MODALIDAD 1: Login Directo / 1 Paso (Acceso Rápido)
 * Envía credenciales y contexto completo en una sola petición POST /api/v1/auth/tokens
 */
export async function loginDirect({
  baseUrl = 'https://test.idempiere.org:443',
  userName,
  password,
  parameters = {},
  useCorsProxy = false,
  corsProxyUrl = ''
}) {
  const url = buildApiUrl(baseUrl, 'api/v1/auth/tokens', useCorsProxy, corsProxyUrl);
  const normalizedParams = normalizeLoginParameters(parameters);

  const payload = {
    userName: userName.trim(),
    password: password,
    parameters: normalizedParams
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.title || data.message || `Error de autenticación (HTTP ${response.status})`;
    throw new Error(errorMsg);
  }

  if (!data.token) {
    throw new Error('La respuesta de iDempiere no devolvió un token Bearer válido.');
  }

  // Construir y persistir contexto de sesión
  const session = {
    token: data.token,
    refreshToken: data.refresh_token || null,
    userId: data.userId || null,
    userName: userName.trim(),
    menuTreeId: data.menuTreeId || null,
    clientId: normalizedParams.clientId,
    roleId: normalizedParams.roleId,
    organizationId: normalizedParams.organizationId,
    orgId: normalizedParams.organizationId,
    warehouseId: normalizedParams.warehouseId,
    language: data.language || normalizedParams.language,
    baseUrl: baseUrl.replace(/\/+$/, ''),
    useCorsProxy,
    corsProxyUrl,
    loginAt: new Date().toISOString(),
    mode: '1-step-direct'
  };

  saveSession(session);
  return session;
}

/**
 * MODALIDAD 2: Paso 1 - Validación Inicial de Credenciales
 * Envía únicamente userName y password. iDempiere responde con los clientes autorizados y un token temporal.
 */
export async function loginStep1({
  baseUrl = 'https://test.idempiere.org:443',
  userName,
  password,
  useCorsProxy = false,
  corsProxyUrl = ''
}) {
  const url = buildApiUrl(baseUrl, 'api/v1/auth/tokens', useCorsProxy, corsProxyUrl);

  const payload = {
    userName: userName.trim(),
    password: password
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.title || data.message || `Credenciales inválidas (HTTP ${response.status})`;
    throw new Error(errorMsg);
  }

  if (!data.token) {
    throw new Error('iDempiere no devolvió token temporal para completar el flujo asistido.');
  }

  return {
    tempToken: data.token,
    clients: data.clients || []
  };
}

/**
 * MODALIDAD 2: Consultar Roles disponibles para el Cliente seleccionado
 */
export async function fetchRoles({
  baseUrl = 'https://test.idempiere.org:443',
  tempToken,
  clientId,
  useCorsProxy = false,
  corsProxyUrl = ''
}) {
  const url = buildApiUrl(baseUrl, `api/v1/auth/roles?client=${clientId}`, useCorsProxy, corsProxyUrl);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tempToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.title || `Error obteniendo roles (HTTP ${response.status})`);
  }

  return data.roles || [];
}

/**
 * MODALIDAD 2: Consultar Organizaciones disponibles para Cliente y Rol
 */
export async function fetchOrganizations({
  baseUrl = 'https://test.idempiere.org:443',
  tempToken,
  clientId,
  roleId,
  useCorsProxy = false,
  corsProxyUrl = ''
}) {
  const url = buildApiUrl(baseUrl, `api/v1/auth/organizations?client=${clientId}&role=${roleId}`, useCorsProxy, corsProxyUrl);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tempToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.title || `Error obteniendo organizaciones (HTTP ${response.status})`);
  }

  return data.organizations || [];
}

/**
 * MODALIDAD 2: Consultar Almacenes (Warehouses) para la Organización seleccionada
 */
export async function fetchWarehouses({
  baseUrl = 'https://test.idempiere.org:443',
  tempToken,
  clientId,
  roleId,
  organizationId,
  useCorsProxy = false,
  corsProxyUrl = ''
}) {
  const url = buildApiUrl(baseUrl, `api/v1/auth/warehouses?client=${clientId}&role=${roleId}&organization=${organizationId}`, useCorsProxy, corsProxyUrl);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tempToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.title || `Error obteniendo almacenes (HTTP ${response.status})`);
  }

  return data.warehouses || [];
}

/**
 * MODALIDAD 2: Paso 2 - Confirmación final con contexto seleccionado
 */
export async function loginStep2Confirm({
  baseUrl = 'https://test.idempiere.org:443',
  userName,
  password,
  parameters = {},
  useCorsProxy = false,
  corsProxyUrl = ''
}) {
  // Reutiliza la emisión con los parámetros seleccionados por el usuario
  return loginDirect({
    baseUrl,
    userName,
    password,
    parameters,
    useCorsProxy,
    corsProxyUrl
  });
}

/**
 * Almacenar la sesión en sessionStorage y localStorage
 */
export function saveSession(session) {
  try {
    const raw = JSON.stringify(session);
    sessionStorage.setItem(STORAGE_KEY, raw);
    localStorage.setItem(STORAGE_KEY, raw);
  } catch (e) {
    console.error('Error guardando sesión:', e);
  }
}

/**
 * Recuperar la sesión activa
 */
export function getSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Comprobar si existe una sesión activa y válida
 */
export function isAuthenticated() {
  const session = getSession();
  return !!(session && session.token);
}

/**
 * Obtener el token de autorización
 */
export function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

/**
 * Obtener el contexto de ERP actual
 */
export function getContext() {
  const session = getSession();
  if (!session) return null;
  return {
    userId: session.userId,
    userName: session.userName,
    clientId: session.clientId,
    roleId: session.roleId,
    organizationId: session.organizationId || session.orgId,
    orgId: session.organizationId || session.orgId,
    warehouseId: session.warehouseId,
    language: session.language,
    baseUrl: session.baseUrl,
    loginAt: session.loginAt
  };
}

/**
 * Generar cabeceras de autorización HTTP listas para consumo REST
 */
export function getAuthHeaders() {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

/**
 * Cerrar sesión y purgar datos locales
 */
export function logout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error cerrando sesión:', e);
  }
}

export default {
  buildApiUrl,
  normalizeLoginParameters,
  loginDirect,
  loginStep1,
  fetchRoles,
  fetchOrganizations,
  fetchWarehouses,
  loginStep2Confirm,
  saveSession,
  getSession,
  isAuthenticated,
  getToken,
  getContext,
  getAuthHeaders,
  logout
};

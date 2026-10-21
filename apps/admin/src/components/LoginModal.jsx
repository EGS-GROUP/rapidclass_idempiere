import React, { useState } from 'react';
import authService from '../services/authService';

export default function LoginModal({ onLoginSuccess }) {
  // Mode: '1-step' (Directo) | '2-step' (Asistido Dinámico)
  const [mode, setMode] = useState('1-step');

  // Server & Connectivity
  const [baseUrl, setBaseUrl] = useState('https://test.idempiere.org:443');
  const [useCorsProxy, setUseCorsProxy] = useState(false);
  const [corsProxyUrl, setCorsProxyUrl] = useState('');

  // Credentials
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  // Fixed Context Parameters (Modalidad 1)
  const [clientId, setClientId] = useState('11');
  const [roleId, setRoleId] = useState('102');
  const [orgId, setOrgId] = useState('11');
  const [warehouseId, setWarehouseId] = useState('103');
  const [language, setLanguage] = useState('en_US');

  // Dynamic Options (Modalidad 2 - Multitenant)
  const [step2State, setStep2State] = useState({
    step: 1, // 1: Credenciales, 2: Selección de Tenant / Rol / Org / Warehouse
    tempToken: null,
    clients: [],
    roles: [],
    organizations: [],
    warehouses: [],
    selectedClient: '',
    selectedRole: '',
    selectedOrg: '',
    selectedWarehouse: ''
  });

  // UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  // Acceso Rápido: Cargar Demo GardenWorld
  const handleLoadGardenWorldDemo = () => {
    setBaseUrl('https://test.idempiere.org:443');
    setUserName('admin @ gardenworld.com');
    setPassword('GardenAdmin');
    setClientId('11');
    setRoleId('102');
    setOrgId('11');
    setWarehouseId('103');
    setLanguage('en_US');
    setUseCorsProxy(false);
    setErrorMessage(null);
  };

  // Submit Modalidad 1: Login Directo
  const handleDirectLogin = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Autenticando contra iDempiere REST API v1...');
    setErrorMessage(null);

    try {
      const session = await authService.loginDirect({
        baseUrl,
        userName,
        password,
        parameters: {
          clientId,
          roleId,
          organizationId: orgId,
          warehouseId,
          language
        },
        useCorsProxy,
        corsProxyUrl
      });

      if (onLoginSuccess) {
        onLoginSuccess(session);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error durante la autenticación');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Submit Modalidad 2: Paso 1 - Validar Credenciales
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Validando credenciales iniciales en iDempiere...');
    setErrorMessage(null);

    try {
      const { tempToken, clients } = await authService.loginStep1({
        baseUrl,
        userName,
        password,
        useCorsProxy,
        corsProxyUrl
      });

      const initialClient = clients.length > 0 ? String(clients[0].id) : '11';

      // Consultar roles para el cliente inicial
      setLoadingStatus('Cargando roles autorizados...');
      const roles = await authService.fetchRoles({
        baseUrl,
        tempToken,
        clientId: initialClient,
        useCorsProxy,
        corsProxyUrl
      });

      const initialRole = roles.length > 0 ? String(roles[0].id) : '';

      // Consultar organizaciones para cliente y rol
      let organizations = [];
      if (initialRole) {
        setLoadingStatus('Cargando organizaciones asignadas...');
        organizations = await authService.fetchOrganizations({
          baseUrl,
          tempToken,
          clientId: initialClient,
          roleId: initialRole,
          useCorsProxy,
          corsProxyUrl
        });
      }

      const initialOrg = organizations.length > 0 ? String(organizations[0].id) : '';

      // Consultar almacenes para la organización
      let warehouses = [];
      if (initialOrg) {
        setLoadingStatus('Cargando almacenes...');
        warehouses = await authService.fetchWarehouses({
          baseUrl,
          tempToken,
          clientId: initialClient,
          roleId: initialRole,
          organizationId: initialOrg,
          useCorsProxy,
          corsProxyUrl
        });
      }

      const initialWarehouse = warehouses.length > 0 ? String(warehouses[0].id) : '';

      setStep2State({
        step: 2,
        tempToken,
        clients,
        roles,
        organizations,
        warehouses,
        selectedClient: initialClient,
        selectedRole: initialRole,
        selectedOrg: initialOrg,
        selectedWarehouse: initialWarehouse
      });
    } catch (err) {
      setErrorMessage(err.message || 'Error validando credenciales iniciales');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Cambio de cliente en Modalidad 2
  const handleClientChange = async (newClient) => {
    setStep2State(prev => ({ ...prev, selectedClient: newClient }));
    setIsLoading(true);
    setLoadingStatus('Actualizando roles para el cliente...');
    try {
      const roles = await authService.fetchRoles({
        baseUrl,
        tempToken: step2State.tempToken,
        clientId: newClient,
        useCorsProxy,
        corsProxyUrl
      });
      const initialRole = roles.length > 0 ? String(roles[0].id) : '';
      setStep2State(prev => ({
        ...prev,
        roles,
        selectedRole: initialRole,
        organizations: [],
        warehouses: []
      }));

      if (initialRole) {
        const orgs = await authService.fetchOrganizations({
          baseUrl,
          tempToken: step2State.tempToken,
          clientId: newClient,
          roleId: initialRole,
          useCorsProxy,
          corsProxyUrl
        });
        const initialOrg = orgs.length > 0 ? String(orgs[0].id) : '';
        setStep2State(prev => ({ ...prev, organizations: orgs, selectedOrg: initialOrg }));

        if (initialOrg) {
          const whs = await authService.fetchWarehouses({
            baseUrl,
            tempToken: step2State.tempToken,
            clientId: newClient,
            roleId: initialRole,
            organizationId: initialOrg,
            useCorsProxy,
            corsProxyUrl
          });
          setStep2State(prev => ({
            ...prev,
            warehouses: whs,
            selectedWarehouse: whs.length > 0 ? String(whs[0].id) : ''
          }));
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Cambio de Rol en Modalidad 2
  const handleRoleChange = async (newRole) => {
    setStep2State(prev => ({ ...prev, selectedRole: newRole }));
    setIsLoading(true);
    setLoadingStatus('Actualizando organizaciones para el rol...');
    try {
      const orgs = await authService.fetchOrganizations({
        baseUrl,
        tempToken: step2State.tempToken,
        clientId: step2State.selectedClient,
        roleId: newRole,
        useCorsProxy,
        corsProxyUrl
      });
      const initialOrg = orgs.length > 0 ? String(orgs[0].id) : '';
      setStep2State(prev => ({ ...prev, organizations: orgs, selectedOrg: initialOrg }));

      if (initialOrg) {
        const whs = await authService.fetchWarehouses({
          baseUrl,
          tempToken: step2State.tempToken,
          clientId: step2State.selectedClient,
          roleId: newRole,
          organizationId: initialOrg,
          useCorsProxy,
          corsProxyUrl
        });
        setStep2State(prev => ({
          ...prev,
          warehouses: whs,
          selectedWarehouse: whs.length > 0 ? String(whs[0].id) : ''
        }));
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Cambio de Organización en Modalidad 2
  const handleOrgChange = async (newOrg) => {
    setStep2State(prev => ({ ...prev, selectedOrg: newOrg }));
    setIsLoading(true);
    setLoadingStatus('Actualizando almacenes para la organización...');
    try {
      const whs = await authService.fetchWarehouses({
        baseUrl,
        tempToken: step2State.tempToken,
        clientId: step2State.selectedClient,
        roleId: step2State.selectedRole,
        organizationId: newOrg,
        useCorsProxy,
        corsProxyUrl
      });
      setStep2State(prev => ({
        ...prev,
        warehouses: whs,
        selectedWarehouse: whs.length > 0 ? String(whs[0].id) : ''
      }));
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Finalizar Modalidad 2: Confirmar Sesión
  const handleStep2Confirm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingStatus('Emitiendo token de sesión definitivo en iDempiere...');
    setErrorMessage(null);

    try {
      const session = await authService.loginStep2Confirm({
        baseUrl,
        userName,
        password,
        parameters: {
          clientId: step2State.selectedClient,
          roleId: step2State.selectedRole,
          organizationId: step2State.selectedOrg,
          warehouseId: step2State.selectedWarehouse,
          language
        },
        useCorsProxy,
        corsProxyUrl
      });

      if (onLoginSuccess) {
        onLoginSuccess(session);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error confirmando sesión');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, #1E1B18 0%, #141210 90%)',
      padding: '24px',
      color: '#0F172A'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1A17 0%, #2A241F 100%)',
          color: '#FFFFFF',
          padding: '28px 32px 22px',
          borderBottom: '2px solid #F5A623',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                background: 'linear-gradient(135deg, #F5A623, #EA580C)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 14px rgba(245, 166, 35, 0.35)'
              }}>
                🔐
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                  Acceso al Panel de Administración
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#C7C2BA', marginTop: '2px' }}>
                  Validación Centralizada con <b style={{ color: '#F5A623' }}>iDempiere ERP REST API v1</b>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Pre-fill Button */}
          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleLoadGardenWorldDemo}
              style={{
                background: 'rgba(245, 166, 35, 0.15)',
                border: '1px solid #F5A623',
                color: '#F5A623',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Autocompletar credenciales de test.idempiere.org"
            >
              <span>⚡ Cargar Demo GardenWorld</span>
            </button>
          </div>
        </div>

        {/* Modal Subnav: Mode Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          <button
            type="button"
            onClick={() => { setMode('1-step'); setErrorMessage(null); }}
            style={{
              padding: '13px',
              fontWeight: '700',
              fontSize: '0.86rem',
              background: mode === '1-step' ? '#FFFFFF' : 'transparent',
              color: mode === '1-step' ? '#D97706' : '#64748B',
              border: 'none',
              borderBottom: mode === '1-step' ? '3px solid #D97706' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            1️⃣ Login Directo (1 Paso)
          </button>
          <button
            type="button"
            onClick={() => { setMode('2-step'); setErrorMessage(null); }}
            style={{
              padding: '13px',
              fontWeight: '700',
              fontSize: '0.86rem',
              background: mode === '2-step' ? '#FFFFFF' : 'transparent',
              color: mode === '2-step' ? '#D97706' : '#64748B',
              border: 'none',
              borderBottom: mode === '2-step' ? '3px solid #D97706' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            2️⃣ Asistido Multitenant (2 Pasos)
          </button>
        </div>

        {/* Modal Form Content */}
        <div style={{ padding: '28px 32px' }}>
          
          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Error en la autenticación:</strong>
                <div style={{ marginTop: '2px', wordBreak: 'break-word' }}>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Loading Status Indicator */}
          {isLoading && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#92400E',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              <span>{loadingStatus}</span>
            </div>
          )}

          {/* Server Base URL & CORS proxy controls */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                🌐 Servidor iDempiere REST v1
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useCorsProxy}
                  onChange={(e) => setUseCorsProxy(e.target.checked)}
                />
                <span>Proxy CORS</span>
              </label>
            </div>

            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://test.idempiere.org:443"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.86rem',
                fontFamily: 'monospace',
                background: '#FFFFFF'
              }}
              required
            />

            {useCorsProxy && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                  URL del Proxy CORS (opcional, ej: https://corsproxy.io/? o proxy local)
                </label>
                <input
                  type="text"
                  value={corsProxyUrl}
                  onChange={(e) => setCorsProxyUrl(e.target.value)}
                  placeholder="https://corsproxy.io/?"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    background: '#FFFFFF'
                  }}
                />
              </div>
            )}
          </div>

          {/* MODALIDAD 1: FORMULARIO DIRECTO */}
          {mode === '1-step' && (
            <form onSubmit={handleDirectLogin}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Usuario ERP <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="admin @ gardenworld.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Contraseña <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Context Parameters Grid */}
              <div style={{
                background: '#FAFAF9',
                border: '1px solid #E7E5E4',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '22px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#78716C', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ⚙️ Parámetros de Contexto Fijos (ERP Parameters)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#57534E', display: 'block', marginBottom: '4px' }}>
                      Client ID (Tenant)
                    </label>
                    <input
                      type="number"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '0.86rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#57534E', display: 'block', marginBottom: '4px' }}>
                      Role ID
                    </label>
                    <input
                      type="number"
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '0.86rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#57534E', display: 'block', marginBottom: '4px' }}>
                      Organization ID
                    </label>
                    <input
                      type="number"
                      value={orgId}
                      onChange={(e) => setOrgId(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '0.86rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#57534E', display: 'block', marginBottom: '4px' }}>
                      Warehouse ID
                    </label>
                    <input
                      type="number"
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '0.86rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#57534E', display: 'block', marginBottom: '4px' }}>
                    Idioma (Language)
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '0.86rem' }}
                  >
                    <option value="en_US">English (en_US)</option>
                    <option value="es_ES">Español (es_ES)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '800',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Conectando con iDempiere...' : '🔓 Ingresar al Panel de Control'}
              </button>
            </form>
          )}

          {/* MODALIDAD 2: LOGIN ASISTIDO EN 2 PASOS */}
          {mode === '2-step' && (
            <div>
              {step2State.step === 1 ? (
                <form onSubmit={handleStep1Submit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Usuario ERP <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="admin @ gardenworld.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Contraseña <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '18px', lineHeight: 1.4 }}>
                    ℹ️ En el Paso 1 se validarán tus credenciales contra iDempiere para consultar los tenants, roles y almacenes autorizados para tu usuario.
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
                      color: '#FFFFFF',
                      padding: '13px',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? 'Consultando Tenants...' : 'Continuar al Paso 2 ➔'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStep2Confirm}>
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '18px',
                    fontSize: '0.84rem',
                    color: '#065F46'
                  }}>
                    ✓ Credenciales validadas para <b>{userName}</b>. Selecciona el contexto de trabajo:
                  </div>

                  {/* Dynamic Dropdowns */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                    {/* Client Select */}
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Empresa / Tenant (Client)
                      </label>
                      <select
                        value={step2State.selectedClient}
                        onChange={(e) => handleClientChange(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                        required
                      >
                        {step2State.clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
                        ))}
                      </select>
                    </div>

                    {/* Role Select */}
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Rol Asignado (Role)
                      </label>
                      <select
                        value={step2State.selectedRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                        required
                      >
                        {step2State.roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name} (ID: {r.id})</option>
                        ))}
                      </select>
                    </div>

                    {/* Organization Select */}
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Organización / Sucursal (Organization)
                      </label>
                      <select
                        value={step2State.selectedOrg}
                        onChange={(e) => handleOrgChange(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                        required
                      >
                        {step2State.organizations.map(o => (
                          <option key={o.id} value={o.id}>{o.name} (ID: {o.id})</option>
                        ))}
                      </select>
                    </div>

                    {/* Warehouse Select */}
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Almacén (Warehouse)
                      </label>
                      <select
                        value={step2State.selectedWarehouse}
                        onChange={(e) => setStep2State(prev => ({ ...prev, selectedWarehouse: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                        required
                      >
                        {step2State.warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name} (ID: {w.id})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setStep2State(prev => ({ ...prev, step: 1 }))}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '10px',
                        background: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      ⬅ Atrás
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
                        color: '#FFFFFF',
                        padding: '12px',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: '800',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                        opacity: isLoading ? 0.7 : 1
                      }}
                    >
                      {isLoading ? 'Confirmando...' : 'Confirmar Contexto y Entrar 🔓'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8' }}>
            Acceso universal para cualquier rol activo en iDempiere ERP &bull; Protocolo Bearer JWT
          </div>
        </div>
      </div>
    </div>
  );
}

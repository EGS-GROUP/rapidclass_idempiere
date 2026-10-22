import React, { useState } from 'react';
import authService from '../services/authService';

export default function LoginModal({ onLoginSuccess }) {
  // Configuración cargada silenciosamente desde el Perfil
  const config = authService.getErpConfig();

  // Credenciales
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado para Flujo Asistido (si loginMode === 'assisted')
  const [assistedState, setAssistedState] = useState({
    isActive: false, // true cuando pasa al Paso 2
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

  // Envío del Formulario Inicial (Usuario + Contraseña)
  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario y contraseña para continuar.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const activeConfig = authService.getErpConfig();

    // MODO 1: LOGIN DIRECTO (1 PASO)
    if (activeConfig.loginMode !== 'assisted') {
      setLoadingStatus('Validando credenciales de acceso...');
      try {
        const session = await authService.loginDirect({
          baseUrl: activeConfig.serverUrl,
          userName: userName.trim(),
          password: password,
          parameters: {
            clientId: activeConfig.clientId,
            roleId: activeConfig.roleId,
            organizationId: activeConfig.organizationId,
            warehouseId: activeConfig.warehouseId,
            language: activeConfig.language
          },
          useCorsProxy: activeConfig.useCorsProxy,
          corsProxyUrl: activeConfig.corsProxyUrl
        });

        if (onLoginSuccess) {
          onLoginSuccess(session);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Error de autenticación. Verifica tus credenciales o el estado de la conexión.');
      } finally {
        setIsLoading(false);
        setLoadingStatus('');
      }
      return;
    }

    // MODO 2: ASISTIDO MULTITENANT (PASO 1 -> SELECCIÓN DINÁMICA)
    setLoadingStatus('Validando identidad en servidor corporativo...');
    try {
      const { tempToken, clients } = await authService.loginStep1({
        baseUrl: activeConfig.serverUrl,
        userName: userName.trim(),
        password: password,
        useCorsProxy: activeConfig.useCorsProxy,
        corsProxyUrl: activeConfig.corsProxyUrl
      });

      const initialClient = clients.length > 0 ? String(clients[0].id) : String(activeConfig.clientId || '11');

      setLoadingStatus('Cargando perfiles y roles autorizados...');
      const roles = await authService.fetchRoles({
        baseUrl: activeConfig.serverUrl,
        tempToken,
        clientId: initialClient,
        useCorsProxy: activeConfig.useCorsProxy,
        corsProxyUrl: activeConfig.corsProxyUrl
      });

      const initialRole = roles.length > 0 ? String(roles[0].id) : String(activeConfig.roleId || '');

      let organizations = [];
      if (initialRole) {
        setLoadingStatus('Cargando organizaciones corporativas...');
        organizations = await authService.fetchOrganizations({
          baseUrl: activeConfig.serverUrl,
          tempToken,
          clientId: initialClient,
          roleId: initialRole,
          useCorsProxy: activeConfig.useCorsProxy,
          corsProxyUrl: activeConfig.corsProxyUrl
        });
      }

      const initialOrg = organizations.length > 0 ? String(organizations[0].id) : String(activeConfig.organizationId || '');

      let warehouses = [];
      if (initialOrg) {
        setLoadingStatus('Cargando centros de distribución...');
        warehouses = await authService.fetchWarehouses({
          baseUrl: activeConfig.serverUrl,
          tempToken,
          clientId: initialClient,
          roleId: initialRole,
          organizationId: initialOrg,
          useCorsProxy: activeConfig.useCorsProxy,
          corsProxyUrl: activeConfig.corsProxyUrl
        });
      }

      const initialWarehouse = warehouses.length > 0 ? String(warehouses[0].id) : String(activeConfig.warehouseId || '');

      setAssistedState({
        isActive: true,
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
      setErrorMessage(err.message || 'Credenciales no válidas o fallo de conexión.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Cambio de cliente en flujo asistido
  const handleClientChange = async (newClient) => {
    setAssistedState(prev => ({ ...prev, selectedClient: newClient }));
    setIsLoading(true);
    setLoadingStatus('Actualizando roles para la entidad...');
    const activeConfig = authService.getErpConfig();

    try {
      const roles = await authService.fetchRoles({
        baseUrl: activeConfig.serverUrl,
        tempToken: assistedState.tempToken,
        clientId: newClient,
        useCorsProxy: activeConfig.useCorsProxy,
        corsProxyUrl: activeConfig.corsProxyUrl
      });
      const initialRole = roles.length > 0 ? String(roles[0].id) : '';

      let organizations = [];
      if (initialRole) {
        organizations = await authService.fetchOrganizations({
          baseUrl: activeConfig.serverUrl,
          tempToken: assistedState.tempToken,
          clientId: newClient,
          roleId: initialRole,
          useCorsProxy: activeConfig.useCorsProxy,
          corsProxyUrl: activeConfig.corsProxyUrl
        });
      }
      const initialOrg = organizations.length > 0 ? String(organizations[0].id) : '';

      let warehouses = [];
      if (initialOrg) {
        warehouses = await authService.fetchWarehouses({
          baseUrl: activeConfig.serverUrl,
          tempToken: assistedState.tempToken,
          clientId: newClient,
          roleId: initialRole,
          organizationId: initialOrg,
          useCorsProxy: activeConfig.useCorsProxy,
          corsProxyUrl: activeConfig.corsProxyUrl
        });
      }
      const initialWarehouse = warehouses.length > 0 ? String(warehouses[0].id) : '';

      setAssistedState(prev => ({
        ...prev,
        roles,
        organizations,
        warehouses,
        selectedRole: initialRole,
        selectedOrg: initialOrg,
        selectedWarehouse: initialWarehouse
      }));
    } catch (err) {
      setErrorMessage('Error al actualizar opciones: ' + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Cambio de rol en flujo asistido
  const handleRoleChange = async (newRole) => {
    setAssistedState(prev => ({ ...prev, selectedRole: newRole }));
    setIsLoading(true);
    setLoadingStatus('Actualizando organizaciones...');
    const activeConfig = authService.getErpConfig();

    try {
      const organizations = await authService.fetchOrganizations({
        baseUrl: activeConfig.serverUrl,
        tempToken: assistedState.tempToken,
        clientId: assistedState.selectedClient,
        roleId: newRole,
        useCorsProxy: activeConfig.useCorsProxy,
        corsProxyUrl: activeConfig.corsProxyUrl
      });
      const initialOrg = organizations.length > 0 ? String(organizations[0].id) : '';

      let warehouses = [];
      if (initialOrg) {
        warehouses = await authService.fetchWarehouses({
          baseUrl: activeConfig.serverUrl,
          tempToken: assistedState.tempToken,
          clientId: assistedState.selectedClient,
          roleId: newRole,
          organizationId: initialOrg,
          useCorsProxy: activeConfig.useCorsProxy,
          corsProxyUrl: activeConfig.corsProxyUrl
        });
      }
      const initialWarehouse = warehouses.length > 0 ? String(warehouses[0].id) : '';

      setAssistedState(prev => ({
        ...prev,
        organizations,
        warehouses,
        selectedOrg: initialOrg,
        selectedWarehouse: initialWarehouse
      }));
    } catch (err) {
      setErrorMessage('Error al actualizar organizaciones: ' + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Cambio de organización en flujo asistido
  const handleOrgChange = async (newOrg) => {
    setAssistedState(prev => ({ ...prev, selectedOrg: newOrg }));
    setIsLoading(true);
    setLoadingStatus('Actualizando centros autorizados...');
    const activeConfig = authService.getErpConfig();

    try {
      const warehouses = await authService.fetchWarehouses({
        baseUrl: activeConfig.serverUrl,
        tempToken: assistedState.tempToken,
        clientId: assistedState.selectedClient,
        roleId: assistedState.selectedRole,
        organizationId: newOrg,
        useCorsProxy: activeConfig.useCorsProxy,
        corsProxyUrl: activeConfig.corsProxyUrl
      });
      const initialWarehouse = warehouses.length > 0 ? String(warehouses[0].id) : '';

      setAssistedState(prev => ({
        ...prev,
        warehouses,
        selectedWarehouse: initialWarehouse
      }));
    } catch (err) {
      setErrorMessage('Error al actualizar centros: ' + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Confirmar y entrar en flujo asistido
  const handleAssistedConfirm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingStatus('Confirmando sesión autorizada...');
    setErrorMessage(null);
    const activeConfig = authService.getErpConfig();

    try {
      const session = await authService.loginStep2Confirm({
        baseUrl: activeConfig.serverUrl,
        userName: userName.trim(),
        password: password,
        parameters: {
          clientId: assistedState.selectedClient,
          roleId: assistedState.selectedRole,
          organizationId: assistedState.selectedOrg,
          warehouseId: assistedState.selectedWarehouse,
          language: activeConfig.language || 'en_US'
        },
        useCorsProxy: activeConfig.useCorsProxy,
        corsProxyUrl: activeConfig.corsProxyUrl
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
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at 50% 20%, #201C18 0%, #0F0D0C 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 99999,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        background: '#181513',
        borderRadius: '24px',
        border: '1px solid #332B25',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 40px rgba(245, 166, 35, 0.08)',
        overflow: 'hidden'
      }}>
        
        {/* Header Corporativo Blindado */}
        <div style={{
          padding: '32px 32px 24px 32px',
          textAlign: 'center',
          borderBottom: '1px solid #28211C',
          background: 'linear-gradient(180deg, rgba(245, 166, 35, 0.04) 0%, transparent 100%)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 8px 24px rgba(245, 166, 35, 0.3)',
            marginBottom: '16px'
          }}>
            👑
          </div>
          
          <h1 style={{
            margin: '0 0 6px 0',
            fontSize: '1.45rem',
            fontWeight: '900',
            color: '#FFFFFF',
            letterSpacing: '-0.02em'
          }}>
            Tasty Bites <span style={{ color: '#F5A623' }}>•</span> Central
          </h1>
          
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#A8A29E',
            fontWeight: '500'
          }}>
            {assistedState.isActive 
              ? 'Selecciona tu contexto operativo de trabajo'
              : 'Acceso seguro al Panel de Control Corporativo'}
          </p>
        </div>

        {/* Feedback de Estado / Error */}
        {errorMessage && (
          <div style={{
            margin: '20px 28px 0 28px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#FCA5A5',
            fontSize: '0.82rem',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading && loadingStatus && (
          <div style={{
            margin: '20px 28px 0 28px',
            padding: '12px 16px',
            background: 'rgba(245, 166, 35, 0.1)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            borderRadius: '12px',
            color: '#FDE68A',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            <span>{loadingStatus}</span>
          </div>
        )}

        {/* CUERPO 1: FORMULARIO PRINCIPAL DE CREDENCIALES */}
        {!assistedState.isActive ? (
          <form onSubmit={handleSubmitCredentials} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Campo Usuario */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#E7E5E4',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Usuario / Correo Corporativo
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="ej: usuario@empresa.com"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '13px 16px 13px 42px',
                      background: '#1F1B18',
                      border: '1px solid #3E342D',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F5A623'}
                    onBlur={(e) => e.target.style.borderColor = '#3E342D'}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1rem',
                    opacity: 0.6
                  }}>
                    👤
                  </span>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#E7E5E4',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Contraseña de Acceso
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 42px',
                      background: '#1F1B18',
                      border: '1px solid #3E342D',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F5A623'}
                    onBlur={(e) => e.target.style.borderColor = '#3E342D'}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1rem',
                    opacity: 0.6
                  }}>
                    🔒
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#A8A29E',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              {/* Botón Principal de Acceso */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '0.98rem',
                  fontWeight: '800',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(217, 119, 6, 0.4)',
                  transition: 'transform 0.15s, opacity 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span>{isLoading ? 'Autenticando...' : 'Acceder al Panel de Control'}</span>
                {!isLoading && <span>➔</span>}
              </button>
            </div>
          </form>
        ) : (
          /* CUERPO 2: FLUJO ASISTIDO MULTITENANT (PASO 2 DINÁMICO) */
          <form onSubmit={handleAssistedConfirm} style={{ padding: '24px 28px 28px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Selector Entidad / Cliente */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#D6D3D1', marginBottom: '6px' }}>
                  Entidad / Organización Principal
                </label>
                <select
                  value={assistedState.selectedClient}
                  onChange={(e) => handleClientChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1F1B18',
                    border: '1px solid #3E342D',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {assistedState.clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
                  ))}
                </select>
              </div>

              {/* Selector Rol de Acceso */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#D6D3D1', marginBottom: '6px' }}>
                  Rol Autorizado
                </label>
                <select
                  value={assistedState.selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1F1B18',
                    border: '1px solid #3E342D',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {assistedState.roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (#{r.id})</option>
                  ))}
                </select>
              </div>

              {/* Selector Organización */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#D6D3D1', marginBottom: '6px' }}>
                  División / Organización
                </label>
                <select
                  value={assistedState.selectedOrg}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1F1B18',
                    border: '1px solid #3E342D',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {assistedState.organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} (#{o.id})</option>
                  ))}
                </select>
              </div>

              {/* Selector Almacén */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#D6D3D1', marginBottom: '6px' }}>
                  Centro de Distribución / Almacén
                </label>
                <select
                  value={assistedState.selectedWarehouse}
                  onChange={(e) => setAssistedState(prev => ({ ...prev, selectedWarehouse: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1F1B18',
                    border: '1px solid #3E342D',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {assistedState.warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (#{w.id})</option>
                  ))}
                </select>
              </div>

              {/* Botones de Confirmación y Retorno */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAssistedState(prev => ({ ...prev, isActive: false }))}
                  style={{
                    flex: '1',
                    background: '#2A2420',
                    color: '#D6D3D1',
                    border: '1px solid #3E342D',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ← Volver
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: '2',
                    background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Iniciando...' : 'Confirmar y Entrar'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Seguro y Discreto */}
        <div style={{
          padding: '16px 28px',
          background: '#12100E',
          borderTop: '1px solid #28211C',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#78716C'
        }}>
          <span>🔒 Conexión cifrada de extremo a extremo &bull; Panel Corporativo v2.0</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import authService, { DEFAULT_ERP_CONFIG } from '../services/authService';

export default function ProfileSection({ session }) {
  const [config, setConfig] = useState(authService.getErpConfig());
  const [saveMessage, setSaveMessage] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);

  useEffect(() => {
    const loaded = authService.getErpConfig();
    setConfig(loaded);
  }, []);

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setConnectionResult(null);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    authService.saveErpConfig(config);
    setSaveMessage('✅ Configuración de perfil y conexión guardada correctamente');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleReset = () => {
    if (confirm('¿Restablecer la configuración de conexión y parámetros a los valores por defecto?')) {
      authService.saveErpConfig(DEFAULT_ERP_CONFIG);
      setConfig({ ...DEFAULT_ERP_CONFIG });
      setSaveMessage('🔄 Configuración restablecida a los valores predeterminados');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    const startTime = performance.now();
    try {
      const url = authService.buildApiUrl(
        config.serverUrl,
        'api/v1/auth/tokens',
        config.useCorsProxy,
        config.corsProxyUrl
      );

      // Enviar probe sin credenciales para verificar conectividad y preflight CORS
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}),
        signal: controller.signal
      }).catch(err => {
        throw new Error(err.name === 'AbortError' ? 'Tiempo de espera agotado (timeout 6s)' : err.message);
      });

      clearTimeout(timeout);
      const elapsed = Math.round(performance.now() - startTime);

      // Si responde 400 (Bad Request / Missing parameters) significa que el servidor está ONLINE y procesó el endpoint REST correctamente
      if (res.status === 400 || res.status === 401 || res.status === 200) {
        setConnectionResult({
          success: true,
          message: `Servidor en línea y accesible (${elapsed} ms) • Estado HTTP ${res.status}`
        });
      } else {
        setConnectionResult({
          success: false,
          message: `Servidor respondió con código inesperado HTTP ${res.status} (${elapsed} ms)`
        });
      }
    } catch (err) {
      setConnectionResult({
        success: false,
        message: `Fallo de conexión: ${err.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1A17 0%, #2A2420 100%)',
        borderRadius: '20px',
        padding: '28px',
        color: '#FFFFFF',
        border: '1px solid #3D352E',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 4px 14px rgba(245, 166, 35, 0.35)'
          }}>
            👤
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#FDFCFB' }}>
                Perfil de Administrador & Configuración de Servidor
              </h2>
              <span style={{
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '3px 9px',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}>
                Activo
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', color: '#C7C2BA', fontSize: '0.88rem' }}>
              Gestión segura de la dirección del servidor central, parámetros de acceso y modo de inicio de sesión.
            </p>
          </div>
        </div>

        {saveMessage && (
          <div style={{
            background: '#065F46',
            color: '#ECFDF5',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: '700',
            border: '1px solid #059669',
            boxShadow: '0 2px 10px rgba(6, 95, 70, 0.25)'
          }}>
            {saveMessage}
          </div>
        )}
      </div>

      {/* Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Datos de Sesión Activa */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(15,23,42,0.03)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔑</span> Sesión Activa del Usuario
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Usuario Autenticado</span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>{session?.userName || 'Administrador'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Identificador de Usuario (ID)</span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>{session?.userId || '101'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Organización Activa (ID)</span>
              <span style={{ fontSize: '0.88rem', color: '#0284C7', fontWeight: '700' }}>Org #{session?.organizationId || session?.orgId || '11'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Rol Asignado (ID)</span>
              <span style={{ fontSize: '0.88rem', color: '#D97706', fontWeight: '700' }}>Rol #{session?.roleId || '102'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Almacén Asignado (ID)</span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>Almacén #{session?.warehouseId || '103'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Idioma de Interfaz</span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>{session?.language || 'en_US'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Fecha / Hora de Conexión</span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
                {session?.loginAt ? new Date(session.loginAt).toLocaleString() : 'Sesión activa'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Blindaje de Servidor y Conectividad */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(15,23,42,0.03)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛡️</span> Servidor Central & Blindaje de Conexión
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4' }}>
            Esta dirección se almacena de forma segura en este panel y <b>nunca se muestra en la pantalla de inicio de sesión</b> para proteger la infraestructura contra atacantes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Dirección URL del Servidor Corporativo
              </label>
              <input
                type="text"
                value={config.serverUrl}
                onChange={(e) => handleChange('serverUrl', e.target.value)}
                placeholder="https://servidor-corporativo.com:443"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* CORS Proxy Settings */}
            <div style={{ padding: '12px 14px', background: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B' }}>
                <input
                  type="checkbox"
                  checked={config.useCorsProxy}
                  onChange={(e) => handleChange('useCorsProxy', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#D97706', cursor: 'pointer' }}
                />
                <span>Habilitar Proxy CORS para peticiones HTTP/REST</span>
              </label>

              {config.useCorsProxy && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>
                    URL del Proxy CORS
                  </label>
                  <input
                    type="text"
                    value={config.corsProxyUrl}
                    onChange={(e) => handleChange('corsProxyUrl', e.target.value)}
                    placeholder="https://corsproxy.io/?"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Test Connection Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: testingConnection ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {testingConnection ? '⏳ Verificando...' : '📡 Probar Conectividad de Servidor'}
              </button>

              {connectionResult && (
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: connectionResult.success ? '#059669' : '#DC2626'
                }}>
                  {connectionResult.success ? '✓ ' : '✕ '}
                  {connectionResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Modo de Inicio de Sesión & Selección de Comportamiento */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(15,23,42,0.03)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Modo de Autenticación en Pantalla de Login
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4' }}>
            Define cómo se comportará la ventana de inicio de sesión cuando los usuarios ingresen sus credenciales.
          </p>

          <div style={{
            padding: '16px',
            background: config.loginMode === 'assisted' ? '#FEF3C7' : '#F8FAFC',
            borderRadius: '12px',
            border: `1.5px solid ${config.loginMode === 'assisted' ? '#F59E0B' : '#E2E8F0'}`,
            marginBottom: '16px'
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.loginMode === 'assisted'}
                onChange={(e) => handleChange('loginMode', e.target.checked ? 'assisted' : 'direct')}
                style={{ width: '18px', height: '18px', accentColor: '#D97706', marginTop: '2px', cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E293B', display: 'block' }}>
                  Habilitar Modo Asistido Multi-Tenant (Selección Dinámica)
                </span>
                <span style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', display: 'block', marginTop: '4px' }}>
                  {config.loginMode === 'assisted'
                    ? 'Activado: Al ingresar usuario y contraseña válidos, la pantalla de login guiará al usuario para elegir dinámicamente su Entidad (Tenant), Rol, Organización y Almacén.'
                    : 'Desactivado (1 Solo Paso): Al ingresar usuario y contraseña, el login se completará en 1 solo paso automático utilizando los parámetros predeterminados configurados a continuación.'}
                </span>
              </div>
            </label>
          </div>

          <div style={{
            padding: '12px 14px',
            background: '#F8FAFC',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>💡</span>
            <span>
              <b>Modo actual:</b> {config.loginMode === 'assisted' ? 'Asistido Multi-Tenant (Paso a Paso)' : 'Login Directo en 1 Paso (Sin fricciones)'}
            </span>
          </div>
        </div>

        {/* Card 4: Parámetros Predeterminados de Acceso */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(15,23,42,0.03)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏢</span> Parámetros Predeterminados de Conexión
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4' }}>
            Estos parámetros son utilizados automáticamente en el inicio de sesión de 1 solo paso y están ocultos del login público:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Tenant / Client ID
              </label>
              <input
                type="number"
                value={config.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Rol ID
              </label>
              <input
                type="number"
                value={config.roleId}
                onChange={(e) => handleChange('roleId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Organización ID
              </label>
              <input
                type="number"
                value={config.organizationId}
                onChange={(e) => handleChange('organizationId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Almacén ID
              </label>
              <input
                type="number"
                value={config.warehouseId}
                onChange={(e) => handleChange('warehouseId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Idioma Predeterminado
              </label>
              <select
                value={config.language}
                onChange={(e) => handleChange('language', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  background: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              >
                <option value="en_US">Inglés (en_US)</option>
                <option value="es_PE">Español Perú (es_PE)</option>
                <option value="es_ES">Español España (es_ES)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #E2E8F0',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 10px rgba(15,23,42,0.03)'
      }}>
        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
          * Los cambios se aplicarán inmediatamente a todos los próximos intentos de inicio de sesión en este dispositivo.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔄 Restablecer Predeterminados
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
            }}
          >
            💾 Guardar Configuración de Perfil
          </button>
        </div>
      </div>
    </div>
  );
}

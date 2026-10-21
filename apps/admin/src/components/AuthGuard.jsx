import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import LoginModal from './LoginModal';

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión almacenada
    const currentSession = authService.getSession();
    if (currentSession && currentSession.token) {
      setSession(currentSession);
    }
    setIsChecking(false);
  }, []);

  const handleLoginSuccess = (newSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    if (confirm('¿Deseas cerrar la sesión de iDempiere ERP y salir del Panel de Control?')) {
      authService.logout();
      setSession(null);
    }
  };

  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#141210',
        color: '#FFFFFF',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#F5A623' }}>
            Verificando sesión activa con iDempiere ERP...
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, renderizar la pantalla de Login
  if (!session || !session.token) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  // Si está autenticado, renderizar la consola pasando sesión y logout
  return typeof children === 'function' 
    ? children({ session, logout: handleLogout }) 
    : React.cloneElement(children, { session, logout: handleLogout });
}

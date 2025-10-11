import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/Auth';
import '../styles/theme.css';

export default function Unauthorized() {
  const navigate = useNavigate();
  const user = getUser();

  const handleGoBack = () => {
    if (user?.permisos?.includes('control_admin')) {
      navigate('/dashboard');
    } else if (user?.permisos?.includes('control_expedientes')) {
      navigate('/expedientes');
    } else if (user?.permisos?.includes('control_ordenes')) {
      navigate('/ordenes');
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '120px',
          marginBottom: '20px',
        }}
      >
        🚫
      </div>
      <h1
        style={{
          fontSize: '32px',
          marginBottom: '10px',
          color: 'var(--color-text-primary)',
        }}
      >
        Acceso denegado
      </h1>
      <p
        style={{
          fontSize: '18px',
          marginBottom: '30px',
          color: 'var(--color-text-secondary)',
        }}
      >
        No tienes permisos para acceder a este módulo.
      </p>
      <button
        onClick={handleGoBack}
        style={{
          padding: '12px 30px',
          fontSize: '16px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--color-primary-dark)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--color-primary)';
        }}
      >
        Volver al inicio
      </button>
    </div>
  );
}

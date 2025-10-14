import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import '../styles/login.css';
import logo from '../assets/logo.jpg';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 🧩 URL del backend obtenida de las variables de entorno (.env.production)
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ Ahora la URL se arma dinámicamente desde el entorno
      const res = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });

      if (res.data.ok) {
        const { token, user } = res.data;

        if (!token) {
          setError('Token no recibido del servidor');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        switch (user.roleId) {
          case 1:
            navigate('/dashboard');
            break;
          case 2:
            navigate('/expedientes');
            break;
          case 3:
            navigate('/ordenes');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(res.data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      {/* Iconos flotantes decorativos */}
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>
      <div className="decoration-circle circle-4"></div>
      <div className="decoration-circle circle-5"></div>

      <div className="decoration-glasses glasses-1">👓</div>
      <div className="decoration-glasses glasses-2">🥽</div>
      <div className="decoration-glasses glasses-3">👓</div>
      <div className="decoration-glasses glasses-4">🥽</div>
      <div className="decoration-glasses glasses-5">👓</div>

      <div className="decoration-tools tool-1">🔧</div>
      <div className="decoration-tools tool-2">⚙️</div>
      <div className="decoration-tools tool-3">🔨</div>
      <div className="decoration-tools tool-4">🛠️</div>

      {/* Panel Izquierdo */}
      <div className="login-left">
        <img src={logo} alt="Logo Óptica" className="login-logo" />
      </div>

      {/* Panel Derecho */}
      <div className="login-right">
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="login-title">Iniciar Sesión</h2>

          {error && <div className="error-message">{error}</div>}

          <InputField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
            required
          />
          <InputField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />

          <a href="#" className="login-link">
            ¿Olvidaste tu contraseña?
          </a>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

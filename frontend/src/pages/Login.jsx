import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import "../styles/login.css";
import logo from "../assets/logo.jpg";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    setError("");

   try {
      // Llamada al backend para login
      const res = await axios.post("http://localhost:4000/api/login", {
        username,
        password,
      });

      if (res.data.ok) {
        const user = res.data.user;

        // Guardar token o información de sesión si es necesario
        localStorage.setItem("user", JSON.stringify(user));

        // Redirección según rol
        switch (user.fk_id_role) {
          case 1: // Administrador
            navigate("/dashboard");
            break;
          case 2: // Optometrista
            navigate("/expedientes");
            break;
          case 3: // Atención Ordenes
            navigate("/ordenes");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        setError(res.data.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-container">
      {/* Panel Izquierdo */}
      <div className="login-left">
        <img src={logo} alt="Logo Óptica" className="login-logo" />
      </div>

      {/* Panel Derecho */}
      <div className="login-right">
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="login-title">Iniciar Sesión</h2>

          <InputField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
          />
          <InputField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
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



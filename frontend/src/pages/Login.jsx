import React from "react";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
        <h1 className="text-xl font-bold mb-4">Inicio de sesión</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full rounded-xl px-4 py-2 bg-blue-600 text-white hover:opacity-90"
        >
          Entrar (dummy)
        </button>
      </div>
    </div>
  );
}


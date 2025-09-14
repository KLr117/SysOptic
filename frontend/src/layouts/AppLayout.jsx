import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { logout, getUser } from "../utils/Auth"; // importar utilidades

export default function AppLayout() {
  const user = getUser();

  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // redirige al login
  }

  <span className="text-sm text-gray-600">
    {user ? `Panel: ${user.username}` : "Panel"}
  </span>


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 text-lg font-bold">SysOptic</div>
        <nav className="px-2 space-y-1">
          <Item to="/dashboard" label="Dashboard" />
          <Item to="/admin" label="Panel de Administracion" />
          <Item to="/ordenes" label="Orden de Trabajo" />  
          <Item to="/expedientes" label="Expedientes de Pacientes" />

        </nav>
      </aside>

       <main className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <span className="text-sm text-gray-600">
            {user ? `Hola, ${user.username}` : "Panel"}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg"
          >
            Cerrar sesión
          </button>
        </header>
        <div className="p-4 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-xl ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`
      }
    >
      {label}
    </NavLink>
  );
}

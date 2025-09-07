import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 text-lg font-bold">SysOptic</div>
        <nav className="px-2 space-y-1">
          <Item to="/dashboard" label="Dashboard" />
          <Item to="/settings" label="Configuración" />
          <Item to="/ordenes" label="Orden de Trabajo" />  

        </nav>
      </aside>

      <main className="flex-1">
        <header className="h-14 bg-white border-b flex items-center px-4">
          <span className="text-sm text-gray-600">Panel (dummy)</span>
        </header>
        <div className="p-4">
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

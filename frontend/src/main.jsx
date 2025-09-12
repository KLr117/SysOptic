import React from "react";
import ReactDOM from "react-dom/client";
import Ordenes from "./pages/OrdenTrabajo";
import EditarOrdenTrabajo from "./pages/EditarOrdenTrabajo";
import AgregarOrdenTrabajo from "./pages/AgregarOrdenTrabajo";
import VerOrdenTrabajo from "./pages/VerOrdenTrabajo";
import ProtectedRoute from "./components/ProtectedRoute";


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";

import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Expedientes from "./pages/Expedientes";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/editar-orden-trabajo" element={<EditarOrdenTrabajo />} />
            <Route path="/agregar-orden-trabajo" element={<AgregarOrdenTrabajo />} />
            <Route path="/ver-orden-trabajo/:id" element={<VerOrdenTrabajo />} />
            <Route path="/expedientes" element={<Expedientes />} />
          </Route>
        </Route>

        {/* cualquier otra URL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


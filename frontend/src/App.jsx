import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// =========================================================
// PRODUCTOS / ADMIN
// =========================================================

import ProductosAdmin from "./pages/productos/ProductosAdmin";
import CrearProducto from "./pages/productos/CrearProducto";
import InventarioPrendas from "./pages/productos/InventarioPrendas";
import PanelControl from "./pages/productos/PanelControl";
import GestionUsuarios from "./pages/productos/GestionUsuarios";
import PanelEmpleado from './pages/productos/PanelEmpleado';

// =========================================================
// AUTENTICACIÓN
// =========================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// =========================================================
// CATÁLOGO
// =========================================================

import Catalogo from "./pages/catalogo/Catalogo";
import Reportes from "./pages/catalogo/Reportes";
import PersonalizarEstampado from "./pages/catalogo/PersonalizarEstampado";

// =========================================================
// APP
// =========================================================

export default function App() {
  return (
    <Router>
      <Routes>

        {/* =====================================================
            VISTA PRINCIPAL
        ====================================================== */}

        <Route
          path="/"
          element={<ProductosAdmin />}
        />


        {/* =====================================================
            CATÁLOGO / TIENDA
        ====================================================== */}

        <Route
          path="/catalogo"
          element={<Catalogo />}
        />


        {/* =====================================================
            PERSONALIZAR ESTAMPADO
        ====================================================== */}

        <Route
          path="/personalizar-estampado"
          element={<PersonalizarEstampado />}
        />


        {/* =====================================================
            REPORTES / HISTORIAL DE PEDIDOS
        ====================================================== */}

        <Route
          path="/historial-pedidos"
          element={<Reportes />}
        />


        {/* =====================================================
            AUTENTICACIÓN
        ====================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/recuperar-password"
          element={<ForgotPassword />}
        />


        {/* =====================================================
            PANEL DE CONTROL
        ====================================================== */}

        <Route
          path="/panel"
          element={<PanelControl />}
        />
        <Route
    path="/panel-empleado"
    element={<PanelEmpleado />}
/>


        {/* =====================================================
            GESTIÓN DE USUARIOS
        ====================================================== */}

        <Route
          path="/gestion-usuarios"
          element={<GestionUsuarios />}
        />


        {/* =====================================================
            CREAR PRODUCTO
        ====================================================== */}

        <Route
          path="/crear-producto"
          element={<CrearProducto />}
        />

        <Route
          path="/admin/crear-producto"
          element={<CrearProducto />}
        />


        {/* =====================================================
            INVENTARIO
        ====================================================== */}

        <Route
          path="/inventario"
          element={<InventarioPrendas />}
        />


        {/* =====================================================
            RUTA DESCONOCIDA
            SI NO EXISTE LA RUTA, VUELVE AL INICIO
        ====================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </Router>
  );
}


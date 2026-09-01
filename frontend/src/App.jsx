import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProductosAdmin from "./pages/productos/ProductosAdmin";
import CrearProducto from "./pages/productos/CrearProducto";
import InventarioPrendas from "./pages/productos/InventarioPrendas";
import PanelControl from "./pages/productos/PanelControl";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Catalogo from "./pages/catalogo/Catalogo";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Vista Principal */}
        <Route path="/" element={<ProductosAdmin />} />
        
        {/* Catálogo / Tienda */}
        <Route path="/catalogo" element={<Catalogo />} />
        
        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-password" element={<ForgotPassword />} />
        
        {/* Panel de Control */}
        <Route path="/panel" element={<PanelControl />} />
        
        {/* Crear Producto */}
        <Route path="/crear-producto" element={<CrearProducto />} />
        <Route path="/admin/crear-producto" element={<CrearProducto />} />
        
        {/* Inventario */}
        <Route path="/inventario" element={<InventarioPrendas />} />

        {/* Redirección por si escriben una URL desconocida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
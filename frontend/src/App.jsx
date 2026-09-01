import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductosAdmin from "./pages/productos/ProductosAdmin";
import CrearProducto from "./pages/productos/CrearProducto";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from './pages/auth/ForgotPassword';
import Catalogo from "./pages/catalogo/Catalogo";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* La raíz muestra la landing page / vista principal */}
        <Route path="/" element={<ProductosAdmin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-password" element={<ForgotPassword />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/admin/productos" element={<ProductosAdmin />} />
        
        {/* Ruta para registrar nuevos productos en el backend */}
        <Route path="/admin/crear-producto" element={<CrearProducto />} />
      </Routes>
    </Router>
  );
}
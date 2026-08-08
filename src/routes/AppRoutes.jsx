import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import NewProduct from "../pages/NewProduct";
import ProductDetail from "../pages/ProductDetail";
import Inventory from "../pages/Inventory";
import Sales from "../pages/Sales";
import Purchases from "../pages/Purchases";
import Suppliers from "../pages/Suppliers";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import ImportProducts from "../pages/ImportProducts";
import NewVariant from "../pages/NewVariant";

// 🛡️ Componente Guardián de Rutas
const ProtectedRoute = ({ allowedRoles }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role ? user.role.toUpperCase() : null;

  // 1. Si no hay usuario en localStorage, lo mandamos al Login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. Definir a dónde redirigir si intenta entrar a una ruta no permitida
  const isAdmin = userRole === "ADMIN" || userRole === "ADMINISTRADOR";
  const fallbackPath = isAdmin ? "/" : "/sales";

  // 3. Si el rol del usuario está permitido, renderiza la ruta (<Outlet />); de lo contrario, redirige
  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to={fallbackPath} replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔑 Ruta pública de Login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas con el layout principal (Menú lateral, Navbar, etc.) */}
      <Route path="/" element={<MainLayout />}>

        {/* 🔓 RUTAS PERMITIDAS TANTO PARA CAJEROS COMO PARA ADMINS */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ADMINISTRADOR", "CASHIER", "CAJERO"]} />}>
          <Route path="sales" element={<Sales />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
        </Route>

        {/* 🔒 RUTAS EXCLUSIVAS PARA ADMINISTRADORES */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ADMINISTRADOR"]} />}>
          <Route index element={<Dashboard />} />
          <Route path="products/new" element={<NewProduct />} />
          <Route path="products/:id/variant/new" element={<NewVariant />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="import" element={<ImportProducts />} />
        </Route>

      </Route>

      {/* Redirección para cualquier ruta desconocida */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
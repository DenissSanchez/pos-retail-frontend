// src/components/Sidebar.jsx
import {
  Dashboard,
  Inventory2,
  ShoppingCart,
  Assessment,
  Settings,
  Category,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import { NavLink } from "react-router-dom";

const drawerWidth = 250;

// Paleta de colores de Casa Orquidia
const themeColors = {
  bgSidebar: "#5B2C83",       // Morado oscuro principal
  activeItem: "#4A226D",      // Morado más profundo para la opción activa
  activeBorder: "#D8C5ED",    // Borde lila pastel resaltado
  hoverItem: "rgba(255, 255, 255, 0.08)", // Efecto hover suave
  textPrimary: "#FFFFFF",     // Texto blanco
  textSecondary: "#E2D4F0",   // Texto lila claro inactivo
  divider: "rgba(255, 255, 255, 0.15)", // Divisor sutil
};

// 🔑 Declaración de menú con matriz de roles con acceso
const menu = [
  { text: "Dashboard", icon: <Dashboard />, path: "/", roles: ["ADMIN"] },
  { text: "Productos", icon: <Category />, path: "/products", roles: ["ADMIN", "CASHIER", "CAJERO"] },
  { text: "Inventario", icon: <Inventory2 />, path: "/inventory", roles: ["ADMIN"] },
  { text: "Ventas", icon: <ShoppingCart />, path: "/sales", roles: ["ADMIN", "CASHIER", "CAJERO"] },
  { text: "Reportes", icon: <Assessment />, path: "/reports", roles: ["ADMIN"] },
  { text: "Configuración", icon: <Settings />, path: "/settings", roles: ["ADMIN"] },
];

export default function Sidebar() {
  // 1. Obtener información de rol del usuario
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = (user.role || "").toUpperCase();

  // 2. Filtrar únicamente los ítems a los que tiene permiso
  const visibleMenu = menu.filter((item) => item.roles.includes(userRole));

  return (
    <Box
      sx={{
        width: drawerWidth,
        minHeight: "100vh",
        backgroundColor: themeColors.bgSidebar,
        color: themeColors.textPrimary,
        position: "sticky",
        top: 0,
        boxShadow: "4px 0px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "center", py: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: 1,
            color: themeColors.textPrimary,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Casa Orquidia
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: themeColors.divider, my: 0.5 }} />

      <List sx={{ px: 1.5, py: 1 }}>
        {visibleMenu.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
            sx={{
              color: themeColors.textSecondary,
              borderRadius: "12px",
              mb: 0.8,
              py: 1.2,
              transition: "all 0.2s ease-in-out",

              // Estado Activo (Al estar seleccionado)
              "&.active": {
                backgroundColor: themeColors.activeItem,
                color: themeColors.textPrimary,
                fontWeight: "bold",
                borderLeft: `4px solid ${themeColors.activeBorder}`,
                boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                "& .MuiListItemIcon-root": {
                  color: themeColors.textPrimary,
                },
              },

              // Estado Hover
              "&:hover": {
                backgroundColor: themeColors.hoverItem,
                color: themeColors.textPrimary,
                "& .MuiListItemIcon-root": {
                  color: themeColors.textPrimary,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: themeColors.textSecondary, minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText 
              primary={item.text} 
              slotProps={{
                primary: { fontSize: '0.95rem', fontWeight: 500 }
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
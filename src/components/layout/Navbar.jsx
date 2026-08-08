import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Tooltip,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import LockClockIcon from "@mui/icons-material/LockClock";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar({ onOpenCloseModal, onLogout }) {
  // 1. Obtener usuario de localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  
  const firstName = user.firstName || "Usuario";
  const initial = firstName.charAt(0).toUpperCase();
  const userRole = (user.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN" || userRole === "ADMINISTRADOR";

  return (
    <AppBar
      position="static"
      elevation={1}
      color="inherit"
    >
      <Toolbar>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          Sistema Punto de Venta
        </Typography>

        {/* 🔒 Botón para Cerrar Caja (SOLO SE MUESTRA A CAJEROS) */}
        {!isAdmin && (
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<LockClockIcon />}
            onClick={onOpenCloseModal}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              mr: 1,
            }}
          >
            Cerrar Caja
          </Button>
        )}

        {/* Notificaciones */}
        <IconButton>
          <NotificationsIcon />
        </IconButton>

        {/* Información del Usuario y Salir */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            ml: 2,
          }}
        >
          <Typography fontWeight={500}>
            {firstName}
          </Typography>

          <Avatar sx={{ width: 34, height: 34, bgcolor: "#5B2C83" }}>
            {initial}
          </Avatar>

          {/* Botón de Salir (Logout) */}

        </Box>

      </Toolbar>
    </AppBar>
  );
}
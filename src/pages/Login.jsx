import React, { useState } from "react";
import { 
  Box, Card, CardContent, TextField, Button, Typography, 
  MenuItem, Select, FormControl, InputLabel, InputAdornment 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Ajusta este puerto al de tu backend (usualmente 5000 o el configurado en tu app.js)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Login() {
  const navigate = useNavigate();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Datos tras autenticar
  const [userData, setUserData] = useState(null);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedRegister, setSelectedRegister] = useState("");
  const [initialCash, setInitialCash] = useState("");
  
  const [step, setStep] = useState(1); // 1: Login credenciales, 2: Selección de caja
  const [loading, setLoading] = useState(false);

  // 🔑 PASO 1: Validar Email y Contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const user = res.data.user;
      const roleName = user.role.name ? user.role.name.toUpperCase() : user.role.toUpperCase();

      // Guardar información básica de usuario y token
      localStorage.setItem("user", JSON.stringify(user));
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // 🛡️ REGLA DE NEGOCIO: Si es ADMIN, entra directo
      if (roleName === "ADMIN" || roleName === "ADMINISTRADOR") {
        navigate("/"); // Redirigir al Dashboard principal
      } else {
        // 🏪 Si es Cajero, guardamos sus datos y pasamos al Paso 2
        setUserData(user);
        setStep(2);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 PASO 2: Abrir Caja (Exclusivo para Cajeros)
  const handleStartShift = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Petición al endpoint de sesiones de caja
      const res = await axios.post(
        `${API_BASE_URL}/sessions/open`,
        {
          registerId: selectedRegister,
          userId: userData.id,
          initialCash: parseFloat(initialCash || 0),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Guardar la sesión de caja activa y la sucursal
      const sessionId = res.data.session?.id || res.data.id;
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("storeId", selectedStore);

      navigate("/sales"); // Redirigir directamente al POS/Ventas
    } catch (error) {
      alert(error.response?.data?.message || "Error al abrir la caja");
    } finally {
      setLoading(false);
    }
  };

  // Obtener las cajas de la tienda seleccionada
  const activeStoreObj = userData?.stores?.find((s) => s.id === selectedStore);
  const availableRegisters = activeStoreObj?.registers || [];

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        bgcolor: "#f4f6f8" 
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", p: 2, borderRadius: "16px", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" color="#5B2C83" align="center" gutterBottom>
            POS Retail
          </Typography>

          {/* ---------------- PASO 1: FORMULARIO DE LOGIN ---------------- */}
          {step === 1 && (
            <form onSubmit={handleLogin}>
              <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Iniciar Sesión
              </Typography>

              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, py: 1.2, bgcolor: "#5B2C83", borderRadius: "10px", fontWeight: "bold" }}
              >
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
          )}

          {/* ---------------- PASO 2: APERTURA DE CAJA (SOLO CAJEROS) ---------------- */}
          {step === 2 && (
            <form onSubmit={handleStartShift}>
              <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mb: 1 }}>
                Apertura de Turno
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Hola {userData?.firstName}, selecciona tu caja asignada:
              </Typography>

              {/* Selección de Sucursal */}
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={selectedStore}
                  label="Sucursal"
                  onChange={(e) => {
                    setSelectedStore(e.target.value);
                    setSelectedRegister(""); // Reiniciar caja seleccionada
                  }}
                >
                  {userData?.stores?.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selección de Caja Registradora */}
              <FormControl fullWidth margin="normal" required disabled={!selectedStore}>
                <InputLabel>Caja Registradora</InputLabel>
                <Select
                  value={selectedRegister}
                  label="Caja Registradora"
                  onChange={(e) => setSelectedRegister(e.target.value)}
                >
                  {availableRegisters.map((reg) => (
                    <MenuItem key={reg.id} value={reg.id}>
                      {reg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Fondo Inicial de Efectivo */}
              <TextField
                fullWidth
                label="Monto Inicial en Caja"
                type="number"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                margin="normal"
                required
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="warning"
                disabled={loading}
                sx={{ mt: 3, py: 1.2, borderRadius: "10px", fontWeight: "bold" }}
              >
                {loading ? "Abriendo Caja..." : "Abrir Caja y Comenzar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
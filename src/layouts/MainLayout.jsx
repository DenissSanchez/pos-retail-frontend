import React, { useState } from "react";
import { Box, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import CloseSessionModal from "../components/CloseSessionModal";
import CashTicket from "../components/CashTicket";

const getStoredSessionId = () => {
  const directId = localStorage.getItem("sessionId");
  if (directId) return directId;

  try {
    const userStr = localStorage.getItem("user");
    const parsedUser = userStr ? JSON.parse(userStr) : null;
    return parsedUser?.sessionId || parsedUser?.activeSession?.id || null;
  } catch {
    return null;
  }
};

export default function MainLayout() {
  const navigate = useNavigate();
  const [openCloseModal, setOpenCloseModal] = useState(false);
  
  // Estado para desplegar el ticket una vez cerrada la caja con éxito
  const [closedSessionData, setClosedSessionData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [openTicketModal, setOpenTicketModal] = useState(false);

  // Recuperamos el ID de la sesión activa
  const sessionId = getStoredSessionId();
  const activeSession = sessionId ? { id: sessionId } : null;

  // Disparador del modal de cierre
  const handleOpenCloseModal = () => {
    const currentSessionId = getStoredSessionId();
    if (!currentSessionId) {
      alert("No se encontró una sesión de caja activa.");
      return;
    }
    setOpenCloseModal(true);
  };

  // 1. Salir (logout para admin)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("storeId");
    navigate("/login", { replace: true });
  };

  // 2. Callback cuando la caja se cierra con éxito
  const handleSessionClosedSuccess = (closedSession, summary) => {
    setClosedSessionData(closedSession);
    setSummaryData(summary);
    setOpenCloseModal(false);
    localStorage.removeItem("sessionId");
    
    // Abrimos el modal con el ticket listo para imprimir
    setOpenTicketModal(true);
  };

  // 3. Finalizar flujo tras ver/imprimir el ticket
  const handleFinishAndLogout = () => {
    localStorage.clear();
    setOpenTicketModal(false);
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Barra lateral */}
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#f4f6f8",
        }}
      >
        {/* Navbar con las acciones pasadas por props */}
        <Navbar onOpenCloseModal={handleOpenCloseModal} onLogout={handleLogout} />

        {/* Contenido dinámico de las rutas hijas */}
        <Box sx={{ p: 4, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Modal interactivo de Arqueo y Cierre de Caja */}
      <CloseSessionModal
        open={openCloseModal}
        onClose={() => setOpenCloseModal(false)}
        activeSession={activeSession}
        onSuccess={handleSessionClosedSuccess}
      />

      {/* Modal de Confirmación e Impresión de Ticket Z */}
      <Dialog open={openTicketModal} maxWidth="xs" fullWidth disableEscapeKeyDown>
        <DialogContent>
          <CashTicket sessionData={closedSessionData} summaryData={summaryData} />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center" }} className="no-print">
          <Button onClick={handleFinishAndLogout} variant="contained" color="primary">
            Finalizar y Salir al Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
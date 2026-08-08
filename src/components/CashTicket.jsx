import React from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

export default function CashTicket({ sessionData, summaryData }) {
  if (!sessionData) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount || 0);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString("es-MX") : "-";

  const handlePrint = () => {
    window.print();
  };

  // Unificar si los datos vienen directamente de sessionData o del summaryData
  const source = summaryData || sessionData;

  const diff = parseFloat(sessionData.difference || sessionData.cashDifference || 0);

  // Mapeo alineado a la respuesta del backend
  const paidCash = parseFloat(source.paidCash || source.salesCash || 0);
  const paidCard = parseFloat(source.paidCard || source.salesCard || 0);
  const paidTransfer = parseFloat(source.paidTransfer || source.salesTransfer || 0);
  const totalDiscounts = parseFloat(source.totalDiscounts || 0);

  const totalSales = source.totalSales 
    ? parseFloat(source.totalSales) 
    : (paidCash + paidCard + paidTransfer);

  return (
    <Box>
      {/* Botón visible solo en pantalla */}
      <Button
        variant="contained"
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        className="no-print"
        sx={{ mb: 2 }}
        fullWidth
      >
        Imprimir Ticket Z
      </Button>

      {/* ÁREA DEL TICKET TÉRMICO */}
      <Box
        className="printable-ticket"
        sx={{
          width: "280px", // Formato estándar de 80mm
          margin: "0 auto",
          padding: "10px",
          fontFamily: "'Courier New', Courier, monospace",
          backgroundColor: "#fff",
          color: "#000",
          fontSize: "12px",
          lineHeight: "1.3",
        }}
      >
        {/* Encabezado */}
        <Typography align="center" fontWeight="bold" sx={{ fontSize: "15px" }}>
          CORTE DE CAJA (TICKET Z)
        </Typography>
        <Typography align="center" sx={{ fontSize: "11px", mb: 1 }}>
          *** RESUMEN DE CIERRE ***
        </Typography>

        <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />

        {/* Datos Generales */}
        <Box display="flex" justifyContent="space-between">
          <span>Fecha Cierre:</span>
        </Box>
        <Typography align="right" sx={{ fontSize: "11px", fontWeight: "bold" }}>
          {formatDate(sessionData.closedAt || new Date())}
        </Typography>

        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <span>Apertura:</span>
          <span>{formatDate(sessionData.openedAt || sessionData.createdAt)}</span>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <span>Cajero:</span>
          <span>
            {sessionData.user
              ? `${sessionData.user.firstName || ""} ${sessionData.user.lastName || ""}`
              : "Denis"}
          </span>
        </Box>

        <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />

        {/* Desglose de Cifras */}
        <Box display="flex" justifyContent="space-between">
          <span>(+) Fondo Inicial:</span>
          <span>{formatCurrency(sessionData.initialCash)}</span>
        </Box>

        {/* Desglose por Método de Pago */}
        <Box display="flex" justifyContent="space-between">
          <span>(+) Ventas Efectivo:</span>
          <span>{formatCurrency(paidCash)}</span>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <span>(+) Ventas Tarjeta:</span>
          <span>{formatCurrency(paidCard)}</span>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <span>(+) Ventas Transfer:</span>
          <span>{formatCurrency(paidTransfer)}</span>
        </Box>

        {totalDiscounts > 0 && (
          <Box display="flex" justifyContent="space-between" sx={{ color: "#444" }}>
            <span>(-) Descuentos Aplicados:</span>
            <span>{formatCurrency(totalDiscounts)}</span>
          </Box>
        )}

        <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />

        <Box display="flex" justifyContent="space-between" fontWeight="bold">
          <span>TOTAL VENTAS:</span>
          <span>{formatCurrency(totalSales)}</span>
        </Box>

        <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />

        {/* Totales Arqueo */}
        <Box display="flex" justifyContent="space-between" fontWeight="bold">
          <span>EFECTIVO ESPERADO:</span>
          <span>{formatCurrency(sessionData.expectedCash)}</span>
        </Box>

        <Box display="flex" justifyContent="space-between" fontWeight="bold">
          <span>EFECTIVO CONTADO:</span>
          <span>{formatCurrency(sessionData.finalCash)}</span>
        </Box>

        <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />

        {/* Balance / Diferencia */}
        <Box display="flex" justifyContent="space-between" fontWeight="bold" sx={{ fontSize: "13px" }}>
          <span>DIFERENCIA:</span>
          <span>{formatCurrency(diff)}</span>
        </Box>
        <Typography align="center" fontWeight="bold" mt={0.5}>
          STATUS: {diff === 0 ? "CAJA CUADRADA" : diff < 0 ? "FALTANTE" : "SOBRANTE"}
        </Typography>

        {/* Observaciones */}
        {sessionData.notes && (
          <>
            <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />
            <Typography sx={{ fontSize: "11px" }}>
              <strong>Notas:</strong> {sessionData.notes}
            </Typography>
          </>
        )}

        <Divider sx={{ borderStyle: "dashed", my: 1, borderColor: "#000" }} />

        {/* Firma */}
        <Box mt={4} textAlign="center">
          <Typography sx={{ fontSize: "11px" }}>___________________________</Typography>
          <Typography sx={{ fontSize: "11px" }}>Firma del Cajero</Typography>
        </Box>

        <Typography align="center" sx={{ fontSize: "10px", mt: 2 }}>
          PosRetail v1.0
        </Typography>
      </Box>

      {/* Reglas de Impresión CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .printable-ticket, .printable-ticket * {
            visibility: visible;
          }

          .no-print {
            display: none !important;
          }

          .printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 80mm !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>
    </Box>
  );
}
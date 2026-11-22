import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as TransferIcon,
  PointOfSale as PosIcon,
  ReceiptLong as SummaryIcon,
  CallSplit as MixedIcon,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = import.meta.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/sessions`
  : "http://localhost:3000/api/sessions";

const buildEmptySummary = (session) => {
  const initialCash = Number(session?.initialCash ?? session?.openingAmount ?? 0);
  return {
    initialCash,
    paidCash: 0,
    paidCard: 0,
    paidTransfer: 0,
    salesMixed: 0,
    totalSales: 0,
    totalTransactions: 0,
    expectedCash: initialCash,
  };
};

const normalizeSummary = (rawData, session) => {
  const base = buildEmptySummary(session);
  const raw = rawData?.data ?? rawData ?? {};

  const initialCash = Number(raw.initialCash ?? raw.openingAmount ?? base.initialCash);
  const paidCash = Number(raw.paidCash ?? raw.cashSales ?? 0);
  const paidCard = Number(raw.paidCard ?? raw.cardSales ?? 0);
  const paidTransfer = Number(raw.paidTransfer ?? raw.transferSales ?? 0);
  const salesMixed = Number(raw.salesMixed ?? raw.mixedSales ?? 0);
  const totalSales = Number(raw.totalSales ?? 0);
  const totalTransactions = Number(raw.totalTransactions ?? raw.salesCount ?? 0);
  const expectedCash = Number(raw.expectedCash ?? initialCash + paidCash);

  return {
    initialCash: Number.isFinite(initialCash) ? initialCash : 0,
    paidCash: Number.isFinite(paidCash) ? paidCash : 0,
    paidCard: Number.isFinite(paidCard) ? paidCard : 0,
    paidTransfer: Number.isFinite(paidTransfer) ? paidTransfer : 0,
    salesMixed: Number.isFinite(salesMixed) ? salesMixed : 0,
    totalSales: Number.isFinite(totalSales) ? totalSales : 0,
    totalTransactions: Number.isFinite(totalTransactions) ? totalTransactions : 0,
    expectedCash: Number.isFinite(expectedCash) ? expectedCash : 0,
  };
};

export default function CloseSessionModal({ open, onClose, activeSession, onSuccess }) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [finalCash, setFinalCash] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && activeSession?.id) {
      fetchSummary(activeSession.id);
    } else {
      resetForm();
    }
  }, [open, activeSession]);

  const fetchSummary = async (sessionId) => {
    setLoadingSummary(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/${sessionId}/summary`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("Resumen recibido del backend:", response.data);
      setSummary(normalizeSummary(response.data, activeSession));
    } catch (err) {
      console.error("Error al obtener resumen de caja:", err);

      // Si el backend indica que no hay movimientos/resumen (404), permitimos cerrar con ceros y fondo inicial
      if (err.response?.status === 404) {
        setSummary(buildEmptySummary(activeSession));
      } else {
        setError("No se pudieron cargar los datos del resumen del turno.");
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  const resetForm = () => {
    setSummary(null);
    setFinalCash("");
    setNotes("");
    setError(null);
  };

  const expectedCash = summary ? Number(summary.expectedCash || 0) : 0;
  const parsedFinalCash = parseFloat(finalCash);
  const hasValidCashInput = finalCash !== "" && !Number.isNaN(parsedFinalCash) && parsedFinalCash >= 0;
  const countedCash = hasValidCashInput ? parsedFinalCash : 0;
  const difference =
    finalCash !== "" && !Number.isNaN(parsedFinalCash)
      ? Math.round((parsedFinalCash - expectedCash) * 100) / 100
      : 0;

  const handleCloseSession = async () => {
    if (finalCash === "" || Number.isNaN(parsedFinalCash) || parsedFinalCash < 0) {
      setError("Debes ingresar un monto de efectivo contado válido (0 o mayor).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/${activeSession.id}/close`,
        {
          finalCash: countedCash,
          notes: notes.trim(),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (onSuccess) {
        onSuccess(response.data.session, response.data.summary || summary);
      }
      onClose();
    } catch (err) {
      console.error("Error al cerrar caja:", err);
      setError(err.response?.data?.message || "Ocurrió un error al procesar el cierre de caja.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount || 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <SummaryIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Cierre y Arqueo de Caja
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sesión ID: {activeSession?.id?.substring(0, 8)}...
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={submitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingSummary ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={6}>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Calculando totales y desglose de ventas...
            </Typography>
          </Box>
        ) : summary ? (
          <Grid container spacing={2}>
            {summary.totalTransactions === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No se registraron ventas en este turno. Puedes cerrar la caja confirmando el efectivo en cajón.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                RESUMEN DE OPERACIONES DEL TURNO
              </Typography>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Card variant="outlined" sx={{ bgcolor: "background.default", height: "100%" }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Fondo Inicial
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {formatCurrency(summary.initialCash)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Card variant="outlined" sx={{ bgcolor: "background.default", height: "100%" }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MoneyIcon color="success" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Efectivo
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(summary.paidCash)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Card variant="outlined" sx={{ bgcolor: "background.default", height: "100%" }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CardIcon color="info" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Tarjeta
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(summary.paidCard)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Card variant="outlined" sx={{ bgcolor: "background.default", height: "100%" }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TransferIcon color="warning" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Transferencia
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(summary.paidTransfer)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Card variant="outlined" sx={{ bgcolor: "background.default", height: "100%" }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MixedIcon color="secondary" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Mixto
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(summary.salesMixed)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{ bgcolor: "action.hover", borderRadius: 2 }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Total de Ventas Realizadas ({summary.totalTransactions} ventas):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(summary.totalSales)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box p={2} border="1px solid" borderColor="divider" borderRadius={2} height="100%">
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom display="flex" alignItems="center" gap={1}>
                  <PosIcon /> CONTEO EN CAJÓN FÍSICO
                </Typography>

                <Box my={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Efectivo esperado en caja (Fondo + Ventas en Efectivo):
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(expectedCash)}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Efectivo contado físicamente"
                  variant="outlined"
                  type="number"
                  placeholder="0.00"
                  value={finalCash}
                  onChange={(e) => setFinalCash(e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>$</Typography>,
                  }}
                  autoFocus
                  sx={{ mt: 1 }}
                />

                {summary.totalTransactions === 0 && (
                  <Box mt={1} display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setFinalCash(String(expectedCash))}
                    >
                      Usar esperado ({formatCurrency(expectedCash)})
                    </Button>
                    {expectedCash !== 0 && (
                      <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        onClick={() => setFinalCash("0")}
                      >
                        Poner $0
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box p={2} border="1px solid" borderColor="divider" borderRadius={2} height="100%" display="flex" flexDirection="column" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                  RESULTADO DEL ARQUEO
                </Typography>

                {finalCash === "" ? (
                  <Box py={2} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Ingresa el efectivo contado para calcular sobrantes o faltantes.
                    </Typography>
                  </Box>
                ) : (
                  <Box textAlign="center" py={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Diferencia
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={difference === 0 ? "success.main" : difference > 0 ? "info.main" : "error.main"}
                    >
                      {formatCurrency(difference)}
                    </Typography>

                    <Box mt={1}>
                      {difference === 0 && (
                        <Chip label="Caja Cuadrada Exacta" color="success" size="small" />
                      )}
                      {difference > 0 && (
                        <Chip label={`Sobrante de ${formatCurrency(difference)}`} color="info" size="small" />
                      )}
                      {difference < 0 && (
                        <Chip label={`Faltante de ${formatCurrency(Math.abs(difference))}`} color="error" size="small" />
                      )}
                    </Box>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Notas / Observaciones del Cierre"
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Ej: Turno sin ventas / justificación de diferencia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleCloseSession}
          variant="contained"
          color="error"
          disabled={submitting || loadingSummary || !summary}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <PosIcon />}
        >
          {submitting ? "Cerrando Caja..." : "Confirmar y Cerrar Caja"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  Tooltip,
} from "@mui/material";
import {
  PointOfSale as PosIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as OkIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import CashTicket from "../components/CashTicket";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000/api";

export default function CashHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el modal de reimpresión de ticket
  const [selectedSession, setSelectedSession] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Filtros de fecha
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_BASE_URL}/sessions/history`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setHistory(response.data);
    } catch (err) {
      console.error("Error al obtener el historial de cajas:", err);
      setError("No se pudieron cargar los reportes de cierre de caja.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const handleOpenTicket = (session) => {
    setSelectedSession(session);
    setTicketModalOpen(true);
  };

  const handleCloseTicket = () => {
    setTicketModalOpen(false);
    setSelectedSession(null);
  };

  // Métricas rápidas acumuladas
  const totalDifference = history.reduce((acc, curr) => {
    const diff = parseFloat(curr.difference || curr.cashDifference || 0);
    return acc + diff;
  }, 0);

  const totalClosedSessions = history.length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <PosIcon color="primary" fontSize="large" /> Historial de Cortes y Cierres de Caja
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total de Cierres Registrados
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalClosedSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Balance Total de Descuadres
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={
                  totalDifference === 0
                    ? "success.main"
                    : totalDifference < 0
                    ? "error.main"
                    : "info.main"
                }
              >
                {formatCurrency(totalDifference)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros de Búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Desde"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Hasta"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={fetchHistory}
              sx={{ height: "56px" }}
            >
              Filtrar Cierres
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabla de Reportes */}
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell><strong>Apertura / Cierre</strong></TableCell>
              <TableCell><strong>Cajero / Usuario</strong></TableCell>
              <TableCell align="right"><strong>Fondo Inicial</strong></TableCell>
              <TableCell align="right"><strong>Efectivo</strong></TableCell>
              <TableCell align="right"><strong>Tarjeta</strong></TableCell>
              <TableCell align="right"><strong>Transferencia</strong></TableCell>
              <TableCell align="right"><strong>Esperado (Cajón)</strong></TableCell>
              <TableCell align="right"><strong>Contado (Físico)</strong></TableCell>
              <TableCell align="center"><strong>Diferencia / Estado</strong></TableCell>
              <TableCell><strong>Notas</strong></TableCell>
              <TableCell align="center"><strong>Ticket Z</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Cargando reportes...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron cierres de caja en el rango seleccionado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.map((row) => {
                const diff = parseFloat(row.difference || row.cashDifference || 0);

                // Unificación de propiedades backend/frontend
                const paidCash = parseFloat(row.paidCash || row.salesCash || 0);
                const paidCard = parseFloat(row.paidCard || row.salesCard || 0);
                const paidTransfer = parseFloat(row.paidTransfer || row.salesTransfer || 0);

                return (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatDate(row.closedAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Abierto: {formatDate(row.openedAt || row.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {row.user
                        ? `${row.user.firstName || ""} ${row.user.lastName || ""}`.trim() || row.user.email
                        : "Denis"}
                    </TableCell>

                    <TableCell align="right">
                      {formatCurrency(row.initialCash)}
                    </TableCell>

                    <TableCell align="right" sx={{ color: "success.main", fontWeight: "medium" }}>
                      {formatCurrency(paidCash)}
                    </TableCell>

                    <TableCell align="right" sx={{ color: "info.main", fontWeight: "medium" }}>
                      {formatCurrency(paidCard)}
                    </TableCell>

                    <TableCell align="right" sx={{ color: "warning.main", fontWeight: "medium" }}>
                      {formatCurrency(paidTransfer)}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(row.expectedCash)}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(row.finalCash)}
                    </TableCell>

                    <TableCell align="center">
                      {diff === 0 && (
                        <Chip
                          icon={<OkIcon fontSize="small" />}
                          label="Cuadrado"
                          color="success"
                          size="small"
                        />
                      )}
                      {diff < 0 && (
                        <Chip
                          icon={<WarningIcon fontSize="small" />}
                          label={`Faltante ${formatCurrency(diff)}`}
                          color="error"
                          size="small"
                        />
                      )}
                      {diff > 0 && (
                        <Chip
                          label={`Sobrante ${formatCurrency(diff)}`}
                          color="info"
                          size="small"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {row.notes || "Sin observaciones"}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Reimprimir Ticket Z">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenTicket(row)}
                          size="small"
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para ver e imprimir el Ticket Z */}
      <Dialog open={ticketModalOpen} onClose={handleCloseTicket} maxWidth="xs" fullWidth>
        <Box display="flex" justifyContent="flex-end" p={1} className="no-print">
          <IconButton onClick={handleCloseTicket}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          {selectedSession && <CashTicket sessionData={selectedSession} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
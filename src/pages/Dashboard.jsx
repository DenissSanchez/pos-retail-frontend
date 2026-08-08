import { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";

import {
  ShoppingCart,
  Inventory2,
  AttachMoney,
  TrendingUp,
  Refresh as RefreshIcon
} from "@mui/icons-material";

import StatCard from "../components/dashboard/StatCard";
import SalesChart from "../components/dashboard/SalesChart";
import { getInventory } from "../services/inventory.service";
import { getDashboardStats } from "../services/sale.service";

// CONSTANTES DE ESTILO MORADO MODERNO
const PURPLE_MAIN = "#6d28d9"; // Violeta principal
const PURPLE_DARK = "#4c1d95"; // Violeta oscuro
const PURPLE_LIGHT = "#f5f3ff"; // Fondo púrpura tenue
const PURPLE_BORDER = "#ddd6fe"; // Borde sutil púrpura

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados locales
  const [inventoryItems, setInventoryItems] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    todaySales: 0,
    todayOrders: 0,
    monthlySalesTotal: 0,
    weeklySales: [0, 0, 0, 0, 0, 0, 0],   // Días Lun - Dom
    monthlySales: [],                      // Datos para gráfica del mes
    recentSales: []
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carga paralela de Inventario y Ventas
      const [inventoryData, salesResponse] = await Promise.all([
        getInventory(),
        getDashboardStats()
      ]);

      setInventoryItems(inventoryData || []);

      if (salesResponse?.success) {
        setSalesSummary({
          todaySales: salesResponse.summary.totalIncome || 0,
          todayOrders: salesResponse.summary.totalSalesCount || 0,
          monthlySalesTotal: salesResponse.summary.monthlySalesTotal || 0,
          weeklySales: salesResponse.summary.weeklySales || [0, 0, 0, 0, 0, 0, 0],
          monthlySales: salesResponse.summary.monthlySales || [],
          recentSales: salesResponse.sales || []
        });
      }
    } catch (err) {
      console.error("Error al cargar datos del Dashboard:", err);
      setError("No se pudieron obtener los datos en tiempo real del servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Cálculos dinámicos
  const totalProducts = inventoryItems.length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Stack spacing={3}>
        {/* ENCABEZADO PRINCIPAL DE GRADIENTE */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_MAIN} 100%)`,
            color: "white",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: "-0.5px" }}>
              Dashboard General
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Monitoreo en tiempo real del rendimiento de PosRetail.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
            disabled={loading}
            sx={{
              bgcolor: "white",
              color: PURPLE_DARK,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              "&:hover": { bgcolor: "#f3e8ff" }
            }}
          >
            Actualizar
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
            <CircularProgress sx={{ color: PURPLE_MAIN }} size={48} />
            <Typography mt={2} color="text.secondary" fontWeight="500">
              Cargando estadísticas en tiempo real...
            </Typography>
          </Box>
        ) : (
          <>
            {/* TARJETAS PRINCIPALES (KPIs) */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Ventas Hoy"
                  value={`$${Number(salesSummary.todaySales).toFixed(2)}`}
                  icon={<AttachMoney fontSize="large" />}
                  color="#10b981"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Productos Registrados"
                  value={totalProducts.toString()}
                  subtitle="En catálogo activo"
                  icon={<Inventory2 fontSize="large" />}
                  color={PURPLE_MAIN}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Órdenes Hoy"
                  value={salesSummary.todayOrders.toString()}
                  icon={<ShoppingCart fontSize="large" />}
                  color="#f59e0b"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Ventas del Mes"
                  value={`$${Number(salesSummary.monthlySalesTotal).toFixed(2)}`}
                  icon={<TrendingUp fontSize="large" />}
                  color="#8b5cf6"
                />
              </Grid>
            </Grid>

            {/* GRÁFICAS COMPARATIVAS (SEMANA vs MES) */}
            <Grid container spacing={2.5}>
              {/* Gráfica Semanal */}
              <Grid item xs={12} lg={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3.5,
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                  }}
                >
                  <Typography variant="h6" fontWeight="800" color="#1e293b" mb={2.5}>
                    📈 Ventas de la Semana
                  </Typography>
                  <SalesChart salesData={salesSummary.weeklySales} />
                </Paper>
              </Grid>

              {/* Gráfica Mensual */}
              <Grid item xs={12} lg={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3.5,
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                  }}
                >
                  <Typography variant="h6" fontWeight="800" color="#1e293b" mb={2.5}>
                    📅 Ventas del Mes
                  </Typography>
                  <SalesChart salesData={salesSummary.monthlySales} />
                </Paper>
              </Grid>
            </Grid>

            {/* ÚLTIMAS VENTAS REALIZADAS */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3.5,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 4px 25px rgba(0,0,0,0.04)"
              }}
            >
              <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f5f9", bgcolor: "white" }}>
                <Typography variant="h6" fontWeight="800" color="#1e293b">
                  🧾 Últimas Ventas Realizadas
                </Typography>
              </Box>

              {salesSummary.recentSales.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Typography color="text.secondary" fontWeight="500">
                    No hay ventas registradas el día de hoy.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: PURPLE_LIGHT }}>
                      <TableRow>
                        <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700, py: 1.5 }}>ID / Folio</TableCell>
                        <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700, py: 1.5 }}>Cajero</TableCell>
                        <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700, py: 1.5 }}>Hora</TableCell>
                        <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700, py: 1.5 }}>Método de Pago</TableCell>
                        <TableCell align="right" sx={{ color: PURPLE_DARK, fontWeight: 700, py: 1.5 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesSummary.recentSales.map((sale) => {
                        const formattedTime = new Date(sale.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const sellerName = sale.session?.user
                          ? `${sale.session.user.firstName} ${sale.session.user.lastName || ''}`
                          : "Sistema";

                        return (
                          <TableRow
                            key={sale.id}
                            sx={{
                              "&:hover": { bgcolor: "#faf5ff" },
                              transition: "background-color 0.2s"
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="700" sx={{ color: PURPLE_MAIN }}>
                                #{sale.id.slice(0, 8)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="600" color="#1e293b">
                                {sellerName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formattedTime}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={sale.paymentMethod}
                                size="small"
                                sx={{
                                  bgcolor: PURPLE_LIGHT,
                                  color: PURPLE_DARK,
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  border: `1px solid ${PURPLE_BORDER}`
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="800" color="#1e293b">
                                ${Number(sale.total).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}
      </Stack>
    </Box>
  );
}
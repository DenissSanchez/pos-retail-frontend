import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Tabs, Tab
} from '@mui/material';

// Íconos de Material UI
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import MonizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import BarChartIcon from '@mui/icons-material/BarChart';

import axios from 'axios';
import { useSnackbar } from 'notistack';

// Tu componente de Historial de Cajas
import CashHistory from '../pages/CashHistory';

export default function Reports() {
  const { enqueueSnackbar } = useSnackbar();

  // Estado para controlar la pestaña activa (0 = Ventas, 1 = Cortes de Caja)
  const [currentTab, setCurrentTab] = useState(0);

  // Estados de Filtros
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Primer día del mes actual
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Estados de Datos
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Cargar ventas desde el backend
  const fetchReportData = async () => {
    setLoading(true);

    try {
      const formattedStartDate = startDate 
        ? new Date(`${startDate}T00:00:00`).toISOString() 
        : null;
        
      const formattedEndDate = endDate 
        ? new Date(`${endDate}T23:59:59.999`).toISOString() 
        : null;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/sales`, {
        params: { 
          startDate: formattedStartDate, 
          endDate: formattedEndDate 
        }
      });

      setSales(response.data || []);
    } catch (error) {
      enqueueSnackbar('Error al cargar reporte de ventas', { variant: 'error' });
      setSales([]); // Evita que se quede con datos corruptos ante un error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 0) {
      fetchReportData();
    }
  }, [startDate, endDate, currentTab]);

  // Helper para renderizar el nombre del usuario/cajero
  const getUserName = (sale) => {
    const user = sale.session?.user;
    if (!user) return 'Cajero';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Cajero';
  };

  // Helper para calcular la ganancia de una venta individual
  const calculateSaleProfit = (sale) => {
    if (!sale.items || !Array.isArray(sale.items)) return 0;
    return sale.items.reduce((acc, item) => {
      const price = Number(item.price || 0);
      const cost = Number(item.variant?.cost || 0);
      return acc + ((price - cost) * item.quantity);
    }, 0);
  };

  // --- BLINDAJE DE ARREGLOS ---
  const safeSales = Array.isArray(sales) ? sales : [];

  // CÁLCULOS DE KPIs (Protegidos con safeSales)
  const totalRevenue = safeSales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  const totalOrders = safeSales.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProfit = safeSales.reduce((acc, sale) => acc + calculateSaleProfit(sale), 0);

  // Helper para chips de método de pago
  const renderPaymentChip = (method) => {
    switch (method) {
      case 'EFECTIVO':
        return <Chip icon={<LocalAtmIcon fontSize="small" />} label="Efectivo" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 'bold' }} />;
      case 'TARJETA':
        return <Chip icon={<CreditCardIcon fontSize="small" />} label="Tarjeta" size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 'bold' }} />;
      case 'TRANSFERENCIA':
        return <Chip icon={<SyncAltIcon fontSize="small" />} label="Transf." size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 'bold' }} />;
      default:
        return <Chip label={method} size="small" />;
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (safeSales.length === 0) return;
   
    const headers = ["Folio,Fecha,Cajero,Metodo Pago,Total Items,Total Venta,Ganancia Neta\n"];
    const rows = safeSales.map(s => {
      const profit = calculateSaleProfit(s);
      return `"${s.id || s.folio}","${new Date(s.createdAt).toLocaleString()}","${getUserName(s)}","${s.paymentMethod}",${s.items?.length || 0},${Number(s.total || 0).toFixed(2)},${profit.toFixed(2)}`;
    });

    const blob = new Blob([headers + rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Ventas_${startDate}_al_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#F4EFFA', minHeight: '100vh' }}>
      
      {/* 📌 Pestañas de Navegación (Tabs) */}
      <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', fontSize: '15px' },
            '& .Mui-selected': { color: '#5B2C83' },
            '& .MuiTabs-indicator': { backgroundColor: '#5B2C83' }
          }}
        >
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Ventas Generales" />
          <Tab icon={<PointOfSaleIcon />} iconPosition="start" label="Cortes de Caja (Arqueos)" />
        </Tabs>
      </Paper>

      {/* --- PESTAÑA 0: REPORTE DE VENTAS --- */}
      {currentTab === 0 && (
        <>
          {/* Encabezado y Filtros */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#5B2C83' }}>
              Reporte de Ventas
            </Typography>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#FFFFFF' }}>
              <CalendarTodayIcon sx={{ color: '#5B2C83', ml: 1 }} />
              <TextField
                label="Desde"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
              />
              <TextField
                label="Hasta"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
              />
              <Button
                variant="contained"
                onClick={fetchReportData}
                disabled={loading}
                sx={{
                  backgroundColor: '#5B2C83',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#4a236d' }
                }}
              >
                {loading ? 'Cargando...' : 'Filtrar'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={exportToCSV}
                sx={{
                  borderColor: '#5B2C83',
                  color: '#5B2C83',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { borderColor: '#4a236d', backgroundColor: '#F3E8FF' }
                }}
              >
                Exportar CSV
              </Button>
            </Paper>
          </Box>

          {/* Tarjetas KPIs */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '20px', p: 1, backgroundColor: '#FFFFFF' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: '#F3E8FF', p: 1.5, borderRadius: '16px' }}>
                    <AttachMoneyIcon sx={{ fontSize: 36, color: '#5B2C83' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
                      Ventas Totales
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>
                      ${totalRevenue.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '20px', p: 1, backgroundColor: '#FFFFFF' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: '#E8F5E9', p: 1.5, borderRadius: '16px' }}>
                    <ReceiptIcon sx={{ fontSize: 36, color: '#2E7D32' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
                      N° de Ventas
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>
                      {totalOrders}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '20px', p: 1, backgroundColor: '#FFFFFF' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: '#E3F2FD', p: 1.5, borderRadius: '16px' }}>
                    <TrendingUpIcon sx={{ fontSize: 36, color: '#1565C0' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
                      Ticket Promedio
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>
                      ${averageTicket.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '20px', p: 1, backgroundColor: '#FFFFFF' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: '#E8F5E9', p: 1.5, borderRadius: '16px' }}>
                    <MonizationOnIcon sx={{ fontSize: 36, color: '#2E7D32' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
                      Ganancias Totales
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                      ${totalProfit.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Historial de Ventas */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', backgroundColor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1A1A1A' }}>
              Historial de Transacciones
            </Typography>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', color: '#5B2C83' } }}>
                    <TableCell>Folio / ID</TableCell>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Cajero</TableCell>
                    <TableCell>Método de Pago</TableCell>
                    <TableCell align="center">Artículos</TableCell>
                    <TableCell align="right">Total Venta</TableCell>
                    <TableCell align="right">Ganancia</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#888' }}>
                        {loading ? 'Cargando ventas...' : 'No se encontraron ventas en el periodo seleccionado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    safeSales.map((sale) => {
                      const saleProfit = calculateSaleProfit(sale);
                      return (
                        <TableRow key={sale.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            #{sale.id ? sale.id.slice(-6).toUpperCase() : 'S/N'}
                          </TableCell>
                          <TableCell>
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                          </TableCell>
                          <TableCell>{getUserName(sale)}</TableCell>
                          <TableCell>{renderPaymentChip(sale.paymentMethod)}</TableCell>
                          <TableCell align="center">
                            {sale.items?.reduce((acc, i) => acc + i.quantity, 0) || 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#5B2C83' }}>
                            ${Number(sale.total || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                            ${saleProfit.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedSale(sale);
                                setOpenModal(true);
                              }}
                              sx={{ color: '#5B2C83', backgroundColor: '#F3E8FF', '&:hover': { backgroundColor: '#D8C5ED' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Modal de Detalle de Venta */}
          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
            {selectedSale && (
              <>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#5B2C83', pb: 1 }}>
                  Detalle de Venta #{selectedSale.id ? selectedSale.id.slice(-6).toUpperCase() : ''}
                </DialogTitle>
                <DialogContent dividers>
                  <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                    Fecha: {selectedSale.createdAt ? new Date(selectedSale.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                    Cajero: <strong>{getUserName(selectedSale)}</strong>
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                    Método de pago: <strong>{selectedSale.paymentMethod}</strong>
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Productos Adquiridos:
                  </Typography>

                  {selectedSale.items?.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.variant?.product?.name || 'Producto'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Talla: {item.variant?.size || 'N/A'} | Color: {item.variant?.color || 'N/A'} (x{item.quantity})
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ${(Number(item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Total Cobrado:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#5B2C83' }}>
                      ${Number(selectedSale.total || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>
                      Ganancia Estimada:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                      ${calculateSaleProfit(selectedSale).toFixed(2)}
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button
                    onClick={() => setOpenModal(false)}
                    sx={{ textTransform: 'none', fontWeight: 'bold', color: '#5B2C83' }}
                  >
                    Cerrar
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </>
      )}

      {/* --- PESTAÑA 1: CORTES DE CAJA --- */}
      {currentTab === 1 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', backgroundColor: '#FFFFFF' }}>
          <CashHistory />
        </Paper>
      )}

    </Box>
  );
}
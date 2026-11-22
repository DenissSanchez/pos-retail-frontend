// src/pages/Sales.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, IconButton,
  Button, Divider, Avatar, InputAdornment, Snackbar, Alert,
  CircularProgress
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import PaymentsIcon from '@mui/icons-material/Payments';
import DiscountIcon from '@mui/icons-material/Discount';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import LocalMallIcon from '@mui/icons-material/LocalMall';

import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { TicketPrint } from '../components/TicketPrint';

// 🔊 Función utilitaria para reproducir el beep del escáner
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine"; 
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.log("El navegador bloqueó el audio temporalmente", e);
  }
};

export default function Sales() {
  const { enqueueSnackbar } = useSnackbar();
  const scanInputRef = useRef(null);
  const ticketRef = useRef(null);

  // Estados del POS
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  
  // Estados de Pagos
  const [amountPaid, setAmountPaid] = useState('');
  const [mixedCash, setMixedCash] = useState('');
  const [mixedCard, setMixedCard] = useState('');
  const [reference, setReference] = useState('');
  
  // Estado de Descuento
  const [discountPercent, setDiscountPercent] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
  const [loading, setLoading] = useState(false);

  const sessionId = localStorage.getItem('sessionId');
  const storeId = localStorage.getItem('storeId');

  // Configuración de react-to-print para impresión automática
  const triggerPrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: 'Ticket_de_Venta',
  });

  // --- CÁLCULOS DE TOTALES Y DESCUENTOS (BLINDADOS) ---
  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.price || 0);
    const qty = Number(item.quantity || 0);
    return acc + (price * qty);
  }, 0);

  const totalItems = cart.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  
  const numericDiscountPercent = Math.min(Math.max(parseFloat(discountPercent) || 0, 0), 100);
  const discountAmount = (subtotal * numericDiscountPercent) / 100;
  const total = subtotal - discountAmount;

  const numericAmountPaid = parseFloat(amountPaid) || 0;
  const numericMixedCash = parseFloat(mixedCash) || 0;
  const numericMixedCard = parseFloat(mixedCard) || 0;

  const change = paymentMethod === 'EFECTIVO' ? numericAmountPaid - total : 0;
  const totalMixedPaid = numericMixedCash + numericMixedCard;
  const mixedDifference = totalMixedPaid - total;

  // --- VALIDACIONES ---
  const isCashValid = paymentMethod === 'EFECTIVO' && numericAmountPaid >= total && total > 0;
  const isReferenceValid = /^\d{12}$/.test(reference.trim());
  const isElectronicValid = (paymentMethod === 'TARJETA' || paymentMethod === 'TRANSFERENCIA') && isReferenceValid && total > 0;
  const isMixedValid = paymentMethod === 'MIXTO' && totalMixedPaid >= total && total > 0 && isReferenceValid;

  const isPaymentValid = 
    paymentMethod === 'EFECTIVO' ? isCashValid :
    paymentMethod === 'MIXTO' ? isMixedValid : isElectronicValid;

  // Manejo inteligente del Foco
  useEffect(() => {
    const focusInput = () => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT';
      
      if (!isInput) {
        scanInputRef.current?.focus();
      }
    };

    const interval = setInterval(focusInput, 2000);

    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== scanInputRef.current) {
        e.preventDefault();
        scanInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleScan = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      e.preventDefault();
      const codeToSearch = barcode.trim();
      setBarcode('');

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/search`, {
          params: { code: codeToSearch, storeId }
        });

        const product = response.data;

        if (!product || Number(product.stock || 0) <= 0) {
          enqueueSnackbar('Producto sin stock o no encontrado', { variant: 'warning' });
          return;
        }

        addToCart(product);
        playBeep();

      } catch (error) {
        enqueueSnackbar('Error al buscar el producto', { variant: 'error' });
      }
    }
  };

  const addToCart = (productToAdd) => {
    // 🛡️ Aseguramos que el precio sea un número válido (revisando variantes por si acaso)
    const safePrice = Number(productToAdd.price || productToAdd.Precio || 0);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.variantId === productToAdd.variantId);

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        const currentItem = updatedCart[existingIndex];
        const newQty = currentItem.quantity + 1;

        if (newQty > Number(productToAdd.stock || 0)) {
          setSnackbar({
            open: true,
            message: `⚠️ No hay suficiente stock. Disponible: ${productToAdd.stock} unidades.`,
            severity: 'warning'
          });
          return prevCart;
        }

        updatedCart[existingIndex] = {
          ...currentItem,
          price: safePrice,
          quantity: newQty
        };

        return updatedCart;
      } else {
        return [...prevCart, { ...productToAdd, price: safePrice, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (variantId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.variantId === variantId) {
          const newQty = item.quantity + delta;

          if (delta > 0 && newQty > Number(item.stock || 0)) {
            setSnackbar({
              open: true,
              message: `⚠️ No puedes agregar más. Stock disponible: ${item.stock}`,
              severity: 'warning'
            });
            return item;
          }

          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (variantId) => {
    setCart((prevCart) => prevCart.filter((item) => item.variantId !== variantId));
  };

  const handleClearCart = () => {
    setCart([]);
    setAmountPaid('');
    setMixedCash('');
    setMixedCard('');
    setReference('');
    setDiscountPercent('');
  };

  // Checkout con Impresión Automática integrada
  const handleCheckout = async () => {
    if (cart.length === 0 || !isPaymentValid) return;

    setLoading(true);
    try {
      const payments = {
        cash: paymentMethod === 'EFECTIVO' ? numericAmountPaid : (paymentMethod === 'MIXTO' ? numericMixedCash : 0),
        card: paymentMethod === 'MIXTO' ? numericMixedCard : 0,
        transfer: 0
      };

      const payload = {
        sessionId,
        items: cart.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: Number(item.price || 0)
        })),
        paymentMethod,
        payments,
        globalDiscount: discountAmount,
        reference: (paymentMethod === 'TARJETA' || paymentMethod === 'TRANSFERENCIA' || paymentMethod === 'MIXTO') ? reference.trim() : null
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/sales/checkout`, payload);

      enqueueSnackbar('¡Venta realizada con éxito! 🛍️', { variant: 'success' });

      triggerPrint();
      handleClearCart();

    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error al procesar la venta';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryIcon = (categoryName) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('playera') || cat.includes('camisa') || cat.includes('top')) {
      return <CheckroomIcon fontSize="small" sx={{ color: '#5B2C83' }} />;
    }
    if (cat.includes('pantalon') || cat.includes('pantalón') || cat.includes('jean')) {
      return <DryCleaningIcon fontSize="small" sx={{ color: '#5B2C83' }} />;
    }
    return <LocalMallIcon fontSize="small" sx={{ color: '#5B2C83' }} />;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#F4EFFA', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        
        {/* COLUMNA IZQUIERDA: Buscador y Carrito */}
        <Grid item xs={12} md={7.5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              minHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <TextField
              fullWidth
              inputRef={scanInputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleScan}
              placeholder="Escanear código de barras o SKU..."
              variant="outlined"
              sx={{
                backgroundColor: '#F3E8FF',
                borderRadius: '16px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  '& fieldset': { borderColor: '#D8C5ED' },
                  '&:hover fieldset': { borderColor: '#5B2C83' },
                  '&.Mui-focused fieldset': { borderColor: '#5B2C83', borderWidth: '2px' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeScannerIcon sx={{ color: '#5B2C83', fontSize: 28 }} />
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>
                Carrito — {totalItems} {totalItems === 1 ? 'Producto' : 'Productos'}
              </Typography>
              {cart.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={handleClearCart}
                  startIcon={<DeleteIcon />}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                  Vaciar
                </Button>
              )}
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', my: 1, pr: 1 }}>
              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <QrCodeScannerIcon sx={{ fontSize: 48, color: '#D8C5ED', mb: 1 }} />
                  <Typography color="text.secondary">
                    El carrito está vacío. Listo para escanear...
                  </Typography>
                </Box>
              ) : (
                cart.map((item) => {
                  const itemPrice = Number(item.price || 0);
                  const itemQty = Number(item.quantity || 0);

                  return (
                    <Box
                      key={item.variantId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        borderBottom: '1px solid #F0F0F0'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#F3E8FF', width: 42, height: 42 }}>
                          {renderCategoryIcon(item.category)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            {item.productName || item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            SKU: {item.sku || 'N/A'} • Color: {item.color || '—'} • Talla: {item.size || '—'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>
                          ${(itemPrice * itemQty).toFixed(2)}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8F5FC', borderRadius: '10px', p: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.variantId, -1)}>
                            <RemoveIcon fontSize="small" sx={{ color: '#5B2C83' }} />
                          </IconButton>
                          <Typography sx={{ px: 1.5, fontWeight: 'bold' }}>
                            {itemQty}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.variantId, 1)}>
                            <AddIcon fontSize="small" sx={{ color: '#5B2C83' }} />
                          </IconButton>
                        </Box>

                        <IconButton size="small" onClick={() => removeFromCart(item.variantId)}>
                          <DeleteIcon fontSize="small" sx={{ color: '#aaa' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: '#F3E8FF',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <QrCodeScannerIcon sx={{ color: '#5B2C83' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#5B2C83', lineHeight: 1 }}>
                  Escáner activo — esperando lectura
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Tip: Escanea el código o presiona <span style={{ fontWeight: 'bold' }}>/</span> para ir al buscador
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* COLUMNA DERECHA: Totales, Descuentos y Pago */}
        <Grid item xs={12} md={4.5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              minHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Resumen de Venta
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Subtotal items:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>${subtotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <DiscountIcon fontSize="small" sx={{ color: '#5B2C83' }} /> Descuento (%):
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  sx={{
                    width: '100px',
                    '& .MuiOutlinedInput-root': { borderRadius: '10px' }
                  }}
                />
              </Box>

              {numericDiscountPercent > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Ahorro aplicado:</Typography>
                  <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>-${discountAmount.toFixed(2)}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Total Final
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#5B2C83' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Método de Pago
              </Typography>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant={paymentMethod === 'EFECTIVO' ? 'contained' : 'outlined'}
                    startIcon={<LocalAtmIcon />}
                    onClick={() => setPaymentMethod('EFECTIVO')}
                    sx={{
                      py: 1.2, px: 0.5, borderRadius: '12px', textTransform: 'none', fontSize: '0.75rem', fontWeight: 'bold',
                      backgroundColor: paymentMethod === 'EFECTIVO' ? '#5B2C83' : 'transparent',
                      borderColor: paymentMethod === 'EFECTIVO' ? '#5B2C83' : '#D8C5ED',
                      color: paymentMethod === 'EFECTIVO' ? '#fff' : '#5B2C83',
                      '&:hover': { backgroundColor: paymentMethod === 'EFECTIVO' ? '#4a236d' : '#F3E8FF' }
                    }}
                  >
                    Efectivo
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant={paymentMethod === 'TARJETA' ? 'contained' : 'outlined'}
                    startIcon={<CreditCardIcon />}
                    onClick={() => setPaymentMethod('TARJETA')}
                    sx={{
                      py: 1.2, px: 0.5, borderRadius: '12px', textTransform: 'none', fontSize: '0.75rem', fontWeight: 'bold',
                      backgroundColor: paymentMethod === 'TARJETA' ? '#5B2C83' : 'transparent',
                      borderColor: paymentMethod === 'TARJETA' ? '#5B2C83' : '#D8C5ED',
                      color: paymentMethod === 'TARJETA' ? '#fff' : '#5B2C83',
                      '&:hover': { backgroundColor: paymentMethod === 'TARJETA' ? '#4a236d' : '#F3E8FF' }
                    }}
                  >
                    Tarjeta
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant={paymentMethod === 'TRANSFERENCIA' ? 'contained' : 'outlined'}
                    startIcon={<SyncAltIcon />}
                    onClick={() => setPaymentMethod('TRANSFERENCIA')}
                    sx={{
                      py: 1.2, px: 0.5, borderRadius: '12px', textTransform: 'none', fontSize: '0.75rem', fontWeight: 'bold',
                      backgroundColor: paymentMethod === 'TRANSFERENCIA' ? '#5B2C83' : 'transparent',
                      borderColor: paymentMethod === 'TRANSFERENCIA' ? '#5B2C83' : '#D8C5ED',
                      color: paymentMethod === 'TRANSFERENCIA' ? '#fff' : '#5B2C83',
                      '&:hover': { backgroundColor: paymentMethod === 'TRANSFERENCIA' ? '#4a236d' : '#F3E8FF' }
                    }}
                  >
                    Transf.
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant={paymentMethod === 'MIXTO' ? 'contained' : 'outlined'}
                    startIcon={<PaymentsIcon />}
                    onClick={() => setPaymentMethod('MIXTO')}
                    sx={{
                      py: 1.2, px: 0.5, borderRadius: '12px', textTransform: 'none', fontSize: '0.75rem', fontWeight: 'bold',
                      backgroundColor: paymentMethod === 'MIXTO' ? '#5B2C83' : 'transparent',
                      borderColor: paymentMethod === 'MIXTO' ? '#5B2C83' : '#D8C5ED',
                      color: paymentMethod === 'MIXTO' ? '#fff' : '#5B2C83',
                      '&:hover': { backgroundColor: paymentMethod === 'MIXTO' ? '#4a236d' : '#F3E8FF' }
                    }}
                  >
                    Mixto
                  </Button>
                </Grid>
              </Grid>

              {paymentMethod === 'EFECTIVO' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F8F5FC', borderRadius: '16px' }}>
                  <TextField
                    fullWidth
                    name="amountPaid"
                    label="Monto entregado"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ 
                      mb: 1.5, 
                      '& label.Mui-focused': { color: '#5B2C83' }, 
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#5B2C83' } 
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => setAmountPaid(total.toString())}
                      sx={{ borderRadius: '8px', borderColor: '#D8C5ED', color: '#5B2C83', textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Exacto (${isNaN(total) ? '0.00' : total.toFixed(0)})
                    </Button>
                    {[100, 200, 500, 1000].map((bill) => (
                      <Button
                        key={bill}
                        size="small"
                        variant="outlined"
                        onClick={() => setAmountPaid(bill.toString())}
                        disabled={bill < total}
                        sx={{ borderRadius: '8px', borderColor: '#D8C5ED', color: '#5B2C83', fontSize: '0.75rem' }}
                      >
                        ${bill}
                      </Button>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>
                      Cambio a devolver:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: change >= 0 ? '#2e7d32' : '#d32f2f' }}>
                      ${change >= 0 ? change.toFixed(2) : '0.00'}
                    </Typography>
                  </Box>
                </Box>
              )}

              {(paymentMethod === 'TARJETA' || paymentMethod === 'TRANSFERENCIA') && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#F8F5FC', borderRadius: '14px' }}>
                  <TextField
                    fullWidth
                    name="reference"
                    size="small"
                    label="Folio de autorización"
                    value={reference}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 12) setReference(val);
                    }}
                    placeholder="12 dígitos"
                    error={reference.length > 0 && reference.length !== 12}
                    helperText={
                      reference.length === 0 
                        ? 'Ingrese el número de comprobante'
                        : reference.length === 12 
                          ? '✓ Folio de 12 dígitos completo'
                          : `${reference.length}/12 dígitos`
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptLongIcon fontSize="small" sx={{ color: '#5B2C83' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': { fontSize: '0.9rem' },
                      '& label': { fontSize: '0.85rem' },
                      '& label.Mui-focused': { color: '#5B2C83' },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#5B2C83' },
                      '& .MuiFormHelperText-root': { 
                        color: reference.length === 12 ? '#2e7d32' : (reference.length > 0 ? '#d32f2f' : '#777'),
                        fontWeight: reference.length === 12 ? 'bold' : 'normal',
                        fontSize: '0.75rem',
                        mt: 0.5
                      }
                    }}
                  />
                </Box>
              )}

              {paymentMethod === 'MIXTO' && (
                <Box sx={{ mt: 1.5, p: 2, bgcolor: '#F8F5FC', borderRadius: '16px' }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Efectivo"
                        type="number"
                        value={mixedCash}
                        onChange={(e) => setMixedCash(e.target.value)}
                        placeholder="0.00"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Tarjeta"
                        type="number"
                        value={mixedCard}
                        onChange={(e) => setMixedCard(e.target.value)}
                        placeholder="0.00"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Folio autorización tarjeta"
                        value={reference}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 12) setReference(val);
                        }}
                        placeholder="12 dígitos"
                        error={reference.length > 0 && reference.length !== 12}
                        helperText={reference.length === 12 ? '✓ Folio completo' : `${reference.length}/12 dígitos`}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ReceiptLongIcon fontSize="small" sx={{ color: '#5B2C83' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>
                      {mixedDifference >= 0 ? 'Cambio:' : 'Faltante:'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: mixedDifference >= 0 ? '#2e7d32' : '#d32f2f' }}>
                      ${Math.abs(mixedDifference).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}

            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CheckCircleIcon />}
                disabled={cart.length === 0 || loading || !isPaymentValid}
                onClick={handleCheckout}
                sx={{
                  py: 1.8,
                  borderRadius: '14px',
                  backgroundColor: '#5B2C83',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0px 4px 12px rgba(91, 44, 131, 0.3)',
                  '&:hover': { backgroundColor: '#4a236d' }
                }}
              >
                {loading ? 'Procesando...' : `Cobrar ($${total.toFixed(2)})`}
              </Button>
            </Box>
          </Paper>
        </Grid>

      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Componente del ticket oculto conectado a la referencia de impresión */}
      <div style={{ display: 'none' }}>
        <TicketPrint
          ref={ticketRef}
          cart={cart}
          subtotal={subtotal}
          discountPercent={numericDiscountPercent}
          discountAmount={discountAmount}
          total={total}
          paymentMethod={paymentMethod}
          mixedCash={numericMixedCash}
          mixedCard={numericMixedCard}
        />
      </div>
    </Box>
  );
}
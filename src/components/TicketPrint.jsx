// src/components/TicketPrint.jsx
import React, { forwardRef } from 'react';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableRow } from '@mui/material';

export const TicketPrint = forwardRef(({ 
  cart = [], 
  subtotal = 0, 
  discountPercent = 0, 
  discountAmount = 0, 
  total = 0, 
  paymentMethod = 'EFECTIVO',
  mixedCash = 0,
  mixedCard = 0
}, ref) => {
  return (
    <div style={{ display: 'none' }}>
      <div ref={ref}>
        {/* 🎨 Estilos CSS específicos para impresora térmica */}
        <style>
  {`
    @media print {
      @page {
        size: 58mm auto;
        margin: 0;
      }

      html, body {
        width: 58mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      body {
        background: white !important;
      }
    }
  `}
</style>

        {/* 🧾 Contenedor del Ticket */}
        <Box
          sx={{
            width: '72mm', // Ancho imprimible efectivo para papel de 80mm
            margin: '0 auto',
            padding: '8px',
            fontFamily: '"Courier New", Courier, monospace', // Fuente monoespaciada POS
            fontSize: '12px',
            color: '#000'
          }}
        >
          {/* 🖼️ LOGO CASA ORQUIDIA */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <img
              src="/logo.png"
              alt="Casa Orquidia Logo"
              style={{
                width: '120px',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                filter: 'contrast(130%)'
              }}
            />
          </Box>

          {/* Encabezado */}
          <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
            CASA ORQUIDIA
          </Typography>

          <Typography variant="body2" align="center" sx={{ fontSize: '11px' }}>
            Tu tienda favorita
          </Typography>
          
          <Typography variant="body2" align="center" sx={{ fontSize: '11px' }}>
            Ropa & Accesorios
          </Typography>

          <Typography variant="caption" display="block" align="center" sx={{ mt: 0.5 }}>
            {new Date().toLocaleString()}
          </Typography>

          <Divider sx={{ my: 1, borderColor: '#000', borderStyle: 'dashed' }} />

          {/* Tabla de Productos */}
          <Table size="small" sx={{ width: '100%' }}>
            <TableBody>
              {cart.map((item, index) => {
                const itemPrice = Number(item.price || 0);
                const itemQty = Number(item.quantity || 1);
                const itemTotal = itemPrice * itemQty;

                return (
                  <React.Fragment key={item.variantId || item.id || index}>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ border: 'none', p: '2px 0', fontWeight: 'bold', fontSize: '11px' }}>
                        {item.productName || item.name || 'Producto'}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ borderBottom: '1px dashed #ccc' }}>
                      <TableCell sx={{ border: 'none', p: '0 0 4px 0', fontSize: '10px' }}>
                        {itemQty} x ${itemPrice.toFixed(2)}
                        {item.size ? ` (${item.size})` : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', p: '0 0 4px 0', fontWeight: 'bold', fontSize: '11px' }}>
                        ${itemTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>

          <Divider sx={{ my: 1, borderColor: '#000', borderStyle: 'dashed' }} />

          {/* Totales y Descuentos */}
          {Number(discountPercent) > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 0.3 }}>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>SUBTOTAL:</Typography>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>${Number(subtotal || 0).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 0.3 }}>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>DESCUENTO ({discountPercent}%):</Typography>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>-${Number(discountAmount || 0).toFixed(2)}</Typography>
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 0.8 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '14px' }}>TOTAL:</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '16px' }}>${Number(total || 0).toFixed(2)}</Typography>
          </Box>

          <Divider sx={{ my: 1, borderColor: '#000', borderStyle: 'dashed' }} />

          {/* Método de Pago y Desglose */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '11px' }}>MÉTODO DE PAGO:</Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>{paymentMethod}</Typography>
          </Box>

          {paymentMethod === 'MIXTO' && (
            <Box sx={{ pl: 1, my: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '10px' }}>Efectivo:</Typography>
                <Typography variant="caption" sx={{ fontSize: '10px' }}>${Number(mixedCash || 0).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '10px' }}>Tarjeta:</Typography>
                <Typography variant="caption" sx={{ fontSize: '10px' }}>${Number(mixedCard || 0).toFixed(2)}</Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1, borderColor: '#000', borderStyle: 'dashed' }} />

          {/* Pie de Ticket */}
          <Typography variant="caption" align="center" display="block" sx={{ mt: 1, fontSize: '10px' }}>
            ¡Gracias por tu compra! 🛍️
          </Typography>

          <Typography variant="caption" align="center" display="block" sx={{ fontSize: '9px', fontStyle: 'italic', mt: 0.5 }}>
            No hacemos cambios ni devoluciones. Por favor, revisa tu compra antes de salir de la tienda.
          </Typography>
        </Box>
      </div>
    </div>
  );
});

export default TicketPrint;
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Alert,
  Divider,
  Paper,
  Chip
} from "@mui/material";

import PrintIcon from "@mui/icons-material/PrintRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";
import LabelIcon from "@mui/icons-material/LabelRounded";

import LabelItem from "./LabelItem";
import "../../styles/print-labels.css";

const MAX_BATCH_SIZE = 200; // Límite de seguridad para evitar caídas de memoria

export default function PrintLabelsModal({ open, onClose, items = [] }) {
  // Modo de cantidad: 'stock' (igual a existencia) | 'one' (1 por variante)
  const [quantityMode, setQuantityMode] = useState("stock");
  
  // Índice del lote seleccionado actualmente (0 = Lote 1, 1 = Lote 2, etc.)
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);

  // 1. CONSTRUCCIÓN DE LA LISTA EXPANDIDA DE ETIQUETAS SEGÚN EL MODO SELECCIONADO
  const expandedLabels = useMemo(() => {
    const list = [];
    items.forEach((item) => {
      // Determina cuántas copias se imprimen de este ítem
      const count = quantityMode === "stock" ? Math.max(1, Number(item.stock || item.Existencia || 1)) : 1;
      
      const labelData = {
        productName: item.productName || item.Producto || "Producto",
        variantColor: item.colorName || item.Color || "",
        variantSize: item.sizeName || item.Talla || "",
        price: Number(item.price || item.Precio || 0),
        barcode: String(item.barcode || item.Código || "000000000000"),
        sku: item.sku || item.SKU || ""
      };

      for (let i = 0; i < count; i++) {
        list.push(labelData);
      }
    });
    return list;
  }, [items, quantityMode]);

  // 2. DIVISIÓN AUTOMÁTICA EN LOTES DE MÁXIMO 200 ETIQUETAS
  const batches = useMemo(() => {
    const result = [];
    for (let i = 0; i < expandedLabels.length; i += MAX_BATCH_SIZE) {
      result.push(expandedLabels.slice(i, i + MAX_BATCH_SIZE));
    }
    return result;
  }, [expandedLabels]);

  // Lote de etiquetas que se renderizará actualmente en pantalla e impresión
  const activeBatch = batches[selectedBatchIndex] || [];
  const totalLabels = expandedLabels.length;
  const isMultiBatch = batches.length > 1;

  // 3. ACTIVAR DISPARO DE IMPRESIÓN NATIVA
  const handlePrint = () => {
    // Breve pausa para asegurar que el DOM cargó el lote activo completamente
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3.5, p: 1 }
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <LabelIcon sx={{ color: "#6d28d9" }} />
          <Typography variant="h6" fontWeight={700}>
            Imprimir Etiquetas Térmicas
          </Typography>
        </Stack>
        <Chip
          label={`${totalLabels} etiqueta${totalLabels !== 1 ? "s" : ""} en total`}
          color="primary"
          sx={{ bgcolor: "#6d28d9", fontWeight: 700 }}
        />
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={2.5}>
          {/* SECCIÓN 1: CONFIGURACIÓN DE CANTIDADES */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
              Modo de Impresión:
            </Typography>
            <RadioGroup
              row
              value={quantityMode}
              onChange={(e) => {
                setQuantityMode(e.target.value);
                setSelectedBatchIndex(0); // Reiniciar al primer lote
              }}
            >
              <FormControlLabel
                value="stock"
                control={<Radio sx={{ color: "#6d28d9", "&.Mui-checked": { color: "#6d28d9" } }} />}
                label="Igual al inventario / existencia actual"
              />
              <FormControlLabel
                value="one"
                control={<Radio sx={{ color: "#6d28d9", "&.Mui-checked": { color: "#6d28d9" } }} />}
                label="1 etiqueta por variante"
              />
            </RadioGroup>
          </Paper>

          {/* SECCIÓN 2: ALERTA Y SELECTOR DE LOTES (+200 ETIQUETAS) */}
          {isMultiBatch && (
            <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
              <Typography variant="body2" fontWeight={600}>
                Se detectaron {totalLabels} etiquetas. Para proteger la memoria del navegador, la impresión se dividió en {batches.length} lotes de máximo {MAX_BATCH_SIZE} etiquetas cada uno.
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Selecciona un lote para imprimirlo individualmente:
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1.5} gap={1}>
                {batches.map((batch, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant={selectedBatchIndex === index ? "contained" : "outlined"}
                    onClick={() => setSelectedBatchIndex(index)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: selectedBatchIndex === index ? "#6d28d9" : "transparent",
                      borderColor: "#ddd6fe",
                      color: selectedBatchIndex === index ? "white" : "#6d28d9",
                      "&:hover": {
                        bgcolor: selectedBatchIndex === index ? "#4c1d95" : "#f5f3ff"
                      }
                    }}
                  >
                    Lote {index + 1} ({index * MAX_BATCH_SIZE + 1} - {Math.min((index + 1) * MAX_BATCH_SIZE, totalLabels)})
                  </Button>
                ))}
              </Stack>
            </Alert>
          )}

          {/* SECCIÓN 3: VISTA PREVIA (ÁREA IMPRIMIBLE) */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
              Vista Previa {isMultiBatch ? `- Lote ${selectedBatchIndex + 1} (${activeBatch.length} etiquetas)` : ""}:
            </Typography>

            {/* Este ID es leído por las reglas CSS @media print */}
            <div id="printable-labels-area" className="label-preview-container">
              {activeBatch.map((label, idx) => (
                <LabelItem key={`${label.sku}-${idx}`} data={label} />
              ))}
            </div>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{ borderRadius: 2.5, textTransform: "none", color: "text.secondary", borderColor: "#e2e8f0" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={totalLabels === 0}
          sx={{
            bgcolor: "#6d28d9",
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            "&:hover": { bgcolor: "#4c1d95" }
          }}
        >
          Imprimir Lote Activo ({activeBatch.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
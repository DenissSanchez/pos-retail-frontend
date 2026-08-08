import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- CORRECTO

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  IconButton
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import SaveIcon from "@mui/icons-material/SaveRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import CategoryIcon from "@mui/icons-material/CategoryRounded";
import SellIcon from "@mui/icons-material/SellRounded";

import {
  getProduct,
  updateProduct
} from "../services/product.service";

import { updateInventory } from "../services/inventory.service";

import VariantTable from "../components/products/VariantTable";
import InventoryDialog from "../components/products/InventoryDialog";

// CONSTANTES DE ESTILO MORADO MODERNO
const PURPLE_MAIN = "#6d28d9";
const PURPLE_DARK = "#4c1d95";
const PURPLE_LIGHT = "#f5f3ff";
const PURPLE_BORDER = "#ddd6fe";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await getProduct(id);
      setProduct(data);
      setForm({
        name: data.name,
        description: data.description ?? "",
        categoryId: data.categoryId,
        brandId: data.brandId
      });
    } catch (error) {
      console.error("Error cargando producto", error);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      await updateProduct(id, form);
      alert("Producto actualizado correctamente");
      loadProduct();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  const openInventory = (variant) => {
    if (!variant.inventory || !variant.inventory.length) {
      alert("La variante no tiene inventario asignado.");
      return;
    }
    setSelectedInventory(variant.inventory[0]);
    setInventoryDialogOpen(true);
  };

  const saveInventory = async (stock) => {
    try {
      await updateInventory(selectedInventory.id, {
        stock: Number(stock)
      });
      alert("Inventario actualizado");
      setInventoryDialogOpen(false);
      loadProduct();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el inventario");
    }
  };

  if (!product || !form) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
        <CircularProgress sx={{ color: PURPLE_MAIN }} size={48} />
        <Typography mt={2} color="text.secondary" fontWeight="500">
          Cargando detalles del producto...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Stack spacing={3} maxWidth="1400px" mx="auto">

        {/* 1. ENCABEZADO Y BARRA DE NAVEGACIÓN */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_MAIN} 100%)`,
            color: "white",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={() => navigate("/products")}
              sx={{ color: "white", bgcolor: "rgba(255, 255, 255, 0.15)", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight="800">
                  {product.name}
                </Typography>
                <Chip
                  label={`ID: #${id.slice(0, 6)}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "white", fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                Edición de datos principales y gestión de variantes
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={save}
            disabled={saving}
            sx={{
              bgcolor: "white",
              color: PURPLE_DARK,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#f3e8ff" }
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Paper>

        {/* 2. LAYOUT PRINCIPAL EN 2 COLUMNAS */}
        <Grid container spacing={3}>

          {/* COLUMNA IZQUIERDA: FORMULARIO BÁSICO */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
            >
              <Typography variant="h6" fontWeight="800" color="#1e293b" mb={3}>
                📝 Información General
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Nombre del Producto"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />

                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* COLUMNA DERECHA: METADATOS (CATEGORÍA Y MARCA) */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: `1px solid ${PURPLE_BORDER}`,
                bgcolor: PURPLE_LIGHT,
                height: "100%"
              }}
            >
              <Typography variant="h6" fontWeight="800" color={PURPLE_DARK} mb={2.5}>
                📌 Clasificación
              </Typography>

              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1.5} p={1.5} sx={{ bgcolor: "white", borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
                  <CategoryIcon sx={{ color: PURPLE_MAIN }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">
                      Categoría
                    </Typography>
                    <Typography variant="body1" fontWeight="700" color="#1e293b">
                      {product.category?.name || "Sin categoría"}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5} p={1.5} sx={{ bgcolor: "white", borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
                  <SellIcon sx={{ color: PURPLE_MAIN }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">
                      Marca
                    </Typography>
                    <Typography variant="body1" fontWeight="700" color="#1e293b">
                      {product.brand?.name || "Sin marca"}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* 3. SECCIÓN DE VARIANTES */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            bgcolor: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
          }}
        >
          {/* Cabecera integrada de la tabla */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2.5}
            sx={{ borderBottom: "1px solid #f1f5f9" }}
          >
            <Box>
              <Typography variant="h6" fontWeight="800" color="#1e293b">
                🎨 Variantes del Producto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona tallas, colores, precios e inventario por variante
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/products/${id}/variant/new`)}
              sx={{
                bgcolor: PURPLE_MAIN,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                "&:hover": { bgcolor: PURPLE_DARK }
              }}
            >
              Agregar Variante
            </Button>
          </Box>

          {/* Tabla de variantes */}
          <Box p={2}>
            <VariantTable
              variants={product.variants}
              onEdit={(variant) => console.log("Editar", variant)}
              onInventory={openInventory}
              onDelete={(variant) => console.log("Eliminar", variant)}
            />
          </Box>
        </Paper>

        {/* DIÁLOGO DE INVENTARIO */}
        <InventoryDialog
          open={inventoryDialogOpen}
          inventory={selectedInventory}
          onClose={() => setInventoryDialogOpen(false)}
          onSave={saveInventory}
        />
      </Stack>
    </Box>
  );
}
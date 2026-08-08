import { useState, useEffect } from "react";
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
    TextField,
    Button,
    Chip,
    Stack,
    Grid,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    MenuItem,
    Tooltip,
    CircularProgress,
    Alert,
    IconButton
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory2Rounded";
import WarningIcon from "@mui/icons-material/WarningRounded";
import AttachMoneyIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteOutlineRounded";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweepRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import HistoryIcon from "@mui/icons-material/HistoryRounded";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import PrintIcon from "@mui/icons-material/PrintRounded";

import {
    getInventory,
    updateInventory,
    clearAllInventory
} from "../services/inventory.service";

import { deleteImportHistory } from "../services/import.service";

// CONSTANTES DE ESTILO MORADO MODERNO
const PURPLE_MAIN = "#6d28d9"; // Violeta principal
const PURPLE_DARK = "#4c1d95"; // Violeta oscuro
const PURPLE_LIGHT = "#f5f3ff"; // Fondo púrpura tenue
const PURPLE_BORDER = "#ddd6fe"; // Borde sutil púrpura

export default function Inventory() {
    // -----------------------------------------------------------------
    // ESTADOS
    // -----------------------------------------------------------------
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Estado para el modal de ajuste de stock
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustmentType, setAdjustmentType] = useState("ADD");
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState(null);

    // Estado para vaciar a 0 un producto individual
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeletingItem, setIsDeletingItem] = useState(false);

    // Estado para borrado masivo
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [isClearingAll, setIsClearingAll] = useState(false);

    // Historial de importaciones
    const [importHistory, setImportHistory] = useState([]);
    const [openHistory, setOpenHistory] = useState(false);

    // -----------------------------------------------------------------
    // CARGA DE DATOS DESDE EL BACKEND
    // -----------------------------------------------------------------
    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getInventory();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando el inventario:", err);
            setError("No se pudo obtener la información del inventario.");
        } finally {
            setLoading(false);
        }
    };

    const fetchImportHistory = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/inventory/imports");
            const data = await response.json();
            setImportHistory(data);
            setOpenHistory(true);
        } catch (error) {
            console.error(error);
        }
    };

    const downloadImportFile = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/import-history/${id}/download`);
            if (!response.ok) {
                throw new Error("No se pudo descargar el archivo.");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const disposition = response.headers.get("Content-Disposition");
            let fileName = "importacion.xlsx";
            if (disposition) {
                const match = disposition.match(/filename="?(.+)"?/);
                if (match) fileName = match[1];
            }
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("No fue posible descargar el archivo.");
        }
    };

    const handleDeleteImport = async (id) => {
        const confirmed = window.confirm(
            "¿Eliminar esta importación?\n\nTambién se eliminará el archivo original."
        );
        if (!confirmed) return;
        try {
            await deleteImportHistory(id);
            await fetchImportHistory();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // -----------------------------------------------------------------
    // CÁLCULOS Y MÉTRICAS
    // -----------------------------------------------------------------
    const totalUnits = items.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

    const lowStockCount = items.filter(
        (item) => (Number(item.stock) || 0) <= (item.minStock ?? 5)
    ).length;

    const inventoryValue = items.reduce((acc, curr) => {
        const price = Number(curr.variant?.price || curr.price || 0);
        const stock = Number(curr.stock || 0);
        return acc + stock * price;
    }, 0);

    const filteredItems = items.filter((item) => {
        const term = searchTerm.toLowerCase();
        const sku = String(item.variant?.sku || item.sku || "");
        const productName = String(item.variant?.product?.name || item.productName || "");
        const brand = String(item.variant?.product?.brand?.name || item.brand || "");

        return (
            sku.toLowerCase().includes(term) ||
            productName.toLowerCase().includes(term) ||
            brand.toLowerCase().includes(term)
        );
    });

    // -----------------------------------------------------------------
    // HANDLERS
    // -----------------------------------------------------------------
    const handleOpenAdjustment = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setReason("");
        setAdjustmentType("ADD");
        setModalError(null);
        setOpenModal(true);
    };

    const handleSaveAdjustment = async () => {
        const numericQty = Number(quantity);
        if (!selectedItem || isNaN(numericQty) || numericQty <= 0) {
            setModalError("Ingresa una cantidad válida mayor a 0.");
            return;
        }

        try {
            setIsSaving(true);
            setModalError(null);

            await updateInventory(selectedItem.id, {
                type: adjustmentType,
                quantity: numericQty,
                reason: reason.trim()
            });

            setOpenModal(false);
            await fetchInventory();
        } catch (err) {
            console.error("Error al actualizar el stock:", err);
            setModalError("Ocurrió un error al intentar guardar el ajuste.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenZeroStock = (item) => {
        setItemToDelete(item);
        setOpenDeleteModal(true);
    };

    const handleConfirmZeroStock = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeletingItem(true);
            if (itemToDelete.stock > 0) {
                await updateInventory(itemToDelete.id, {
                    type: "REMOVE",
                    quantity: Number(itemToDelete.stock),
                    reason: "Ajuste manual a cero"
                });
            }
            setOpenDeleteModal(false);
            setItemToDelete(null);
            await fetchInventory();
        } catch (err) {
            console.error("Error al vaciar el stock del producto:", err);
            setError("Ocurrió un error al intentar dejar en cero el producto.");
        } finally {
            setIsDeletingItem(false);
        }
    };

    const handleConfirmClearAll = async () => {
        try {
            setIsClearingAll(true);
            await clearAllInventory();
            setOpenClearDialog(false);
            await fetchInventory();
        } catch (err) {
            console.error("Error al limpiar el inventario:", err);
            setError("Ocurrió un error al intentar borrar todo el inventario.");
        } finally {
            setIsClearingAll(false);
        }
    };

    // Función optimizada para imprimir etiquetas con CÓDIGO DE BARRAS escaneable
    const handlePrintLabel = (item) => {
    // 1. Asegurar que capturamos un código válido y no sea vació/null
    const barcodeNumber = 
        item.variant?.barcode || 
        item.barcode || 
        item.variant?.sku || 
        item.sku || 
        "750000000000"; // fallback

    const name = item.variant?.product?.name || item.productName || "Producto";
    const price = Number(item.variant?.price || item.price || 0).toFixed(2);
    const size = item.variant?.size?.name || item.size || null;

    const printWindow = window.open("", "_blank", "width=480,height=380");
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Etiqueta - ${barcodeNumber}</title>
                    <!-- Cargar JsBarcode -->
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                    <style>
                        @page { size: auto; margin: 0; }
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            text-align: center;
                            margin: 0;
                            padding: 10px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background-color: #ffffff;
                        }
                        .label-card {
                            border: 2px dashed #1e293b;
                            padding: 10px 14px;
                            border-radius: 8px;
                            max-width: 300px;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        .title { 
                            font-size: 14px; 
                            font-weight: 700; 
                            color: #0f172a;
                            margin-bottom: 2px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        .size-badge {
                            font-size: 11px;
                            font-weight: 700;
                            color: #4c1d95;
                            background-color: #f5f3ff;
                            border: 1px solid #ddd6fe;
                            padding: 2px 6px;
                            border-radius: 4px;
                            display: inline-block;
                            margin-bottom: 2px;
                        }
                        .price { 
                            font-size: 22px; 
                            font-weight: 800; 
                            color: #000; 
                            margin-top: 2px; 
                        }
                        svg#barcode {
                            width: 100%;
                            max-height: 60px;
                            margin: 4px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="label-card">
                        <div class="title">${name}</div>
                        ${size ? `<div class="size-badge">Talla: ${size}</div>` : ''}
                        <svg id="barcode"></svg>
                        <div class="price">$${price}</div>
                    </div>

                    <script>
                        function renderBarcode() {
                            try {
                                if (typeof JsBarcode === 'function') {
                                    JsBarcode("#barcode", "${String(barcodeNumber)}", {
                                        format: "CODE128", // CODE128 soporta cualquier tipo de números (750...) y letras
                                        lineColor: "#000",
                                        width: 2,
                                        height: 50,
                                        displayValue: true,
                                        fontSize: 13,
                                        margin: 0
                                    });
                                    
                                    // Dar 250ms extra a la ventana para renderizar el dibujo del SVG antes de imprimir
                                    setTimeout(() => {
                                        window.print();
                                        window.close();
                                    }, 250);
                                } else {
                                    // Si CDN no ha cargado aún, reintentar en 50ms
                                    setTimeout(renderBarcode, 50);
                                }
                            } catch (e) {
                                console.error("Error al generar barcode:", e);
                            }
                        }

                        window.onload = renderBarcode;
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
};
    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#fafafa", minHeight: "100vh" }}>
            {/* ENCABEZADO PRINCIPAL */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
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
                        Control de Inventario
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                        Consulta existencias en tiempo real y gestiona entradas o salidas de mercancía.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Button
                        variant="outlined"
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => setOpenClearDialog(true)}
                        disabled={loading || items.length === 0}
                        sx={{
                            color: "#fecdd3",
                            borderColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(4px)",
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { borderColor: "#f43f5e", bgcolor: "rgba(244, 63, 94, 0.1)" }
                        }}
                    >
                        Limpiar todo
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<HistoryIcon />}
                        onClick={fetchImportHistory}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            color: "white",
                            backdropFilter: "blur(10px)",
                            borderRadius: 2.5,
                            boxShadow: "none",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(255,255,255,0.25)", boxShadow: "none" }
                        }}
                    >
                        Historial
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={fetchInventory}
                        disabled={loading}
                        sx={{
                            bgcolor: "white",
                            color: PURPLE_DARK,
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 700,
                            "&:hover": { bgcolor: "#f3e8ff" }
                        }}
                    >
                        Actualizar
                    </Button>
                </Stack>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* TARJETAS DE MÉTRICAS */}
            <Grid container spacing={2.5} mb={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: `1px solid ${PURPLE_BORDER}`,
                            bgcolor: "white",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                        }}
                    >
                        <Box sx={{ bgcolor: PURPLE_LIGHT, p: 1.8, borderRadius: 3, color: PURPLE_MAIN }}>
                            <InventoryIcon fontSize="large" />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight="600" color="text.secondary" textTransform="uppercase">
                                Total Unidades
                            </Typography>
                            <Typography variant="h5" fontWeight="800" color="#1e293b">
                                {totalUnits.toLocaleString()} <Typography component="span" variant="body2" color="text.secondary">pcs</Typography>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: "1px solid #e2e8f0",
                            bgcolor: "white",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                        }}
                    >
                        <Box sx={{ bgcolor: "#ecfdf5", p: 1.8, borderRadius: 3, color: "#10b981" }}>
                            <AttachMoneyIcon fontSize="large" />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight="600" color="text.secondary" textTransform="uppercase">
                                Valor Total Inventario
                            </Typography>
                            <Typography variant="h5" fontWeight="800" color="#1e293b">
                                ${inventoryValue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                
            </Grid>

            {/* SECCIÓN DE BARRA DE BÚSQUEDA Y TABLA */}
            <Paper elevation={0} sx={{ borderRadius: 3.5, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 25px rgba(0,0,0,0.04)" }}>
                {/* BUSCADOR */}
                <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9", bgcolor: "white" }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por SKU, Nombre de Producto, Marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: PURPLE_MAIN }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2.5, bgcolor: "#f8fafc" }
                        }}
                        size="small"
                    />
                </Box>

                {/* TABLA DE INVENTARIO */}
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: PURPLE_LIGHT }}>
                            <TableRow>
                                <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700 }}>SKU</TableCell>
                                <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700 }}>Producto</TableCell>
                                <TableCell sx={{ color: PURPLE_DARK, fontWeight: 700 }}>Detalles</TableCell>
                                <TableCell align="center" sx={{ color: PURPLE_DARK, fontWeight: 700 }}>Precio</TableCell>
                                <TableCell align="center" sx={{ color: PURPLE_DARK, fontWeight: 700 }}>Stock Actual</TableCell>
                                <TableCell align="center" sx={{ color: PURPLE_DARK, fontWeight: 700 }}>Estado</TableCell>
                                <TableCell align="right" sx={{ color: PURPLE_DARK, fontWeight: 700 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <CircularProgress sx={{ color: PURPLE_MAIN }} />
                                        <Typography mt={2} color="text.secondary" fontWeight="500">Cargando inventario...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary" fontWeight="500">No se encontraron productos en inventario.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item, index) => {
                                    const sku = item.variant?.sku || item.sku || "N/A";
                                    const name = item.variant?.product?.name || item.productName || "Sin Nombre";
                                    const brand = item.variant?.product?.brand?.name || item.brand || "-";
                                    const category = item.variant?.product?.category?.name || item.category || "-";
                                    const color = item.variant?.color?.name || item.color;
                                    const size = item.variant?.size?.name || item.size;
                                    const price = Number(item.variant?.price || item.price || 0);
                                    const stock = Number(item.stock ?? 0);

                                    const isOut = stock === 0;

                                    return (
                                        <TableRow
                                            key={item.id || index}
                                            sx={{
                                                "&:hover": { bgcolor: "#faf5ff" },
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="700" sx={{ color: PURPLE_MAIN }}>
                                                    {sku}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="600" color="#1e293b">
                                                    {name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {brand} • {category}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.8}>
                                                    {color && (
                                                        <Chip
                                                            label={color}
                                                            size="small"
                                                            sx={{ borderRadius: 1.5, bgcolor: "#f1f5f9", fontWeight: 600, fontSize: "0.75rem" }}
                                                        />
                                                    )}
                                                    {size && (
                                                        <Chip
                                                            label={`Talla: ${size}`}
                                                            size="small"
                                                            sx={{ borderRadius: 1.5, bgcolor: "#f1f5f9", fontWeight: 600, fontSize: "0.75rem" }}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight="600" variant="body2">
                                                    ${price.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight="800" fontSize="1.05rem" color={isOut ? "error.main" : "text.primary"}>
                                                    {stock}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {isOut ? (
                                                    <Chip
                                                        label="Agotado"
                                                        size="small"
                                                        sx={{ bgcolor: "#ffe4e6", color: "#e11d48", fontWeight: 700, borderRadius: 2 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Disponible"
                                                        size="small"
                                                        sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 700, borderRadius: 2 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Imprimir etiqueta con código de barras">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handlePrintLabel(item)}
                                                            sx={{
                                                                color: PURPLE_MAIN,
                                                                bgcolor: PURPLE_LIGHT,
                                                                "&:hover": { bgcolor: "#ede9fe" }
                                                            }}
                                                        >
                                                            <PrintIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Realizar ajuste de stock">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleOpenAdjustment(item)}
                                                            sx={{
                                                                borderRadius: 2,
                                                                color: PURPLE_MAIN,
                                                                borderColor: PURPLE_BORDER,
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                                "&:hover": { borderColor: PURPLE_MAIN, bgcolor: PURPLE_LIGHT }
                                                            }}
                                                        >
                                                            Ajustar
                                                        </Button>
                                                    </Tooltip>

                                                    <Tooltip title="Dejar stock en 0">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleOpenZeroStock(item)}
                                                                disabled={stock === 0}
                                                                sx={{ bgcolor: "#fff1f2", "&:hover": { bgcolor: "#ffe4e6" } }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* MODALES MANTENIDOS IGUAL */}
            {/* Modal Ajuste */}
            <Dialog open={openModal} onClose={() => !isSaving && setOpenModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
                <DialogTitle fontWeight="800" sx={{ color: PURPLE_DARK }}>Ajuste de Stock</DialogTitle>
                <DialogContent dividers>
                    {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{modalError}</Alert>}
                    {selectedItem && (
                        <Stack spacing={2.5} mt={1}>
                            <Box sx={{ p: 2, bgcolor: PURPLE_LIGHT, borderRadius: 2.5 }}>
                                <Typography variant="caption" color="text.secondary">Producto a modificar:</Typography>
                                <Typography variant="subtitle2" fontWeight="700" color={PURPLE_DARK}>
                                    {selectedItem.variant?.product?.name || selectedItem.productName}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    SKU: {selectedItem.variant?.sku || selectedItem.sku}
                                </Typography>
                            </Box>

                            <TextField
                                select
                                label="Tipo de Ajuste"
                                value={adjustmentType}
                                onChange={(e) => setAdjustmentType(e.target.value)}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="ADD">Entrada (+ Sumar Stock)</MenuItem>
                                <MenuItem value="REMOVE">Salida (- Restar Stock)</MenuItem>
                            </TextField>

                            <TextField
                                label="Cantidad"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                fullWidth
                                size="small"
                                inputProps={{ min: 1 }}
                            />

                            <TextField
                                label="Motivo (Opcional)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                placeholder="Ej: Compra directa, merma, devolución..."
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenModal(false)} disabled={isSaving} sx={{ color: "text.secondary", textTransform: "none" }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveAdjustment}
                        disabled={isSaving}
                        sx={{ bgcolor: PURPLE_MAIN, "&:hover": { bgcolor: PURPLE_DARK }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                    >
                        {isSaving ? <CircularProgress size={24} color="inherit" /> : "Guardar Ajuste"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Dejar en 0 */}
            <Dialog open={openDeleteModal} onClose={() => !isDeletingItem && setOpenDeleteModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
                <DialogTitle fontWeight="800" color="error.main">Vaciar Stock del Producto</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas ajustar el stock de <strong>{itemToDelete?.variant?.product?.name || itemToDelete?.productName}</strong> a 0?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDeleteModal(false)} disabled={isDeletingItem} sx={{ color: "text.secondary", textTransform: "none" }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmZeroStock}
                        disabled={isDeletingItem}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                    >
                        {isDeletingItem ? <CircularProgress size={24} color="inherit" /> : "Sí, Dejar en 0"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Limpiar Todo */}
            <Dialog open={openClearDialog} onClose={() => !isClearingAll && setOpenClearDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
                <DialogTitle fontWeight="800" color="error.main">Limpiar Inventario Completo</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Esta acción vaciará el stock de <strong>TODOS</strong> los productos registrados en el inventario. ¿Deseas continuar?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenClearDialog(false)} disabled={isClearingAll} sx={{ color: "text.secondary", textTransform: "none" }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmClearAll}
                        disabled={isClearingAll}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                    >
                        {isClearingAll ? <CircularProgress size={24} color="inherit" /> : "Confirmar Vaciado"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Historial */}
            <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
                <DialogTitle fontWeight="800" sx={{ color: PURPLE_DARK }}>Historial de Importaciones</DialogTitle>
                <DialogContent dividers>
                    {importHistory.length === 0 ? (
                        <Typography color="text.secondary" py={3} align="center">No hay registros de importaciones previas.</Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: PURPLE_LIGHT }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: PURPLE_DARK }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: PURPLE_DARK }}>Archivo</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: PURPLE_DARK }}>Registros</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: PURPLE_DARK }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {importHistory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{new Date(item.createdAt || item.date).toLocaleString()}</TableCell>
                                            <TableCell>{item.fileName || item.filename || "Archivo sin nombre"}</TableCell>
                                            <TableCell align="center">{item.recordsCount || item.totalRecords || 0}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Descargar archivo original">
                                                        <IconButton size="small" onClick={() => downloadImportFile(item.id)}>
                                                            <DownloadIcon fontSize="small" color="primary" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar registro">
                                                        <IconButton size="small" onClick={() => handleDeleteImport(item.id)}>
                                                            <DeleteIcon fontSize="small" color="error" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenHistory(false)} sx={{ textTransform: "none", color: "text.secondary" }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
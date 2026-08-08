import {
    Box,
    Button,
    MenuItem,
    Stack,
    TextField,
    InputAdornment,
    Paper
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddRounded";
import UploadFileIcon from "@mui/icons-material/UploadFileRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";

import { useNavigate } from "react-router-dom";

// CONSTANTES DE ESTILO MORADO MODERNO
const PURPLE_MAIN = "#6d28d9";
const PURPLE_DARK = "#4c1d95";
const PURPLE_LIGHT = "#f5f3ff";
const PURPLE_BORDER = "#ddd6fe";

export default function ProductToolbar({
    search,
    setSearch,
    category,
    setCategory,
    brand,
    setBrand,
    categories = [], // Arreglo de categorías
    brands = [],     // Arreglo de marcas
    refresh
}) {
    const navigate = useNavigate();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3.5,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}
        >
            <Stack spacing={2}>
                {/* FILA DE BUSCADOR Y FILTROS */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems="center"
                >
                    {/* Buscador general */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Buscar producto"
                        placeholder="Nombre, SKU o código de barras..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: PURPLE_MAIN }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2.5, bgcolor: "#f8fafc" }
                        }}
                    />

                    {/* Selector de Categorías */}
                    <TextField
                        select
                        size="small"
                        label="Categoría"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        sx={{
                            minWidth: { xs: "100%", md: 200 },
                            "& .MuiOutlinedInput-root": { borderRadius: 2.5 }
                        }}
                    >
                        <MenuItem value="">
                            <em>Todas las categorías</em>
                        </MenuItem>
                        {categories.map((cat) => (
                            <MenuItem 
                                key={cat.id || cat._id || cat.name || cat} 
                                value={cat.id || cat._id || cat.name || cat}
                            >
                                {cat.name || cat}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Selector de Marcas */}
                    <TextField
                        select
                        size="small"
                        label="Marca"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        sx={{
                            minWidth: { xs: "100%", md: 200 },
                            "& .MuiOutlinedInput-root": { borderRadius: 2.5 }
                        }}
                    >
                        <MenuItem value="">
                            <em>Todas las marcas</em>
                        </MenuItem>
                        {brands.map((b) => (
                            <MenuItem 
                                key={b.id || b._id || b.name || b} 
                                value={b.id || b._id || b.name || b}
                            >
                                {b.name || b}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                {/* FILA DE BOTONES DE ACCIÓN */}
                <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={1.5}
                    pt={1}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/products/new")}
                            sx={{
                                bgcolor: PURPLE_MAIN,
                                borderRadius: 2.5,
                                textTransform: "none",
                                fontWeight: 700,
                                px: 2.5,
                                "&:hover": { bgcolor: PURPLE_DARK }
                            }}
                        >
                            Nuevo Producto
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={() => navigate("/import")}
                            sx={{
                                color: PURPLE_MAIN,
                                borderColor: PURPLE_BORDER,
                                borderRadius: 2.5,
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                    borderColor: PURPLE_MAIN,
                                    bgcolor: PURPLE_LIGHT
                                }
                            }}
                        >
                            Importar Excel
                        </Button>
                    </Stack>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={refresh}
                        sx={{
                            color: "text.secondary",
                            borderColor: "#e2e8f0",
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                                borderColor: PURPLE_MAIN,
                                color: PURPLE_MAIN,
                                bgcolor: PURPLE_LIGHT
                            }
                        }}
                    >
                        Actualizar
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
}
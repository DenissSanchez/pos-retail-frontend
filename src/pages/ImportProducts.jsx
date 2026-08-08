import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Paper,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from "@mui/material";

import ExcelImporter from "../components/import/ExcelImporter";
import ImportPreview from "../components/import/ImportPreview";
import {
  previewImportAPI,
  importProductsAPI
} from "../services/import.service";

export default function ImportProducts() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null); // <- Guarda el archivo binario seleccionado
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [options, setOptions] = useState({
    updatePrices: true,
    updateCosts: true,
    updateStock: true,
    updateSupplierSku: true,
    createCatalogs: true,
    skipErrors: true
  });

  const handleOptionChange = (field) => (event) => {
    setOptions((prev) => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  // CAMBIO 2: handlePreview solo recibe excelRows (el archivo físico ya fue capturado por onFileSelected)
  const handlePreview = async (excelRows) => {
    setLoading(true);
    try {
      setRows(excelRows);

      const response = await previewImportAPI(excelRows, options);
      setPreview(response.data);
    } catch (error) {
      console.error("Error al generar vista previa:", error);
      alert(error.message || "Error al procesar la vista previa del archivo.");
    } finally {
      setLoading(false);
    }
  };

  // CAMBIO 3: handleImport envía el estado 'file' guardado previamente
  const handleImport = async () => {
    if (!rows || rows.length === 0) {
      alert("No hay filas para importar. Vuelve a cargar el archivo Excel.");
      return;
    }

    setLoading(true);
    try {

        console.log("Archivo que se enviará:", file);
      // 'file' ya no es null ni depende del parámetro de preview
      await importProductsAPI(rows, options, file);

      alert("Productos importados correctamente.");
      setPreview(null);
      setRows([]);
      setFile(null);
      
      navigate("/inventory");
    } catch (error) {
      console.error("Error al importar:", error);
      alert(error.message || "Error al importar productos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" mb={4}>
        Importar Inventario
      </Typography>

      {/* CAMBIO 1: Se agrega la prop onFileSelected={setFile} */}
      <ExcelImporter 
        onImport={handlePreview} 
        onFileSelected={setFile} 
      />

      {loading && (
        <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mt: 3 }}>
          Procesando información del archivo...
        </Alert>
      )}

      {preview && (
        <>
          {/* Resumen de Métricas */}
          <Grid container spacing={2} mt={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    Filas
                  </Typography>
                  <Typography variant="h4">
                    {preview.summary?.totalRows || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    Nuevos
                  </Typography>
                  <Typography variant="h4">
                    {preview.summary?.newProducts || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    Variantes
                  </Typography>
                  <Typography variant="h4">
                    {preview.summary?.newVariants || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    Actualizaciones
                  </Typography>
                  <Typography variant="h4">
                    {preview.summary?.updates || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla con la vista previa */}
          <ImportPreview rows={preview.rows} />

          {/* Opciones de Importación */}
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Opciones de importación
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.updatePrices}
                    onChange={handleOptionChange("updatePrices")}
                  />
                }
                label="Actualizar precios"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.updateCosts}
                    onChange={handleOptionChange("updateCosts")}
                  />
                }
                label="Actualizar costos"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.updateStock}
                    onChange={handleOptionChange("updateStock")}
                  />
                }
                label="Actualizar inventario"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.updateSupplierSku}
                    onChange={handleOptionChange("updateSupplierSku")}
                  />
                }
                label="Actualizar SKU del proveedor"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.createCatalogs}
                    onChange={handleOptionChange("createCatalogs")}
                  />
                }
                label="Crear categorías, marcas, colores y tallas automáticamente"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.skipErrors}
                    onChange={handleOptionChange("skipErrors")}
                  />
                }
                label="Omitir filas con errores"
              />
            </FormGroup>
          </Paper>

          {/* Botón de Acción Principal */}
          <Box mt={3} mb={4}>
            <Button
              variant="contained"
              size="large"
              onClick={handleImport}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? "Importando..." : "Importar productos"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
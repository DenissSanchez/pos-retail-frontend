import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  LinearProgress,
  Chip,
  Divider
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import BoltIcon from "@mui/icons-material/Bolt";

export default function ExcelImporter({

    onImport,

    onFileSelected

}) {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [progress, setProgress] = useState(0);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
      Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
    );
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress(0);
    setFileInfo(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      setProgress(25);

      const workbook = XLSX.read(event.target.result, {
        type: "array"
      });

      setProgress(50);

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convertimos el Excel a array de objetos JSON
      const rows = XLSX.utils.sheet_to_json(sheet);

      console.log("📊 Filas leídas del Excel:", rows);

      setProgress(75);

      const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

      setFileInfo({
        rows: rows.length,
        columns: range.e.c + 1,
        sheetName,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified
      });

      setProgress(100);

      if (onFileSelected) {

    onFileSelected(selectedFile);

}

if (onImport) {

    onImport(rows);

}
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert("Solo se permiten archivos Excel (.xlsx o .xls)");
      return;
    }

    if (acceptedFiles.length === 0) return;

    processFile(acceptedFiles[0]);
  }, [onImport, onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"]
    }
  });

  const removeFile = () => {
    setFile(null);
    setFileInfo(null);
  };

  return (
    <Stack spacing={3}>
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          border: "3px dashed",
          borderColor: isDragActive ? "primary.main" : "#cfd8dc",
          background: isDragActive
            ? "linear-gradient(135deg,#e3f2fd,#ffffff)"
            : "#fafafa",
          transition: "all .35s",
          borderRadius: 5,
          p: 7,
          textAlign: "center",
          cursor: "pointer",
          transform: isDragActive ? "scale(1.02)" : "scale(1)",
          boxShadow: isDragActive
            ? "0 12px 35px rgba(25,118,210,.25)"
            : "0 3px 12px rgba(0,0,0,.08)",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 8px 20px rgba(25,118,210,.18)"
          }
        }}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <FileUploadIcon color="primary" sx={{ fontSize: 90, mb: 2 }} />
        ) : (
          <CloudUploadIcon color="primary" sx={{ fontSize: 90, mb: 2 }} />
        )}

        <Typography variant="h5" fontWeight="bold">
          {isDragActive
            ? "Suelta el archivo para comenzar"
            : "Arrastra tu archivo Excel"}
        </Typography>

        {/* ⚡ CORREGIDO: Reemplazamos Typography contenedor por Box para evitar <p> dentro de <p> */}
        <Box sx={{ mt: 1 }}>
          <Typography color="text.secondary">
            o haz clic para seleccionarlo
          </Typography>

          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Máximo recomendado: 10 MB
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            mt={3}
          >
            <Chip icon={<BoltIcon />} label="Importación rápida" color="primary" />
            <Chip label=".xlsx" variant="outlined" />
            <Chip label=".xls" variant="outlined" />
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Formatos permitidos: .xlsx y .xls
        </Typography>
      </Paper>

      {file && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <DescriptionIcon color="primary" sx={{ fontSize: 42 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {file.name}
                </Typography>

                <Chip
                  icon={<CheckCircleIcon />}
                  label="Excel válido"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Tamaño: {formatBytes(file.size)}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={(event) => {
                event.stopPropagation();
                removeFile();
              }}
            >
              Eliminar
            </Button>
          </Stack>

          <Box mt={3}>
            <Divider sx={{ mb: 3 }} />

            {fileInfo && (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Chip
                    icon={<TableRowsIcon />}
                    label={`${fileInfo.rows} filas`}
                    color="primary"
                  />
                  <Chip
                    icon={<ViewColumnIcon />}
                    label={`${fileInfo.columns} columnas`}
                    color="secondary"
                  />
                </Stack>

                <Typography component="div">
                  📋 Hoja: <b>{fileInfo.sheetName}</b>
                </Typography>

                <Typography component="div">
                  💾 Tamaño: <b>{formatBytes(fileInfo.size)}</b>
                </Typography>

                <Typography component="div">
                  <CalendarMonthIcon
                    sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
                  />
                  {new Date(fileInfo.lastModified).toLocaleDateString()}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 10, borderRadius: 5 }}
                />

                <Typography color="success.main" fontWeight="bold">
                  Archivo listo para analizar
                </Typography>
              </Stack>
            )}
          </Box>
        </Paper>
      )}
    </Stack>
  );
}
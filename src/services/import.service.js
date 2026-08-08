const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BASE_URL = `${API_BASE_URL}/import`;

// Función auxiliar para peticiones JSON
const request = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error del servidor.");
  }

  return data;
};

// Se incluye 'options' para recibir los filtros de la vista previa
export const previewImportAPI = async (rows, options = {}) => {
  return request(`${BASE_URL}/preview`, { rows, options });
};

export const importProductsAPI = async (rows, options, file = null) => {
  const formData = new FormData();

  // 1. Filas de Excel
  formData.append("rows", JSON.stringify(rows || []));

  // 2. Opciones de importación
  formData.append("options", JSON.stringify(options || {}));

  // 3. Archivo binario (solo si existe)
  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    body: formData
    // El navegador asignará 'multipart/form-data' con su boundary automáticamente
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error del servidor.");
  }

  return data;
};

export const downloadImportFile = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/import-history/${id}/download`
  );

  if (!response.ok) {
    throw new Error("No fue posible descargar el archivo.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  const disposition = response.headers.get("Content-Disposition");
  let filename = "importacion.xlsx";

  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/);
    if (match && match[1]) {
      filename = match[1].replace(/["']/g, "");
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

// 🟢 FIX: La función termina limpiamente en el return data;
export const deleteImportHistory = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/import-history/${id}`,
    {
      method: "DELETE"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible eliminar la importación."
    );
  }

  return data;
};
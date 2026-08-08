import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import ProductToolbar from "../components/products/ProductToolbar";
import ProductTable from "../components/products/ProductTable";

import { getProducts } from "../services/product.service";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  // 🔑 Detectar el Rol del Usuario
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = (user.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN" || userRole === "ADMINISTRADOR";

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.sku?.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "" ||
      product.category === category;

    const matchesBrand =
      brand === "" ||
      product.brand === brand;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand
    );
  });

  return (
    <>
      <Typography variant="h4" mb={3}>
        Productos
      </Typography>

      <ProductToolbar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        brand={brand}
        setBrand={setBrand}
        refresh={loadProducts}
        isAdmin={isAdmin} // 👈 1. Pasamos si es Admin para ocultar el botón de "Crear Producto" dentro del toolbar
      />

      <Box sx={{ mb: 3 }} />

      <Paper
        sx={{
          height: 600,
          p: 2
        }}
      >
        <ProductTable 
          rows={filteredProducts} 
          isAdmin={isAdmin} // 👈 2. Pasamos si es Admin para ocultar las acciones de "Editar" o "Eliminar" en las filas
        />
      </Paper>
    </>
  );
}
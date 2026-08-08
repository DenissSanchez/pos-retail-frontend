import { useEffect, useState } from "react";

import {
    Box,
    Button,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useNavigate } from "react-router-dom";

import {
    createProduct,
    getBrands,
    getCategories
} from "../services/product.service";

export default function NewProduct() {

    const navigate = useNavigate();

    const [brands, setBrands] = useState([]);

    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({

        name: "",

        categoryId: "",

        brandId: "",

        description: "",

        active: true

    });

    useEffect(() => {

        loadCatalogs();

    }, []);

    const loadCatalogs = async () => {

        try {

            const [brandsData, categoriesData] = await Promise.all([

                getBrands(),

                getCategories()

            ]);

            setBrands(brandsData);

            setCategories(categoriesData);

        } catch (error) {

            console.error(error);

        }

    };

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const save = async (e) => {

        e.preventDefault();

        try {

            const product = await createProduct(form);

            alert("Producto creado correctamente");

            navigate(`/products/${product.id}`);

        } catch (error) {

            console.error(error);

            alert("No se pudo crear el producto");

        }

    };

    return (

        <Box
            sx={{
                maxWidth: 700,
                mx: "auto"
            }}
        >

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
            >

                <Typography variant="h4">

                    Nuevo Producto

                </Typography>

                <Button

                    startIcon={<ArrowBackIcon />}

                    onClick={() => navigate("/products")}

                >

                    Volver

                </Button>

            </Stack>

            <Paper
                sx={{ p: 4 }}
                component="form"
                onSubmit={save}
            >

                <Stack spacing={3}>

                    <TextField

                        label="Nombre"

                        name="name"

                        value={form.name}

                        onChange={handleChange}

                        required

                    />

                    <TextField

                        select

                        label="Categoría"

                        name="categoryId"

                        value={form.categoryId}

                        onChange={handleChange}

                        required

                    >

                        {

                            categories.map(category => (

                                <MenuItem

                                    key={category.id}

                                    value={category.id}

                                >

                                    {category.name}

                                </MenuItem>

                            ))

                        }

                    </TextField>

                    <TextField

                        select

                        label="Marca"

                        name="brandId"

                        value={form.brandId}

                        onChange={handleChange}

                    >

                        {

                            brands.map(brand => (

                                <MenuItem

                                    key={brand.id}

                                    value={brand.id}

                                >

                                    {brand.name}

                                </MenuItem>

                            ))

                        }

                    </TextField>

                    <TextField

                        multiline

                        rows={4}

                        label="Descripción"

                        name="description"

                        value={form.description}

                        onChange={handleChange}

                    />

                    <Button

                        type="submit"

                        variant="contained"

                        startIcon={<SaveIcon />}

                        size="large"

                    >

                        Crear Producto

                    </Button>

                </Stack>

            </Paper>

        </Box>

    );

}
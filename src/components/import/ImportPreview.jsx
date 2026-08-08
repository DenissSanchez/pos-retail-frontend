import {
    Paper,
    Typography,
    Chip
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

const columns = [

    {
        field: "status",
        headerName: "Estado",
        width: 150,
        renderCell: (params) => {

const colors = {

    Nuevo: "success",

    Variante: "warning",

    Actualizar: "info",

    Error: "error"

};

            return (

                <Chip

                    label={params.value}

                    color={colors[params.value] || "default"}

                    size="small"

                />

            );

        }

    },

    {
        field: "Producto",
        headerName: "Producto",
        flex: 1
    },

    {
        field: "Marca",
        headerName: "Marca",
        width: 150
    },

    {
        field: "Categoria",
        headerName: "Categoría",
        width: 150
    },

    {
        field: "Color",
        headerName: "Color",
        width: 120
    },

    {
        field: "Talla",
        headerName: "Talla",
        width: 120
    },

    {
        field: "message",
        headerName: "Mensaje",
        flex: 1
    }

];

export default function ImportPreview({ rows }) {

    const data = rows.map((row, index) => ({

        id: index,

        ...row

    }));

    return (

        <Paper
            sx={{
                mt: 4,
                height: 600
            }}
        >

            <Typography
                variant="h6"
                p={2}
            >

                Vista previa

            </Typography>

            <DataGrid

                rows={data}

                columns={columns}

                pageSizeOptions={[10,25,50,100]}

            />

        </Paper>

    );

}
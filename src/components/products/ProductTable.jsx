import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

export default function ProductTable({ rows }) {

    const navigate = useNavigate();

    const columns = [
  {
    field: 'sku',
    headerName: 'SKU',
    width: 130,
    // Como ahora manejas un producto general con stock sumado, 
    // puedes renderizar el SKU del primer elemento o dejarlo como prefieras
    valueGetter: (value, row) => row?.sku || 'N/A'
  },
  {
    field: 'name',
    headerName: 'Producto',
    width: 200,
    // Lee directamente 'name' que manda el servicio mapeado
    valueGetter: (value, row) => row?.name || ''
  },
  {
    field: 'category',
    headerName: 'Categoría',
    width: 150,
    // ¡Ya no necesitas hacer row?.category?.name! El backend ya te manda el string directo:
    valueGetter: (value, row) => row?.category || 'Sin categoría'
  },
  {
    field: 'brand',
    headerName: 'Marca',
    width: 150,
    // Lee directamente el string que aplanó el backend:
    valueGetter: (value, row) => row?.brand || 'Sin marca'
  },

   {
            field: "variants",
            headerName: "Variantes",
            type: "number",
            width: 120
        },

  {
    field: 'price',
    headerName: 'Precio',
    width: 120,
    valueGetter: (value, row) => {
      return row?.price ? `$${row.price}` : '—';
    }
  },
  {
    field: 'stock',
    headerName: 'Existencia',
    width: 120,
    // ¡Súper limpio! El backend ya te calculó el total matemático, solo imprímelo:
    valueGetter: (value, row) => row?.stock ?? 0
  },

  {
            field: "active",
            headerName: "Activo",
            width: 110,
            renderCell: (params) =>
                params.value ? "Sí" : "No"
        }

];
    return (

        <DataGrid
            onRowDoubleClick= {(params) => navigate(`/products/${params.row.id}`) }

            rows={rows}

            columns={columns}

            pageSizeOptions={[10,25,50]}

            initialState={{

                pagination: {

                    paginationModel: {

                        pageSize: 10

                    }

                }

            }}

                       disableRowSelectionOnClick

            autoHeight

        />

    );

}
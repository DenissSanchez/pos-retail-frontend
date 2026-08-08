import { DataGrid } from "@mui/x-data-grid";

import {

    IconButton,

    Chip

} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

import InventoryIcon from "@mui/icons-material/Inventory2";

import DeleteIcon from "@mui/icons-material/Delete";

export default function VariantTable({

    variants,

    onEdit,

    onInventory,

    onDelete

}){

    const columns=[

        {

            field:"color",

            headerName:"Color",

            flex:1,

            valueGetter:(value,row)=>row.color.name

        },

        {

            field:"size",

            headerName:"Talla",

            flex:1,

            valueGetter:(value,row)=>row.size.name

        },

        {

            field:"sku",

            headerName:"SKU",

            flex:1.4

        },

        {

            field:"barcode",

            headerName:"Código",

            flex:1.4

        },

        {

            field:"cost",

            headerName:"Costo",

            flex:1,

            renderCell:(params)=>

                `$${Number(params.value).toFixed(2)}`

        },

        {

            field:"price",

            headerName:"Precio",

            flex:1,

            renderCell:(params)=>

                `$${Number(params.value).toFixed(2)}`

        },

        {

            field:"stock",

            headerName:"Stock",

            flex:1,

            valueGetter:(value,row)=>

                row.inventory[0]?.stock ?? 0

        },

        {
    field: "store",

    headerName: "Sucursal",

    flex: 1.5,

    valueGetter: (value, row) =>

        row.inventory?.[0]?.store?.name ?? "Sin sucursal"

},

        {

            field:"active",

            headerName:"Estado",

            flex:1,

            renderCell:(params)=>

                params.value

                ?

                <Chip

                    label="Activo"

                    color="success"

                    size="small"

                />

                :

                <Chip

                    label="Inactivo"

                    color="error"

                    size="small"

                />

        },

        {

            field:"actions",

            headerName:"Acciones",

            width:150,

            sortable:false,

            renderCell:(params)=>(

                <>

                    <IconButton

                        onClick={()=>onEdit(params.row)}

                    >

                        <EditIcon/>

                    </IconButton>

                    <IconButton

                        onClick={()=>onInventory(params.row)}

                    >

                        <InventoryIcon/>

                    </IconButton>

                    <IconButton

                        color="error"

                        onClick={()=>onDelete(params.row)}

                    >

                        <DeleteIcon/>

                    </IconButton>

                </>

            )

        }

    ];

    return(

        <DataGrid

            rows={variants}

            columns={columns}

            autoHeight

            disableRowSelectionOnClick

            pageSizeOptions={[5,10,20]}

            initialState={{

                pagination:{

                    paginationModel:{

                        pageSize:5

                    }

                }

            }}

        />

    );

}
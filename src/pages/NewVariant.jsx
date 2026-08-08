import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Box,
    Paper,
    Stack,
    TextField,
    Typography,
    Button,
    MenuItem
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
    createVariant,
    getProduct,
    generateSku
} from "../services/product.service";

import {
    getColors,
    getSizes,
    getStores
} from "../services/catalog.service";


export default function NewVariant() {


    const navigate = useNavigate();

    const { id } = useParams();


    const [loading,setLoading]=useState(true);

    const [product,setProduct]=useState(null);

    const [colors,setColors]=useState([]);

    const [sizes,setSizes]=useState([]);

    const [stores,setStores]=useState([]);



    const [form,setForm]=useState({

        colorId:"",
        sizeId:"",
        sku:"",
        barcode:"",
        cost:"",
        price:"",
        stock:"",
        storeId:""

    });



    useEffect(()=>{

        loadData();

    },[id]);



    useEffect(()=>{

        generateAutomaticSku();

    },[
        form.colorId,
        form.sizeId,
        product,
        colors,
        sizes
    ]);




    const loadData = async()=>{

        try{


            const [
                productData,
                colorsData,
                sizesData,
                storesData
            ] = await Promise.all([

                getProduct(id),

                getColors(),

                getSizes(),

                getStores()

            ]);


            setProduct(productData);

            setColors(colorsData);

            setSizes(sizesData);

            setStores(storesData);



        }catch(error){

            console.error(
                "Error cargando datos:",
                error
            );

        }finally{

            setLoading(false);

        }

    };





    const generateAutomaticSku = async()=>{


        if(
            !product ||
            !form.colorId ||
            !form.sizeId
        )
        return;



        const color = colors.find(
            c=>c.id===form.colorId
        );


        const size = sizes.find(
            s=>s.id===form.sizeId
        );


        if(!color || !size)
            return;



        const prefix =
        `${product.name.substring(0,3).toUpperCase()}-${
            color.name.substring(0,3).toUpperCase()
        }-${
            size.name.toUpperCase()
        }`;



        try{


            const sku = await generateSku(prefix);


            setForm(prev=>({

                ...prev,

                sku

            }));


        }catch(error){

            console.error(error);

        }

    };





    const handleChange=(e)=>{


        setForm({

            ...form,

            [e.target.name]:e.target.value

        });


    };





    const save=async(e)=>{


        e.preventDefault();


        try{


            await createVariant({

                ...form,

                productId:id

            });



            alert(
                "Variante creada correctamente"
            );


            navigate(`/products/${id}`);



        }catch(error){

            console.error(error);

            alert(
                "No se pudo crear la variante"
            );

        }

    };




    if(loading){

        return <Typography>
            Cargando...
        </Typography>;

    }




    return (

        <Box
            sx={{
                maxWidth:700,
                mx:"auto"
            }}
        >


            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
            >

                <Typography variant="h4">

                    Nueva Variante

                </Typography>



                <Button

                    startIcon={<ArrowBackIcon/>}

                    onClick={()=>navigate(`/products/${id}`)}

                >

                    Volver

                </Button>


            </Stack>




            <Paper

                component="form"

                sx={{p:4}}

                onSubmit={save}

            >


                <Stack spacing={3}>



                    <TextField

                        select

                        label="Color"

                        name="colorId"

                        value={form.colorId}

                        onChange={handleChange}

                        required

                    >

                    {
                        colors.map(color=>(

                            <MenuItem

                                key={color.id}

                                value={color.id}

                            >

                                {color.name}

                            </MenuItem>

                        ))
                    }

                    </TextField>





                    <TextField

                        select

                        label="Talla"

                        name="sizeId"

                        value={form.sizeId}

                        onChange={handleChange}

                        required

                    >

                    {
                        sizes.map(size=>(

                            <MenuItem

                                key={size.id}

                                value={size.id}

                            >

                                {size.name}

                            </MenuItem>


                        ))
                    }


                    </TextField>





                    <TextField

                        select

                        label="Sucursal"

                        name="storeId"

                        value={form.storeId}

                        onChange={handleChange}

                        required

                    >

                    {
                        stores.map(store=>(

                            <MenuItem

                                key={store.id}

                                value={store.id}

                            >

                                {store.name}

                            </MenuItem>

                        ))
                    }


                    </TextField>





                    <TextField

                        label="SKU"

                        name="sku"

                        value={form.sku}

                        onChange={handleChange}

                    />





                    <TextField

                        label="Código de barras"

                        name="barcode"

                        value={form.barcode}

                        onChange={handleChange}

                    />





                    <TextField

                        type="number"

                        label="Costo"

                        name="cost"

                        value={form.cost}

                        onChange={handleChange}

                        required

                    />





                    <TextField

                        type="number"

                        label="Precio"

                        name="price"

                        value={form.price}

                        onChange={handleChange}

                        required

                    />





                    <TextField

                        type="number"

                        label="Stock inicial"

                        name="stock"

                        value={form.stock}

                        onChange={handleChange}

                        required

                    />





                    <Button

                        type="submit"

                        variant="contained"

                        startIcon={<SaveIcon/>}

                        size="large"

                    >

                        Guardar Variante

                    </Button>


                </Stack>


            </Paper>


        </Box>

    );

}
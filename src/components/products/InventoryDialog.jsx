import { useEffect, useState } from "react";

import {

    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography

} from "@mui/material";

export default function InventoryDialog({

    open,

    inventory,

    onClose,

    onSave

}){

    const [stock,setStock]=useState("");

    useEffect(()=>{

        if(inventory){

            setStock(inventory.stock);

        }

    },[inventory]);

    if(!inventory) return null;

    return(

        <Dialog

            open={open}

            onClose={onClose}

            fullWidth

            maxWidth="xs"

        >

            <DialogTitle>

                Editar Inventario

            </DialogTitle>

            <DialogContent>

                <Typography mb={2}>

                    Sucursal:

                    <strong>

                        {" "}

                        {inventory.store?.name}

                    </strong>

                </Typography>

                <TextField

                    fullWidth

                    label="Stock"

                    type="number"

                    value={stock}

                    onChange={(e)=>

                        setStock(e.target.value)

                    }

                />

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>

                    Cancelar

                </Button>

                <Button

                    variant="contained"

                    onClick={()=>onSave(stock)}

                >

                    Guardar

                </Button>

            </DialogActions>

        </Dialog>

    );

}
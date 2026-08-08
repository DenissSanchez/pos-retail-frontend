import api from "./api";

export const getProducts = async () => {

    const response = await api.get("/products");

    return response.data;

};
export const getProduct = async (id) => {

    const { data } = await api.get(`/products/${id}`);

    return data;

};

export const updateProduct = async (id, product) => {

    const { data } = await api.put(

        `/products/${id}`,

        product

    );

    return data;

};

export const updateVariant = async(id,data)=>{

    const response=await api.put(

        `/products/variant/${id}`,

        data

    );

    return response.data;

};

export const createVariant = async (data) => {

    const response = await api.post(

        "/products/variant",

        data

    );

    return response.data;

};

export const createProduct = async(data)=>{

    const response=await api.post(

        "/products",

        data

    );

    return response.data;

};

export const getBrands = async () => {

    const response = await api.get("/catalog/brands");

    return response.data;

};

export const getCategories = async () => {

    const response = await api.get("/catalog/categories");

    return response.data;

};

export const generateSku = async (prefix) => {

    const response = await api.post(
        "/products/generate-sku",
        {
            prefix
        }
    );

    return response.data.sku;
};
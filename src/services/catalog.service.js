import api from "./api";

export const getColors = async () => {

    const response = await api.get("/colors");

    return response.data;

};

export const getSizes = async () => {

    const response = await api.get("/sizes");

    return response.data;

};

export const getStores = async()=>{

    const response = await api.get("/stores");

    return response.data;

};
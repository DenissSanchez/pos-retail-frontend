import api from "./api";

export const getInventory = async () => {
    const response = await api.get("/inventory");
    return response.data;
};

export const updateInventory = async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
};

export const clearAllInventory = async () => {
    const response = await api.delete("/inventory/clear-all");
    return response.data;
};
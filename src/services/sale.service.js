import api from "./api"; // Ajusta según el nombre de tu instancia de axios

export const getDashboardStats = async () => {
  const response = await api.get("/sales/dashboard");
  return response.data;
};
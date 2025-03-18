// src/lib/api.js
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

export const apiRequest = async (url, options = {}) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}${url}`,
      ...options,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error.response?.data || error.message);
    if (error.response?.status === 401) {
      toast({ title: "Error", description: "Session expired. Please log in again.", variant: "destructive" });
    } else {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
    }
    throw error;
  }
};
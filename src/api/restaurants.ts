import { apiClient } from "@/services/apiClient";

export type HalalStatus = "certified" | "muslim-owned" | "halal-friendly";

export type Restaurant = {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  halalStatus: HalalStatus;
  certBody: string | null;
  rating: number;
  reviewCount: number;
  distance: string;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  phone: string;
  hours: string;
  description: string;
  photo: string;
};

export type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  photo: string | null;
};

export const getRestaurants = async (params?: { category?: string; q?: string }) => {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  const result = await apiClient<{ restaurants: Restaurant[] }>(`/api/restaurants${qs ? `?${qs}` : ""}`);
  return result.restaurants;
};

export const getRestaurant = async (id: string) => {
  const result = await apiClient<{ restaurant: Restaurant }>(`/api/restaurants/${encodeURIComponent(id)}`);
  return result.restaurant;
};

export const getRestaurantMenu = async (id: string) => {
  const result = await apiClient<{ restaurant: { id: string; name: string }; menu: MenuItem[] }>(
    `/api/restaurants/${encodeURIComponent(id)}/menu`,
  );
  return result;
};

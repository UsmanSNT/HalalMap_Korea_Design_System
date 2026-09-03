import { apiClient } from "@/services/apiClient";

export type SavedRestaurant = {
  id: string;
  name: string;
  halalStatus: "certified" | "muslim-owned" | "halal-friendly";
  rating: number;
  reviewCount: number;
  imageId: string;
};

export type SavedMosque = {
  id: string;
  name: string;
  nameEn: string;
  distance: string;
};

export type SavedPlaces = {
  restaurants: SavedRestaurant[];
  mosques: SavedMosque[];
};

export const getSavedPlaces = async (): Promise<SavedPlaces> => {
  const data = await apiClient<{ savedPlaces: SavedPlaces }>("/api/saved-places");
  return data.savedPlaces;
};

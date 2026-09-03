import { apiClient } from "@/services/apiClient";

export type Profile = {
  id: number;
  email: string;
  name: string;
  role: string;
  initials: string;
  membership: string;
  points: number;
  stats: { orders: number; reviews: number; saved: number };
};

export const getProfile = async (): Promise<Profile> => {
  const data = await apiClient<{ profile: Profile }>("/api/profile");
  return data.profile;
};

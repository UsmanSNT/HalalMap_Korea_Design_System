import { apiClient } from "../services/apiClient";

export type PartnerRole = "courier" | "owner";

type PartnerLoginInput = { role: PartnerRole; nickname: string; password: string };
type PartnerRegistrationInput = PartnerLoginInput & {
  fullName: string;
  phone: string;
  address: string;
  documents: Record<string, string>;
};

export const loginPartner = (input: PartnerLoginInput) =>
  apiClient<{ success: true }>("/api/partners/login", { method: "POST", body: JSON.stringify(input) });

export const registerPartner = (input: PartnerRegistrationInput) =>
  apiClient<{ success: true }>("/api/partners/register", { method: "POST", body: JSON.stringify(input) });

import { useLocalState } from "./localState";
export type Address = { icon: string; label: string; addr: string; default: boolean };
export const useAddresses = () => useLocalState<Address[]>("addresses", []);

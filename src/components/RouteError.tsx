import React from "react";
import { navigate } from "../services/navigation";
export default class RouteError extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <section role="alert" className="p-8"><h1 className="text-xl font-bold">Sahifani ochishda xato yuz berdi</h1><p className="my-3">Qayta urinib ko‘ring yoki bosh sahifaga qayting.</p><button className="rounded-xl bg-[var(--green)] px-4 py-3 text-white" onClick={() => navigate("/customer/home")}>Bosh sahifa</button></section>;
  }
}

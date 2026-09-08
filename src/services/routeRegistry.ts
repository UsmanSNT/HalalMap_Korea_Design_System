export const routeRegistry = {
  customer: ["home", "splash", "onboarding", "signup", "language", "restaurant-list", "restaurant-detail", "menu", "item-detail", "cart", "checkout", "order-confirmation", "search", "map-view", "city-selector", "restaurant-map-detail", "mosque-list", "mosque-detail", "prayer-times", "qibla", "scanner", "scan-result", "scan-history", "order-tracking", "order-history", "order-detail", "profile", "saved-places", "address", "settings", "reviews", "community", "share", "ai-meal", "group-order", "meal-plans", "grocery", "travel-planner", "offline-prayer", "notifications", "ramadan", "eid", "loyalty", "referral", "tutorial", "multilingual", "submit-place", "apply-courier", "apply-owner"],
  owner: ["main-dashboard", "order-board", "menu-editor", "menu-item-form", "menu-availability", "restaurant-settings", "halal-certification", "sales-analytics", "reviews", "notifications"],
  courier: ["registration", "login", "verification", "go-online", "order-feed", "order-accepted", "at-restaurant", "delivering", "delivery-complete", "delivery-issue", "earnings", "history", "payout", "courier-profile", "courier-settings"],
  admin: ["home", "restaurants", "restaurant-approval", "restaurant-detail", "users", "user-detail", "couriers", "courier-approval", "courier-detail", "orders", "live-map", "halal-db", "mosques", "place-submissions", "promotions", "analytics", "settings", "admin-users"],
} as const;
export type Workspace = keyof typeof routeRegistry;
export const workspaceHome: Record<Workspace, string> = { customer: "home", owner: "main-dashboard", courier: "go-online", admin: "home" };
export function isRoute(workspace: string, screen: string): workspace is Workspace {
  return Object.prototype.hasOwnProperty.call(routeRegistry, workspace) && (routeRegistry[workspace as Workspace] as readonly string[]).includes(screen);
}
const parents: Record<string, string> = {
  "customer/restaurant-detail": "restaurant-list", "customer/menu": "restaurant-detail", "customer/item-detail": "menu", "customer/cart": "menu", "customer/checkout": "cart", "customer/order-confirmation": "order-history", "customer/restaurant-map-detail": "map-view", "customer/mosque-detail": "mosque-list", "customer/qibla": "prayer-times", "customer/scan-result": "scan-history", "customer/scan-history": "scanner", "customer/order-detail": "order-history", "customer/order-tracking": "order-history", "customer/saved-places": "profile", "customer/address": "profile", "customer/settings": "profile", "owner/menu-item-form": "menu-editor", "admin/restaurant-detail": "restaurants", "admin/user-detail": "users", "admin/courier-detail": "couriers", "courier/payout": "earnings", "courier/courier-settings": "courier-profile",
};
export function parentRoute(workspace: Workspace, screen: string) {
  return `/${workspace}/${parents[`${workspace}/${screen}`] ?? workspaceHome[workspace] ?? "home"}`;
}

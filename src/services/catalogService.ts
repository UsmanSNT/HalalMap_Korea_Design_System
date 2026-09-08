import { restaurants, menuItems } from "../data/catalog";
export const catalogService = {
  restaurants: () => restaurants,
  menu: () => menuItems,
  restaurant: (name: string) => restaurants.find(item => item.name === name),
  menuItem: (name: string) => menuItems.find(item => item.name === name),
  search: (query: string) => restaurants.filter(item => `${item.name} ${item.cuisine}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())),
};

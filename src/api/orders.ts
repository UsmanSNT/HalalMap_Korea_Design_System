import { apiClient } from "@/services/apiClient";

export type OrderItem = {
  name: string;
  option: string;
  price: number;
  qty: number;
};

export type Courier = {
  name: string;
  rating: number;
  deliveries: number;
};

export type Order = {
  id: string;
  restaurant: string;
  restaurantId: string;
  date: string;
  total: number;
  items: string;
  status: "delivered" | "cancelled" | "preparing" | "delivering";
  rated: boolean;
  orderNumber?: string;
  orderDate?: string;
  deliveredDate?: string;
  orderItems?: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  couponDiscount?: number;
  tip?: number;
  paymentMethod?: string;
  deliveryAddress?: string;
  courier?: Courier;
};

export const getOrders = async (): Promise<Order[]> => {
  const data = await apiClient<{ orders: Order[] }>("/api/orders");
  return data.orders;
};

export const getOrder = async (id: string): Promise<Order> => {
  const data = await apiClient<{ order: Order }>(`/api/orders/${id}`);
  return data.order;
};

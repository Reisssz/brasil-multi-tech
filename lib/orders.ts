import { CartItem } from "./types";

const ORDERS_KEY = "bmt_orders_v1";

export type PaymentMethod = "pix" | "boleto" | "cartao";

export interface OrderRecord {
  id: string;
  createdAt: string;
  items: CartItem[];
  totalCents: number;
  paymentMethod: PaymentMethod;
  installments: number;
  customerName: string;
  address: {
    cep: string;
    street: string;
    city: string;
    state: string;
  };
}

export const ORDER_STAGES = [
  { key: "confirmado", label: "Pedido confirmado", afterMinutes: 0 },
  { key: "preparando", label: "Preparando para envio", afterMinutes: 2 },
  { key: "enviado", label: "Pedido enviado", afterMinutes: 6 },
  { key: "rota", label: "Saiu para entrega", afterMinutes: 12 },
  { key: "entregue", label: "Entregue", afterMinutes: 20 },
] as const;

function readOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderRecord[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(data: Omit<OrderRecord, "id" | "createdAt">): OrderRecord {
  const order: OrderRecord = {
    ...data,
    id: `BMT-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
  };
  const orders = readOrders();
  writeOrders([order, ...orders]);
  return order;
}

export function getOrder(id: string): OrderRecord | undefined {
  return readOrders().find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
}

export function getOrderStage(order: OrderRecord) {
  const minutesElapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  let currentIndex = 0;
  ORDER_STAGES.forEach((stage, i) => {
    if (minutesElapsed >= stage.afterMinutes) currentIndex = i;
  });
  return { currentIndex, minutesElapsed };
}

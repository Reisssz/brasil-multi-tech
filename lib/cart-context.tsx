"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { CartItem } from "./types";
import { products } from "./data/products";

const STORAGE_KEY = "bmt_cart_v1";

const EMPTY_ITEMS: CartItem[] = [];

let cartItems: CartItem[] = EMPTY_ITEMS;
let hydratedFromStorage = false;
const listeners = new Set<() => void>();

function readFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_ITEMS;
  } catch {
    return EMPTY_ITEMS;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // storage unavailable (private mode, quota, etc.) — cart still works in-memory
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): CartItem[] {
  if (!hydratedFromStorage) {
    cartItems = readFromStorage();
    hydratedFromStorage = true;
  }
  return cartItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

function addItem(productId: string, variantId: string, quantity = 1) {
  const existing = cartItems.find((i) => i.variantId === variantId);
  cartItems = existing
    ? cartItems.map((i) => (i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i))
    : [...cartItems, { productId, variantId, quantity }];
  persist();
  notify();
}

function removeItem(variantId: string) {
  cartItems = cartItems.filter((i) => i.variantId !== variantId);
  persist();
  notify();
}

function setQuantity(variantId: string, quantity: number) {
  cartItems =
    quantity <= 0
      ? cartItems.filter((i) => i.variantId !== variantId)
      : cartItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
  persist();
  notify();
}

function clear() {
  cartItems = [];
  persist();
  notify();
}

interface CartContextValue {
  items: CartItem[];
  addItem: typeof addItem;
  removeItem: typeof removeItem;
  setQuantity: typeof setQuantity;
  clear: typeof clear;
  totalCount: number;
  totalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCents = items.reduce((sum, i) => {
    const product = products.find((p) => p.id === i.productId);
    const variant = product?.variants.find((v) => v.id === i.variantId);
    return sum + (variant ? variant.priceCents * i.quantity : 0);
  }, 0);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setQuantity,
    clear,
    totalCount,
    totalCents,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function resolveCartLine(item: CartItem) {
  const product = products.find((p) => p.id === item.productId);
  const variant = product?.variants.find((v) => v.id === item.variantId);
  return { product, variant };
}

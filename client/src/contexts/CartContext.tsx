import type { StoreProduct } from "@/lib/store";
import { useAuth } from "@/_core/hooks/useAuth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = { product: StoreProduct; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: StoreProduct) => void;
  remove: (productId: number) => void;
  changeQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "game-pay-cart";
const CLEAN_KEY = "game-pay-cart-cleaned-v3";

function readCart(key: string): CartLine[] {
  try {
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.removeItem(key);
      localStorage.setItem(CLEAN_KEY, "true");
      return [];
    }
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [activeKey, setActiveKey] = useState(`${STORAGE_KEY}:guest`);
  const [lines, setLines] = useState<CartLine[]>(() => readCart(`${STORAGE_KEY}:guest`));

  useEffect(() => {
    if (loading) return;
    const nextKey = user ? `${STORAGE_KEY}:customer-${user.id}` : `${STORAGE_KEY}:guest`;
    setLines(readCart(nextKey));
    setActiveKey(nextKey);
  }, [loading, user?.id]);

  useEffect(() => {
    if (!loading) localStorage.setItem(activeKey, JSON.stringify(lines));
  }, [activeKey, lines, loading]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + Number(line.product.price) * line.quantity, 0),
    add: product => setLines(current => {
      const existing = current.find(line => line.product.id === product.id);
      if (existing) return current.map(line => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, Math.max(1, product.stock)) } : line);
      return [...current, { product, quantity: 1 }];
    }),
    remove: productId => setLines(current => current.filter(line => String(line.product.id) !== String(productId))),
    changeQuantity: (productId, quantity) => setLines(current => current.map(line => String(line.product.id) === String(productId) ? { ...line, quantity: Math.min(Math.max(1, quantity), Math.max(1, line.product.stock)) } : line)),
    clear: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

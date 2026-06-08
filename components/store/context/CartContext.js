"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const [hydrated, setHydrated] = useState(false);

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("store-cart");

    if (saved) {
      setCart(JSON.parse(saved));
    }

    setHydrated(true);
  }, []);

  // SAVE
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("store-cart", JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  // ADD
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);

      if (existing) {
        return prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                quantity: p.quantity + quantity,
              }
            : p,
        );
      }

      return [
        ...prev,
        {
          ...product,

          quantity,

          storeSlug: product.store?.slug,

          storeBankName: product.store?.bankName,

          storeAccountName: product.store?.accountName,

          storeAccountNumber: product.store?.accountNumber,
        },
      ];
    });
  };

  // REMOVE
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  // UPDATE
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);

      return;
    }

    setCart((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              quantity: qty,
            }
          : p,
      ),
    );
  };

  // CLEAR
  const clearCart = () => {
    setCart([]);
  };

  // GET ITEM QTY
  const getItemQty = (id) => {
    const item = cart.find((p) => p._id === id);

    return item?.quantity || 0;
  };

  // TOTALS
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        getItemQty,
        totalItems,
        subtotal,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

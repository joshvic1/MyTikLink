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
      const parsed = JSON.parse(saved);

      const upgraded = parsed.map((item) => {
        const selectedVariants = normalizeVariants(item.selectedVariants || {});

        return {
          ...item,
          selectedVariants,
          cartKey: item.cartKey || getCartKey(item._id, selectedVariants),
        };
      });

      setCart(upgraded);
    }

    setHydrated(true);
  }, []);

  // SAVE
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("store-cart", JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const normalizeVariants = (variants = {}) => {
    return Object.keys(variants)
      .sort()
      .reduce((acc, key) => {
        acc[key] = variants[key];
        return acc;
      }, {});
  };

  const getCartKey = (id, variants = {}) => {
    return `${id}-${JSON.stringify(normalizeVariants(variants))}`;
  };
  // ADD
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const selectedVariants = normalizeVariants(
        product.selectedVariants || {},
      );
      const cartKey = getCartKey(product._id, selectedVariants);

      const existing = prev.find((p) => p.cartKey === cartKey);

      if (existing) {
        return prev.map((p) =>
          p.cartKey === cartKey
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
          cartKey,
          selectedVariants,
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
  const removeFromCart = (id, variants = {}) => {
    const cartKey = getCartKey(id, variants);

    setCart((prev) => prev.filter((p) => p.cartKey !== cartKey));
  };

  // UPDATE
  const updateQty = (id, qty, variants = {}) => {
    if (qty <= 0) {
      removeFromCart(id, variants);
      return;
    }

    const cartKey = getCartKey(id, variants);

    setCart((prev) =>
      prev.map((p) =>
        p.cartKey === cartKey
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
  const getItemQty = (id, variants = {}) => {
    const cartKey = getCartKey(id, variants);

    const item = cart.find((p) => p.cartKey === cartKey);

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

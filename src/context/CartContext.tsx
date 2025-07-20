// File: context/CartContext.tsx

"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of a menu item
interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  count: number;
}

// Define the shape of an item in our cart
interface CartItem {
  item: MenuItem;
  quantity: number;
}

// Define the shape of the context's value
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void; // New function
  totalCartItems: number;
  totalPrice: number;
}

// Create the context with a default value of undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a custom hook for easy access to the context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Create the Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (itemToAdd: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item._id === itemToAdd._id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item._id === itemToAdd._id
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, itemToAdd.count) }
            : cartItem
        );
      } else {
        return [...prevCart, { item: itemToAdd, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(ci => ci.item._id === itemId);
      if (newQuantity <= 0) {
        return prevCart.filter(cartItem => cartItem.item._id !== itemId);
      }
      return prevCart.map(cartItem =>
        cartItem.item._id === itemId
          ? { ...cartItem, quantity: Math.min(newQuantity, itemToUpdate!.item.count) }
          : cartItem
      );
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item._id !== itemId));
  };

  // New function to clear the cart
  const clearCart = () => {
    setCart([]);
  };

  const totalCartItems = cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
  const totalPrice = cart.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart, // Expose the new function
    totalCartItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

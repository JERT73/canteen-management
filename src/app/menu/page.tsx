// File: app/menu/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext'; // Import the useCart hook

// Define a type for our menu item
interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  count: number;
}

// Define a type for items grouped by category
interface GroupedMenuItems {
  [key: string]: MenuItem[];
}

export default function StudentMenuPage() {
  const router = useRouter();
  const { cart, addToCart, totalCartItems } = useCart(); // Use the global cart context
  const [menuItems, setMenuItems] = useState<GroupedMenuItems>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndGroupMenuItems = async () => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error('Could not fetch the menu. Please try again later.');
        }
        const data: MenuItem[] = await response.json();
        const grouped = data
          .filter(item => item.inStock && item.count > 0)
          .reduce((acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(item);
            return acc;
          }, {} as GroupedMenuItems);
        
        setMenuItems(grouped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndGroupMenuItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Canteen Menu</h1>
          <div className="flex items-center space-x-6">
            {/* New "My Orders" Button */}
            <button 
              onClick={() => router.push('/my-orders')} 
              className="text-gray-600 hover:text-indigo-600"
              aria-label="View my orders"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

            {/* Existing Cart Icon */}
            <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading delicious items...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-10 bg-red-50 text-red-600 rounded-lg">
            <p>Error: {error}</p>
          </div>
        )}
        {!isLoading && !error && (
          <div className="space-y-8">
            {Object.keys(menuItems).length > 0 ? (
              Object.keys(menuItems).map(category => (
                <section key={category}>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-indigo-500 pb-2">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems[category].map(item => (
                      <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                        <div className="p-6 flex flex-col h-full">
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                            <p className="text-gray-600 mt-2">Price: <span className="font-semibold text-lg">₹{item.price.toFixed(2)}</span></p>
                            <p className="text-sm text-gray-500">Available: {item.count}</p>
                          </div>
                          <button 
                            onClick={() => addToCart(item)} // Use addToCart from context
                            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                            disabled={cart.find(ci => ci.item._id === item._id)?.quantity === item.count}
                          >
                            {cart.find(ci => ci.item._id === item._id)?.quantity === item.count ? 'Max Reached' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">The canteen is currently closed or no items are available.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

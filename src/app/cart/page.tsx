// File: app/cart/page.tsx

"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalCartItems, clearCart } = useCart();
  const router = useRouter();
  
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!studentName || !rollNumber) {
      setError('Please enter your name and roll number.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName,
          rollNumber,
          cart,
          totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      // If order is placed successfully
      console.log('Order placed:', data);
      clearCart(); // Clear the cart from global state
      
      // Redirect to the order confirmation page
      router.push(`/order/${data.orderId}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={() => router.push('/menu')} className="text-gray-800 hover:text-black">
            &larr; Back to Menu
          </button>
          <h1 className="text-3xl font-bold text-black">Your Cart</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-700 mt-2">Add some items from the menu to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black">Order Summary</h2>
              <div className="space-y-4">
                {cart.map(({ item, quantity }) => (
                  <div key={item._id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{item.name}</p>
                      <p className="text-gray-800">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(item._id, quantity - 1)} className="h-8 w-8 bg-gray-200 rounded-full font-bold text-black">-</button>
                      <span className="text-black">{quantity}</span>
                      <button onClick={() => updateQuantity(item._id, quantity + 1)} className="h-8 w-8 bg-gray-200 rounded-full font-bold text-black">+</button>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 ml-4">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-semibold mb-4 text-black">Your Details</h2>
              <div className="space-y-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
                <input 
                  type="text" 
                  placeholder="Class & Roll Number" 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-800">Total Items:</span>
                  <span className="font-semibold text-black">{totalCartItems}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black">
                  <span>Total Price:</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-green-300"
              >
                {isLoading ? 'Placing Order...' : 'Place Order & Pay at Counter'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

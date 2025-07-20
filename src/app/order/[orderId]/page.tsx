// File: app/order/[orderId]/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Define the shape of an order
interface Order {
  _id: string;
  studentName: string;
  rollNumber: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure orderId is available before fetching
    if (orderId) {
      const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Could not find order details.');
          }
          const data = await response.json();
          setOrder(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderDetails();
    } else {
        // If orderId is not present for some reason, stop loading.
        setIsLoading(false);
    }
  }, [orderId]); // Dependency array ensures this runs when orderId changes

  // Loading State UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-red-600">Error</h1>
          <p className="text-red-500 mt-2">{error}</p>
           <button 
              onClick={() => router.push('/menu')}
              className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Back to Menu
            </button>
        </div>
      </div>
    );
  }
  
  // Success State UI
  if (order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-green-600">Order Placed Successfully!</h1>
              <p className="text-gray-500 mt-2">Show this screen at the counter to pay and pick up your order.</p>
            </div>

            <div className="mt-6 border-t border-b border-gray-200 py-4">
              <h2 className="text-lg font-semibold text-gray-800">Order ID:</h2>
              <p className="text-3xl font-mono bg-gray-100 p-2 rounded-md text-center mt-2">{order._id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">For: {order.studentName} ({order.rollNumber})</h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                {order.items.map(item => (
                  <li key={item.itemId} className="flex justify-between">
                    <span>{item.quantity} x {item.name}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 border-t pt-4 flex justify-between items-center text-xl font-bold">
              <span>Total to Pay:</span>
              <span>₹{order.totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-6 text-center">
                <p className="text-lg font-semibold">Status: <span className="text-indigo-600">{order.status}</span></p>
            </div>

             <button 
                onClick={() => router.push('/menu')}
                className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Place Another Order
              </button>
        </div>
      </div>
    );
  }

  // Fallback if order is null and not loading/error
  return null;
}

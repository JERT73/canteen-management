// File: app/my-orders/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function MyOrdersPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false); // To know when to show results/no results message

  // Fetch all recent orders on initial page load
  useEffect(() => {
    const fetchRecentOrders = async () => {
      setIsLoading(true);
      try {
        // We use the existing API that fetches all orders
        const response = await fetch('/api/orders'); 
        if (!response.ok) {
          throw new Error('Could not fetch recent orders.');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const handleFetchOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !rollNumber) {
      setError('Please enter both your name and roll number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearched(true);
    setOrders([]);

    try {
      const response = await fetch('/api/my-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, rollNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not fetch your orders.');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
      setOrders([]); // Clear orders on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button onClick={() => router.push('/menu')} className="text-indigo-600 hover:text-indigo-800 mb-4 font-semibold">
            &larr; Back to Menu
          </button>
          <h1 className="text-3xl font-bold text-black">Order History</h1>
          <p className="text-black mt-1">View recent orders or search for yours below.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleFetchOrders} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="studentName" className="block text-sm font-medium text-black">Your Name</label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="rollNumber" className="block text-sm font-medium text-black">Class & Roll Number</label>
              <input
                id="rollNumber"
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g., 7th & Roll No: 8"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                required
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {isLoading && searched ? 'Searching...' : 'Find My Orders'}
              </button>
            </div>
          </form>
        </div>

        {isLoading && <p className="text-center text-black font-semibold">Loading orders...</p>}
        {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

        {!isLoading && !error && (
          <div>
            <h2 className="text-2xl font-bold text-black mb-4">{searched ? 'Your Search Results' : 'Recent Orders'}</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => router.push(`/order/${order._id}`)}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-black">Order ID: ...{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-black">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-black">₹{order.totalPrice.toFixed(2)}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-black bg-white p-6 rounded-lg shadow-md">
                {searched ? 'No orders found for the provided details.' : 'There are no recent orders.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

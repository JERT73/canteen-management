// File: app/admin/orders/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of an Order item
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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      // Sort orders to show "Placed" orders first
      const sortedData = data.sort((a: Order, b: Order) => {
        if (a.status === 'Placed' && b.status !== 'Placed') return -1;
        if (a.status !== 'Placed' && b.status === 'Placed') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sortedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll for new orders every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      // Refetch orders to get the latest sorted list
      fetchOrders();
    } catch (err: any) {
      console.error('Update status error:', err);
      alert(`Error: ${err.message}`);
    }
  };


  const handleLogout = () => {
    router.push('/admin/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-300 text-black';
      default: return 'bg-gray-100 text-black';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-indigo-600">Canteen Admin</h1>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/admin/dashboard" className="text-black hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/admin/menu" className="text-black hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">Menu</a>
                <a href="/admin/orders" className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium">Orders</a>
              </div>
            </div>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Live Orders</h2>
          </div>
          
          {isLoading && <p className="text-black">Loading orders...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.length > 0 ? (
                orders.map(order => (
                  <div key={order._id} className={`rounded-lg shadow-md p-6 flex flex-col justify-between transition-opacity ${order.status === 'Completed' ? 'bg-gray-200 opacity-75' : 'bg-white'}`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg text-black">{order.studentName}</p>
                          <p className="text-sm text-black">{order.rollNumber}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-black">Order ID: ...{order._id.slice(-6)}</p>
                      
                      <ul className="mt-4 space-y-1 border-t border-gray-300 pt-2">
                        {order.items.map(item => (
                          <li key={item.itemId} className="flex justify-between text-sm text-black">
                            <span>{item.quantity} x {item.name}</span>
                            <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-gray-300 mt-4 pt-4">
                      <div className="flex justify-between items-center font-bold text-lg text-black">
                        <span>Total:</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="mt-4">
                        <button 
                          onClick={() => handleUpdateStatus(order._id, 'Completed')}
                          disabled={order.status === 'Completed'}
                          className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {order.status === 'Completed' ? 'Order Completed' : 'Mark as Completed'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-black col-span-full text-center py-10">No active orders at the moment.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

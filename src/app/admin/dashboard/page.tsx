// File: app/admin/dashboard/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of the analytics data we expect from the API
interface AnalyticsData {
  totalRevenueToday: number;
  totalOrdersToday: number;
  topSellingItem: {
    name: string;
    quantity: number;
  } | null;
  mostProfitableItem: {
    name: string;
    revenue: number;
  } | null;
}

// A reusable component for displaying a single statistic
const StatCard = ({ title, value, subtext, icon }: { title: string, value: string, subtext?: string, icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-indigo-100 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-black">{value}</p>
      {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    router.push('/admin/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">Canteen Admin</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/admin/dashboard" className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/admin/menu" className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Menu
                </a>
                <a href="/admin/orders" className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Orders
                </a>
              </div>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-6 px-4 sm:px-0">Today's Analytics</h2>
          
          {isLoading ? (
             <div className="text-center py-10"><p className="text-xl">Loading Dashboard...</p></div>
          ) : error ? (
             <div className="text-center py-10"><p className="text-xl text-red-500">Error: {error}</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
              <StatCard 
                title="Total Revenue Today"
                value={`₹${analytics?.totalRevenueToday.toFixed(2) || '0.00'}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
              />
              <StatCard 
                title="Total Orders Today"
                value={analytics?.totalOrdersToday.toString() || '0'}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
              />
              <StatCard 
                title="Top Selling Item"
                value={analytics?.topSellingItem?.name || 'N/A'}
                subtext={`${analytics?.topSellingItem?.quantity || 0} units sold`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              />
              <StatCard 
                title="Most Profitable Item"
                value={analytics?.mostProfitableItem?.name || 'N/A'}
                subtext={`₹${analytics?.mostProfitableItem?.revenue.toFixed(2) || '0.00'} revenue`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

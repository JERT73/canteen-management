// File: app/api/analytics/route.ts (Final Version)

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient } from 'mongodb';

// This tells Next.js not to cache the response of this API route.
export const revalidate = 0;

interface Order {
  _id: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: string;
  createdAt: string; // This is a string like "Tue Jul 22 2025..."
}

export async function GET(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');

    // Fetch ALL orders from the database.
    const allOrders = await db.collection<Order>('orders').find({}).toArray();
    
    // --- Filter for "Today" in JavaScript ---
    // This is necessary because the createdAt field is a non-standard string.
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const ordersToday = allOrders.filter(order => {
      // Convert the string from the database into a real Date object
      const orderDate = new Date(order.createdAt);
      // Check if the order's date falls within today's range
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });

    console.log(`[API/Analytics] Found ${ordersToday.length} orders for today after filtering.`);

    // --- Calculate Analytics from Today's Orders ---
    let totalRevenueToday = 0;
    const itemAnalytics: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    for (const order of ordersToday) {
      // Calculate total revenue from completed orders only
      if (order.status === 'Completed') {
        totalRevenueToday += order.totalPrice;
      }

      // Aggregate item data for popularity and profitability from ALL of today's orders
      for (const item of order.items) {
        if (!itemAnalytics[item.itemId]) {
          itemAnalytics[item.itemId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemAnalytics[item.itemId].quantity += item.quantity;
        itemAnalytics[item.itemId].revenue += item.quantity * item.price;
      }
    }

    const totalOrdersToday = ordersToday.length;

    // --- Determine Top Items ---
    const itemAnalyticsArray = Object.values(itemAnalytics);

    const topSellingItem = itemAnalyticsArray.length > 0
      ? itemAnalyticsArray.reduce((prev, current) => (prev.quantity > current.quantity) ? prev : current)
      : null;

    const mostProfitableItem = itemAnalyticsArray.length > 0
      ? itemAnalyticsArray.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current)
      : null;
      
    const analyticsData = {
      totalRevenueToday,
      totalOrdersToday,
      topSellingItem,
      mostProfitableItem,
    };

    console.log('[API/Analytics] Sending final analytics data:', analyticsData);
    
    return NextResponse.json(analyticsData, { status: 200 });

  } catch (error) {
    console.error('[API/Analytics] Failed to fetch analytics:', error);
    return NextResponse.json({ message: 'Failed to fetch analytics data' }, { status: 500 });
  }
}

// File: app/api/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient } from 'mongodb';

// Define the shape of an Order item for clarity
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
  createdAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');

    // --- Calculate Date Range for "Today" ---
    // We set the time to the beginning of the day in the local timezone (IST)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    // --- Fetch Today's Orders ---
    const ordersToday = await db.collection<Order>('orders').find({
      createdAt: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString(),
      }
    }).toArray();

    // --- Calculate Analytics ---
    let totalRevenueToday = 0;
    const itemAnalytics: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    for (const order of ordersToday) {
      // Calculate total revenue from completed orders only
      if (order.status === 'Completed') {
        totalRevenueToday += order.totalPrice;
      }

      // Aggregate item data for popularity and profitability
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

    // --- Return Analytics Data ---
    return NextResponse.json({
      totalRevenueToday,
      totalOrdersToday,
      topSellingItem,
      mostProfitableItem,
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

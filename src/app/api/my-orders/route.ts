// File: app/api/my-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { studentName, rollNumber } = await req.json();

    if (!studentName || !rollNumber) {
      return NextResponse.json({ message: 'Student name and roll number are required' }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');

    // Find all orders matching the student's details and sort by most recent
    const orders = await db.collection('orders').find({
      studentName: studentName,
      rollNumber: rollNumber,
    }).sort({ createdAt: -1 }).toArray();

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No orders found for these details.' }, { status: 404 });
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}

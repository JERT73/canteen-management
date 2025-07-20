// File: app/api/orders/[orderId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';

// This function handles GET requests to /api/orders/[orderId]
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    if (!orderId || !ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch order ${params.orderId}:`, error);
    return NextResponse.json({ message: 'Failed to fetch order details' }, { status: 500 });
  }
}

// *** NEW FUNCTION ***
// This function handles PUT requests to update an order's status
export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const { status } = await req.json(); // We'll send the new status in the request body

    if (!orderId || !ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ message: 'Missing status field' }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order status updated successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Failed to update order ${params.orderId}:`, error);
    return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
  }
}

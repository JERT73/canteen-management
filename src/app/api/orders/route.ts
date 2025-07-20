// File: app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';

// Define the shape of a cart item from the request
interface CartItem {
  item: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

// *** NEW FUNCTION ***
// This function handles GET requests to /api/orders to fetch all orders
export async function GET(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');

    // Find all orders and sort by newest first
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}


// This function handles POST requests to /api/orders to create a new order
export async function POST(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');

    const { studentName, rollNumber, cart, totalPrice } = await req.json();

    if (!studentName || !rollNumber || !cart || cart.length === 0) {
      return NextResponse.json({ message: 'Missing required order information.' }, { status: 400 });
    }

    const updateOperations = cart.map((cartItem: CartItem) => {
      return {
        updateOne: {
          filter: { _id: new ObjectId(cartItem.item._id), count: { $gte: cartItem.quantity } },
          update: { $inc: { count: -cartItem.quantity } },
        },
      };
    });
    
    const bulkWriteResult = await db.collection('menuItems').bulkWrite(updateOperations);

    if (bulkWriteResult.modifiedCount !== cart.length) {
        console.error("Stock update failed for some items. Order not placed.");
        return NextResponse.json({ message: 'Some items are out of stock. Please review your cart.' }, { status: 409 });
    }

    const orderDocument = {
      studentName,
      rollNumber,
      items: cart.map((ci: CartItem) => ({
        itemId: new ObjectId(ci.item._id),
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
      })),
      totalPrice,
      status: 'Placed',
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderDocument);

    return NextResponse.json({ message: 'Order placed successfully!', orderId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Order placement failed:', error);
    return NextResponse.json({ message: 'Failed to place order.' }, { status: 500 });
  }
}

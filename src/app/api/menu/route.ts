// File: app/api/menu/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';

// GET all menu items
export async function GET(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');
    const menuItems = await db.collection('menuItems').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ message: 'Failed to fetch menu items' }, { status: 500 });
  }
}

// POST a new menu item
export async function POST(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');
    const newItemData = await req.json();
    const { name, price, category, count } = newItemData;
    if (!name || price === undefined || !category || count === undefined) {
      return NextResponse.json({ message: 'Validation Error: Missing required fields' }, { status: 400 });
    }
    const documentToInsert = {
      name: String(name),
      price: Number(price),
      category: String(category),
      count: Number(count),
      inStock: Number(count) > 0,
      createdAt: new Date(),
    };
    const result = await db.collection('menuItems').insertOne(documentToInsert);
    return NextResponse.json({ message: 'Item added successfully', insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ message: 'Failed to add menu item due to a server error.' }, { status: 500 });
  }
}

// DELETE a menu item
export async function DELETE(req: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB');
    const id = req.nextUrl.searchParams.get('id');
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing item ID' }, { status: 400 });
    }
    const result = await db.collection('menuItems').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ message: 'Failed to delete item' }, { status: 500 });
  }
}

// *** NEW FUNCTION ***
// PUT (update) a menu item
export async function PUT(req: NextRequest) {
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db('smartCanteenDB');
        
        const id = req.nextUrl.searchParams.get('id');
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid or missing item ID' }, { status: 400 });
        }

        const updatedData = await req.json();
        const { name, price, category, count } = updatedData;

        if (!name || price === undefined || !category || count === undefined) {
            return NextResponse.json({ message: 'Validation Error: Missing required fields' }, { status: 400 });
        }

        const documentToUpdate = {
            name: String(name),
            price: Number(price),
            category: String(category),
            count: Number(count),
            inStock: Number(count) > 0,
        };

        const result = await db.collection('menuItems').updateOne(
            { _id: new ObjectId(id) },
            { $set: documentToUpdate }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Item not found to update' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('API PUT Error:', error);
        return NextResponse.json({ message: 'Failed to update item' }, { status: 500 });
    }
}

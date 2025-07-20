// File: app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // Using '@' as a shortcut for the root directory
import { Db, MongoClient } from 'mongodb';

// This function will handle POST requests to /api/auth/login
export async function POST(req: NextRequest) {
  try {
    // 1. Get the email and password from the request body
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2. Connect to the database
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('smartCanteenDB'); // Use the database name we decided on

    // 3. Find the user in the 'users' collection
    const user = await db.collection('users').findOne({ email: email });

    // 4. Check if the user exists and the password matches
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 } // 401 Unauthorized
      );
    }

    // IMPORTANT: In a real app, passwords should be hashed!
    // We are comparing plain text for now, but we will fix this later.
    const isPasswordCorrect = user.password === password;

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 5. If login is successful, return a success response
    // In the future, we will return a session token here.
    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    // Check if MONGO_URL is set
    if (!process.env.MONGO_URL) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'MONGO_URL environment variable is not set',
        },
        { status: 500 }
      );
    }

    // Try to connect to MongoDB
    const client = await clientPromise;
    const db = client.db('urlshortener');

    // Ping the database
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: 'healthy',
      message: 'MongoDB connection successful',
      database: 'urlshortener',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Health check failed:', errorMessage);

    return NextResponse.json(
      {
        status: 'error',
        message: 'MongoDB connection failed',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

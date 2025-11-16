import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// URL validation function
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, alias } = await request.json();

    // Validate inputs
    if (!url || !alias) {
      return NextResponse.json(
        { error: 'URL and alias are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate alias format (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
      return NextResponse.json(
        { error: 'Alias can only contain letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('urlshortener');
    const collection = db.collection('urls');

    // Check if alias already exists
    const existingAlias = await collection.findOne({ alias });
    if (existingAlias) {
      return NextResponse.json(
        { error: 'This alias is already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Insert the new URL-alias pair
    await collection.insertOne({
      url,
      alias,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      alias,
      shortenedUrl: `${request.headers.get('origin')}/${alias}`,
    });
  } catch (error) {
    console.error('Error creating shortened URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

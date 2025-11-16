import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import Link from 'next/link';

export default async function AliasRedirect({
  params,
}: {
  params: Promise<{ alias: string }>;
}) {
  const { alias } = await params;

  let urlDoc = null;

  try {
    const client = await clientPromise;
    const db = client.db('urlshortener');
    const collection = db.collection('urls');

    urlDoc = await collection.findOne({ alias });
  } catch (error) {
    console.error('Error fetching URL:', error);
  }

  // Redirect if URL found (outside try-catch so redirect error can propagate)
  if (urlDoc && urlDoc.url) {
    redirect(urlDoc.url);
  }

  // If no URL found or error, show 404 message
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          404 - Not Found
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          The shortened URL you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}

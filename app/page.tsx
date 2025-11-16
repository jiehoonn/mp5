'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Frontend URL validation
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortenedUrl('');
    setCopied(false);

    // Frontend validation
    if (!url || !alias) {
      setError('Please fill in both fields');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
      setError('Alias can only contain letters, numbers, and hyphens');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, alias }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setShortenedUrl(data.shortenedUrl);
      setUrl('');
      setAlias('');
    } catch {
      setError('Failed to create shortened URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            URL Shortener
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Create short, memorable links
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Alias
              </label>
              <input
                type="text"
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="my-link"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? 'Creating...' : 'Shorten URL'}
            </button>
          </form>

          {shortenedUrl && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-2">
                Success! Your shortened URL:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shortenedUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-700 rounded text-sm text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

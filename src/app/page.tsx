// src/app/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.skyl.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Accept header if your API specifically needs it, but usually not required for login
          // 'Accept': 'text/plain', // Or 'application/json' if it *might* return json on error
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Try getting error text first, then fallback
        let errorMessage = `Login failed with status: ${response.status}`;
        try {
          const errorText = await response.text(); // Try reading error as text
          // If your API *does* send JSON errors, you might try parsing here
          // try { const errorData = JSON.parse(errorText); errorMessage = errorData?.message || ... } catch {}
          errorMessage = errorText || errorMessage; // Use error text if available
        } catch (e) {
          // Ignore if reading text fails
        }
        throw new Error(errorMessage);
      }

      // --- Read the response body as TEXT ---
      const token = await response.text(); // Use .text() instead of .json()

      // Check if the token string is actually present
      if (!token) {
        throw new Error('Received an empty token response from the server.');
      }

      // Optional: Add a basic check if the token looks like a JWT (3 parts separated by dots)
      if (token.split('.').length !== 3) {
          console.warn("Received token doesn't look like a standard JWT:", token);
          // You might decide to throw an error here depending on strictness
          // throw new Error('Received invalid token format from server.');
      }

      console.log('Login successful, token:', token);

      // Save the token in a cookie
      Cookies.set('authToken', token, { expires: 1, path: '/' , secure: true, sameSite: 'strict'  });

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">
          Skylapp Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="sky@gmail.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="superskylab"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const someFunction = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const e = "example";
};
// File: app/admin/login/page.tsx

// We need to change this to a Client Component to use hooks like useState and handle user events.
"use client"; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the router for redirection

export default function AdminLoginPage() {
  // State to hold the email and password from the input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State to hold any error messages from the API
  const [error, setError] = useState('');
  
  // State to manage the loading status while the form is submitting
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the router
  const router = useRouter();

  // This function is called when the user clicks the "Sign in" button
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default browser form submission
    setIsLoading(true); // Set loading to true
    setError(''); // Clear any previous errors

    try {
      // Use the fetch API to send a POST request to our login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password as JSON
      });

      const data = await response.json(); // Parse the JSON response from the server

      if (response.ok) {
        // If the response status is 200 (OK), login was successful
        console.log('Login successful:', data);
        // For now, we'll just show an alert. In the future, we redirect.
        router.push('/admin/dashboard');
        // TODO: Redirect to the admin dashboard
        // router.push('/admin/dashboard'); 
      } else {
        // If the response was not ok, set the error message to display to the user
        setError(data.message || 'An error occurred.');
      }
    } catch (err) {
      // Handle network errors or other issues with the fetch call
      console.error('An unexpected error occurred:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false); // Set loading back to false
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Canteen Admin</h1>
          <p className="mt-2 text-gray-600">Please sign in to manage the canteen</p>
        </div>

        {/* The onSubmit event on the form is now handled by our function */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email} // The input's value is controlled by our state
                onChange={(e) => setEmail(e.target.value)} // Update state when user types
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password} // The input's value is controlled by our state
                onChange={(e) => setPassword(e.target.value)} // Update state when user types
              />
            </div>
          </div>
          
          {/* Display the error message if it exists */}
          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading} // Disable button while loading
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

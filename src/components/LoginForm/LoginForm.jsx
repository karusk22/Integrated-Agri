import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// The main App component which renders the login form.
export default function LoginForm() {
  // Initialize the navigate hook for programmatic navigation.
  const navigate = useNavigate();
  
  // State hooks to manage form input values.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handles the form submission logic.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setMessage('');

    // Prepare the data to be sent to the backend.
    const credentials = { email, password };

    // Simulate an API call to your backend for authentication.
    console.log('Attempting to log in with:', credentials);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    // For demonstration, we'll assume the login was successful.
    // In a real app, you would handle the response from your backend.
    if (email === 'user@example.com' && password === 'password') {
      setMessage('Login successful! Redirecting to dashboard...');
      
      // Navigate to the homepage after a short delay.
      setTimeout(() => {
        navigate('/');
        window.scrollTo(0, 0); // Scroll to the top of the page after navigation
      }, 1500);

    } else {
      setMessage('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    // Main container for the form with a vibrant, themed background.
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 font-sans">
      {/* Form container with card-like styling, using a subtle shadow and rounded corners. */}
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header section of the form with a themed icon. */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4 text-green-800">🌱</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Log in to your Integrated Agri-Management account
          </p>
        </div>

        {/* The login form itself. */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input field. */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input field. */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Message display area for success or errors. */}
          {message && (
            <p className={`text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          {/* Submit button with loading state. */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Optional footer for account creation. */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account? <Link to="/signup" className="text-green-600 hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

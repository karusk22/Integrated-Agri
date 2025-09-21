import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginForm({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Login successful! Redirecting...');

        // Call App handler to store user
        if (onLoginSuccess) {
          onLoginSuccess(result.user); // backend should return { user }
        }

        setTimeout(() => {
          navigate('/');
          window.scrollTo(0, 0);
        }, 1000);
      } else {
        setMessage(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('An error occurred. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4 text-green-800">🌱</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Log in to your Integrated Agri-Management account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {message && (
            <p className={`text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

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

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account? <Link to="/signup" className="text-green-600 hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

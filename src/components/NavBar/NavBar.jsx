import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import logo from '../../assets/background/Sandhai-Logo.png';

/**
 * Navbar component for the Sandhai application.
 *
 * This component provides responsive navigation links to different sections of the app.
 * It features a collapsible menu for mobile views and is styled with a modern
 * aesthetic using Tailwind CSS, matching the homepage's new theme.
 */
export default function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="relative p-4 shadow-lg font-sans">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-wide flex items-center space-x-2">
          <span className="text-4xl">🌱</span>
          <span>Sandhai</span>
        </Link>

        {/* Mobile menu toggle button. */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700 focus:outline-none" aria-label="Toggle navigation menu" aria-expanded={isOpen}>
            {!isOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Desktop navigation links. */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link 
            to="/products" 
            className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300 text-gray-700 hover:text-green-600 transition-colors duration-200 text-lg font-medium"
          >
            Products
          </Link>
          <Link 
            to="/rental" 
            className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300 text-gray-700 hover:text-green-600 transition-colors duration-200 text-lg font-medium"
          >
            Rental
          </Link>
          <Link 
            to="/cartpage" 
            className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300 text-gray-700 hover:text-green-600 transition-colors duration-200 text-lg font-medium flex items-center space-x-1"
          >
            <ShoppingCart size={20} className="text-emerald-600" />
            <span>Cart</span>
          </Link>

          {/* Conditional rendering for login/profile */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* ⬅️ UPDATED: Added classes to match the 'Products' link style */}
              <Link 
                to="/profile" 
                className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300 text-gray-700 hover:text-green-600 transition-colors duration-200 text-lg font-medium flex items-center space-x-1"
              >
                <User size={20} className="text-emerald-600" />
                <span>Profile</span>
              </Link>
              <button 
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu that slides down. */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl 
                   transition-all duration-300 ease-in-out z-20 overflow-hidden
                   ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <div className="flex flex-col space-y-4 p-4">
            <Link to="/products" onClick={toggleMenu} className="block text-gray-700 hover:text-green-600 text-lg font-medium py-2">
              Products
            </Link>
            <Link to="/rental" onClick={toggleMenu} className="block text-gray-700 hover:text-green-600 text-lg font-medium py-2">
              Rental
            </Link>
            <Link to="/cartpage" onClick={toggleMenu} className="block text-gray-700 hover:text-green-600 text-lg font-medium py-2">
              Cart
            </Link>
            {/* Conditional rendering for login/profile in mobile menu */}
            {user ? (
              <>
                <Link to="/profile" onClick={toggleMenu} className="block text-gray-700 hover:text-green-600 text-lg font-medium py-2">
                  Profile
                </Link>
                <button 
                  onClick={() => { toggleMenu(); onLogout(); }}
                  className="w-full bg-red-500 text-white text-center px-4 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl flex items-center justify-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={toggleMenu}
                className="block bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center px-4 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Navbar component for the Sandhai application.
 *
 * This component provides responsive navigation links to different sections of the app.
 * It features a collapsible menu for mobile views and is styled with a modern
 * aesthetic using Tailwind CSS. It should be used within a React Router context.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    // Main navigation bar with a subtle gradient and a clean, modern shadow.
    <nav className="relative bg-white p-4 shadow-lg font-sans">
      <div className="container mx-auto flex justify-between items-center">
        {/* The app name as a link to the home page. */}
        <Link to="/" className="text-2xl font-extrabold text-green-800 tracking-wide hover:text-green-600 transition-colors duration-200">
          Sandhai
        </Link>

        {/* Mobile menu toggle button. Hidden on medium and larger screens. */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700 focus:outline-none" aria-label="Toggle navigation menu" aria-expanded={isOpen}>
            {/* Hamburger icon for when the menu is closed. */}
            {!isOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            ) : (
              // "X" icon for when the menu is open.
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Desktop navigation links. Hidden on mobile. */}
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
            to="/login" 
            className="text-white bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg 
                       transition-colors duration-200 font-semibold shadow-md transform hover:scale-105"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile menu that slides down. Hidden on desktop.
          It uses max-height and overflow to create a smooth transition. */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl 
                   transition-all duration-300 ease-in-out z-10 overflow-hidden
                   ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex flex-col space-y-4 p-4">
          <Link 
            to="/products" 
            onClick={toggleMenu}
            className="block text-gray-700 hover:text-green-600 text-lg font-medium py-2"
          >
            Products
          </Link>
          <Link 
            to="/rental" 
            onClick={toggleMenu}
            className="block text-gray-700 hover:text-green-600 text-lg font-medium py-2"
          >
            Rental
          </Link>
          <Link 
            to="/login" 
            onClick={toggleMenu}
            className="block text-white bg-green-600 hover:bg-green-700 text-center 
                       px-4 py-3 rounded-lg font-semibold shadow-md transform hover:scale-105"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

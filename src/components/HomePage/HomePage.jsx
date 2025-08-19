import React from 'react-dom';
import { Link } from 'react-router-dom';
import Navbar from '../NavBar/NavBar';

// The main HomePage component, now with improved styling and structure.
export default function HomePage() {
  return (
    <>
    <Navbar/>
    <div className="bg-slate-50 font-sans text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-slate-100 h-[500px] flex flex-col items-center justify-center text-gray-800 p-6 md:p-12">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 animate-fadeInUp">
            Tools, trade, and trust — all in one <i>sandhai.</i>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fadeInUp animate-delay-200">
            A unified digital platform for monetizing agricultural by-products and accessing affordable farm equipment rentals.
          </p>
          <Link to="/products" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-green-700 animate-fadeInUp animate-delay-400">
            Browse our Shop
          </Link>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-16">
          {/* Card for By-products */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img src="https://placehold.co/800x600/6A8E4E/ffffff?text=FOOD+WASTE" alt="Pile of organic by-products" className="w-full h-80 object-cover" />
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4">Re-imagining By-products</h3>
              <p className="text-gray-600 leading-relaxed">
                What many see as waste, we see as possibility. Every peel, husk, and leftover holds hidden potential to create energy, feed, compost, or new products. By rethinking agricultural by-products, we reduce waste, close the loop, and build a sustainable cycle where nothing goes unused.
              </p>
              <Link to="/products" className="inline-block mt-8 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 hover:bg-green-700">
                Check out Byproducts
              </Link>
            </div>
          </div>

          {/* Card for Equipment Rentals */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img src="https://placehold.co/800x600/436b1f/ffffff?text=TRACTOR+IN+FIELD" alt="Tractor harvesting crops" className="w-full h-80 object-cover" />
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4">Empowering with Equipment</h3>
              <p className="text-gray-600 leading-relaxed">
                Behind every harvest is the strength of innovation. Modern equipment empowers farmers to work smarter, save resources, and bring out the best from every acre. By combining tradition with technology, we cultivate not just crops, but a future of efficiency, resilience, and sustainability in agriculture.
              </p>
              <Link to="/rental" className="inline-block mt-8 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 hover:bg-green-700">
                Browse Machinery Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-extrabold mb-4">About Us</h3>
          <p className="text-lg max-w-4xl mx-auto text-gray-600 leading-relaxed">
            We are building a farmer-friendly platform that goes beyond traditional eCommerce. Our app connects farmers, traders, and buyers by creating a dedicated space for agricultural by-products and affordable farming equipment.
            For too long, by-products have been seen as waste. We believe they are hidden opportunities — valuable resources for fuel, feed, fiber, and more. Alongside this, we make essential farming tools and equipment accessible at lower costs, ensuring that no farmer is left behind because of affordability.
          </p>
        </div>

        {/* Our Vision Section */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-extrabold mb-4">Our Vision</h3>
          <p className="text-lg max-w-4xl mx-auto text-gray-600 leading-relaxed">
            To create a future where no farmer struggles for tools, no harvest is wasted, and every by-product finds its true value.
            We envision a marketplace where farmers grow, trade, and thrive with dignity.
          </p>
        </div>
      </div>
      
      {/* Footer component placeholder */}
      <Footer />
    </div>
    </>
  );
};

// Footer component.
const Footer = () => (
  <footer className="bg-gray-800 text-white p-8 text-center">
    <div className="max-w-7xl mx-auto">
      <p>&copy; 2024 Sandhai. All rights reserved.</p>
    </div>
  </footer>
);

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../NavBar/NavBar';
import tractorPic from '../../assets/background/tractor-pic-1.jpg';
import foodWaste from '../../assets/background/food-waste-1.jpg';
import ChatBotMenu from '../ChatBot/ChatBotMenu';
import chatboticon from '../../assets/background/icons8-chatbot3-48.png';

// The main HomePage component, now with an updated theme and more content.
export default function HomePage() {
  return (
    <>
        <Navbar/>
        {/* <div className='fixed right-5 bottom-20 max-md:bottom-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-2 px-5 rounded-3xl z-20'>
            <Link to="/chatbot">
                <img src={chatboticon} alt="" className=''/>
            </Link>
        </div> */}
        <div className="font-sans text-gray-800">
        {/* Hero Section */}
        <div className="relative h-[500px] flex flex-col items-center justify-center p-6 md:p-12">
            <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 animate-fadeInUp bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Tools, trade, and trust — all in one <i>sandhai.</i>
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fadeInUp animate-delay-200 text-gray-700">
                A unified digital platform for monetizing agricultural by-products and accessing affordable farm equipment rentals.
            </p>
            <Link to="/products" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-700 animate-fadeInUp animate-delay-400">
                Browse our Shop
            </Link>
            </div>
        </div>

        {/* Main Content Sections */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-16">
            {/* Card for By-products */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img src={foodWaste} alt="Pile of organic by-products" className="w-full h-80 object-cover" />
                <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Re-imagining By-products</h3>
                <p className="text-gray-600 leading-relaxed">
                    What many see as waste, we see as possibility. Every peel, husk, and leftover holds hidden potential to create energy, feed, compost, or new products. By rethinking agricultural by-products, we reduce waste, close the loop, and build a sustainable cycle where nothing goes unused.
                </p>
                <Link to="/products" className="inline-block mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-colors duration-300 hover:from-emerald-600 hover:to-teal-700">
                    Check out Byproducts
                </Link>
                </div>
            </div>

            {/* Card for Equipment Rentals */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img src={tractorPic} alt="Tractor harvesting crops" className="w-full h-80 object-cover" />
                <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Empowering with Equipment</h3>
                <p className="text-gray-600 leading-relaxed">
                    Behind every harvest is the strength of innovation. Modern equipment empowers farmers to work smarter, save resources, and bring out the best from every acre. By combining tradition with technology, we cultivate not just crops, but a future of efficiency, resilience, and sustainability in agriculture.
                </p>
                <Link to="/rental" className="inline-block mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-colors duration-300 hover:from-emerald-600 hover:to-teal-700">
                    Browse Machinery Catalog
                </Link>
                </div>
            </div>
            </div>

            {/* How It Works Section */}
            <section className="mb-16">
            <h3 className="text-center text-4xl font-extrabold mb-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="text-5xl mb-4 text-emerald-600">1</div>
                <h4 className="text-xl font-bold mb-2">Create Your Profile</h4>
                <p className="text-gray-600">Set up your account as a Farmer or an Equipment Owner and list your products or machinery.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="text-5xl mb-4 text-teal-600">2</div>
                <h4 className="text-xl font-bold mb-2">Connect & Trade</h4>
                <p className="text-gray-600">Browse listings, connect with other users, and negotiate deals directly through the platform.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="text-5xl mb-4 text-cyan-600">3</div>
                <h4 className="text-xl font-bold mb-2">Transact Securely</h4>
                <p className="text-gray-600">Use our integrated payment and notification system for smooth and secure transactions.</p>
                </div>
            </div>
            </section>

            {/* About Section */}
            <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">About Us</h3>
            <p className="text-lg max-w-4xl mx-auto text-gray-600 leading-relaxed">
                We are building a farmer-friendly platform that goes beyond traditional eCommerce. Our app connects farmers, traders, and buyers by creating a dedicated space for agricultural by-products and affordable farming equipment.
                For too long, by-products have been seen as waste. We believe they are hidden opportunities — valuable resources for fuel, feed, fiber, and more. Alongside this, we make essential farming tools and equipment accessible at lower costs, ensuring that no farmer is left behind because of affordability.
            </p>
            </div>

            {/* Testimonials Section */}
            <section className="mb-16">
            <h3 className="text-center text-4xl font-extrabold mb-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">What Our Farmers Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                <p className="text-lg text-gray-700 italic mb-4">"The Sandhai platform has been a game-changer. I was able to rent a tractor at half the usual price, and the process was so simple. It's a huge help for small farmers like me."</p>
                <p className="font-bold text-emerald-600">- Aravind S., Villupuram</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                <p className="text-lg text-gray-700 italic mb-4">"Selling our maize stover was always a challenge. Now, with a few clicks, we connect with buyers and turn waste into income. The secure payment system is a bonus!"</p>
                <p className="font-bold text-teal-600">- Kavitha P., Madurai</p>
                </div>
            </div>
            </section>

            {/* Our Vision Section */}
            <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Our Vision</h3>
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

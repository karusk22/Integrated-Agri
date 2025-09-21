import React, { useState } from 'react';
import { Star, MapPin, Wrench, UserCheck } from 'lucide-react';

/**
 * RentalCard Component
 * Renders a single agricultural machine for rent, displaying all backend details.
 */
const RentalCard = ({ rental, onBookNow }) => {
    // A simple state to manage hover effects if needed, though most is handled by CSS group-hover
    const [isHovered, setIsHovered] = useState(false);

    // Helper function to get the first image URL from the array
    const getRentalImage = () => {
        if (rental.images && rental.images.length > 0) {
            // Correctly form a full URL for the image stored on the backend
            return `http://localhost:3001${rental.images[0]}`;
        }
        // Provide a relevant placeholder if no image exists
        return 'https://placehold.co/600x400/a3e635/14532d?text=Equipment';
    };
    
    // Formats the rate unit from the database (e.g., 'per_day') to a display format (e.g., 'day')
    const formatRateUnit = (unit) => {
        return unit ? unit.replace('per_', '') : 'unit';
    };

    // Placeholder data for fields not yet in the backend schema
    const rating = rental.rating || 4;
    const reviews = rental.reviews || 12;

    return (
        <div 
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100 h-full flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-600/20 z-10"></div>
                <img
                    src={getRentalImage()}
                    alt={rental.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        ₹{rental.rental_rate} / {formatRateUnit(rental.rate_unit)}
                    </div>
                </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {rental.name}
                </h3>
                <div className="flex items-center text-gray-500 mb-3">
                    <MapPin size={14} className="mr-2 text-emerald-500" />
                    <span className="text-sm">{rental.location_name || 'Location not specified'}</span>
                </div>
                
                {/* ✅ NEW: Display driver availability and rate */}
                {rental.driver_option_available && (
                    <div className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-3 self-start">
                        <UserCheck size={14} className="mr-2" />
                        Driver Included (+₹{rental.driver_rate})
                    </div>
                )}

                <div className="flex items-center mb-4">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 font-medium">
                        {rating}.0 ({reviews})
                    </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center text-gray-700">
                        <Wrench size={16} className="mr-2 text-emerald-500" />
                        {/* ✅ NEW: Displaying the actual availability status */}
                        <span className="font-bold text-lg capitalize">{rental.availability_status}</span>
                    </div>
                    <button 
                        onClick={() => onBookNow && onBookNow(rental)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        // Disable the button if the item is not available
                        disabled={rental.availability_status !== 'available'}
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalCard;


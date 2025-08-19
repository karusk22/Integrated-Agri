import React, { useState } from 'react';
import { Star, MapPin, Wrench } from 'lucide-react';

/**
 * RentalCard Component
 * Renders a single agricultural machine for rent.
 */
const RentalCard = ({ rental }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-600/20 z-10"></div>
                <img
                    src={rental.image}
                    alt={rental.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        ₹{rental.price} / {rental.unit}
                    </div>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {rental.name}
                </h3>
                <div className="flex items-center text-gray-500 mb-3">
                    <MapPin size={14} className="mr-2 text-emerald-500" />
                    <span className="text-sm">{rental.location}</span>
                </div>
                <div className="flex items-center mb-4">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < rental.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 font-medium">
                        {rental.rating}.0 ({rental.reviews})
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {rental.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 px-3 py-1 text-xs font-semibold rounded-full border border-emerald-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-700">
                        <Wrench size={16} className="mr-2 text-emerald-500" />
                        <span className="font-bold text-lg">Available</span>
                    </div>
                    <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalCard;
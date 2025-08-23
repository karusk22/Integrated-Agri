import React, { useState } from 'react';
import { Star, MapPin, Award, Package } from 'lucide-react';

/**
 * ProductCard Component
 * Enhanced with beautiful animations and modern design
 */
const ProductCard = ({ product }) => {
    // Add a check to handle cases where the product prop is undefined
    if (!product) {
        return null;
    }

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100 h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image with Gradient Overlay */}
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-600/20 z-10"></div>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        ₹{product.price}/kg
                    </div>
                </div>

                {/* Quality Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="bg-white/90 backdrop-blur-sm text-emerald-600 px-3 py-1 rounded-full flex items-center text-xs font-semibold">
                        <Award size={12} className="mr-1" />
                        Premium
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold py-3 rounded-xl hover:bg-white/30 transition-all duration-300">
                            Quick View
                        </button>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
                {/* Product Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {product.name}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-3">
                    <MapPin size={14} className="mr-2 text-emerald-500" />
                    <span className="text-sm">{product.location}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={
                                    i < product.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-200"
                                }
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 font-medium">
                        {product.rating}.0 ({product.reviews})
                    </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 px-3 py-1 text-xs font-semibold rounded-full border border-emerald-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Quantity and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-700">
                        <Package size={16} className="mr-2 text-emerald-500" />
                        <span className="font-bold text-lg">{product.quantity}</span>
                    </div>
                    <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
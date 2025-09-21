import React, { useState } from 'react';
import { Star, MapPin, Award, Package, ShoppingCart } from 'lucide-react';

/**
 * ProductCard Component
 * Simplified with a single "Add to Cart" button and corrected functionality.
 */
const ProductCard = ({ product, onAddToCart }) => {
    if (!product) {
        return null;
    }

    const [itemQuantity, setItemQuantity] = useState(1);

    const getProductImage = () => {
        if (product.images && product.images.length > 0) {
            return `http://localhost:3001${product.images[0]}`;
        }
        return 'https://placehold.co/600x400/E5E7EB/4B5563?text=No+Image';
    };

    const handleQuantityChange = (e) => {
        const value = Math.max(1, parseInt(e.target.value, 10) || 1);
        setItemQuantity(value);
    };

    return (
        <div 
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100 flex flex-col h-full"
        >
            {/* Product Image with Gradient Overlay */}
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-600/20 z-10"></div>
                <img
                    src={getProductImage()}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        ₹{product.price}/{product.unit}
                    </div>
                </div>

                {/* Quality Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="bg-white/90 backdrop-blur-sm text-emerald-600 px-3 py-1 rounded-full flex items-center text-xs font-semibold">
                        <Award size={12} className="mr-1" />
                        Premium
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {product.name}
                </h3>

                <div className="flex items-center text-gray-500 mb-3">
                    <MapPin size={14} className="mr-2 text-emerald-500" />
                    <span className="text-sm">{product.location_name || 'Location not specified'}</span>
                </div>

                <div className="flex items-center mb-4">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={i < (product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 font-medium">
                        {product.rating || 'N/A'} ({product.reviews || 0} reviews)
                    </span>
                </div>
                
                {/* Spacer to push content to the bottom */}
                <div className="flex-grow"></div>

                {/* Quantity and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center text-gray-700 text-sm">
                        <Package size={16} className="mr-2 text-emerald-500" />
                        <span>Available: <span className="font-bold">{product.quantity}</span> {product.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={itemQuantity}
                            onChange={handleQuantityChange}
                            min="1"
                            className="w-16 text-center border border-gray-300 rounded-md py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
                            onClick={() => onAddToCart(product, itemQuantity)}
                        >
                            <ShoppingCart size={16} className="mr-2" />
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

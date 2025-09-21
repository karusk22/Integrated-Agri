import React, { useState } from 'react';
import { Star, MapPin, Award, Package, ShoppingCart } from 'lucide-react';

/**
 * ProductCard Component
 * Modified to prevent the owner from adding their own product.
 * @param {object} props.user - The logged-in user object.
 */
const ProductCard = ({ product, onAddToCart, user }) => {
    if (!product) {
        return null;
    }

    const [itemQuantity, setItemQuantity] = useState(1);
    
    // Determine if the product is out of stock
    const maxStock = parseInt(product.quantity, 10);
    const isOutOfStock = maxStock <= 0;

    // 🔥 CRITICAL FIX: Check if the logged-in user is the owner
    const isOwner = user && product.seller_id && parseInt(user.user_id) === parseInt(product.seller_id);

    const getProductImage = () => {
        if (product.images && product.images.length > 0) {
            return `http://localhost:3001${product.images[0]}`;
        }
        return 'https://placehold.co/600x400/E5E7EB/4B5563?text=No+Image';
    };

    const handleQuantityChange = (e) => {
        const input = parseInt(e.target.value, 10);
        let value = Math.max(1, input || 1);
        
        if (maxStock > 0) {
            value = Math.min(value, maxStock);
        } else {
            value = 0;
        }

        setItemQuantity(value);
    };

    // Determine if the Add button should be fully disabled
    const isButtonDisabled = isOutOfStock || isOwner || itemQuantity === 0;

    return (
        <div 
            className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100 flex flex-col h-full ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
        >
            {/* Product Image with Gradient Overlay (unchanged) */}
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-600/20 z-10"></div>
                <img
                    src={getProductImage()}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Price Badge - Change to 'UNAVAILABLE' if out of stock */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        {isOutOfStock ? ('UNAVAILABLE') : (`₹${product.price}/${product.unit}`)}
                    </div>
                </div>

                {/* Quality Badge (unchanged) */}
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

                {/* ... (Location and Rating JSX unchanged) ... */}
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
                
                {/* 🔥 POP-UP MESSAGE for owner */}
                {isOwner && (
                    <div className="text-center p-2 mb-2 bg-red-100 border border-red-300 rounded-lg text-sm font-medium text-red-700 transition-opacity duration-300">
                        You are the owner of this product.
                    </div>
                )}
                {/* END POP-UP MESSAGE */}


                {/* Quantity and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center text-gray-700 text-sm">
                        <Package size={16} className="mr-2 text-emerald-500" />
                        <span>
                            {isOutOfStock ? (
                                <span className="font-bold text-red-600">Unavailable</span>
                            ) : (
                                <>
                                    Available: 
                                    <span className="font-bold ml-1">{product.quantity}</span> {product.unit}
                                </>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={itemQuantity}
                            onChange={handleQuantityChange}
                            min="1"
                            max={maxStock > 0 ? maxStock : 1}
                            disabled={isButtonDisabled} 
                            className={`w-16 text-center border border-gray-300 rounded-md py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isButtonDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                        />
                        <button
                            className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            onClick={() => onAddToCart(product, itemQuantity)}
                            disabled={isButtonDisabled}
                        >
                            <ShoppingCart size={16} className="mr-2" />
                            <span>{isOutOfStock ? 'Sold Out' : isOwner ? 'View Details' : 'Add'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
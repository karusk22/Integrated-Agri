import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin, Package, Percent } from 'lucide-react';
import Navbar from '../NavBar/NavBar';
// import Navbar from '../NavBar/NavBar'; // Assuming you handle this import outside the scope of the component for now

/**
 * Mock data structure for the cart
 */
const initialCartItems = [
    {
        id: 1,
        name: 'Organic Premium Basmati Rice (5kg Bag)',
        image: 'https://via.placeholder.com/150/10B981/FFFFFF?text=Rice', // Placeholder image
        price: 650.00,
        unit: 'Bag',
        quantity: 1,
        farmerLocation: 'Punjab, India',
        stock: 5,
    },
    {
        id: 2,
        name: 'Fresh Locally Sourced Tomatoes',
        image: 'https://via.placeholder.com/150/EF4444/FFFFFF?text=Tomato', // Placeholder image
        price: 45.00,
        unit: 'kg',
        quantity: 3,
        farmerLocation: 'Maharashtra, India',
        stock: 20,
    },
    {
        id: 3,
        name: 'Natural Cow Ghee (500ml Jar)',
        image: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=Ghee', // Placeholder image
        price: 480.00,
        unit: 'Jar',
        quantity: 2,
        farmerLocation: 'Gujarat, India',
        stock: 10,
    },
];

const TAX_RATE = 0.05; // 5% tax

/**
 * CartPage Component
 * A two-column layout with cart items and order summary.
 */
const CartPage = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState(initialCartItems);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [shippingCost, setShippingCost] = useState(120.00); // Fixed or estimated shipping

    // --- Core Cart Logic ---

    // Function to handle quantity change
    const handleQuantityChange = (id, change) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQty = item.quantity + change;
                    if (newQty > 0 && newQty <= item.stock) {
                        return { ...item, quantity: newQty };
                    }
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    // Function to handle item removal
    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Function to apply coupon (placeholder logic)
    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'AGRI10') {
            setDiscount(0.10); // 10% discount
            alert('Coupon applied successfully! You got 10% off.');
        } else {
            setDiscount(0);
            alert('Invalid coupon code. Try AGRI10.');
        }
    };

    // Memoized function for calculating all totals
    const totals = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const discountAmount = subtotal * discount;
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * TAX_RATE;
        const grandTotal = subtotalAfterDiscount + taxAmount + shippingCost;

        return {
            subtotal,
            discountAmount,
            taxAmount,
            grandTotal,
        };
    }, [cartItems, discount, shippingCost]);

    // ⬅️ NEW HELPER FUNCTION: Combines navigation and scroll
    const handleContinueShopping = () => {
        navigate('/');
        window.scrollTo(0, 0);
    };

    // --- Component Rendering ---

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                <Package size={64} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800">Your Cart is Empty!</h2>
                <p className="text-gray-500 mt-2">Time to fill it with fresh agri-goods.</p>
                
                {/* ⬅️ Updated onClick to use the new handler */}
                <button 
                    onClick={handleContinueShopping}
                    className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <>
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Your Harvest Cart ({cartItems.length} Items)
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* === Cart Items Column === */}
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden p-4 border border-gray-100"
                        >
                            {/* Item Image */}
                            <div className="w-full sm:w-40 h-32 sm:h-auto overflow-hidden rounded-lg sm:mr-6 flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Item Details and Controls */}
                            <div className="flex-grow pt-4 sm:pt-0">
                                <h2 className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors">
                                    {item.name}
                                </h2>
                                
                                <div className="flex items-center text-sm text-gray-500 my-1">
                                    <MapPin size={14} className="mr-1 text-emerald-500" />
                                    <span>From {item.farmerLocation}</span>
                                </div>
                                
                                <p className="text-lg font-semibold text-gray-700 mt-2">
                                    Unit Price: ₹{item.price.toFixed(2)} / {item.unit}
                                </p>

                                <div className="flex items-center justify-between mt-4 border-t pt-4">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center space-x-3">
                                        <label className="text-gray-600 font-medium">Quantity:</label>
                                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white transition-all duration-200"
                                                aria-label="Decrease quantity"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-10 text-center font-bold text-gray-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                className="p-2 bg-gray-100 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                                                aria-label="Increase quantity"
                                                disabled={item.quantity >= item.stock}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal and Remove */}
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-emerald-600">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="mt-2 text-red-500 hover:text-red-700 transition-colors flex items-center text-sm ml-auto"
                                        >
                                            <Trash2 size={16} className="mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Continue Shopping Button */}
                    <div className="pt-4 flex justify-between">
                         {/* ⬅️ Updated onClick to use the new handler */}
                         <button 
                            onClick={handleContinueShopping}
                            className="text-emerald-600 font-semibold hover:text-emerald-800 flex items-center transition-colors"
                        >
                            &larr; Continue Shopping
                        </button>
                    </div>
                </div>

                {/* === Order Summary Column === */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 bg-white rounded-xl shadow-2xl p-6 border border-emerald-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b">Order Summary</h2>

                        {/* Totals Breakdown */}
                        <div className="space-y-3 mb-6 text-lg">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Discount:</span>
                                <span className="font-medium text-red-500">- ₹{totals.discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Estimate:</span>
                                <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">Estimated Tax ({TAX_RATE * 100}%):</span>
                                <span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-3 text-xl font-extrabold text-emerald-700">
                                <span>Grand Total:</span>
                                <span>₹{totals.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Coupon Input */}
                        <div className="mt-6 mb-6">
                            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                                Apply Coupon Code:
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="coupon"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code"
                                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                                />
                                <button
                                    onClick={applyCoupon}
                                    className="bg-emerald-500 text-white px-5 py-3 rounded-r-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center"
                                >
                                    <Percent size={18} className="mr-1" /> Apply
                                </button>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-[1.01] transition-all duration-300"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CartPage;
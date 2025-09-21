import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin, Package, Percent } from 'lucide-react';

const TAX_RATE = 0.05; // 5% tax

/**
 * CartPage Component
 * A two-column layout with cart items and order summary.
 */
const CartPage = ({ user, cartItems: initialCartItems, onUpdateCart }) => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState(initialCartItems);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [shippingCost, setShippingCost] = useState(120.00); // Fixed or estimated shipping
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setCartItems(initialCartItems);
    }, [initialCartItems]);

    // --- Core Cart Logic ---

    // ✅ CORRECTED: This function now updates the UI instantly for a better user experience.
    const handleQuantityChange = async (productId, change) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const currentItem = cartItems.find(item => item.product_id === productId);
        if (!currentItem) return;

        const newQty = currentItem.quantity + change;

        if (newQty > currentItem.stock) {
            alert('Cannot add more than available stock.');
            return;
        }
        
        const originalCart = [...cartItems]; // Save original state for rollback

        // Optimistically update the UI
        if (newQty <= 0) {
            // If quantity is zero or less, filter it out from the view
            setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
        } else {
            // Otherwise, update the quantity of the specific item
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.product_id === productId ? { ...item, quantity: newQty } : item
                )
            );
        }

        try {
            // Update the backend
            if (newQty > 0) {
                const response = await fetch(`http://localhost:3001/api/users/${user.user_id}/cart/update/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQty }),
                });
                if (!response.ok) throw new Error('Failed to update item quantity on server');
            } else {
                // If quantity reached zero, send a remove request instead
                const response = await fetch(`http://localhost:3001/api/users/${user.user_id}/cart/remove/${productId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to remove item on server');
            }
            // Sync with parent component after successful API call
            await onUpdateCart();
        } catch (err) {
            console.error('Error updating cart, rolling back UI:', err);
            // If the API call fails, revert the UI to its original state
            setCartItems(originalCart);
            alert('There was an issue updating your cart. Please try again.');
        }
    };

    // ✅ CORRECTED: This function also uses an optimistic update for instant removal.
    const handleRemoveItem = async (productId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const originalCart = [...cartItems]; // Save for rollback

        // Optimistically remove the item from the UI
        setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));

        try {
            const response = await fetch(`http://localhost:3001/api/users/${user.user_id}/cart/remove/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to remove item from server');
            // Sync with parent
            await onUpdateCart();
        } catch (err) {
            console.error('Error removing item, rolling back UI:', err);
            // Revert UI on error
            setCartItems(originalCart);
            alert('There was an issue removing the item. Please try again.');
        }
    };

    // Function to apply coupon (placeholder logic)
    const applyCoupon = async () => {
        if (!couponCode) return;
        setLoading(true);
        try {
            if (couponCode.toUpperCase() === 'AGRI10') {
                setDiscount(0.10); // 10% discount
                alert('Coupon applied successfully! You got 10% off.');
            } else {
                setDiscount(0);
                alert('Invalid coupon code. Try AGRI10.');
            }
        } catch (err) {
            console.error("Error applying coupon:", err);
            alert("An error occurred while applying the coupon.");
        } finally {
            setLoading(false);
        }
    };

    // Memoized function for calculating all totals
    const totals = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
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

    const handleContinueShopping = () => {
        navigate('/products');
        window.scrollTo(0, 0);
    };

    const getProductImage = (dbPath) => {
        if (dbPath && dbPath.length > 0) {
            return `http://localhost:3001${dbPath[0]}`;
        }
        return 'https://placehold.co/150/10B981/FFFFFF?text=Product';
    };

    // --- Component Rendering ---

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                <Package size={64} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800">Your Cart is Empty!</h2>
                <p className="text-gray-500 mt-2">Time to fill it with fresh agri-goods.</p>
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
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Your Harvest Cart ({cartItems.length} Items)
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* === Cart Items Column === */}
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map((item) => (
                        <div
                            key={item.cart_item_id}
                            className="flex flex-col sm:flex-row bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden p-4 border border-gray-100"
                        >
                            <div className="w-full sm:w-40 h-32 sm:h-auto overflow-hidden rounded-lg sm:mr-6 flex-shrink-0">
                                <img
                                    src={getProductImage(item.images)}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex-grow pt-4 sm:pt-0">
                                <h2 className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors">
                                    {item.name}
                                </h2>
                                <div className="flex items-center text-sm text-gray-500 my-1">
                                    <MapPin size={14} className="mr-1 text-emerald-500" />
                                    <span>From {item.location_name || 'Location not specified'}</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mt-2">
                                    Unit Price: ₹{item.price ? parseFloat(item.price).toFixed(2) : '0.00'} / {item.unit}
                                </p>
                                <div className="flex items-center justify-between mt-4 border-t pt-4">
                                    <div className="flex items-center space-x-3">
                                        <label className="text-gray-600 font-medium">Quantity:</label>
                                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                                            <button
                                                onClick={() => handleQuantityChange(item.product_id, -1)}
                                                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white transition-all duration-200"
                                                aria-label="Decrease quantity"
                                                disabled={loading}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-10 text-center font-bold text-gray-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.product_id, 1)}
                                                className="p-2 bg-gray-100 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                                                aria-label="Increase quantity"
                                                disabled={item.quantity >= item.stock || loading}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-emerald-600">
                                            ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => handleRemoveItem(item.product_id)}
                                            className="mt-2 text-red-500 hover:text-red-700 transition-colors flex items-center text-sm ml-auto"
                                            disabled={loading}
                                        >
                                            <Trash2 size={16} className="mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="pt-4 flex justify-between">
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
                    <div className="sticky top-24 bg-white rounded-xl shadow-2xl p-6 border border-emerald-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b">Order Summary</h2>
                        <div className="space-y-3 mb-6 text-lg">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium">₹{totals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="font-medium text-red-500">- ₹{totals.discountAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Shipping Estimate:</span><span className="font-medium">₹{shippingCost.toFixed(2)}</span></div>
                            <div className="flex justify-between border-b pb-3"><span className="text-gray-600">Estimated Tax ({TAX_RATE * 100}%):</span><span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between pt-3 text-xl font-extrabold text-emerald-700"><span>Grand Total:</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
                        </div>
                        <div className="mt-6 mb-6">
                            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">Apply Coupon Code:</label>
                            <div className="flex">
                                <input type="text" id="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"/>
                                <button onClick={applyCoupon} className="bg-emerald-500 text-white px-5 py-3 rounded-r-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center"><Percent size={18} className="mr-1" /> Apply</button>
                            </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-[1.01] transition-all duration-300">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;


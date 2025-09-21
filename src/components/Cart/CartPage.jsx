import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin, Package } from 'lucide-react';

const TAX_RATE = 0.05;

/**
 * CartPage Component
 */
const CartPage = ({ user: propUser, cartItems: initialCartItems, onUpdateCart }) => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const user = propUser || storedUser;

  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [shippingCost] = useState(120.0); // Changed to constant as it's not modified
  const [loading, setLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  useEffect(() => {
    setCartItems(initialCartItems || []);
  }, [initialCartItems]);

  const updateCartQuantity = async (productId, quantity) => {
    if (!user || !user.user_id) return navigate('/login');

    if (quantity < 1) {
      await handleRemoveItem(productId);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3001/api/users/${user.user_id}/cart/update/${productId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        }
      );
      if (!res.ok) throw new Error('Failed to update cart');
      if (onUpdateCart) await onUpdateCart();
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      // Re-fetch cart even on error to sync with the server state
      if (onUpdateCart) await onUpdateCart(); 
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = (productId) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;
    if (Number(item.quantity) >= Number(item.stock)) {
      alert(`Cannot add more items than are currently in stock (${item.stock} ${item.unit}).`);
      return;
    }
    updateCartQuantity(productId, Number(item.quantity) + 1);
  };

  const handleDecrement = (productId) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;
    updateCartQuantity(productId, Number(item.quantity) - 1);
  };

  const handleRemoveItem = async (productId) => {
    if (!user || !user.user_id) return navigate('/login');
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3001/api/users/${user.user_id}/cart/remove/${productId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to remove item');
      if (onUpdateCart) await onUpdateCart();
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UPDATED: Ensures re-fetch and handles specific stock errors.
  const handleCheckout = async () => {
    if (!user || !user.user_id) return navigate('/login');
    if (cartItems.length === 0) {
        setCheckoutMessage('Your cart is empty. Please add items to proceed.');
        return;
    }
    
    setLoading(true);
    setCheckoutMessage('');

    try {
        const response = await fetch('http://localhost:3001/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyer_id: user.user_id,
                total_price: totals.grandTotal,
                cartItems: cartItems,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            // This captures the "Insufficient stock" message from the backend
            throw new Error(errorData.message || 'Failed to create order due to an unknown error.');
        }
        
        setCheckoutMessage('Order placed successfully! Stock quantity updated.');
        
        // 🔥 CRITICAL: Wait for the parent to re-fetch cart AND products
        if (onUpdateCart) {
            await onUpdateCart(); 
        }

        // Redirect to products page to visually confirm stock update
        setTimeout(() => {
            navigate('/products'); 
        }, 2000);

    } catch (err) {
        setCheckoutMessage(err.message);
        console.error('Checkout error:', err);
    } finally {
        setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + parseFloat(item.price) * Number(item.quantity),
      0
    );
    const taxAmount = subtotal * TAX_RATE;
    const grandTotal = subtotal + taxAmount + shippingCost;
    return { subtotal, taxAmount, grandTotal };
  }, [cartItems, shippingCost]);

  const handleContinueShopping = () => {
    navigate('/products');
    window.scrollTo(0, 0);
  };

  const getProductImage = (dbPath) => {
    if (dbPath && dbPath.length > 0) return `http://localhost:3001${dbPath[0]}`;
    return 'https://placehold.co/150/10B981/FFFFFF?text=Product';
  };
  
  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Please log in to view your cart.</h2>
        <button onClick={() => navigate('/login')} className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full">
          Go to Login
        </button>
      </div>
    );
  }

  if (cartItems.length === 0 && !checkoutMessage.includes('successfully')) {
    return (
      <div className="text-center py-20">
        <Package size={64} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">Your Cart is Empty!</h2>
        <p className="text-gray-500 mt-2">Time to fill it with fresh agri-goods.</p>
        <button onClick={handleContinueShopping} className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
        Your Harvest Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item.cart_item_id} className="flex flex-col sm:flex-row bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="w-full sm:w-40 h-32 sm:h-auto overflow-hidden rounded-lg sm:mr-6 flex-shrink-0">
                <img src={getProductImage(item.images)} alt={item.name} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-grow pt-4 sm:pt-0">
                <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                <div className="flex items-center text-sm text-gray-500 my-1">
                  <MapPin size={14} className="mr-1 text-emerald-500" />
                  <span>From {item.location_name || 'Location not specified'}</span>
                </div>
                <p className="text-lg font-semibold text-gray-700 mt-2">
                  Unit Price: ₹{parseFloat(item.price).toFixed(2)} / {item.unit}
                </p>
                <div className="flex items-center justify-between mt-4 border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <label className="text-gray-600 font-medium">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                      <button onClick={() => handleDecrement(item.product_id)} className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white" disabled={loading}>
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => handleIncrement(item.product_id)} className="p-2 bg-gray-100 hover:bg-emerald-500 hover:text-white" disabled={Number(item.quantity) >= Number(item.stock) || loading}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">₹{(parseFloat(item.price) * Number(item.quantity)).toFixed(2)}</p>
                    <button onClick={() => handleRemoveItem(item.product_id)} className="mt-2 text-red-500 hover:text-red-700 flex items-center text-sm ml-auto" disabled={loading}>
                      <Trash2 size={16} className="mr-1" /> Remove
                    </button>
                  </div>
                </div>
                {Number(item.quantity) > Number(item.stock) && (
                    <p className="text-red-500 text-sm mt-1 font-semibold">
                        Warning: Only {item.stock} {item.unit} in stock. Please reduce your quantity.
                    </p>
                )}
              </div>
            </div>
          ))}
          <div className="pt-4 flex justify-between">
            <button onClick={handleContinueShopping} className="text-emerald-600 font-semibold hover:text-emerald-800">
              &larr; Continue Shopping
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl shadow-2xl p-6 border border-emerald-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b">Order Summary</h2>
            <div className="space-y-3 mb-6 text-lg">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium">₹{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping Estimate:</span><span className="font-medium">₹{shippingCost.toFixed(2)}</span></div>
              <div className="flex justify-between border-b pb-3"><span className="text-gray-600">Estimated Tax ({TAX_RATE * 100}%):</span><span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between pt-3 text-xl font-extrabold text-emerald-700"><span>Grand Total:</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
            </div>
            
            {checkoutMessage && (
                <p className={`text-center font-medium mb-4 p-2 rounded ${checkoutMessage.includes('successfully') ? 'text-green-800 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {checkoutMessage}
                </p>
            )}
            
            <button 
                onClick={handleCheckout} 
                disabled={loading || cartItems.length === 0} 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
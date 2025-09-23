import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Wrench, RefreshCw, ShieldCheck, BookOpen, Calendar, UserCheck, Tractor, History, MapPin, XCircle, CheckCircle, Clock, ShoppingBag, DollarSign, Truck } from 'lucide-react';

/**
 * ProfilePage Component
 * Displays user information and role-specific dashboards with a unified, stacked layout.
 * @param {function} onRentalStatusUpdate - Function to refresh the public rental list.
 */
const ProfilePage = ({ onRentalStatusUpdate }) => { 
    // State declarations (unchanged)
    const [user, setUser] = useState(null); 
    const [profileData, setProfileData] = useState(null); 
    
    const [myEquipment, setMyEquipment] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [myRentalHistory, setMyRentalHistory] = useState([]); 
    const [myProductOrders, setMyProductOrders] = useState([]); 
    const [myProductSales, setMyProductSales] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [returningId, setReturningId] = useState(null); 
    const [saleActionId, setSaleActionId] = useState(null);

    // Fetch functions (Unchanged logic)
    const fetchUserProfile = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/profile`);
            if (!response.ok) throw new Error("Failed to fetch user profile data.");
            
            const data = await response.json();
            setProfileData(data); 
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err.message);
        } finally {
             setLoading(false); 
        }
    }, []);

    const fetchOwnerData = useCallback(async () => {
        if (!profileData || profileData.user_type !== 'owner') return;

        try {
            const [equipmentRes, bookingsRes] = await Promise.all([
                fetch(`http://localhost:3001/api/users/${profileData.user_id}/equipment`),
                fetch(`http://localhost:3001/api/owners/${profileData.user_id}/bookings`)
            ]);

            if (!equipmentRes.ok) throw new Error("Failed to fetch your equipment.");
            if (!bookingsRes.ok) throw new Error("Failed to fetch your bookings."); 

            setMyEquipment(await equipmentRes.json());
            setMyBookings(await bookingsRes.json());
        } catch (err) {
            setError(err.message);
        }
    }, [profileData]);

    const fetchAllUserHistory = useCallback(async (userId) => {
        if (!userId) return;
        
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/renters/${userId}/bookings`);
            if (!response.ok) throw new Error("Failed to fetch your rental history.");
            setMyRentalHistory(await response.json());
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const fetchProductOrders = useCallback(async (userId) => {
        if (!userId) return;
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/orders`);
            if (!response.ok) throw new Error("Failed to fetch product order history.");
            setMyProductOrders(await response.json());
        } catch (err) {
            setError(err.message);
        }
    }, []);
    
    const fetchProductSales = useCallback(async (userId) => {
        if (!userId) return;
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/sales`);
            if (!response.ok) throw new Error("Failed to fetch product sales history.");
            setMyProductSales(await response.json());
        } catch (err) {
            setError(err.message);
        }
    }, []);
    
    // UseEffect hooks (Unchanged logic)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const basicUser = JSON.parse(storedUser);
            setUser(basicUser); 
            fetchUserProfile(basicUser.user_id); 
        } else {
            setLoading(false); 
        }
    }, [fetchUserProfile]); 

    useEffect(() => {
        if (profileData) {
            fetchAllUserHistory(profileData.user_id);
            fetchProductOrders(profileData.user_id); 
            fetchProductSales(profileData.user_id); 
            
            if (profileData.user_type === 'owner') {
                fetchOwnerData();
            }
        }
    }, [profileData, fetchOwnerData, fetchAllUserHistory, fetchProductOrders, fetchProductSales]);
    
    
    // Status handlers (Unchanged logic)
    const handleStatusChange = async (equipmentId, currentStatus) => {
        const targetStatus = currentStatus === 'available' ? 'unavailable' : 'available';
        
        setUpdatingId(equipmentId);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3001/api/equipment/${equipmentId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: targetStatus, 
                    ownerId: profileData.user_id 
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to set status to ${targetStatus}.`);
            }
            
            await fetchOwnerData(); 
            
            if (onRentalStatusUpdate) { 
                 await onRentalStatusUpdate();
            }
            
        } catch (err) {
            alert(err.message);
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const handleMarkAsReturned = async (bookingId) => {
        setReturningId(bookingId);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/return`, {
                method: 'PUT',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to mark equipment as returned.');
            }
            
            await fetchAllUserHistory(profileData.user_id);
            
        } catch (err) {
            alert(err.message);
            setError(err.message);
        } finally {
            setReturningId(null);
        }
    };

    const handleMarkOrderShipped = async (orderId) => {
        setSaleActionId(orderId);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}/ship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId: profileData.user_id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to mark order as shipped.');
            }
            
            await fetchProductSales(profileData.user_id);

        } catch (err) {
            alert(err.message);
            setError(err.message);
        } finally {
            setSaleActionId(null);
        }
    };

    const handleConfirmDelivery = async (orderId) => {
        setUpdatingId(orderId); 
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}/complete-delivery`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: profileData.user_id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm delivery.');
            }
            
            await fetchProductOrders(profileData.user_id);

        } catch (err) {
            alert(err.message);
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };


    const getProfileImage = () => {
        if (profileData && profileData.profile_picture) return `http://localhost:3001${profileData.profile_picture}`;
        return 'https://placehold.co/150/a3e635/14532d?text=User';
    };
    
    const StatusBadge = ({ status }) => {
        const base = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        const colors = {
            available: "bg-green-100 text-green-800",
            unavailable: "bg-red-100 text-red-800",
            rented: "bg-yellow-100 text-yellow-800", 
            confirmed: "bg-green-600 text-white", // Final delivery confirmed/Completed
            completed: "bg-gray-400 text-gray-800", // Booking Completed
            pending: "bg-orange-100 text-orange-800",
            shipped: "bg-teal-100 text-teal-800",
            returned: "bg-indigo-100 text-indigo-800",
        };
        return <span className={`${base} ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };
    
    if (loading && !profileData) {
         return <div className="text-center p-10">Loading profile...</div>;
    }

    if (!profileData) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    const isOwner = profileData.user_type === 'owner';
    const totalOrders = myProductOrders.length; 
    const hasSales = myProductSales.length > 0;
    
    // The main layout wrapper class is now always a simple column stack
    const sectionWrapperClass = "space-y-8"; 

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* User Profile Header (Unchanged) */}
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 flex flex-col sm:flex-row items-center gap-8">
                    <img src={getProfileImage()} alt={profileData.username} className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500"/>
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-gray-800">{profileData.username}</h1>
                        <p className="text-lg text-gray-500 capitalize">{profileData.user_type}</p>
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-gray-600">
                            <span className="flex items-center"><Mail size={14} className="mr-2 text-emerald-600"/>{profileData.email}</span>
                            <span className="flex items-center"><Phone size={14} className="mr-2 text-emerald-600"/>{profileData.phone_number}</span>
                            
                            {profileData.location_name && (
                                <span className="flex items-center">
                                    <MapPin size={14} className="mr-2 text-emerald-600"/>
                                    {profileData.location_name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dashboard Sections - All stack vertically */}
                <div className={sectionWrapperClass}>
                    
                    {/* 1. OWNER EQUIPMENT DASHBOARD (Only if Owner) */}
                    {isOwner && (
                        <div key="equipment" className="bg-white rounded-3xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center"><Wrench className="mr-3 text-emerald-600"/>My Equipment</h2>
                                <button onClick={fetchOwnerData} className="text-emerald-600 hover:text-emerald-800" disabled={updatingId}><RefreshCw size={20} className={updatingId ? 'animate-spin' : ''}/></button>
                            </div>
                            {loading && <p>Loading equipment...</p>}
                            {!loading && myEquipment.length === 0 && <p className="text-gray-500 text-center py-8">You have not listed any equipment yet.</p>}
                            {!loading && myEquipment.length > 0 && (
                                <div className="space-y-4 h-96 overflow-y-auto pr-2"> 
                                    {myEquipment.map(item => (
                                        <div key={item.equipment_id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl border">
                                            <div>
                                                <p className="font-bold text-lg text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-500">Listed: {new Date(item.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                                <StatusBadge status={item.availability_status} />
                                                
                                                <button 
                                                    onClick={() => handleStatusChange(item.equipment_id, item.availability_status)} 
                                                    disabled={updatingId === item.equipment_id} 
                                                    className={`text-white px-4 py-2 rounded-lg font-semibold flex items-center disabled:opacity-50 transition-colors ${
                                                        item.availability_status === 'available' 
                                                        ? 'bg-red-500 hover:bg-red-600' 
                                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                                    }`}
                                                >
                                                    {updatingId === item.equipment_id ? <RefreshCw size={16} className="mr-2 animate-spin"/> : null}
                                                    
                                                    {item.availability_status === 'available' ? (
                                                        <>
                                                            <XCircle size={16} className="mr-2"/> Mark Unavailable
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={16} className="mr-2"/> Mark Available
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. CUSTOMER BOOKINGS DASHBOARD (Only if Owner) */}
                    {isOwner && (
                        <div key="customer-bookings" className="bg-white rounded-3xl shadow-lg p-8">
                            <div className="flex items-center mb-6 border-b pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center"><BookOpen className="mr-3 text-teal-600"/>Customer Bookings</h2>
                            </div>
                            {loading && <p>Loading bookings...</p>}
                            {!loading && myBookings.length === 0 && <p className="text-gray-500 text-center py-8">No customer bookings yet.</p>}
                            {!loading && myBookings.length > 0 && (
                                <div className="space-y-4 h-96 overflow-y-auto pr-2">
                                    {myBookings.map(booking => (
                                        <div key={booking.booking_id} className="p-4 bg-gray-50 rounded-2xl border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg text-gray-800">{booking.equipment_name}</p>
                                                    <p className="text-sm text-gray-600 flex items-center mt-1"><UserCheck size={14} className="mr-2"/>Rented by: <span className="font-semibold ml-1">{booking.renter_name}</span></p>
                                                </div>
                                                <StatusBadge status={booking.booking_status}/>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-2 border-t pt-2">
                                                <Calendar size={14} className="mr-2"/>
                                                {new Date(booking.start_date).toLocaleDateString()} &rarr; {new Date(booking.end_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* 3. PRODUCT SALES DASHBOARD (Visible to ALL sellers) */}
                    {hasSales && (
                        <div key="product-sales" className="bg-white rounded-3xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center"><span className="mr-3 text-green-700 font-extrabold text-2xl">₹</span>My Product Sales</h2>
                                <button onClick={() => fetchProductSales(profileData.user_id)} className="text-green-700 hover:text-green-900" disabled={saleActionId}><RefreshCw size={20} className={saleActionId ? 'animate-spin' : ''}/></button>
                            </div>
                            {loading && <p>Loading sales history...</p>}
                            {!loading && myProductSales.length === 0 && <p className="text-gray-500 text-center py-8">You have not recorded any sales yet.</p>}
                            {!loading && myProductSales.length > 0 && (
                                <div className="space-y-6 h-96 overflow-y-auto pr-2">
                                    {myProductSales.map((order) => (
                                        <div key={order.order_id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300">
                                                <p className="font-bold text-lg text-gray-800">Sale to {order.buyer_name}</p>
                                                <div className="flex items-center space-x-3">
                                                    <StatusBadge status={order.status}/>
                                                    <span className="text-sm text-gray-500">
                                                        Date: {new Date(order.order_date).toLocaleDateString()}
                                                    </span>
                                                    {/* Seller Action Button: Mark Shipped */}
                                                    {order.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleMarkOrderShipped(order.order_id)}
                                                            disabled={saleActionId === order.order_id}
                                                            className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-teal-600 flex items-center disabled:opacity-50"
                                                        >
                                                            {saleActionId === order.order_id ? <RefreshCw size={14} className="mr-1 animate-spin"/> : <Truck size={14} className="mr-1"/>}
                                                            Mark Shipped
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <ul className="space-y-2">
                                                {order.items.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex justify-between text-sm text-gray-700">
                                                        <span className="flex items-center">
                                                            {item.product_name} 
                                                            <span className="font-medium ml-2 text-gray-500">({item.quantity} {item.unit})</span>
                                                        </span>
                                                        <span className="font-semibold">₹{parseFloat(item.line_item_price).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-3 border-t mt-3 flex justify-between items-center">
                                                <p className="text-lg font-extrabold text-green-700">Revenue:</p>
                                                <p className="text-lg font-extrabold text-green-700">₹{parseFloat(order.total_revenue).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* 4. PRODUCT ORDER HISTORY (Buyer's Orders) - Always visible */}
                    <div key="product-orders" className="bg-white rounded-3xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center"><ShoppingBag className="mr-3 text-orange-600"/>My Product Orders</h2>
                            <button onClick={() => fetchProductOrders(profileData.user_id)} className="text-orange-600 hover:text-orange-800" disabled={updatingId}><RefreshCw size={20} className={updatingId ? 'animate-spin' : ''}/></button>
                        </div>
                        {loading && <p>Loading product order history...</p>}
                        {!loading && myProductOrders.length === 0 && <p className="text-gray-500 text-center py-8">You have not placed any product orders yet.</p>}
                        {!loading && myProductOrders.length > 0 && (
                            <div className="space-y-6 h-96 overflow-y-auto pr-2">
                                {myProductOrders.map((order, index) => {
                                    const relativeOrderNumber = totalOrders - index; 
                                    const isDeliveryConfirmable = order.status === 'shipped';

                                    return (
                                        <div key={order.order_id} className="p-4 bg-gray-100 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300">
                                                
                                                <p className="font-bold text-lg text-gray-800">Order #{relativeOrderNumber}</p> 

                                                <div className="flex items-center space-x-3">
                                                    <StatusBadge status={order.status}/>
                                                    <span className="text-sm text-gray-500">
                                                        Placed: {new Date(order.order_date).toLocaleDateString()}
                                                    </span>
                                                    
                                                    {/* Buyer Action Button: Confirm Delivery */}
                                                    {isDeliveryConfirmable && (
                                                        <button 
                                                            onClick={() => handleConfirmDelivery(order.order_id)}
                                                            disabled={updatingId === order.order_id}
                                                            className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-600 flex items-center disabled:opacity-50"
                                                        >
                                                            {updatingId === order.order_id ? <RefreshCw size={14} className="mr-1 animate-spin"/> : <ShieldCheck size={14} className="mr-1"/>}
                                                            Confirm Delivery
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <ul className="space-y-2">
                                                {order.items.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex justify-between text-sm text-gray-700">
                                                        <span className="flex items-center">
                                                            {item.name} 
                                                            <span className="font-medium ml-2 text-gray-500">({item.quantity} {item.unit})</span>
                                                        </span>
                                                        <span className="font-semibold">₹{parseFloat(item.line_item_price).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-3 border-t mt-3 flex justify-between items-center">
                                                <p className="text-lg font-extrabold text-emerald-600">Total:</p>
                                                <p className="text-lg font-extrabold text-emerald-600">₹{parseFloat(order.total_price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 5. RENTAL HISTORY DASHBOARD (Visible to ALL users as Renter) */}
                    <div key="rental-history" className="bg-white rounded-3xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center"><History className="mr-3 text-cyan-600"/>My Rental History (as a Renter)</h2>
                            <button onClick={() => fetchAllUserHistory(profileData.user_id)} className="text-cyan-600 hover:text-cyan-800" disabled={returningId}><RefreshCw size={20} className={returningId ? 'animate-spin' : ''}/></button>
                        </div>
                        {loading && <p>Loading rental history...</p>}
                        {!loading && myRentalHistory.length === 0 && <p className="text-gray-500 text-center py-8">You have not rented any equipment yet.</p>}
                        {!loading && myRentalHistory.length > 0 && (
                            <div className="space-y-4 h-96 overflow-y-auto pr-2">
                                {myRentalHistory.map(booking => (
                                     <div key={booking.booking_id} className="p-4 bg-gray-50 rounded-2xl border">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-lg text-gray-800">{booking.equipment_name}</p>
                                                <p className="text-sm text-gray-600 flex items-center mt-1"><Tractor size={14} className="mr-2"/>Owned by: <span className="font-semibold ml-1">{booking.owner_name}</span></p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                                <StatusBadge status={booking.booking_status}/>

                                                {(booking.booking_status === 'confirmed' || booking.booking_status === 'rented') && (
                                                    <button 
                                                        onClick={() => handleMarkAsReturned(booking.booking_id)}
                                                        disabled={returningId === booking.booking_id}
                                                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 flex items-center disabled:opacity-50"
                                                    >
                                                        {returningId === booking.booking_id ? <RefreshCw size={16} className="mr-2 animate-spin"/> : <Clock size={16} className="mr-2"/>}
                                                        Mark as Returned
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-2 border-t pt-2">
                                            <span className="flex items-center">
                                                <Calendar size={14} className="mr-2"/>
                                                {new Date(booking.start_date).toLocaleDateString()} &rarr; {new Date(booking.end_date).toLocaleDateString()}
                                            </span>
                                            <span className="font-bold text-gray-700">₹{parseFloat(booking.total_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                 {error && <div className="mt-8 text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>}
            </div>
        </div>
    );
};

export default ProfilePage;
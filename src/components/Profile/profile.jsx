import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Wrench, RefreshCw, ShieldCheck, BookOpen, Calendar, UserCheck, Tractor, History, MapPin, XCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * ProfilePage Component
 * @param {function} onRentalStatusUpdate - Function to refresh the public rental list.
 */
const ProfilePage = ({ onRentalStatusUpdate }) => { 
    // State declarations (unchanged)
    const [user, setUser] = useState(null); 
    const [profileData, setProfileData] = useState(null); 
    
    const [myEquipment, setMyEquipment] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [myRentalHistory, setMyRentalHistory] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [returningId, setReturningId] = useState(null); 

    // Fetch user profile data (Only sets loading=true/false for the initial profile fetch)
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
             // Reset loading state after initial profile fetch is done
             setLoading(false); 
        }
    }, []);

    // ✅ MODIFIED: Removed global setLoading(true) from here to avoid conflicts. 
    // This function should only manage its own data fetching status.
    const fetchOwnerData = useCallback(async () => {
        if (!profileData || profileData.user_type !== 'owner') return;

        // setError(null); // Keep error clearing

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

    // Fetch renter history for ANY user type 
    const fetchAllUserHistory = useCallback(async (userId) => {
        if (!userId) return;
        
        // This fetch is now done purely for data refresh, no global loading set.
        // setLoading(true); // Removing this line too for clean toggle operations
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/renters/${userId}/bookings`);
            if (!response.ok) throw new Error("Failed to fetch your rental history.");
            setMyRentalHistory(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            // setLoading(false); // Removing this line too
        }
    }, []);
    
    // UseEffect hooks (Unchanged, but now they rely on the simplified loading state)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const basicUser = JSON.parse(storedUser);
            setUser(basicUser); 
            // Only fetchUserProfile sets the initial global loading state
            fetchUserProfile(basicUser.user_id); 
        } else {
            setLoading(false); 
        }
    }, [fetchUserProfile]); 

    useEffect(() => {
        if (profileData) {
            fetchAllUserHistory(profileData.user_id);
            
            if (profileData.user_type === 'owner') {
                fetchOwnerData();
            }
        }
    }, [profileData, fetchOwnerData, fetchAllUserHistory]);
    
    
    // Handle status change (Manual Owner Toggle) - Unchanged logic, relies on fetchOwnerData change
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
            
            // fetchOwnerData is now faster and non-blocking
            await fetchOwnerData(); 
            
            if (onRentalStatusUpdate) { 
                 await onRentalStatusUpdate();
            }
            
        } catch (err) {
            alert(err.message);
            setError(err.message);
        } finally {
            // ✅ THIS LINE IS NOW GUARANTEED TO RUN AND RESET THE BUTTON ICON
            setUpdatingId(null);
        }
    };
    
    // Handle renter marking item as returned (Booking Status Change) - Unchanged logic
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
            confirmed: "bg-blue-100 text-blue-800",
            completed: "bg-gray-100 text-gray-800",
            pending: "bg-orange-100 text-orange-800",
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
    const dashboardLayout = isOwner ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "space-y-8";

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

                {/* Dashboard Sections */}
                <div className={dashboardLayout}>
                    
                    {/* 1. OWNER DASHBOARD (My Equipment & My Bookings) */}
                    {isOwner && (
                        <>
                            {/* My Equipment Dashboard */}
                            <div className="bg-white rounded-3xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-6 border-b pb-4">
                                    <h2 className="text-3xl font-bold text-gray-800 flex items-center"><Wrench className="mr-3 text-emerald-600"/>My Equipment</h2>
                                    <button onClick={fetchOwnerData} className="text-emerald-600 hover:text-emerald-800" disabled={updatingId}><RefreshCw size={20} className={updatingId ? 'animate-spin' : ''}/></button>
                                </div>
                                {loading && <p>Loading equipment...</p>}
                                {!loading && myEquipment.length === 0 && <p className="text-gray-500 text-center py-8">You have not listed any equipment yet.</p>}
                                {!loading && myEquipment.length > 0 && (
                                    <div className="space-y-4">
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
                                                        
                                                        {/* If current status is available, next action is UNAVAILABLE */}
                                                        {item.availability_status === 'available' ? (
                                                            <>
                                                                <XCircle size={16} className="mr-2"/> Mark Unavailable
                                                            </>
                                                        ) : (
                                                            /* If current status is RENTED or UNAVAILABLE, next action is AVAILABLE */
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

                            {/* My Bookings Dashboard (as an Owner) */}
                            <div className="bg-white rounded-3xl shadow-lg p-8">
                                <div className="flex items-center mb-6 border-b pb-4">
                                    <h2 className="text-3xl font-bold text-gray-800 flex items-center"><BookOpen className="mr-3 text-teal-600"/>Customer Bookings</h2>
                                </div>
                                {loading && <p>Loading bookings...</p>}
                                {!loading && myBookings.length === 0 && <p className="text-gray-500 text-center py-8">You have no customer bookings yet.</p>}
                                {!loading && myBookings.length > 0 && (
                                    <div className="space-y-4">
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
                        </>
                    )}
                    
                    {/* 2. RENTAL HISTORY DASHBOARD (Visible to ALL users as Renter) */}
                    <div className={isOwner ? "lg:col-span-2 bg-white rounded-3xl shadow-lg p-8" : "bg-white rounded-3xl shadow-lg p-8"}>
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center"><History className="mr-3 text-cyan-600"/>My Rental History (as a Renter)</h2>
                            <button onClick={() => fetchAllUserHistory(profileData.user_id)} className="text-cyan-600 hover:text-cyan-800" disabled={returningId}><RefreshCw size={20} className={returningId ? 'animate-spin' : ''}/></button>
                        </div>
                        {loading && <p>Loading rental history...</p>}
                        {!loading && myRentalHistory.length === 0 && <p className="text-gray-500 text-center py-8">You have not rented any equipment yet.</p>}
                        {!loading && myRentalHistory.length > 0 && (
                            <div className="space-y-4">
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
                                            <span className="font-bold text-gray-700">Total: ₹{parseFloat(booking.total_price).toFixed(2)}</span>
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
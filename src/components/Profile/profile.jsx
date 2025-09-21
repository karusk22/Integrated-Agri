import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Wrench, RefreshCw, ShieldCheck, BookOpen, Calendar, UserCheck, Tractor, History, MapPin } from 'lucide-react';

/**
 * ProfilePage Component
 * Displays user information and role-specific dashboards.
 */
const ProfilePage = () => {
    // State to hold the basic user data from localStorage (used primarily for user_id)
    const [user, setUser] = useState(null); 
    // State to hold the full, enriched profile data from the API (includes location_name)
    const [profileData, setProfileData] = useState(null); 
    
    const [myEquipment, setMyEquipment] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [myRentalHistory, setMyRentalHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // Memoized function to fetch the complete user profile (including location_name)
    const fetchUserProfile = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/profile`);
            if (!response.ok) throw new Error("Failed to fetch user profile data.");
            
            const data = await response.json();
            // Store the enriched data here
            setProfileData(data); 
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 1. Load basic user from localStorage and trigger the profile fetch
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const basicUser = JSON.parse(storedUser);
            setUser(basicUser); 
            // Fetch the detailed profile immediately
            fetchUserProfile(basicUser.user_id); 
        } else {
            setLoading(false); 
        }
    }, [fetchUserProfile]); 

    // Memoized functions to fetch owner-specific data
    const fetchOwnerData = useCallback(async () => {
        if (!profileData || profileData.user_type !== 'owner') return;

        setLoading(true);
        setError(null);
        try {
            // Fetch both equipment and bookings in parallel
            const [equipmentRes, bookingsRes] = await Promise.all([
                fetch(`http://localhost:3001/api/users/${profileData.user_id}/equipment`),
                fetch(`http://localhost:3001/api/owners/${profileData.user_id}/bookings`)
            ]);

            if (!equipmentRes.ok) throw new Error("Failed to fetch your equipment.");
            if (!bookingsRes.ok) throw new Error("Failed to fetch your bookings.");

            const equipmentData = await equipmentRes.json();
            const bookingsData = await bookingsRes.json();

            setMyEquipment(equipmentData);
            setMyBookings(bookingsData);
        } catch (err) {
            setError(err.message);
        } finally {
            // Only set loading to false if we aren't still waiting on the main profile data
            if (profileData) setLoading(false);
        }
    }, [profileData]);

    // Fetch data for a farmer (renter)
    const fetchFarmerData = useCallback(async () => {
        if (!profileData || profileData.user_type !== 'farmer') return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/renters/${profileData.user_id}/bookings`);
            if (!response.ok) throw new Error("Failed to fetch your rental history.");
            setMyRentalHistory(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            // Only set loading to false if we aren't still waiting on the main profile data
            if (profileData) setLoading(false);
        }
    }, [profileData]);

    // 2. Fetch role-specific data when the full profileData is available
    useEffect(() => {
        if (profileData) {
            if (profileData.user_type === 'owner') {
                fetchOwnerData();
            } else if (profileData.user_type === 'farmer') {
                fetchFarmerData();
            }
        }
    }, [profileData, fetchOwnerData, fetchFarmerData]);
    
    // Function to handle marking equipment as available
    const handleMarkAsAvailable = async (equipmentId) => {
        setUpdatingId(equipmentId);
        try {
            const response = await fetch(`http://localhost:3001/api/equipment/${equipmentId}/available`, {
                method: 'PUT',
            });
            if (!response.ok) throw new Error("Failed to update status.");
            await fetchOwnerData(); // Refresh all owner data
        } catch (err) {
            alert(err.message);
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
            rented: "bg-yellow-100 text-yellow-800",
            maintenance: "bg-red-100 text-red-800",
            confirmed: "bg-blue-100 text-blue-800",
            completed: "bg-gray-100 text-gray-800",
            pending: "bg-orange-100 text-orange-800",
        };
        return <span className={`${base} ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };
    
    // Check loading state against the enriched profileData
    if (loading && !profileData) {
         return <div className="text-center p-10">Loading profile...</div>;
    }

    if (!profileData) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* User Profile Header - NOW USES profileData */}
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 flex flex-col sm:flex-row items-center gap-8">
                    <img src={getProfileImage()} alt={profileData.username} className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500"/>
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-gray-800">{profileData.username}</h1>
                        <p className="text-lg text-gray-500 capitalize">{profileData.user_type}</p>
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-gray-600">
                            <span className="flex items-center"><Mail size={14} className="mr-2 text-emerald-600"/>{profileData.email}</span>
                            <span className="flex items-center"><Phone size={14} className="mr-2 text-emerald-600"/>{profileData.phone_number}</span>
                            
                            {/* ✅ LOCATION DISPLAY ADDED/FIXED HERE */}
                            {profileData.location_name && (
                                <span className="flex items-center">
                                    <MapPin size={14} className="mr-2 text-emerald-600"/>
                                    {profileData.location_name}
                                </span>
                            )}
                            {/* -------------------------------------- */}
                        </div>
                    </div>
                </div>

                {/* Conditional rendering for OWNER dashboard - NOW USES profileData */}
                {profileData.user_type === 'owner' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* My Equipment Dashboard */}
                        <div className="bg-white rounded-3xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center"><Wrench className="mr-3 text-emerald-600"/>My Equipment</h2>
                                <button onClick={fetchOwnerData} className="text-emerald-600 hover:text-emerald-800" disabled={loading}><RefreshCw size={20} className={loading ? 'animate-spin' : ''}/></button>
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
                                                {item.availability_status === 'rented' && (
                                                    <button onClick={() => handleMarkAsAvailable(item.equipment_id)} disabled={updatingId === item.equipment_id} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 flex items-center disabled:opacity-50">
                                                        {updatingId === item.equipment_id ? <RefreshCw size={16} className="mr-2 animate-spin"/> : <ShieldCheck size={16} className="mr-2"/>}
                                                        Mark Available
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Bookings Dashboard */}
                        <div className="bg-white rounded-3xl shadow-lg p-8">
                            <div className="flex items-center mb-6 border-b pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center"><BookOpen className="mr-3 text-teal-600"/>My Bookings</h2>
                            </div>
                            {loading && <p>Loading bookings...</p>}
                            {!loading && myBookings.length === 0 && <p className="text-gray-500 text-center py-8">You have no bookings for your equipment yet.</p>}
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
                    </div>
                )}
                
                {/* Conditional rendering for FARMER dashboard - NOW USES profileData */}
                {profileData.user_type === 'farmer' && (
                     <div className="bg-white rounded-3xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center"><History className="mr-3 text-cyan-600"/>My Rental History</h2>
                             <button onClick={fetchFarmerData} className="text-cyan-600 hover:text-cyan-800" disabled={loading}><RefreshCw size={20} className={loading ? 'animate-spin' : ''}/></button>
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
                                            <StatusBadge status={booking.booking_status}/>
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
                )}

                 {error && <div className="mt-8 text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>}
            </div>
        </div>
    );
};

export default ProfilePage;
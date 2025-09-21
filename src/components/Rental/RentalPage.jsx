import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Wrench, CalendarDays, Leaf, UserCheck, X } from 'lucide-react';

/**
 * RentalCard Component
 * Displays a single rental item.
 */
const RentalCard = ({ rental, onBookNow }) => {
    const getRentalImage = () => {
        if (rental.images && rental.images.length > 0) {
            return `http://localhost:3001${rental.images[0]}`;
        }
        return 'https://placehold.co/600x400/a3e635/14532d?text=Equipment';
    };
    
    const formatRateUnit = (unit) => {
        return unit ? unit.replace('per_', '') : 'unit';
    };

    // Placeholder data until these are added to your backend schema
    const rating = rental.rating || 4;
    const reviews = rental.reviews || 12;

    return (
        <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100 h-full flex flex-col">
            <div className="relative h-64 overflow-hidden">
                <img src={getRentalImage()} alt={rental.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        ₹{rental.rental_rate} / {formatRateUnit(rental.rate_unit)}
                    </div>
                </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700">{rental.name}</h3>
                <div className="flex items-center text-gray-500 mb-3">
                    <MapPin size={14} className="mr-2 text-emerald-500" />
                    <span className="text-sm">{rental.location_name || 'Location not specified'}</span>
                </div>
                {rental.driver_option_available && (
                    <div className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-3 self-start">
                        <UserCheck size={14} className="mr-2" />
                        Driver Included (+₹{rental.driver_rate})
                    </div>
                )}
                <div className="flex items-center mb-4">
                    <div className="flex">{[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i < rental.rating || 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}/>))}</div>
                    <span className="ml-2 text-sm text-gray-600 font-medium">{rental.rating || 'N/A'}.0 ({rental.reviews || 0})</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center text-gray-700">
                        <Wrench size={16} className="mr-2 text-emerald-500" />
                        <span className="font-bold text-lg capitalize">{rental.availability_status}</span>
                    </div>
                    <button 
                        onClick={() => onBookNow(rental)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={rental.availability_status !== 'available'}
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};


/**
 * RentalPage Component
 */
const RentalPage = ({ rentals: propRentals }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [rentals, setRentals] = useState(propRentals || []);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for the booking modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeDriver, setIncludeDriver] = useState(false);
    const [bookingMessage, setBookingMessage] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    // Function to fetch rentals
    const fetchRentals = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/rentals');
            if (!response.ok) throw new Error('Failed to fetch rentals');
            const data = await response.json();
            setRentals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load user from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // If propRentals are not passed (or are empty), fetch data
        if (!propRentals || propRentals.length === 0) {
            fetchRentals();
        } else {
            setLoading(false);
        }
    }, [propRentals]);
    
    // Filter logic for search
    const filteredRentals = rentals.filter(rental => {
        const name = rental.name || '';
        const location = rental.location_name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               location.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const handleBookNowClick = (rental) => {
        if (!user) {
            navigate('/login'); // Redirect to login if not authenticated
            return;
        }
        setSelectedRental(rental);
        setIsModalOpen(true);
        // Reset form state
        setBookingMessage('');
        setStartDate('');
        setEndDate('');
        setIncludeDriver(false);
    };

    const handleConfirmBooking = async () => {
        if (!startDate || !endDate) {
            setBookingMessage('Please select a start and end date.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            setBookingMessage('End date must be after the start date.');
            return;
        }

        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let totalPrice = days * parseFloat(selectedRental.rental_rate);
        if (includeDriver && selectedRental.driver_option_available) {
            totalPrice += days * parseFloat(selectedRental.driver_rate);
        }

        setIsBooking(true);
        setBookingMessage('');

        try {
            const response = await fetch('http://localhost:3001/api/rentals/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipment_id: selectedRental.equipment_id,
                    renter_id: user.user_id,
                    start_date: startDate,
                    end_date: endDate,
                    total_price: totalPrice,
                    driver_included: includeDriver
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Booking failed. The equipment might have been rented already.');
            }
            
            setBookingMessage('Booking successful! The page will now refresh.');
            
            setTimeout(() => {
                setIsModalOpen(false);
                fetchRentals(); // Re-fetch to update availability status immediately
            }, 2000);

        } catch (err) {
            setBookingMessage(err.message);
        } finally {
            setIsBooking(false);
        }
    };

    // Determine if the user is an equipment owner
    // Assuming the user_type from your backend is 'equipment_owner'
    const isEquipmentOwner = user && user.user_type === 'owner';

    const handleListMachineClick = () => {
        // Basic check, though the button should already be hidden from non-owners
        if (isEquipmentOwner) {
            navigate('/addrentalproduct');
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header and Search UI */}
            <div className="relative z-10 p-8">
                <header className="text-center mb-16">
                     <div className="mb-6"><div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl mb-6"><CalendarDays size={32} className="text-white"/></div></div>
                    <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Sandhai Rentals</h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">Rent the right farm equipment for your needs.</p>
                </header>
                
                <main className="max-w-7xl mx-auto">
                    {/* Optional Search Bar */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-3 shadow-xl flex items-center">
                            <Search className="ml-4 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search machinery or location..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    {loading && <div className="text-center py-16 font-semibold">Loading...</div>}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRentals.map((rental, index) => (
                                <RentalCard key={rental.equipment_id || index} rental={rental} onBookNow={handleBookNowClick} />
                            ))}
                        </div>
                    )}
                     {filteredRentals.length === 0 && !loading && (
                        <div className="text-center py-16 col-span-full">
                            <p className="text-gray-500">No equipment found matching your search.</p>
                        </div>
                    )}
                </main>

                {/* Call to Action section with conditional rendering */}
                <section className="mt-24 text-center">
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20 max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                            {isEquipmentOwner ? "Got a Machine to Rent?" : "Your Source for Farm Equipment"}
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            {isEquipmentOwner 
                                ? "List your farm equipment and start earning today by connecting with farmers."
                                : "Browse the available equipment above and easily book what you need for your next harvest."
                            }
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            
                            {/* ONLY List Your Machine button shows for the owner */}
                            {isEquipmentOwner && (
                                <button
                                    onClick={handleListMachineClick}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
                                >
                                    List Your Machine
                                </button>
                            )}

                        </div>
                    </div>
                </section>

                <footer className="text-center mt-16 pb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3">
                            <Leaf size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-700">Sandhai Rentals</span>
                    </div>
                    <p className="text-gray-500">
                        Part of the Sandhai • Building a sustainable future together
                    </p>
                </footer>
            </div>

            {/* Booking Modal */}
            {isModalOpen && selectedRental && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeInUp">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Book: {selectedRental.name}</h2>
                        <p className="text-gray-600 mb-6">Select your desired rental period.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" min={new Date().toISOString().split('T')[0]}/>
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" min={startDate || new Date().toISOString().split('T')[0]}/>
                            </div>
                        </div>
                        
                        {selectedRental.driver_option_available && (
                             <div className="my-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={includeDriver} 
                                        onChange={(e) => setIncludeDriver(e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700 font-medium">Include Driver (+₹{selectedRental.driver_rate} per day)</span>
                                </label>
                            </div>
                        )}

                        {bookingMessage && <p className={`text-center my-4 font-medium ${bookingMessage.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>{bookingMessage}</p>}

                        <button onClick={handleConfirmBooking} disabled={isBooking} className="w-full mt-4 bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                            {isBooking ? 'Processing Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalPage;
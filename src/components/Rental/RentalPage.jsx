import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Wrench, CalendarDays, Leaf } from 'lucide-react';
import Navbar from '../NavBar/NavBar';
import { useNavigate } from 'react-router-dom';

const RentalPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const navigate = useNavigate();

    const sampleRentals = [
        {
            name: "John Deere 6155M Tractor",
            image: "https://images.unsplash.com/photo-1579698501657-3f364024b455?w=600&h=400&fit=crop",
            location: "Thanjavur, Tamil Nadu",
            price: 5000,
            unit: "per day",
            rating: 5,
            reviews: 45,
            tags: ["Tractor", "Heavy Duty", "Modern"]
        },
        {
            name: "Massey Ferguson 241 Harvester",
            image: "https://images.unsplash.com/photo-1587395045657-190f70a58a74?w=600&h=400&fit=crop",
            location: "Salem, Tamil Nadu",
            price: 7500,
            unit: "per day",
            rating: 4,
            reviews: 20,
            tags: ["Harvester", "Crop", "Automated"]
        },
        {
            name: "Kubota L4701 Tiller",
            image: "https://images.unsplash.com/photo-1627916942478-f3d917719602?w=600&h=400&fit=crop",
            location: "Coimbatore, Tamil Nadu",
            price: 1500,
            unit: "per day",
            rating: 4,
            reviews: 15,
            tags: ["Tiller", "Soil", "Small Scale"]
        },
        {
            name: "Sonalika 4x4 Power Tiller",
            image: "https://images.unsplash.com/photo-1540321285097-f416a4a29288?w=600&h=400&fit=crop",
            location: "Madurai, Tamil Nadu",
            price: 2000,
            unit: "per day",
            rating: 5,
            reviews: 60,
            tags: ["Tiller", "Multi-purpose", "Manual"]
        },
        {
            name: "Hydraulic Sprayer Unit",
            image: "https://images.unsplash.com/photo-1574972704153-61b9a9f43063?w=600&h=400&fit=crop",
            location: "Pollachi, Tamil Nadu",
            price: 800,
            unit: "per day",
            rating: 5,
            reviews: 10,
            tags: ["Sprayer", "Pesticide", "Compact"]
        },
    ];

    const filters = ['all', 'Tractor', 'Harvester', 'Tiller', 'Sprayer'];

    const filteredRentals = sampleRentals.filter(rental => {
        const matchesSearch = rental.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              rental.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterCategory === 'all' || rental.tags.includes(filterCategory);
        return matchesSearch && matchesFilter;
    });

    const RentalCard = ({ rental }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <div 
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden border border-gray-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 z-10"></div>
                    <img
                        src={rental.image}
                        alt={rental.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                            ₹{rental.price} / {rental.unit}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                        {rental.name}
                    </h3>
                    <div className="flex items-center text-gray-500 mb-3">
                        <MapPin size={14} className="mr-2 text-emerald-500" />
                        <span className="text-sm">{rental.location}</span>
                    </div>
                    <div className="flex items-center mb-4">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={i < rental.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                                />
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600 font-medium">
                            {rental.rating}.0 ({rental.reviews})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {rental.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 px-3 py-1 text-xs font-semibold rounded-full border border-emerald-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-gray-700">
                            <Wrench size={16} className="mr-2 text-emerald-500" />
                            <span className="font-bold text-lg">Available</span>
                        </div>
                        <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="relative z-10 p-8">
                <header className="text-center mb-16">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl mb-6 transform hover:rotate-6 transition-transform duration-300">
                            <CalendarDays size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight mb-4">
                        Sandhai Rentals
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Rent the right farm equipment for your needs.
                    </p>
                </header>
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search machinery or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="pl-12 pr-8 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 bg-white appearance-none cursor-pointer min-w-48"
                                >
                                    {filters.map(filter => (
                                        <option key={filter} value={filter}>
                                            {filter === 'all' ? 'All Equipment' : filter}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <main className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRentals.map((rental, index) => (
                            <div key={index} className="transform transition-all duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                <RentalCard rental={rental} />
                            </div>
                        ))}
                    </div>
                    {filteredRentals.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-2">No equipment found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </main>

                {/* Call to Action Section */}
                <section className="mt-24 text-center">
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20 max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                            Join Our Sustainable Network
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Connect with like-minded farmers and contribute to a circular economy in agriculture.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/addrentalproduct')}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
                            >
                                List Your Machine
                            </button>
                            <button className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-emerald-200 hover:border-emerald-300 transform hover:scale-105 transition-all duration-300">
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
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
        </div>
    );
};

export default RentalPage;
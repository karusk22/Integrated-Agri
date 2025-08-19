import React, { useState } from 'react';
import { Filter, Search, Leaf } from 'lucide-react';
import Navbar from '../NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard'; // Import the ProductCard component

/**
 * Main ProductList Component with Enhanced UI
 */
const ProductList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const navigate = useNavigate();

    const sampleProducts = [
        {
            name: "Premium Wheat Straw Bales",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
            location: "Villupuram, Tamil Nadu",
            quantity: "500 kg",
            price: 12,
            tags: ["Crop Residue", "Animal Feed", "Organic"],
            rating: 4,
            reviews: 12,
        },
        {
            name: "Fresh Sugarcane Bagasse",
            image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&h=400&fit=crop",
            location: "Madurai, Tamil Nadu",
            quantity: "200 kg",
            price: 15,
            tags: ["Organic", "Biofuel", "Sustainable"],
            rating: 5,
            reviews: 8,
        },
        {
            name: "High-Quality Maize Stover",
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop",
            location: "Tiruchirappalli, Tamil Nadu",
            quantity: "800 kg",
            price: 8,
            tags: ["Crop Residue", "Fertilizer", "Budget"],
            rating: 4,
            reviews: 25,
        },
        {
            name: "Golden Paddy Straw",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
            location: "Thanjavur, Tamil Nadu",
            quantity: "1000 kg",
            price: 10,
            tags: ["Animal Feed", "Mulch", "Traditional"],
            rating: 3,
            reviews: 5,
        },
        {
            name: "Natural Coconut Coir",
            image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&h=400&fit=crop",
            location: "Pollachi, Tamil Nadu",
            quantity: "150 kg",
            price: 20,
            tags: ["Organic", "Gardening", "Premium"],
            rating: 5,
            reviews: 30,
        },
        {
            name: "Rice Husk Pellets",
            image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop",
            location: "Coimbatore, Tamil Nadu",
            quantity: "300 kg",
            price: 18,
            tags: ["Biofuel", "Eco-friendly", "Processed"],
            rating: 4,
            reviews: 15,
        }
    ];

    const filters = ['all', 'Organic', 'Animal Feed', 'Biofuel', 'Crop Residue'];

    const filteredProducts = sampleProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || product.tags.includes(selectedFilter);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <Navbar />

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
            </div>

            <div className="relative z-10 p-8">
                {/* Hero Header */}
                <header className="text-center mb-16">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl mb-6 transform hover:rotate-6 transition-transform duration-300">
                            <Leaf size={32} className="text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight mb-4">
                        Sandhai Products
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform agricultural waste into valuable resources. Connect with farmers across Tamil Nadu for sustainable by-products.
                    </p>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-12 mt-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600">500+</div>
                            <div className="text-sm text-gray-500">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-teal-600">100+</div>
                            <div className="text-sm text-gray-500">Farmers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-600">50+</div>
                            <div className="text-sm text-gray-500">Districts</div>
                        </div>
                    </div>
                </header>

                {/* Search and Filter Section */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products or locations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="pl-12 pr-8 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 bg-white appearance-none cursor-pointer min-w-48"
                                >
                                    {filters.map(filter => (
                                        <option key={filter} value={filter}>
                                            {filter === 'all' ? 'All Categories' : filter}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <main className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={index}
                                className="transform transition-all duration-500"
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* No Results Message */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
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
                            <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300" onClick={() => navigate('/addproduct')}>
                                List Your Products
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
                        <span className="text-2xl font-bold text-gray-700">Sandhai Products</span>
                    </div>
                    <p className="text-gray-500">
                        Part of the Sandhai • Building a sustainable future together
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ProductList;
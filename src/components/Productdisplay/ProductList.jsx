import React, { useState } from 'react';
import { Filter, Search, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard'; // Import the ProductCard component

/**
 * Main ProductList Component with Enhanced UI
 * This component now receives products, cart handlers, and the logged-in user as props.
 */
// ✅ FIXED: The component now accepts `user` as a prop
const ProductList = ({ products, onAddToCart, user }) => { 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const navigate = useNavigate();

    const filters = ['all', 'Organic', 'Animal Feed', 'Biofuel', 'Crop Residue'];

    // NOTE: This filter logic requires products to have a 'tags' property, 
    // which may not be present in your current backend schema. Using location 
    // for demonstration only.
    const filteredProducts = products.filter(product => {
        const productLocation = product.location_name || ''; // Use location_name from API
        const productName = product.name || '';

        const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              productLocation.toLowerCase().includes(searchTerm.toLowerCase());
        
        // This tag logic needs adjustment based on your actual data structure
        const matchesFilter = selectedFilter === 'all' // || product.tags.includes(selectedFilter); 
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen">
            <div className="relative z-10 p-8">
                {/* Hero Header (unchanged) */}
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
                            <div className="text-3xl font-bold text-emerald-600">{products.length}+</div>
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

                {/* Search and Filter Section (Commented Out - unchanged) */}

                {/* Products Grid */}
                <main className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product.product_id}
                                className="transform transition-all duration-500"
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                {/* 🔥 FIXED: Passing the user prop to ProductCard */}
                                <ProductCard 
                                    product={product} 
                                    onAddToCart={onAddToCart} 
                                    user={user} // 👈 PROP NOW PASSED
                                />
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
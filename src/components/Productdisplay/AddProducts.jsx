import React, { useState } from 'react';
import { PlusCircle, Image, MapPin, Tag, Package, AlignJustify } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddProduct = ({ onAddProduct, user }) => { // ⬅️ Passed onAddProduct and user props
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    locationName: '', // Changed to locationName to match backend
    quantity: '',
    unit: 'kg', // Added unit selection
    price: '',
    images: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) {
      setMessage('You must be logged in to add a product.');
      setLoading(false);
      return;
    }

    const dataToSubmit = new FormData();
    dataToSubmit.append('name', product.name);
    dataToSubmit.append('description', product.description);
    dataToSubmit.append('quantity', product.quantity);
    dataToSubmit.append('unit', product.unit);
    dataToSubmit.append('price', product.price);
    dataToSubmit.append('seller_id', user.user_id);
    dataToSubmit.append('locationName', product.locationName);
    
    if (product.images) {
      dataToSubmit.append('images', product.images);
    }
    
    try {
      // Assuming your backend handles the file upload and creates the URL
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        body: dataToSubmit, // Browser will set Content-Type to multipart/form-data
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Product added successfully!');
        // Call the parent component's handler to refresh data
        onAddProduct(result);
        setProduct({
          name: '',
          description: '',
          locationName: '',
          quantity: '',
          unit: 'kg',
          price: '',
          images: null,
        });
      } else {
        setMessage(result.message || 'Failed to add product. Please check your data.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('An error occurred. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-8 flex justify-center items-center">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl mb-4">
              <PlusCircle size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              Add a New Product
            </h1>
            <p className="mt-2 text-md text-gray-600 max-w-xl mx-auto">
              Fill in the details below to list your agricultural by-product on AgriBazar.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              {/* Location */}
              <div className="relative">
                <input
                  type="text"
                  name="locationName"
                  id="locationName"
                  placeholder="Location (e.g., Coimbatore, Tamil Nadu)"
                  value={product.locationName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              {/* Price */}
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  id="price"
                  placeholder="Price (per kg)"
                  value={product.price}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    placeholder="Quantity"
                    value={product.quantity}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                  />
                  <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <div className="relative">
                  <select
                    name="unit"
                    id="unit"
                    value={product.unit}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 appearance-none"
                  >
                    <option value="kg">kg</option>
                    <option value="tons">tons</option>
                    <option value="bales">bales</option>
                    <option value="liters">liters</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="relative">
              <textarea
                name="description"
                id="description"
                rows="4"
                placeholder="Product Description"
                value={product.description}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
              ></textarea>
              <AlignJustify className="absolute left-4 top-4 text-gray-400" size={20} />
            </div>

            {/* Image Upload */}
            <div className="relative p-6 bg-white/70 border border-dashed border-gray-300 rounded-2xl text-center cursor-pointer hover:border-emerald-400 transition-colors duration-300">
              <input
                type="file"
                name="images"
                id="images"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Image size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-600 font-semibold">Click to upload image</p>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                {product.images && <p className="text-emerald-500 text-sm mt-2 font-medium">Selected file: {product.images.name}</p>}
              </div>
            </div>

            {message && (
                <p className={`text-center font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
                </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
              <button
                type="button"
                className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-emerald-200 hover:border-emerald-300 transform hover:scale-105 transition-all duration-300"
                onClick={() => setProduct({
                  name: '',
                  description: '',
                  locationName: '',
                  quantity: '',
                  unit: 'kg',
                  price: '',
                  images: null,
                })}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;

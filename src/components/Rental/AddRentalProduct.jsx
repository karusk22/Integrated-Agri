import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, MapPin, Tag, DollarSign, Image, AlignJustify, UserCheck } from 'lucide-react';

/**
 * AddRentalProduct Component
 * A form for users to list their agricultural machinery for rent, now with expanded options.
 */
const AddRentalProduct = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ STATE ALIGNED WITH FULL BACKEND SCHEMA
  const [rental, setRental] = useState({
    name: '',
    description: '',
    rental_rate: '',
    rate_unit: 'per day',
    locationName: '',
    driver_option_available: false, // New state for driver option
    driver_rate: '',                // New state for driver rate
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Effect to get the logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox input separately
    const val = type === 'checkbox' ? checked : value;
    setRental((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
        setMessage('You must be logged in to list a machine.');
        return;
    }
    setLoading(true);
    setMessage('');

    // FormData is required for sending files (images)
    const formData = new FormData();
    formData.append('name', rental.name);
    formData.append('description', rental.description);
    formData.append('rental_rate', rental.rental_rate);
    formData.append('rate_unit', rental.rate_unit);
    formData.append('locationName', rental.locationName);
    formData.append('owner_id', user.user_id);
    // ✅ APPEND NEW FIELDS to the form data
    formData.append('driver_option_available', rental.driver_option_available);
    formData.append('driver_rate', rental.driver_rate || '0.00'); // Send 0 if empty
    
    if (imageFile) {
        formData.append('images', imageFile);
    }

    try {
        const response = await fetch('http://localhost:3001/api/rentals', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add rental machine.');
        }

        setMessage('Rental machine listed successfully! Redirecting...');
        setTimeout(() => {
            navigate('/rental'); 
        }, 2000);

    } catch (err) {
        setMessage(err.message || 'An error occurred.');
        console.error('Error adding rental:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="relative z-10 p-8 flex justify-center items-center">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl mb-4">
              <Wrench size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              Add a Rental Machine
            </h1>
            <p className="mt-2 text-md text-gray-600 max-w-xl mx-auto">
              List your agricultural machinery for rent to connect with local farmers.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rental Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Machine Name (e.g., John Deere Tractor)"
                  value={rental.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
                <Wrench className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              {/* Location */}
              <div className="relative">
                <input
                  type="text"
                  name="locationName"
                  placeholder="Location (e.g., Salem, Tamil Nadu)"
                  value={rental.locationName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              {/* Price */}
              <div className="relative">
                <input
                  type="number"
                  name="rental_rate"
                  placeholder="Price"
                  value={rental.rental_rate}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
              </div>
              
              {/* Rate Unit */}
              <div className="relative">
                <select
                  name="rate_unit"
                  value={rental.rate_unit}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all appearance-none bg-white"
                >
                    <option value="per day">per day</option>
                    <option value="per hour">per hour</option>
                    <option value="per acre">per acre</option> {/* ✅ ADDED 'per acre' option */}
                </select>
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Rental Description */}
            <div className="relative">
              <textarea
                name="description"
                rows="4"
                placeholder="Provide a detailed description of the machine..."
                value={rental.description}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              ></textarea>
              <AlignJustify className="absolute left-4 top-4 text-gray-400" size={20} />
            </div>
            
            {/* ✅ NEW: Driver Option Section */}
            <div className="space-y-4 rounded-2xl border border-gray-200 p-6 bg-white/50">
                <div className="flex items-center justify-between">
                    <label htmlFor="driver_option_available" className="flex items-center cursor-pointer">
                        <UserCheck className="mr-3 text-gray-500" size={22}/>
                        <span className="font-semibold text-gray-700">Driver Available?</span>
                    </label>
                    <input
                        type="checkbox"
                        name="driver_option_available"
                        id="driver_option_available"
                        checked={rental.driver_option_available}
                        onChange={handleChange}
                        className="h-6 w-6 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                </div>
                {/* Conditionally render the driver rate input */}
                {rental.driver_option_available && (
                    <div className="relative pt-4">
                        <input
                            type="number"
                            name="driver_rate"
                            placeholder="Driver Rate (per unit)"
                            value={rental.driver_rate}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xl pt-2">₹</span>
                    </div>
                )}
            </div>

            {/* Image Upload */}
            <div className="relative p-6 bg-white/70 border-2 border-dashed border-gray-300 rounded-2xl text-center cursor-pointer hover:border-emerald-400 transition-colors">
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Image size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-600 font-semibold">
                  {imageFile ? imageFile.name : 'Click to upload image'}
                </p>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <p className={`text-center font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
              >
                {loading ? 'Submitting...' : 'Add Rental'}
              </button>
              <button
                type="button"
                className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-emerald-200 hover:border-emerald-300 transform hover:scale-105 transition-all"
                onClick={() => navigate('/rental')}
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

export default AddRentalProduct;


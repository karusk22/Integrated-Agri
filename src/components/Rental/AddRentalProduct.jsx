import React, { useState } from 'react';
import { PlusCircle, Wrench, MapPin, Tag, DollarSign, Package, CalendarDays, Image, AlignJustify } from 'lucide-react';
import Navbar from '../NavBar/NavBar'; // Assuming the path is correct

const AddRentalProduct = () => {
  const [rental, setRental] = useState({
    name: '',
    description: '',
    image: null,
    location: '',
    pricePerDay: '',
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRental((prevRental) => ({
      ...prevRental,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setRental((prevRental) => ({
      ...prevRental,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New rental product to be added:', rental);
    // Here you would add the logic to send this data to your backend API
    // For example:
    // axios.post('/api/rentals', rental)
    //   .then(response => console.log('Rental added successfully!', response))
    //   .catch(error => console.error('Error adding rental:', error));
    alert('Rental form submitted! Check the console for the data.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

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
                  id="name"
                  placeholder="Machine Name"
                  value={rental.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <Wrench className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              {/* Location */}
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  id="location"
                  placeholder="Location (e.g., Salem, Tamil Nadu)"
                  value={rental.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              {/* Price Per Day */}
              <div className="relative">
                <input
                  type="number"
                  name="pricePerDay"
                  id="pricePerDay"
                  placeholder="Price (per day)"
                  value={rental.pricePerDay}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              {/* Tags */}
              <div className="relative">
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  placeholder="Tags (e.g., Tractor, Heavy Duty)"
                  value={rental.tags}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Rental Description */}
            <div className="relative">
              <textarea
                name="description"
                id="description"
                rows="4"
                placeholder="Rental Description"
                value={rental.description}
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
                name="image"
                id="image"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Image size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-600 font-semibold">Click to upload image</p>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
              >
                Add Rental
              </button>
              <button
                type="button"
                className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-emerald-200 hover:border-emerald-300 transform hover:scale-105 transition-all duration-300"
                onClick={() => setRental({
                  name: '',
                  description: '',
                  image: null,
                  location: '',
                  pricePerDay: '',
                  tags: '',
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

export default AddRentalProduct;
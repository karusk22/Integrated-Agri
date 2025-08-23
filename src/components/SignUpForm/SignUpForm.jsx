import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// The main App component which renders the sign-up form.
export default function SignUpForm() {
  const navigate = useNavigate(); // Initialize the navigate function
  const location = useLocation(); // Get the current location object

  // Scroll to the top of the page on component mount or location change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // State hooks to manage form input values.
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // userRole is now an array to support multiple selections
    userRole: ['farmer'], 
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handler for role card clicks
  const handleRoleClick = (roleValue) => {
    setFormData(prev => {
      // Check if the role is already selected
      const isSelected = prev.userRole.includes(roleValue);
      let newRoles = [...prev.userRole];

      if (isSelected) {
        // Remove the role from the array
        newRoles = newRoles.filter(role => role !== roleValue);
      } else {
        // Add the role to the array
        newRoles.push(roleValue);
      }
      return { ...prev, userRole: newRoles };
    });
  };

  // Handles the form submission logic.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setMessage('');

    // Simple validation to check if passwords match.
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Prepare the data to be sent to the backend.
    const dataToSubmit = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      userRole: formData.userRole,
      location: formData.location,
    };
    
    // Simulate an API call to your backend.
    console.log('Submitting Form:', dataToSubmit);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    // For demonstration, we'll assume the sign-up was successful.
    setMessage('Account created successfully!');
    setLoading(false);

    // Redirect the user to the home page after a short delay.
    setTimeout(() => {
      navigate('/');
      window.scrollTo(0, 0); // Scroll to the top of the page after navigation
    }, 1500);
  };

  const roles = [
    { value: 'farmer', label: 'Farmer', emoji: '🧑‍🌾' },
    { value: 'equipment-owner', label: 'Equipment Owner', emoji: '🚜' },
  ];

  return (
    // Main container for the form with a vibrant, themed background.
    <div className="min-h-screen flex items-center justify-start pt-16 pb-16 font-sans">
      {/* Form container with card-like styling, using a subtle shadow and rounded corners. */}
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md mx-auto">
        {/* Header section of the form with a themed icon. */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4 text-green-800">🌱</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Join the Integrated Agri-Management Platform
          </p>
        </div>

        {/* The sign-up form itself. */}
        <form onSubmit={handleSubmit}>
          {/* Full Name input field. */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Sujith Kumar"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email input field. */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number input field. */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="tel"
              id="phone"
              name="phone"
              placeholder="+91-1234567890"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Password input field. */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="password"
              id="password"
              name="password"
              placeholder="Enter a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password input field. */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* User Role selection using clickable cards. */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <div
                  key={role.value}
                  onClick={() => handleRoleClick(role.value)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-lg
                    border-2 cursor-pointer transition-all duration-200
                    ${formData.userRole.includes(role.value) ? 
                      'border-green-600 bg-green-50 shadow-md' : 
                      'border-gray-300 hover:border-green-400'
                    }
                  `}
                >
                  <span className="text-2xl">{role.emoji}</span>
                  <span className="text-sm font-medium mt-2 text-center">{role.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location input field. */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="location">
              Location (City/State)
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              type="text"
              id="location"
              name="location"
              placeholder="Chennai, Tamil Nadu"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Message display area for success or errors. */}
          {message && (
            <p className={`text-center font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          {/* Submit button with loading state. */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-teal-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Optional footer for logging in. */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-green-600 hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

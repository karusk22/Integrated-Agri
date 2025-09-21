import React, { useState, useEffect, useRef } from 'react'; // ⬅️ Import useRef
import { Link, useNavigate, useLocation } from 'react-router-dom';

// The main App component which renders the sign-up form.
export default function SignUpForm() {
  const navigate = useNavigate(); // Initialize the navigate function
  const location = useLocation(); // Get the current location object
  const fileInputRef = useRef(null); // ⬅️ Ref to programmatically click the hidden file input

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

  // ⬅️ New state for the profile picture file and its preview URL
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // You can keep this state, but it might not be needed depending on your final CSS setup.
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handler for text input changes
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

  // ⬅️ New handler for when a picture is selected
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file); // Store the file object
      setPreviewUrl(URL.createObjectURL(file)); // Create a temporary URL for preview
    }
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

    // ⬅️ UPDATED: Use FormData to handle file uploads along with other data
    const submissionData = new FormData();
    submissionData.append('username', formData.fullName);
    submissionData.append('email', formData.email);
    submissionData.append('phone_number', formData.phone);
    submissionData.append('password', formData.password);
    submissionData.append('user_type', formData.userRole[0]);
    submissionData.append('locationName', formData.location);
    
    if (profilePicture) {
      // The key 'profilePicture' must match what your backend expects (e.g., using Multer)
      submissionData.append('profilePicture', profilePicture);
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        // IMPORTANT: Do NOT set the 'Content-Type' header. 
        // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
        body: submissionData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
          window.scrollTo(0, 0);
        }, 1500);
      } else {
        setMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('An error occurred. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'farmer', label: 'Farmer', emoji: '🧑‍🌾' },
    { value: 'owner', label: 'Equipment Owner', emoji: '🚜' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-start pt-16 pb-16 font-sans bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4 text-green-800">🌱</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Join the Integrated Agri-Management Platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ⬅️ New Profile Picture Input Section */}
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Profile Picture (Optional)
            </label>
            <div
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-green-500 transition-all duration-300"
              onClick={() => fileInputRef.current.click()} // Clicks the hidden input
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className="w-full h-full rounded-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePictureChange}
              className="hidden" // The input is hidden and controlled programmatically
              accept="image/png, image/jpeg, image/jpg"
            />
          </div>

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
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <div
                  key={role.value}
                  onClick={() => handleRoleClick(role.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${formData.userRole.includes(role.value) ? 'border-green-600 bg-green-50 shadow-md' : 'border-gray-300 hover:border-green-400'}`}
                >
                  <span className="text-2xl">{role.emoji}</span>
                  <span className="text-sm font-medium mt-2 text-center">{role.label}</span>
                </div>
              ))}
            </div>
          </div>

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

          {message && (
            <p className={`text-center font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

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

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-green-600 hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

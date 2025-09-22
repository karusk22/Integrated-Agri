import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * SignUpForm Component
 * A complete sign-up form with input fields for user details and a profile picture upload.
 */
export default function SignUpForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null); // Ref to programmatically click the hidden file input

    // Scroll to the top of the page on component mount or location change.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        userRole: [],
        location: '',
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Handler for text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for user role selection
    const handleRoleClick = (role) => {
        setFormData(prev => {
            const newRoles = prev.userRole.includes(role)
                ? prev.userRole.filter(r => r !== role)
                : [role]; // Allows only one role to be selected at a time
            return { ...prev, userRole: newRoles };
        });
    };

    // Handler for when a picture is selected
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

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match!');
            return;
        }

        setLoading(true);
        setMessage('');

        // Prepare the data to be sent using FormData for file upload
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
        { value: 'equipment-owner', label: 'Equipment Owner', emoji: '🚜' },
    ];

    return (
        // Main container for the form with a vibrant, themed background.
        <div className="min-h-screen flex items-center justify-center pt-16 pb-16 font-sans bg-gray-100">
            {/* Form container with card-like styling, using a subtle shadow and rounded corners. */}
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md mx-auto">
                {/* Header section of the form with a themed icon. */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4 text-green-800">🌱</div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Join our community of farmers and agri-partners.
                    </p>
                </div>

                {/* The sign-up form itself. */}
                <form onSubmit={handleSubmit}>
                    {/* Profile Picture Input Section */}
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
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
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
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
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
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g., +91 9876543210"
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
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
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
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    {/* User Role selection using clickable cards. */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {roles.map(role => (
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
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., New Delhi, Delhi"
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
                        {loading ? 'Creating Account...' : 'Create My Account'}
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

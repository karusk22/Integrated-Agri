import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../NavBar/NavBar.jsx';
import Footer from '../Footer/Footer.jsx';

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${user.user_id}/profile`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="text-center p-8">
          <User size={64} className="text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Not Logged In</h1>
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Loading Profile...
      </div>
    );
  }

  // Helper function to get the correct image URL
  const getProfilePictureUrl = (dbPath) => {
    if (dbPath && dbPath.startsWith('/uploads/')) {
      return `http://localhost:3001${dbPath}`;
    }
    // Fallback to a placeholder if no picture is available
    return 'https://via.placeholder.com/150/10B981/FFFFFF?text=User';
  };

  const profilePic = getProfilePictureUrl(profile?.profile_picture);

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-200">
          <div className="flex flex-col items-center text-center">
            <img 
              src={profilePic} 
              alt="User Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg -mt-24 mb-6"
            />
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {profile.username}
            </h1>
            <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600">
              {profile.user_type?.charAt(0).toUpperCase() + profile.user_type?.slice(1)}
            </span>
          </div>

          <div className="mt-10 space-y-6 text-gray-700">
            <div className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <Mail size={24} className="text-emerald-600" />
              <p className="text-lg font-medium">{profile.email}</p>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <Phone size={24} className="text-teal-600" />
              <p className="text-lg font-medium">{profile.phone_number}</p>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <MapPin size={24} className="text-cyan-600" />
              <p className="text-lg font-medium">{profile.location_name || 'Location not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

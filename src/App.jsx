import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import SignUpForm from './components/SignUpForm/SignUpForm';
import LoginForm from './components/LoginForm/LoginForm';
import ProductList from './components/Productdisplay/ProductList';
import RentalPage from './components/Rental/RentalPage';
import Navbar from './components/NavBar/NavBar';
import AddProduct from './components/Productdisplay/AddProducts';
import AddRentalProduct from './components/Rental/AddRentalProduct';
import ChatBotMenu from './components/ChatBot/ChatBotMenu';
import CartPage from './components/Cart/CartPage';
import ProfilePage from './components/Profile/profile';
import Footer from './components/Footer/Footer';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userId = user ? user.user_id : null;

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, []);

  const fetchCartItems = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/cart`);
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error fetching cart items:', err);
    }
  }, [userId]);

  const fetchRentals = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rentals');
      if (!response.ok) throw new Error('Failed to fetch rentals');
      const data = await response.json();
      setRentals(data);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchRentals(), fetchCartItems()]);
      setLoading(false);
    };
    loadInitialData();
  }, [fetchProducts, fetchRentals, fetchCartItems]);

  const handleAddToCart = async (product, quantity) => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    // Validation check: Prevent owner from buying their own product
    if (parseInt(product.seller_id) === parseInt(userId)) {
        // The ProductCard handles the visual block, this is the final security check
        return; 
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.product_id, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add item to cart');
      await fetchCartItems();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleUpdateCart = async () => {
    await fetchCartItems();
    await fetchProducts(); 
  };

  const handleAddProduct = async (newProduct) => {
    if (!userId) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          seller_id: userId,
          locationName: newProduct.locationName || 'Coimbatore, India' 
        }),
      });
      if (!response.ok) throw new Error('Failed to add product');
      await fetchProducts();
      navigate('/products');
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleAddRental = async (newRental) => {
    if (!userId) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRental,
          owner_id: userId,
          locationName: newRental.locationName || 'Coimbatore, India' 
        }),
      });
      if (!response.ok) throw new Error('Failed to add rental');
      await fetchRentals();
      navigate('/rental');
    } catch (err) {
      console.error('Error adding rental:', err);
    }
  };

  // Login & Logout Handlers
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser)); // persist login
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpForm onLoginSuccess={handleLogin} />} />
        <Route path="/login" element={<LoginForm onLoginSuccess={handleLogin} />} />
        
        {/* 🔥 UPDATED: Passing the user object to ProductList */}
        <Route 
            path="/products" 
            element={
                <ProductList 
                    products={products} 
                    onAddToCart={handleAddToCart} 
                    user={user} 
                />
            } 
        />
        
        <Route path="/rental" element={<RentalPage rentals={rentals} />} />
        <Route path="/addproduct" element={<AddProduct onAddProduct={handleAddProduct} user={user} />} />
        <Route path="/addrentalproduct" element={<AddRentalProduct onAddRental={handleAddRental} />} />
        <Route path="/chatbot" element={<ChatBotMenu />} />
        <Route 
            path="/cartpage" 
            element={
                <CartPage 
                    user={user} 
                    cartItems={cartItems} 
                    onUpdateCart={handleUpdateCart} 
                />
            } 
        />
        <Route 
            path="/profile" 
            element={
                <ProfilePage 
                    user={user} 
                    onRentalStatusUpdate={fetchRentals}
                />
            } 
        />
      </Routes>
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage'
import SignUpForm from './components/SignUpForm/SignUpForm';
import LoginForm from './components/LoginForm/LoginForm';
import ProductList from './components/Productdisplay/ProductList'
import RentalPage from './components/Rental/RentalPage'
import Navbar from './components/NavBar/NavBar';
import AddProduct from './components/AddProducts/AddProducts';
import AddRentalProduct from './components/AddRentalProduct/AddRentalProduct';
function App() {
  return (

    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/rental" element={<RentalPage />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/addrentalproduct" element={<AddRentalProduct />} />




        </Routes>
        
      </div>
    </Router>
  )
}

export default App;

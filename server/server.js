const fetch = require('node-fetch'); 
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.static('public')); // Serve static files from the 'public' directory

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect(async (err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database! ✅');
  release();
});

// ----------------------------------------------------
// MULTER CONFIGURATION FOR FILE UPLOADS
// ----------------------------------------------------

// Create a directory for uploads if it doesn't exist
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique file name to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ----------------------------------------------------
// GEOLOCATION UTILITY FUNCTIONS
// ----------------------------------------------------

/**
 * Converts a location name (e.g., "Chennai") into a PostGIS GEOGRAPHY(POINT, 4326) SQL string.
 * @param {string} locationName - The name of the city or address.
 * @returns {Promise<string|null>} The PostGIS function string or 'NULL' string if geocoding fails.
 */
async function geocodeLocation(locationName) {
    const appName = 'SandhaiCollegeProjectBackend'; 
    const encodedLocation = encodeURIComponent(locationName);
    const API_URL = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

    try {
        const response = await fetch(API_URL, {
            headers: { 'User-Agent': appName }
        });

        if (!response.ok) {
            console.error(`Geocoding API request failed with status: ${response.status}`);
            return 'NULL';
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const lon = data[0].lon;
            const lat = data[0].lat;
            
            return `ST_GeogFromText('SRID=4326;POINT(${lon} ${lat})')`;
        } else {
            console.warn(`No coordinates found for location: ${locationName}`);
            return 'NULL';
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return 'NULL';
    }
}

/**
 * Converts coordinates (lat/lng) into a human-readable address.
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @returns {Promise<string>} A human-readable location string.
 */
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AgriApp/1.0 (your_email@example.com)" // Nominatim requires this
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed: ${response.status}`);
    }

    const data = await response.json();

    const { city, town, village, state, country } = data.address || {};
    return city || town || village
      ? `${city || town || village}, ${state || ""}, ${country || ""}`
      : data.display_name || "Unknown Location";
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return "Unknown Location";
  }
}

// ----------------------------------------------------
// USER AUTHENTICATION
// ----------------------------------------------------

// POST: Register a new user with profile picture upload
app.post('/api/signup', upload.single('profilePicture'), async (req, res) => {
  const { username, email, password, phone_number, user_type, locationName } = req.body; 
  
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const location_geog_sql = await geocodeLocation(locationName);
    
    // Determine the profile picture URL. Use the uploaded file path or a default URL.
    const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;
    
    const params = [username, email, password_hash, phone_number, user_type, profile_picture];

    const newUser = await pool.query(
      `INSERT INTO "users" (username, email, password_hash, phone_number, user_type, profile_picture, location) 
       VALUES ($1, $2, $3, $4, $5, $6, ${location_geog_sql}) 
       RETURNING user_id, username, email, user_type, location, profile_picture`,
      params
    );

    res.status(201).json({
      message: "User registered successfully!",
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST: Login a user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { password_hash, ...userData } = user.rows[0];
    res.json({ message: "Login successful", user: userData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET: User Profile with Location Name
app.get('/api/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT user_id, username, email, phone_number, user_type, profile_picture,
              ST_Y(location::geometry) AS lat,
              ST_X(location::geometry) AS lng
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let user = result.rows[0];

    if (user.lat && user.lng) {
      user.location_name = await reverseGeocode(user.lat, user.lng);
    } else {
      user.location_name = "Location not specified";
    }

    res.json(user);

  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).send("Server error");
  }
});

// ----------------------------------------------------
// PRODUCT MARKETPLACE
// ----------------------------------------------------

// GET: All Products (Modified to include location name)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT product_id, name, description, quantity, unit, price, images, seller_id, status, created_at,
              ST_Y(location::geometry) AS lat,
              ST_X(location::geometry) AS lng
       FROM products WHERE status = 'available'`
    );
    
    const productsWithLocationNames = [];
    for (const product of result.rows) {
        if (product.lat && product.lng) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for Nominatim
          product.location_name = await reverseGeocode(product.lat, product.lng);
        } else {
          product.location_name = "Location not specified";
        }
        productsWithLocationNames.push(product);
    }

    res.json(productsWithLocationNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST: Add a new product with image upload
app.post('/api/products', upload.single('images'), async (req, res) => {
  const { name, description, quantity, unit, price, seller_id, locationName } = req.body; 
  
  try {
    const location_geog_sql = await geocodeLocation(locationName);
    const images_path = req.file ? [`/uploads/${req.file.filename}`] : [];
    
    const params = [name, description, quantity, unit, price, images_path, seller_id];

    const newProduct = await pool.query(
      `INSERT INTO products (name, description, quantity, unit, price, images, seller_id, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, ${location_geog_sql}) 
       RETURNING *`,
      params
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ----------------------------------------------------
// FARM EQUIPMENT RENTAL
// ----------------------------------------------------

// GET: All Farm Equipment (Modified to include location name)
app.get('/api/rentals', async (req, res) => {
  try {
    const result = await pool.query(
        `SELECT equipment_id, name, description, rental_rate, rate_unit, images, owner_id, availability_status, created_at, driver_option_available, driver_rate,
                ST_Y(location::geometry) AS lat,
                ST_X(location::geometry) AS lng
        FROM farm_Equipment WHERE availability_status = 'available'`
    );

    const rentalsWithLocationNames = [];
    for (const rental of result.rows) {
        if (rental.lat && rental.lng) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for Nominatim
          rental.location_name = await reverseGeocode(rental.lat, rental.lng);
        } else {
          rental.location_name = "Location not specified";
        }
        rentalsWithLocationNames.push(rental);
    }
    res.json(rentalsWithLocationNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST: Add new farm equipment
app.post('/api/rentals', upload.single('images'), async (req, res) => {
  const { name, description, rental_rate, rate_unit, owner_id, locationName } = req.body;
  
  try {
    const location_geog_sql = await geocodeLocation(locationName);
    const images_path = req.file ? [`/uploads/${req.file.filename}`] : [];

    const newRental = await pool.query(
      `INSERT INTO farm_Equipment (name, description, rental_rate, rate_unit, images, owner_id, location) 
       VALUES ($1, $2, $3, $4, $5, $6, ${location_geog_sql}) 
       RETURNING *`,
      params
    );
    res.status(201).json(newRental.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ----------------------------------------------------
// CART
// ----------------------------------------------------

// GET: User's Cart items (Modified to include location name)
app.get('/api/users/:userId/cart', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.unit, p.images, p.quantity AS stock,
              ST_Y(p.location::geometry) AS lat,
              ST_X(p.location::geometry) AS lng
       FROM cartItems ci 
       JOIN Cart c ON ci.cart_id = c.cart_id 
       JOIN Products p ON ci.product_id = p.product_id 
       WHERE c.user_id = $1`,
      [userId]
    );
    
    const cartItemsWithLocationNames = [];
    for (const item of result.rows) {
        if (item.lat && item.lng) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for Nominatim
            item.location_name = await reverseGeocode(item.lat, item.lng);
        } else {
            item.location_name = "Location not specified";
        }
        cartItemsWithLocationNames.push(item);
    }
    
    res.json(cartItemsWithLocationNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST: Add an item to the cart
app.post('/api/users/:userId/cart/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await pool.query('SELECT cart_id FROM Cart WHERE user_id = $1', [userId]);
    let cartId;
    if (cart.rows.length === 0) {
      const newCart = await pool.query('INSERT INTO Cart (user_id) VALUES ($1) RETURNING cart_id', [userId]);
      cartId = newCart.rows[0].cart_id;
    } else {
      cartId = cart.rows[0].cart_id;
    }

    const cartItem = await pool.query(
      'INSERT INTO CartItems (cart_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = CartItems.quantity + $3 RETURNING *',
      [cartId, productId, quantity]
    );
    res.json(cartItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT: Update item quantity in the cart
app.put('/api/users/:userId/cart/update/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cartItems SET quantity = $1 WHERE product_id = $2 AND cart_id IN (SELECT cart_id FROM "Cart" WHERE user_id = $3) RETURNING *',
      [quantity, productId, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE: Remove an item from the cart
app.delete('/api/users/:userId/cart/remove/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  try {
    await pool.query(
      'DELETE FROM CartItems WHERE product_id = $1 AND cart_id IN (SELECT cart_id FROM Cart WHERE user_id = $2)',
      [productId, userId]
    );
    res.status(204).send(); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

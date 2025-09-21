require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const fetch = require("node-fetch");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); 

// Serve static files from the 'public' directory more robustly
app.use(express.static(path.join(__dirname, 'public')));

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

// Helper function to add a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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


async function reverseGeocode(lat, lng, retries = 3) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Sandhai Agri App/1.0 (sandhai.project.dev@gmail.com)" }
    });
    if (!response.ok) throw new Error(`Reverse geocode failed: ${response.status}`);
    const data = await response.json();
    const { city, town, village, state, country } = data.address || {};
    return city || town || village
      ? `${city || town || village}, ${state || ""}, ${country || ""}`
      : data.display_name || "Unknown Location";
  } catch (err) {
    if (retries > 0 && (err.code === 'ECONNRESET' || err.type === 'system')) {
        console.warn(`Reverse geocoding failed with ${err.code}, retrying... (${retries} attempts left)`);
        await delay(1500); 
        return reverseGeocode(lat, lng, retries - 1);
    }
    console.error("Reverse geocoding error after all retries:", err);
    return "Location lookup failed";
  }
}

async function addLocationNames(items) {
    const resultsWithLocations = [];
    for (const item of items) {
        if (item.lat && item.lng) {
            item.location_name = await reverseGeocode(item.lat, item.lng);
            await delay(1000); 
        } else {
            item.location_name = "Location not specified";
        }
        resultsWithLocations.push(item);
    }
    return resultsWithLocations;
}


// ----------------------------------------------------
// USER AUTHENTICATION
// ----------------------------------------------------
app.post('/api/signup', upload.single('profilePicture'), async (req, res) => {
  const { username, email, password, phone_number, user_type, locationName } = req.body; 
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const location_geog_sql = await geocodeLocation(locationName);
    const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;
    const params = [username, email, password_hash, phone_number, user_type, profile_picture];
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, phone_number, user_type, profile_picture, location) 
       VALUES ($1, $2, $3, $4, $5, $6, ${location_geog_sql}) 
       RETURNING user_id, username, email, user_type, location, profile_picture`,
      params
    );
    res.status(201).json({ message: "User registered successfully!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
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
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
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
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT product_id, name, description, quantity, unit, price, images, seller_id, status, created_at,
              ST_Y(location::geometry) AS lat,
              ST_X(location::geometry) AS lng
       FROM products WHERE status = 'available'`
    );
    const productsWithLocationNames = await addLocationNames(result.rows);
    res.json(productsWithLocationNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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
app.get('/api/rentals', async (req, res) => {
  try {
    const result = await pool.query(
        `SELECT equipment_id, name, description, rental_rate, rate_unit, images, owner_id, availability_status, created_at, driver_option_available, driver_rate,
                ST_Y(location::geometry) AS lat,
                ST_X(location::geometry) AS lng
        FROM farm_equipment WHERE availability_status = 'available'`
    );
    const rentalsWithLocationNames = await addLocationNames(result.rows);
    res.json(rentalsWithLocationNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/rentals', upload.single('images'), async (req, res) => {
  const { 
    name, 
    description, 
    rental_rate, 
    rate_unit, 
    owner_id, 
    locationName,
    driver_option_available,
    driver_rate
  } = req.body;
  
  const transformedRateUnit = rate_unit ? rate_unit.replace(' ', '_') : null;

  try {
    const location_geog_sql = await geocodeLocation(locationName);
    const images_path = req.file ? [`/uploads/${req.file.filename}`] : [];
    
    const driverOption = driver_option_available || false;
    const driverRateValue = driver_rate || 0.00;

    const params = [
        name, 
        description, 
        rental_rate, 
        transformedRateUnit,
        images_path, 
        owner_id,
        driverOption,
        driverRateValue
    ];

    const queryText = `INSERT INTO farm_equipment 
        (name, description, rental_rate, rate_unit, images, owner_id, driver_option_available, driver_rate, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${location_geog_sql}) 
       RETURNING *`;

    const newRental = await pool.query(queryText, params);
    res.status(201).json(newRental.rows[0]);

  } catch (err) {
    console.error("--- DATABASE ERROR ---");
    console.error("Error Code:", err.code); 
    console.error("Error Detail:", err.detail); 
    console.error("Full Error:", err.message);
    console.error("--- END DATABASE ERROR ---");
    res.status(500).json({ 
        message: 'Server error during database operation.',
        error: err.message,
        code: err.code 
    });
  }
});

app.post('/api/rentals/book', async (req, res) => {
    const { equipment_id, renter_id, start_date, end_date, total_price, driver_included } = req.body;

    if (!equipment_id || !renter_id || !start_date || !end_date || total_price === undefined || driver_included === undefined) {
        return res.status(400).json({ message: "Missing required booking information." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const bookingQuery = `
            INSERT INTO rentalbookings (equipment_id, renter_id, start_date, end_date, total_price, driver_included, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
            RETURNING booking_id;
        `;
        const bookingParams = [equipment_id, renter_id, start_date, end_date, total_price, driver_included];
        const bookingResult = await client.query(bookingQuery, bookingParams);
        const newBookingId = bookingResult.rows[0].booking_id;

        const updateEquipmentQuery = `UPDATE farm_equipment SET availability_status = 'rented' WHERE equipment_id = $1;`;
        await client.query(updateEquipmentQuery, [equipment_id]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Booking successful!', booking_id: newBookingId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error during booking process:", err);
        res.status(500).json({ message: 'Server error during booking process.' });
    } finally {
        client.release();
    }
});


// ----------------------------------------------------
// CART
// ----------------------------------------------------
app.get('/api/users/:userId/cart', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.unit, p.images, p.quantity AS stock,
              ST_Y(p.location::geometry) AS lat,
              ST_X(p.location::geometry) AS lng
       FROM cartitems ci 
       JOIN cart c ON ci.cart_id = c.cart_id 
       JOIN products p ON ci.product_id = p.product_id 
       WHERE c.user_id = $1`,
      [userId]
    );
    const cartItemsWithLocationNames = await addLocationNames(result.rows);
    res.json(cartItemsWithLocationNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/users/:userId/cart/add', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity < 1 || !userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ message: "Invalid request: User ID must be a valid number, and product details must be provided." });
  }
  const numericUserId = parseInt(userId);
  try {
    let cart = await pool.query('SELECT cart_id FROM cart WHERE user_id = $1', [numericUserId]);
    let cartId;
    if (cart.rows.length === 0) {
      const newCart = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id', [numericUserId]);
      cartId = newCart.rows[0].cart_id;
    } else {
      cartId = cart.rows[0].cart_id;
    }
    const cartItem = await pool.query(
      'INSERT INTO cartitems (cart_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cartitems.quantity + $3 RETURNING *',
      [cartId, productId, quantity]
    );
    res.status(201).json(cartItem.rows[0]);
  } catch (err) {
    console.error("Add to cart error:", err.message);
    res.status(500).send('Server error');
  }
});

app.put('/api/users/:userId/cart/update/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 0 || isNaN(parseInt(quantity))) {
    return res.status(400).json({ message: "Invalid quantity provided." });
  }

  try {
    const result = await pool.query(
      'UPDATE cartitems SET quantity = $1 WHERE product_id = $2 AND cart_id IN (SELECT cart_id FROM cart WHERE user_id = $3) RETURNING *',
      [quantity, productId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found or user not authorized." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating cart quantity:", err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/users/:userId/cart/remove/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM cartitems WHERE product_id = $1 AND cart_id IN (SELECT cart_id FROM cart WHERE user_id = $2)',
      [productId, userId]
    );
    
    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Item not found in cart." });
    }

    res.status(204).send(); 
  } catch (err)
    {
    console.error("Error removing item from cart:", err.message);
    res.status(500).send('Server error');
  }
});


// --- ORDER CREATION ---
app.post('/api/orders/create', async (req, res) => {
    const { buyer_id, total_price, cartItems } = req.body;

    if (!buyer_id || !total_price || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Missing required order information." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        const orderQuery = `INSERT INTO orders (buyer_id, total_price, status) VALUES ($1, $2, 'pending') RETURNING order_id`;
        const orderResult = await client.query(orderQuery, [buyer_id, total_price]);
        const newOrderId = orderResult.rows[0].order_id;

        for (const item of cartItems) {
            const line_item_price = parseFloat(item.price) * Number(item.quantity);
            const orderItemQuery = `INSERT INTO orderitems (order_id, product_id, quantity, line_item_price) VALUES ($1, $2, $3, $4)`;
            await client.query(orderItemQuery, [newOrderId, item.product_id, item.quantity, line_item_price]);
        }

        const cartResult = await client.query('SELECT cart_id FROM cart WHERE user_id = $1', [buyer_id]);
        if (cartResult.rows.length > 0) {
            const cartId = cartResult.rows[0].cart_id;
            await client.query('DELETE FROM cartitems WHERE cart_id = $1', [cartId]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order created successfully!', order_id: newOrderId });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Error creating order:", err);
        res.status(500).json({ message: "Failed to create order due to a server error." });
    } finally {
        client.release();
    }
});

// --- OWNER-SPECIFIC EQUIPMENT & BOOKING ROUTES ---
app.get('/api/users/:userId/equipment', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM farm_equipment WHERE owner_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching user's equipment:", err);
        res.status(500).json({ message: "Failed to fetch equipment." });
    }
});

app.put('/api/equipment/:equipmentId/available', async (req, res) => {
    const { equipmentId } = req.params;
    try {
        const result = await pool.query(
            `UPDATE farm_equipment SET availability_status = 'available' WHERE equipment_id = $1 RETURNING *`,
            [equipmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found." });
        }
        res.json({ message: 'Equipment marked as available.', equipment: result.rows[0] });
    } catch (err) {
        console.error("Error updating equipment status:", err);
        res.status(500).json({ message: "Failed to update equipment status." });
    }
});

app.get('/api/owners/:ownerId/bookings', async (req, res) => {
    const { ownerId } = req.params;
    try {
        const query = `
            SELECT 
                rb.booking_id, rb.start_date, rb.end_date, rb.total_price, rb.status AS booking_status,
                fe.name AS equipment_name,
                u.username AS renter_name
            FROM rentalbookings rb
            JOIN farm_equipment fe ON rb.equipment_id = fe.equipment_id
            JOIN users u ON rb.renter_id = u.user_id
            WHERE fe.owner_id = $1
            ORDER BY rb.start_date DESC;
        `;
        const { rows } = await pool.query(query, [ownerId]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching owner's bookings:", err);
        res.status(500).json({ message: "Failed to fetch bookings." });
    }
});

// --- FARMER-SPECIFIC RENTAL HISTORY & REVIEW ROUTES ---
app.get('/api/renters/:renterId/bookings', async (req, res) => {
    const { renterId } = req.params;
    try {
        const query = `
            SELECT 
                rb.*,
                fe.name AS equipment_name,
                fe.owner_id,
                u.username AS owner_name,
                EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = rb.booking_id) AS review_submitted
            FROM rentalbookings rb
            LEFT JOIN farm_equipment fe ON rb.equipment_id = fe.equipment_id
            LEFT JOIN users u ON fe.owner_id = u.user_id
            WHERE rb.renter_id = $1
            ORDER BY rb.start_date DESC;
        `;
        const { rows } = await pool.query(query, [renterId]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching renter's bookings:", err);
        res.status(500).json({ message: "Failed to fetch rental history." });
    }
});

app.put('/api/bookings/:bookingId/complete', async (req, res) => {
    const { bookingId } = req.params;
    try {
        const result = await pool.query(
            `UPDATE rentalbookings SET status = 'completed' WHERE booking_id = $1 RETURNING *`,
            [bookingId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }
        res.json({ message: 'Booking marked as completed.', booking: result.rows[0] });
    } catch (err) {
        console.error("Error completing booking:", err);
        res.status(500).json({ message: "Failed to complete booking." });
    }
});

// ✅ EDITED: This route was missing and has now been added.
app.put('/api/bookings/:bookingId/return', async (req, res) => {
    const { bookingId } = req.params;
    try {
        const result = await pool.query(
            `UPDATE rentalbookings SET status = 'returned' WHERE booking_id = $1 RETURNING *`,
            [bookingId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }
        res.json({ message: 'Booking marked as returned.', booking: result.rows[0] });
    } catch (err) {
        console.error("Error returning booking:", err);
        res.status(500).json({ message: "Failed to return booking." });
    }
});


app.post('/api/reviews', async (req, res) => {
    const { booking_id, equipment_id, reviewer_id, owner_id, rating, comment } = req.body;
    
    if (!booking_id || !equipment_id || !reviewer_id || !owner_id || !rating) {
        return res.status(400).json({ message: "Missing required review information." });
    }
    try {
        const query = `
            INSERT INTO reviews (reviewer_id, rated_user_id, equipment_id, rating, comment, booking_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING review_id;
        `;
        const params = [reviewer_id, owner_id, equipment_id, rating, comment || null, booking_id];
        const result = await pool.query(query, params);
        res.status(201).json({ message: 'Review submitted successfully!', review: result.rows[0] });
    } catch (err) {
        console.error("Error submitting review:", err);
        if (err.code === '23505') { 
            return res.status(409).json({ message: "A review for this booking already exists." });
        }
        res.status(500).json({ message: "Failed to submit review." });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


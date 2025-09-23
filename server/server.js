require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔑 NEW IMPORT: OpenCage API Client
const opencage = require('opencage-api-client');

const app = express();
const port = process.env.PORT || 3001;

// ----------------------------------------------------
// OPEN CAGE API KEY INITIALIZATION
// ----------------------------------------------------
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY; 

if (!OPENCAGE_API_KEY) {
    console.warn("⚠️ WARNING: OPENCAGE_API_KEY is missing. Geocoding functions will not work.");
}
// ----------------------------------------------------


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

// -------------------------------------
// MULTER CONFIGURATION FOR FILE UPLOADS 
// -------------------------------------

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ----------------------------------------------------
// GEOLOCATION UTILITY FUNCTIONS (OpenCage + CACHING)
// ----------------------------------------------------

/**
 * Forward Geocoding: Converts location name to coordinates (lat/lng) using OpenCage.
 */
async function geocodeLocation(locationName) {
    if (!OPENCAGE_API_KEY) return 'NULL';
    try {
        const response = await opencage.geocode({ 
            q: locationName, 
            key: OPENCAGE_API_KEY,
            limit: 1, 
        });
        
        if (response.status.code === 200 && response.results.length > 0) {
            const { lat, lng } = response.results[0].geometry;
            // PostGIS uses (Lng, Lat) for POINT construction
            return `ST_GeogFromText('SRID=4326;POINT(${lng} ${lat})')`;
        } else {
            const status = response.status.code;
            console.warn(`Forward Geocode failed for location: ${locationName}. Status: ${status}`);
            return 'NULL';
        }
    } catch (error) {
        console.error('Forward Geocoding error (OpenCage):', error.message);
        return 'NULL';
    }
}


/**
 * Reverse Geocoding: Checks cache first, then calls OpenCage, and stores result.
 */
async function reverseGeocode(lat, lng) {
    const query = `${lat}, ${lng}`;
    const pointString = `POINT(${lng} ${lat})`; 

    // 2. CHECK CACHE
    try {
        const cacheResult = await pool.query(
            `SELECT location_name FROM location_cache WHERE coords = ST_GeomFromText($1, 4326) LIMIT 1`,
            [pointString]
        );

        if (cacheResult.rows.length > 0) {
            // Cache HIT
            return cacheResult.rows[0].location_name;
        }
    } catch (cacheError) {
        console.error("Cache lookup error:", cacheError.message);
    }

    // 3. API CALL (Cache MISS)
    if (!OPENCAGE_API_KEY) return "Location lookup failed (API Key Missing)";
    
    let locationName = "Location lookup failed";

    try {
        const response = await opencage.geocode({
            q: query, 
            key: OPENCAGE_API_KEY,
            limit: 1,
            no_annotations: 1 
        });

        if (response.status.code === 200 && response.results.length > 0) {
            locationName = response.results[0].formatted;
            
            // 4. STORE IN CACHE
            await pool.query(
                `INSERT INTO location_cache (coords, location_name) 
                 VALUES (ST_GeomFromText($1, 4326), $2)
                 ON CONFLICT (coords) DO NOTHING`, 
                [pointString, locationName]
            );
        } else {
            const status = response.status.code;
            locationName = `No address found (Status: ${status})`;
        }
    } catch (err) {
        console.error("Reverse geocoding error (OpenCage):", err.message);
        locationName = "Location lookup failed";
    }

    return locationName;
}

/**
 * Iterates through a list of items and adds a human-readable location name.
 */
async function addLocationNames(items) {
    const promises = items.map(async (item) => {
        if (item.lat && item.lng) {
            item.location_name = await reverseGeocode(item.lat, item.lng);
        } else {
            item.location_name = "Location not specified";
        }
        return item;
    });
    
    return Promise.all(promises);
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
// PRODUCT MARKETPLACE (Unchanged logic)
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
// FARM EQUIPMENT RENTAL (Unchanged logic)
// ----------------------------------------------------
app.get('/api/rentals', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT equipment_id, name, description, rental_rate, rate_unit, images, owner_id, availability_status, created_at, driver_option_available, driver_rate,
                    ST_Y(location::geometry) AS lat,
                    ST_X(location::geometry) AS lng
             FROM farm_equipment 
             ORDER BY created_at DESC`
        );
        const rentalsWithLocationNames = await addLocationNames(result.rows);
        res.json(rentalsWithLocationNames);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/rentals', upload.single('images'), async (req, res) => {
    const { name, description, rental_rate, rate_unit, owner_id, locationName, driver_option_available, driver_rate } = req.body;
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

        // 1. CHECK FOR SELF-BOOKING CONFLICT
        const ownerCheckQuery = `SELECT owner_id FROM farm_equipment WHERE equipment_id = $1`;
        const ownerResult = await client.query(ownerCheckQuery, [equipment_id]);

        if (ownerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Equipment not found." });
        }
        
        const owner_id = ownerResult.rows[0].owner_id;

        // Ensure both IDs are numbers for reliable comparison
        if (parseInt(renter_id) === parseInt(owner_id)) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: "You cannot book your own equipment." });
        }


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
// CART (Unchanged logic)
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
  
  
// ORDER CREATION (Unchanged)
app.post('/api/orders/create', async (req, res) => {
    const { buyer_id, total_price, cartItems } = req.body;

    if (!buyer_id || !total_price || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Missing required order information." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        // 1. Check stock availability for all items before creating the order
        for (const item of cartItems) {
            const stockCheckQuery = 'SELECT quantity FROM products WHERE product_id = $1 FOR UPDATE'; // Lock the row
            const stockResult = await client.query(stockCheckQuery, [item.product_id]);
            
            if (stockResult.rows.length === 0) {
                throw new Error(`Product with ID ${item.product_id} not found.`);
            }

            const currentStock = parseInt(stockResult.rows[0].quantity, 10);
            const orderedQuantity = Number(item.quantity);

            if (currentStock < orderedQuantity) {
                // Throw an error to trigger the ROLLBACK
                throw new Error(`Insufficient stock for product: ${item.name}. Available: ${currentStock}, Ordered: ${orderedQuantity}`);
            }
        }
        
        // 2. Create the new order
        const orderQuery = `INSERT INTO orders (buyer_id, total_price, status) VALUES ($1, $2, 'pending') RETURNING order_id`;
        const orderResult = await client.query(orderQuery, [buyer_id, total_price]);
        const newOrderId = orderResult.rows[0].order_id;

        // 3. Insert order items and update product stock
        for (const item of cartItems) {
            const line_item_price = parseFloat(item.price) * Number(item.quantity);
            const orderedQuantity = Number(item.quantity);
            
            // Insert into orderitems table
            const orderItemQuery = `INSERT INTO orderitems (order_id, product_id, quantity, line_item_price) VALUES ($1, $2, $3, $4)`;
            await client.query(orderItemQuery, [newOrderId, item.product_id, orderedQuantity, line_item_price]);

            // Update product quantity (stock)
            const updateStockQuery = `
                UPDATE products 
                SET quantity = quantity - $1
                WHERE product_id = $2
            `;
            await client.query(updateStockQuery, [orderedQuantity, item.product_id]);
        }

        // 4. Clear the cart
        const cartResult = await pool.query('SELECT cart_id FROM cart WHERE user_id = $1', [buyer_id]);
        if (cartResult.rows.length > 0) {
            const cartId = cartResult.rows[0].cart_id;
            await client.query('DELETE FROM cartitems WHERE cart_id = $1', [cartId]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order created successfully and stock updated!', order_id: newOrderId });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Error creating order and updating stock:", err.message);
        
        let statusCode = 500;
        let errorMessage = "Failed to create order due to a server error.";

        if (err.message.includes("Insufficient stock")) {
            statusCode = 409; // Conflict
            errorMessage = err.message;
        }

        res.status(statusCode).json({ message: errorMessage });
    } finally {
        client.release();
    }
});
  
// ----------------------------------------------------
// OWNER-SPECIFIC ROUTES (Unchanged)
// ----------------------------------------------------
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


app.put('/api/equipment/:equipmentId/status', async (req, res) => {
    const { equipmentId } = req.params;
    const { status, ownerId } = req.body; 

    if (!status || !ownerId) {
        return res.status(400).json({ message: "Missing required status or owner ID." });
    }

    const allowedStatuses = ['available', 'unavailable'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value. Must be 'available' or 'unavailable'." });
    }

    try {
        const result = await pool.query(
            `UPDATE farm_equipment 
             SET availability_status = $1 
             WHERE equipment_id = $2 
             AND owner_id = $3
             RETURNING equipment_id, availability_status`,
            [status, equipmentId, ownerId]
        );

        if (result.rows.length === 0) {
            const checkOwner = await pool.query(
                `SELECT owner_id FROM farm_equipment WHERE equipment_id = $1`,
                [equipmentId]
            );

            if (checkOwner.rows.length === 0) {
                return res.status(404).json({ message: "Equipment not found." });
            }
            
            if (checkOwner.rows[0].owner_id !== parseInt(ownerId)) { 
                return res.status(403).json({ message: "You are not authorized to modify this equipment." });
            }
            
            return res.status(500).json({ message: "Update failed unexpectedly." });
        }

        res.json({ 
            message: `Equipment status force-updated to ${status}.`, 
            equipment: result.rows[0] 
        });
    } catch (err) {
        console.error("Error updating equipment status:", err);
        res.status(500).json({ message: "Failed to update equipment status due to a server error." });
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

// ----------------------------------------------------
// SALES & ORDER MANAGEMENT (Updated with Status Fix)
// ----------------------------------------------------

// Endpoint for Seller/Owner to Mark Order as Shipped
app.put('/api/orders/:orderId/ship', async (req, res) => {
    const { orderId } = req.params;
    const { sellerId } = req.body; 

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Verify seller owns at least one product in this order
        const verificationQuery = `
            SELECT 1 FROM orderitems oi 
            JOIN products p ON oi.product_id = p.product_id 
            WHERE oi.order_id = $1 AND p.seller_id = $2
        `;
        const verificationResult = await client.query(verificationQuery, [orderId, sellerId]);

        if (verificationResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: "Unauthorized: You are not the seller for this order." });
        }

        // 2. Update the order status from 'pending' to 'shipped'
        const updateQuery = `
            UPDATE orders SET status = 'shipped'
            WHERE order_id = $1 AND status = 'pending'
            RETURNING *;
        `;
        const result = await client.query(updateQuery, [orderId]);

        if (result.rows.length === 0) {
             await client.query('ROLLBACK');
             return res.status(409).json({ message: "Order must be in 'pending' status to be marked as shipped." });
        }

        await client.query('COMMIT');
        res.json({ message: "Order marked as shipped successfully.", order: result.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error marking order as shipped:", err);
        res.status(500).json({ message: "Server error during shipping update." });
    } finally {
        client.release();
    }
});

// ✅ FIXED: Endpoint for Buyer to Mark as Completed/Delivered (Status changed to 'completed')
app.put('/api/orders/:orderId/complete-delivery', async (req, res) => {
    const { orderId } = req.params;
    const { buyerId } = req.body; 
    
    // We will use 'completed' as the final status to align with common database patterns.
    const finalStatus = 'completed'; 

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update the order status from 'shipped' to 'completed'
        const updateQuery = `
            UPDATE orders SET status = $3
            WHERE order_id = $1 AND buyer_id = $2 AND status = 'shipped'
            RETURNING *;
        `;
        const result = await client.query(updateQuery, [orderId, buyerId, finalStatus]);

        if (result.rows.length === 0) {
             await client.query('ROLLBACK');
             return res.status(409).json({ message: "Order must be in 'shipped' status and belong to the buyer to be confirmed." });
        }

        await client.query('COMMIT');
        res.json({ message: `Delivery confirmed and order marked as ${finalStatus}.`, order: result.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error completing delivery:", err);
        // The detailed error is now visible in the console if the status string itself is incorrect
        res.status(500).json({ message: "Server error during delivery confirmation." });
    } finally {
        client.release();
    }
});


// Endpoint for Fetching Product Order History (Buyer)
app.get('/api/users/:userId/orders', async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `
            SELECT 
                o.order_id,
                o.total_price,
                o.status AS order_status,
                o.created_at AS order_date,
                oi.quantity AS item_quantity,
                oi.line_item_price,
                p.product_id,
                p.name AS product_name,
                p.price AS unit_price,
                p.unit AS product_unit
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.buyer_id = $1
            ORDER BY o.created_at DESC;
        `;
        const { rows } = await pool.query(query, [userId]);

        const ordersHistory = rows.reduce((acc, row) => {
            const existingOrder = acc.find(order => order.order_id === row.order_id);
            const itemDetail = {
                product_id: row.product_id,
                name: row.product_name,
                quantity: row.item_quantity,
                unit_price: row.unit_price,
                line_item_price: row.line_item_price,
                unit: row.product_unit
            };

            if (existingOrder) {
                existingOrder.items.push(itemDetail);
            } else {
                acc.push({
                    order_id: row.order_id,
                    total_price: row.total_price,
                    status: row.order_status,
                    order_date: row.order_date,
                    items: [itemDetail]
                });
            }
            return acc;
        }, []);

        res.json(ordersHistory);
    } catch (err) {
        console.error("Error fetching product orders:", err);
        res.status(500).json({ message: "Failed to fetch product order history." });
    }
});

// Endpoint for Fetching Product Sales History (Seller/Owner)
app.get('/api/users/:userId/sales', async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `
            SELECT 
                o.order_id,
                o.created_at AS order_date,
                o.status AS order_status,
                u.username AS buyer_name,
                oi.quantity AS item_quantity,
                oi.line_item_price,
                p.name AS product_name,
                p.unit AS product_unit
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            JOIN users u ON o.buyer_id = u.user_id
            WHERE p.seller_id = $1
            ORDER BY o.created_at DESC, o.order_id;
        `;
        const { rows } = await pool.query(query, [userId]);

        const salesHistory = rows.reduce((acc, row) => {
            const existingOrder = acc.find(order => order.order_id === row.order_id);
            const itemDetail = {
                product_name: row.product_name,
                quantity: row.item_quantity,
                unit: row.product_unit,
                line_item_price: row.line_item_price,
            };
            const itemTotal = parseFloat(row.line_item_price);

            if (existingOrder) {
                existingOrder.items.push(itemDetail);
                existingOrder.total_revenue += itemTotal;
            } else {
                acc.push({
                    order_id: row.order_id,
                    buyer_name: row.buyer_name,
                    status: row.order_status,
                    order_date: row.order_date,
                    total_revenue: itemTotal, 
                    items: [itemDetail]
                });
            }
            return acc;
        }, []);

        res.json(salesHistory);
    } catch (err) {
        console.error("Error fetching product sales:", err);
        res.status(500).json({ message: "Failed to fetch product sales history." });
    }
});


// ----------------------------------------------------
// RENTAL BOOKING/REVIEW ROUTES (Unchanged)
// ----------------------------------------------------
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

app.put('/api/bookings/:bookingId/return', async (req, res) => {
    const { bookingId } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update the booking status to 'returned'
        const result = await client.query(
            `UPDATE rentalbookings 
             SET status = 'returned' 
             WHERE booking_id = $1 
             RETURNING equipment_id, renter_id, status`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Booking not found." });
        }
        
        await client.query('COMMIT');

        res.json({ 
            message: 'Booking marked as returned. The equipment owner must now check the item and manually mark it available on their dashboard.', 
            booking: result.rows[0] 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error returning booking:", err);
        res.status(500).json({ message: "Failed to return booking." });
    } finally {
        client.release();
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
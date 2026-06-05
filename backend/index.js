import dotenv from 'dotenv'     // allows using .env file to set mysql parameters (user, host, etc.)
dotenv.config();    // imports .env file
import express from 'express';      // allows handling HTTP requests
import mysql from 'mysql2'      // allows communicating with mysql database
import cors from 'cors'     // gives permission to frontend server to send HTTP requests to backend proxy server (this server)
import bcrypt from 'bcrypt'     // used to hash passwords
import jwt from 'jsonwebtoken'  // turns email into token to be used as variable on pages
import nodemailer from 'nodemailer'     // used to send email for password recovery

const app = express();  // starts HTTP handler
app.use(express.json())     // allows parsing POST requests that contain json objects
app.use(cors({ origin: ["http://127.0.0.1:5174", "http://localhost:5174", "http://127.0.0.1:5173", "http://localhost:5173"] })) // gives permission to frontend to send HTTP requests

const PORT = 8080;  // port of this server

// testing database is corect
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_DATABASE);


// setting up connection to mysql database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise();


// sets up ability to send an email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})


// handles accepting request to change password and sending email
// requires email address
// returns success status
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) return res.status(404).json({ error: 'Email not found' })

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'BenchMark Password Reset',
        text: `Click this link to reset your password: ${resetLink}`
    })

    res.status(200).json({ success: true })
})


// handles actual resetting of password in the database
// requires JWT token and new password
// returns success status
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body
    try {
        const { email } = jwt.verify(token, process.env.JWT_SECRET)
        const hashed = await bcrypt.hash(newPassword, 10)
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email])
        res.status(200).json({ success: true })
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' })
    }
})


// LEGACY: should not be used, but kept in case it actually is
// allows testing whether server is online
app.get('/', (req, res) => {
    res.send( {success: true} );
})


// gets all benches from database
// requires nothing
// returns everything in "bench" table in database
app.get('/bench', async (req, res) => {
    const result = await pool.query("SELECT * FROM benches");
    res.send(result[0]);
})


// calculates the star rating and number of ratings for each bench
// requires nothing
// returns list of benches with their associated rating and number of reviews
app.get('/bench-ratings', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                bench_id AS benchId,
                COALESCE(AVG(stars), 0) AS avgRating,
                COUNT(*) AS reviewCount
            FROM reviews
            GROUP BY bench_id
        `);

        res.json(rows);
    } catch (err) {
        console.error('bench-ratings error:', err);
        res.status(500).json({ error: err.message });
    }
})


// search for benches near the users location, optionally filtered by a query string 
// requires latitdue and longitude, can accept query string
// returns list of benches nearby
app.get('/bench-search', async (req, res) => { // 
  const q = (req.query.q || '').trim();
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT
        b.id,
        b.name,
        b.address,
        b.image_url AS imageURL,
        ST_X(b.coordinates) AS lat,
        ST_Y(b.coordinates) AS lng,
        COALESCE(review_stats.avgRating, 0) AS avgRating,
        COALESCE(review_stats.reviewCount, 0) AS reviewCount,
        ST_Distance_Sphere(
          b.coordinates,
          ST_SRID(POINT(?, ?), 4326)
        ) AS distance_meters
      FROM benches b
      LEFT JOIN (
        SELECT
          bench_id,
          AVG(stars) AS avgRating,
          COUNT(*) AS reviewCount
        FROM reviews
        GROUP BY bench_id
      ) review_stats ON review_stats.bench_id = b.id
      WHERE ST_Distance_Sphere(
        b.coordinates,
        ST_SRID(POINT(?, ?), 4326)
      ) <= 5000
      AND (
        ? = '' OR
        b.name LIKE CONCAT('%', ?, '%') OR
        b.address LIKE CONCAT('%', ?, '%')
      )
      ORDER BY distance_meters ASC
      LIMIT 50
    `, [lng, lat, lng, lat, q, q, q]);

    res.json(rows);
  } catch (err) {
    console.error('bench-search error:', err);
    res.status(500).json({ error: err.message });
  }
});


// LEGACY: should not be used, but kept in case it actually is
// gets benches from database that are near certain coordinates
// requires a coordinate as a query paramater
// returns all benches from "benches" table that are within 50,000 meters
app.get('/bench-lookup', async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const result = await pool.query(`
        SELECT
            id,
            name,
            address,
            ST_Y(coordinates) as lon,
            ST_X(coordinates) as lat,
            ST_Distance_Sphere(coordinates, ST_SRID(
                POINT(?, ?)
                , 4326)) AS distance_meters
        FROM benches
        WHERE ST_Distance_Sphere(coordinates, ST_SRID(
            POINT(?, ?)
            , 4326)) <= 50000
        `, [lon, lat, lon, lat])
    res.send(result[0])
})


// adds new bench to database
// requires bench name, address, coordinates, and image URL of a bench
// returns the database id of the added bench
app.post('/add-bench', async (req, res) => {
    const { name, address, lng, lat, imageURL } = req.body

    try {
        const [result] = await pool.query(
            'INSERT INTO benches (name, address, coordinates,image_url) VALUES (?, ?, ST_SRID(POINT(?, ?), 4326), ?)',
            [name, address, lng, lat, imageURL]
        )
        console.log({ insertId: result.insertId })
        res.send({ insertId: result.insertId })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


// adds new review to database
// requires a bench ID, a user ID, stars, text
// returns nothing
app.post('/add-review', async (req, res) => { 
    const { benchId, userId, stars, review } = req.body

    try {
        await pool.query(
            'INSERT INTO reviews (bench_id, user_id, stars, review) VALUES (?, ?, ?, ?)',
            [benchId, userId, stars, review]
        )
        const [result] = await pool.query(
            'SELECT num_reviewed FROM users WHERE email = ?', [userId]
        )
        console.log(result[0].num_reviewed + 1)
        await pool.query(
            'UPDATE users SET num_reviewed = ? WHERE email = ?', [result[0].num_reviewed + 1, userId]
        )
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ error: err.message })
    }
})


// gets reviews for a bench
// requries bench id
// returns array of reviews with author info
app.get('/bench-reviews', async (req, res) => {
    const benchId = Number(req.query.bench_id);

    if (!benchId) {
        return res.status(400).json({ error: 'bench_id is required' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT
                r.id,
                r.bench_id AS benchId,
                r.user_id AS userId,
                r.stars,
                r.stars AS rating,
                r.review,
                r.review AS preview,
                r.created_at AS createdAt,
                COALESCE(u.username, r.user_id, 'Anonymous') AS author,
                COALESCE(u.pfp_url, '') AS avatarUrl,
                'Bench Scout' AS badge
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.email
             WHERE r.bench_id = ?
             ORDER BY r.created_at DESC, r.id DESC`,
            [benchId]
        );

        res.json(rows);
    } catch (err) {
        console.error('bench-reviews error:', err);
        res.status(500).json({ error: err.message });
    }
})


// inserts new user into database and logs in user
// requires email, password, username
// returns success status
app.post('/register', async (req, res) => {
    const { email, password, username } = req.body
    
    try {
        const hashed = await bcrypt.hash(password, 10)
        await pool.query(
            'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
            [email, hashed, username]
        )

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).json({ success: true, token })
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' })
        }
        res.status(500).json({ error: err.message })
    }
})


// checks if credentials are correct and logs in user
// requires email, password
// returns success status
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
        if (rows.length === 0) return res.status(401).json({ error: 'Incorrect email or password' })
        
        const match = await bcrypt.compare(password, rows[0].password)
        if (!match) return res.status(401).json({ error: 'Incorrect email or password' })
        
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).json({ success: true, token })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


// queries necessary profile information linked to the email
// requires email
// returns username, profile picture, number of reviews
app.get('/user', async (req, res) => {
    const { email } = req.query;
    const [rows] = await pool.query(
        'SELECT username, pfp_url, num_reviewed FROM users WHERE email = ?',
        [email]
    );
    res.json(rows[0]);
})


// quereis necessary profile reviews linked with email
// requires user id
// returns list of reviews associated with the user
app.get('/reviews', async (req, res) => {
    const { user_id } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.bench_id, r.stars, r.review, r.created_at,
                    b.name, b.address, b.image_url
             FROM reviews r
             JOIN benches b ON r.bench_id = b.id
             WHERE r.user_id = ?`,
            [user_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})


// add the username profile picture to user entry in database
// requires email and picture url
// returns success status
app.post('/update-pfp', async (req, res) => {
    const { email, url } = req.body;
    await pool.query(
        'UPDATE users SET pfp_url = ? WHERE email = ?',
        [url, email]
    );
    res.json({ success: true });
});


// lets the developer know that the server is online
app.listen(8080, () => {
    console.log('Server is running on port 8080');
})

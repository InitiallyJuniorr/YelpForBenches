import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import mysql from 'mysql2'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'




const app = express();
app.use(express.json())
app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173"] }))
const PORT = 8080;

// Testing Database is corect
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_DATABASE);



const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

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


app.get('/', (req, res) => {
    res.send( {success: true} );
})

app.get('/bench', async (req, res) => {
    const result = await pool.query("SELECT * FROM benches");
    res.send(result[0]);
})

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

app.post('/add-bench', async (req, res) => {    // Adds bench to database, returns id of new bench
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

app.post('/add-review', async (req, res) => {    // Adds review to database, returns nothing
    const { benchId, userId, stars, review } = req.body
    console.log(typeof benchId)
    console.log(typeof userId)
    console.log(typeof stars)
    console.log(typeof review)

    try {
        await pool.query(
            'INSERT INTO reviews (bench_id, user_id, stars, review) VALUES (?, ?, ?, ?)',
            [benchId, userId, stars, review]
        )
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ error: err.message })
    }
})

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

// Queries necessary profile information linked to the email
app.get('/user', async (req, res) => {
    const { email } = req.query;
    const [rows] = await pool.query(
        'SELECT username, pfp_url, num_reviewed FROM users WHERE email = ?',
        [email]
    );
    res.json(rows[0]);
})

// Queries necessary profile reviews linked with email
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
// POST the username profile picture
app.post('/update-pfp', async (req, res) => {
    const { email, url } = req.body;
    await pool.query(
        'UPDATE users SET pfp_url = ? WHERE email = ?',
        [url, email]
    );
    res.json({ success: true });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
})
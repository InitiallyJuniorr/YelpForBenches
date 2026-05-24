import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import mysql from 'mysql2'
import cors from 'cors'
import bcrypt from 'bcrypt'


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

app.post('/register', async (req, res) => {
    const { email, password } = req.body
    
    try {
        const hashed = await bcrypt.hash(password, 10)
        await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashed]
        )
        res.status(200).json({ success: true })
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
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' })
        
        const match = await bcrypt.compare(password, rows[0].password)
        if (!match) return res.status(401).json({ error: 'Invalid email or password' })
        
        res.status(200).json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(8080, () => {
    console.log('Server is running on port 8080');
})
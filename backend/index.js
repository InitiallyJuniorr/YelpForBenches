import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import mysql from 'mysql2'
import cors from 'cors'

const app = express();
const PORT = 8080;

console.log(process.env.MYSQL_HOST);
console.log(process.env.MYSQL_USER);
console.log(process.env.MYSQL_PASSWORD);
console.log(process.env.MYSQL_DATABASE);

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

app.use(
    cors({
        origin: ["http://127.0.0.1:5173"]
    })
)

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
            ST_Distance_Sphere(coordinates, ST_SRID(
                POINT(?, ?)
                , 4326)) AS distance_meters
        FROM benches
        WHERE ST_Distance_Sphere(coordinates, ST_SRID(
            POINT(?, ?)
            , 4326)) <= 1000
        `, [lon, lat, lon, lat])
    res.send(result[0])
})

app.listen(8080, () => {
    console.log('Server is running on port 8080');
})
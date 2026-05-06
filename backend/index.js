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
    const result = await pool.query("SELECT * FROM notes");
    res.send(result[0][0]);
})

app.listen(8080, () => {
    console.log('Server is running on port 8080');
})
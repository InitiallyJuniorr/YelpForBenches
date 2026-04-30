const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(
    cors({
        origin: ["http://127.0.0.1:5173"]
    })
)

app.get('/', (req, res) => {
    res.send('Welcome!!!');
})

app.get('/api/bench', (req, res) => {
    res.json({ name: "Bechnamin", location: "Court Of Sciences" });
})

app.listen(8080, () => {
    console.log('Server is running on port 8080');
})
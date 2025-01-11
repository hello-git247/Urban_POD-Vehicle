const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const zlib = require('zlib');
require('dotenv').config();

const app = express();
const port = 5000; // Ensure this matches the port used in your fetch requests

app.use(bodyParser.json());
app.use(express.json());

app.get('/booking_stats', (req, res) => {
    // Replace with actual data fetching logic
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        values: [10, 20, 30, 40, 50, 60]
    };
    res.json(data);
});

app.get('/revenue_stats', (req, res) => {
    // Replace with actual data fetching logic
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        values: [1000, 2000, 3000, 4000, 5000, 6000]
    };
    res.json(data);
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected');

    setInterval(() => {
        const message = JSON.stringify({ lat: 17.7253, lng: 78.2572 });
        zlib.deflate(message, (err, buffer) => {
            if (!err) {
                ws.send(buffer);
            }
        });
    }, 5000);

    ws.on('message', message => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${5000}`);
});
const express = require('express');
const cors = require('cors');
const { evaluate } = require('mathjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enables frontend connection
app.use(express.json()); // Parses incoming JSON payloads

// Temporal In-Memory database array tracking all global operations
let calculationHistory = [];

// Endpoint 1: Evaluate equation and store the calculation
app.post('/api/calculate', (req, res) => {
    const { user, equation } = req.body;

    if (!equation) {
        return res.status(400).json({ error: 'No equation provided' });
    }

    try {
        // Evaluate expression cleanly and securely using mathjs
        const result = evaluate(equation);
        
        const newLog = {
            id: Date.now(),
            user: user || 'Anonymous',
            equation,
            result: Number(result.toFixed(4)) // Format long float decimals cleanly
        };

        // Add to history stack (keep top 20 latest logs)
        calculationHistory.unshift(newLog);
        if (calculationHistory.length > 20) {
            calculationHistory.pop();
        }

        return res.json({ result: newLog.result });
    } catch (error) {
        return res.status(400).json({ error: 'Invalid calculation expression' });
    }
});

// Endpoint 2: Get global log stream
app.get('/api/history', (req, res) => {
    res.json(calculationHistory);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend calculator service running at http://localhost:${PORT}`);
});

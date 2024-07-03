// Example server-side code using Express
const express = require('express');
const app = express();

// Dummy data for demonstration
const users = [
    { name: 'User 1', email: 'user1@example.com', number: '1234567890', score: 8 },
    { name: 'User 2', email: 'user2@example.com', number: '0987654321', score: 6 },
    // Add more users as needed
];

// Route handler for /api/users endpoint
app.get('/api/users', (req, res) => {
    res.json(users); // Send users array as JSON response
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

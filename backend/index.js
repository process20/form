require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const formRoutes = require('./routes/formRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
//built-in middleware
//enable json content type
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Routes
app.use('/api/form', formRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

// Serve static files from the React/Vite app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

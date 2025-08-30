const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/tpo', require('./routes/tpoRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));

app.get('/', (req, res) => {
  res.send('Placement Tracker API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Imports
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const User = require('./models/User'); 
const OpenAI = require('openai');
const mongoose = require('mongoose');
app.set('view engine', 'ejs');

dotenv.config();

// Init + DB
const app = express();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors({ origin: '*', methods: ['POST'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'mooreworks_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', emailRoutes);
app.use('/api/calendar', calendarRoutes);

// Serve HTML Views

app.get('/', (req, res) => {
  res.render('index', { loggedIn: !!req.session.userId });
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});
app.get('/tool', (req, res) => { 
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'views', 'tool.html'));
});
app.get('/calendar', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'views', 'calendar.html'));
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
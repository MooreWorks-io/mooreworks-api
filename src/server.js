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


dotenv.config();

// Init + DB
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware to protect pages
function ensureAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  next();
}

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
const userRoutes = require('./routes/userRoutes');
const timesheetRoutes = require('./routes/timesheetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', emailRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api', userRoutes);
app.use('/api/timesheets', timesheetRoutes);

// Serve HTML Views

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});
app.get('/tool', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tool.html'));
});

app.get('/calendar', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'calendar.html'));
});

app.get('/invoice', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'invoice.html'));
});

app.get('/account', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'account.html'));
});

app.get('/dashboard', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
app.get('/timesheets', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'timesheets.html'));
});
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/home');
  res.render('index', { loggedIn: false });
});
app.get('/home', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.render('home', { userEmail: req.session.userEmail });
});
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forgot-password.html'));
});
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reset-password.html'));
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
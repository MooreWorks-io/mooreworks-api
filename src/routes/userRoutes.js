const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Middleware to ensure user is logged in
function ensureAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET user info
router.get('/user', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update user name or password
router.put('/user', ensureAuth, async (req, res) => {
  try {
    const { name, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (password) updates.password = await bcrypt.hash(password, 10);

     updates.quickbooksConnected = quickbooksToggle === 'on';


    const updatedUser = await User.findByIdAndUpdate(req.session.userId, updates, { new: true });

    res.json({ message: 'User updated', user: { name: updatedUser.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user
router.delete('/user', ensureAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.userId);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Account deleted' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be 3-20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;

    try {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email or username already in use' });
      }

      const user = await User.create({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      console.error('Register error', error);
      return res.status(500).json({ message: 'Registration failed' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').optional().isEmail(),
    body('username').optional().isString(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;

    if (!email && !username) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    try {
      const user = await User.findOne(
        email
          ? { email: email.toLowerCase() }
          : { username: username.toLowerCase() }
      );

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      console.error('Login error', error);
      return res.status(500).json({ message: 'Login failed' });
    }
  }
);

router.get('/me', auth, (req, res) => {
  const { _id, email, username, friends } = req.user;
  return res.json({
    user: { id: _id, email, username, friends },
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, authController.googleAuthCallback);

module.exports = router;

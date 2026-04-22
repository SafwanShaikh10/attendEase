const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const { name, email, password, role, department, year, division } = req.body;
    
    // Security Fix: Password length validation
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'STUDENT',
        department,
        year,
        division,
      },
    });

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      userId: user.id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Guard: Google-only users don't have a password
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google button.' });
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token containing id and role (Security Fix: 8h expiry, no secret fallback)
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      success: true, 
      data: { 
        token, 
        user: { id: user.id, name: user.name, role: user.role, email: user.email } 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user; // Passport adds the user to req after successful auth
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Redirect to frontend with token and user info
    // The frontend will catch these in AuthContext/Login page
    const userData = encodeURIComponent(JSON.stringify({ 
      id: user.id, 
      name: user.name, 
      role: user.role, 
      email: user.email 
    }));
    
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&user=${userData}`);
  } catch (err) {
    console.error('Google Auth Callback Error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=Server error`);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a reset token (15 min expiry)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"AttendEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset — AttendEase',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #333;">
          <h2 style="font-size: 22px; font-weight: 900; margin-bottom: 8px;">Reset Your Password</h2>
          <p style="font-size: 14px; color: #5f6368; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your AttendEase password. Click the button below to choose a new password. This link expires in <strong>15 minutes</strong>.
          </p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #333; color: #fdfaf1; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
            Reset Password
          </a>
          <p style="font-size: 11px; color: #999; margin-top: 32px; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 0.15em;">AttendEase · DSU</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
      }
      return res.status(400).json({ error: 'Invalid reset link.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid reset token.' });
    }

    // Hash new password and update
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash },
    });

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
};

module.exports = { register, login, googleAuthCallback, forgotPassword, resetPassword };

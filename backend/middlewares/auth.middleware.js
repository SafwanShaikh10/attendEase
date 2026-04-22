const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  // Fallback to query parameter for iframes/images
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is expired or invalid' });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check actual role first
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Check if user is an active substitute for any of the allowed roles
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const now = new Date();
    const substitute = await prisma.substituteApprover.findFirst({
      where: {
        substituteUserId: req.user.id,
        roleCovered: { in: roles },
        active: true,
        expiresAt: { gt: now }
      }
    });

    if (substitute) {
      req.user.actingAs = substitute.roleCovered;  // flag for audit log
      req.user.substituteFor = substitute.absentUserId;
      return next();
    }

    return res.status(403).json({ error: 'Access denied' });
  };
};

module.exports = { authenticateToken, requireRole };

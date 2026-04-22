const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./prisma');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const name = profile.displayName;

      // 1. Try to find user by googleId
      let user = await prisma.user.findUnique({
        where: { googleId }
      });

      // 2. If not found, try to find by email
      if (!user) {
        user = await prisma.user.findUnique({
          where: { email }
        });

        if (user) {
          // Sync googleId to existing email account
          user = await prisma.user.update({
            where: { email },
            data: { googleId }
          });
        }
      }

      // 3. If still not found, create new user
      if (!user) {
        // For new students via Google, we might need department/year/etc.
        // For now, we create a skeleton and they might need to update details later
        // or we restrict registration to pre-existing emails.
        // Option: Only allow pre-registered emails? 
        // Decision: Create skeleton user as STUDENT, they can fill details in profile.
        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId,
            role: 'STUDENT',
            department: 'Pending', // Placeholder
            passwordHash: null // Social users don't have local password initially
          }
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// No session needed as we use JWT, but passport requires these if session: true
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User'); // Your User model

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            const { email, name, picture } = profile._json;

            // Find or Create User
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({ email, name, profilePicture: picture, provider: 'google' });
            }
            done(null, user);
        }
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails[0].value;
            const name = profile.displayName;

            // Find or Create User
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({ email, name, provider: 'github' });
            }
            done(null, user);
        }
    )
);

module.exports = passport;

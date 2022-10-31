require("dotenv").config();
const User = require("../models/user");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies.token) token = req.cookies.token;
  return token;
};

const options = {};
options.jwtFromRequest = cookieExtractor;
options.secretOrKey = process.env.SECRET;
options.algorithms = ["HS256"];
passport.use(
  new JwtStrategy(options, (payload, done) => {
    User.findOne({ userName: payload.userName }, (err, user) => {
      if (err) return done(err, false);
      if (!user) return done(null, false);
      done(null, user);
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((userId, done) => {
  User.findById(userId, (err, user) => {
    if (err) return done(err, false);

    done(null, user);
  });
});

module.exports = passport;

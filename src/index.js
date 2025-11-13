const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const routes = require('./Routes');
const path = require('path');
require('dotenv').config();
const connectDb = require('./config/db');
const expressLayouts = require('express-ejs-layouts');
const session = require("express-session");
const authMiddleware = require('./Middlewares/auth').authMiddleware;
var cookieParser = require('cookie-parser')
var methodOverride = require('method-override')
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const homeController = require('./Controllers/homeController')
const fbCallBack = `https://technodejsweb.onrender.com/auth/facebook/callback`;

app.use(methodOverride('_method'))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(authMiddleware);
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: fbCallBack || "/auth/facebook/callback",

},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

routes(app);

app.use(homeController.get404)

app.listen(PORT, () => {
    console.log('Connecting to Database...');
    connectDb();
    console.log(`Server is running on http://${host}:${PORT}`);
});
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
routes(app);

app.listen(PORT, () => {
    console.log('Connecting to Database...');
    connectDb();
    console.log(`Server is running on http://${host}:${PORT}`);
});
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const routes = require('./Routes');
const path = require('path');
require('dotenv').config();
const connectDb = require('./config/db');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
routes(app);


app.listen(PORT, () => {
    console.log('Connecting to Database...');
    connectDb();
    console.log(`Server is running on http://${host}:${PORT}`);
});
const express = require('express');
const routers = express.Router();
const homeController = require('../Controllers/homeController');

routers.get('/', homeController.homePage);

module.exports = routers;
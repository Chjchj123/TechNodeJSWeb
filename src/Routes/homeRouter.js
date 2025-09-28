const express = require('express');
const routers = express.Router();
const homeController = require('../Controllers/homeController');

routers.get('/shop-page/:category', homeController.shopPage);
routers.get('/shop/:category/:id', homeController.productDetails);
routers.get('/', homeController.homePage);

module.exports = routers;
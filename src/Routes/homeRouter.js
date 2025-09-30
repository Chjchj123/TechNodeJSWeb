const express = require('express');
const routers = express.Router();
const homeController = require('../Controllers/homeController');

routers.get('/shop-page/:category', homeController.shopPage);
routers.get('/shop/:category/:id', homeController.productDetails);
routers.get('/cart/:id', homeController.showCart);
routers.post('/add-cart/:id', homeController.addToCart);
routers.post('/remove-cart/:id', homeController.removeCart);
routers.patch('/update-quantity-cart/:id', homeController.updateQuantity);
routers.get('/', homeController.homePage);

module.exports = routers;
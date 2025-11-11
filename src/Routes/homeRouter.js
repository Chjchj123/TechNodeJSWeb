const express = require('express');
const routers = express.Router();
const homeController = require('../Controllers/homeController');

routers.get('/shop-page/:category', homeController.shopPage);
routers.get('/shop/:category/:id', homeController.productDetails);
routers.get('/cart/:id', homeController.showCart);
routers.post('/add-cart/:id', homeController.addToCart);
routers.post('/remove-cart/:id', homeController.removeCart);
routers.patch('/update-quantity-cart/:id', homeController.updateQuantity);
routers.get('/checkout/:id', homeController.checkOut);
routers.post('/checkout-submit', homeController.checkOutSubmit)
routers.get('/user-orders/:id', homeController.showUsersOrders)
routers.post('/orders-filter', homeController.ordersFilter);
routers.post('/sort-product/:category', homeController.productFilter);
routers.get('/search-product', homeController.searchProduct);
routers.post('/brand-filter/:category', homeController.brandFilter);
routers.post('/sort-by-price-product/:category', homeController.sortByPriceProduct);
routers.post('/payment-process', homeController.paymentProcess);
routers.post('/get-webhooks', homeController.getWebhooks);
routers.get('/', homeController.homePage);

module.exports = routers;
const express = require('express');
const routers = express.Router();
const adminController = require('../Controllers/adminController');
const adminMiddleware = require('../Middlewares/auth').adminMiddleware;
const ProductsController = require('../Controllers/productsController');
const orderController = require('../Controllers/orderControllers')

const multer = require("multer");

// Không lưu vào ổ cứng, chỉ giữ trong memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
routers.use(adminMiddleware);
routers.get('/user-list', adminController.userList);
routers.delete('/delete-user/:_id', adminController.deleteUser);
routers.delete('/delete-all', adminController.deleteAllUsers);
routers.get('/recycle-bin', adminController.recycleBin);
routers.patch('/restore/:id', adminController.restoreUser);
routers.patch('/recycle-bin/restore-all', adminController.restoreAllUsers);
routers.delete('/recycle-bin/hard-delete/:id', adminController.hardDeleteUser);
routers.delete('/recycle-bin/hard-delete-all', adminController.hardDeleteAllUsers);
routers.post('/edit-user/:_id', adminController.editUser);
routers.put('/update-user/:_id', adminController.updateUser);
routers.get('/product-list', ProductsController.productList);
routers.post('/add-product', upload.array("images"), ProductsController.addProduct);
routers.post('/get-product/:id', ProductsController.getProduct);
routers.put('/update-product/:id', upload.any("images"), ProductsController.updateProduct);
routers.get('/deleted-products', ProductsController.getListDeletedProduct);
routers.delete('/delete-product/:id', ProductsController.deleteProduct);
routers.patch('/restore-product/:id', ProductsController.restoreProduct);
routers.patch('/restore-all-selected-product', ProductsController.restoreAllSelected);
routers.delete('/product/hard-delete/:id', ProductsController.hardDelete);
routers.delete('/products/hard-delete-selected', ProductsController.hardDeleteSelected);
routers.get('/orders-list', orderController.getOrderViews);
routers.post('/info-order/:id', orderController.infoOrder);
routers.post('/get-status/:id', orderController.getStatus);
routers.patch('/update-status/:id', orderController.updateStatus);
routers.delete('/delete-order/:id', orderController.deleteOrder);
routers.get('/pending-order', orderController.getPendingOrder);
routers.get('/', adminController.homepage);

module.exports = routers;
const express = require('express');
const routers = express.Router();
const adminController = require('../Controllers/adminController');
const authMiddleware = require('../Middlewares/auth');

routers.get('/user-list', adminController.userList);
routers.get('/', adminController.homepage);

module.exports = routers;
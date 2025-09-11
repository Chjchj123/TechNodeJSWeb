const express = require('express');
const routers = express.Router();
const adminController = require('../Controllers/adminController');

routers.get('/user-list', adminController.userList);
routers.get('/', adminController.homepage);

module.exports = routers;
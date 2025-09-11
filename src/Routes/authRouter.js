const express = require('express');
const routers = express.Router();

const LoginController = require('../Controllers/loginController');

routers.get('/login', LoginController.loginview);
routers.get('/sign-up', LoginController.registerview);
routers.post('/sign-up-submit', LoginController.registerSubmit);


module.exports = routers;
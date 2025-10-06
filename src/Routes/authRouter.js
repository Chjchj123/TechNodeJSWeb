const express = require('express');
const routers = express.Router();

const LoginController = require('../Controllers/loginController');

routers.get('/login', LoginController.loginview);
routers.get('/sign-up', LoginController.registerview);
routers.post('/sign-up-submit', LoginController.registerSubmit);
routers.post('/login-submit', LoginController.loginSubmit);
routers.post('/logout', LoginController.logout);
routers.get('/google', LoginController.loginWithGoogle);
routers.get('/google/callback', LoginController.loginGoogleCallBack)
routers.get('/facebook', LoginController.loginWithFacebook);
routers.get('/facebook/callback', LoginController.loginWithFacebookCallBack);


module.exports = routers;
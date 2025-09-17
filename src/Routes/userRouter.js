const express = require('express');
const routers = express.Router();
const userController = require('../Controllers/userController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

routers.put('/update-profile', upload.single('file'), userController.updateProfile);
routers.get('/', userController.profileView);

module.exports = routers;

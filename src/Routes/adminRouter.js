const express = require('express');
const routers = express.Router();
const adminController = require('../Controllers/adminController');
const adminMiddleware = require('../Middlewares/auth').adminMiddleware;
routers.use(adminMiddleware);

routers.get('/user-list', adminController.userList);
routers.delete('/delete-user/:_id', adminController.deleteUser);
routers.delete('/delete-all', adminController.deleteAllUsers);
routers.get('/recycle-bin', adminController.recycleBin);
routers.patch('/restore/:id', adminController.restoreUser);
routers.patch('/recycle-bin/restore-all', adminController.restoreAllUsers);
routers.delete('/recycle-bin/hard-delete/:id', adminController.hardDeleteUser);
routers.delete('/recycle-bin/hard-delete-all', adminController.hardDeleteAllUsers);
routers.get('/', adminController.homepage);

module.exports = routers;
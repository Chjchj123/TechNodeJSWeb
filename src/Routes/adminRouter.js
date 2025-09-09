const express = require('express');
const routers = express.Router();

routers.get('/', (req, res) => {
    res.render('admin/index', { title: 'Admin Dashboard' });
});

module.exports = routers;
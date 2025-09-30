const jwt = require('jsonwebtoken');
const user = require("../Models/user");

const authMiddleware = async (req, res, next) => {
    const category = ["GPU", "CPU", "Mainboards", "PSU", "RAM", "HDD", "SSD", "Monitors", "Case"];
    const whitelist = [
        '/auth/login',
        '/auth/sign-up',
        '/auth/login-submit',
        '/auth/sign-up-submit',
        '/',
        ...category.map(c => `/shop-page/${c}`)
    ];

    res.locals.existingUser = null;

    const isWhite = isWhitelisted(req.path, whitelist);

    if (req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            const getUser = await user.findOne({ _id: decoded.id });
            res.locals.existingUser = getUser;

            if (!res.locals.existingUser || res.locals.existingUser.deleted === true) {
                res.clearCookie('token');
                if (!isWhite) {
                    return res.redirect('/auth/login');
                }
            }
        } catch (error) {
            res.clearCookie('token');
            if (!isWhite) {
                return res.redirect('/auth/login');
            }
        }
    } else {
        if (!isWhite) {
            return res.redirect('/auth/login');
        }
    }
    next();
};



const adminMiddleware = (req, res, next) => {
    if (res.locals.existingUser.role !== 'Admin') {
        return res.status(403).send('Access denied. Admins only.');
    }
    next();
}
function isWhitelisted(path, whitelist) {
    // check exact match
    if (whitelist.includes(path)) return true;

    // check path động: /shop/:category/:id
    if (path.startsWith('/shop/')) return true;

    return false;
}

module.exports = {
    authMiddleware,
    adminMiddleware
};
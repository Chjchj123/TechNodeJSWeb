const jwt = require('jsonwebtoken');
const user = require("../Models/user");

const authMiddleware = async (req, res, next) => {
    const whitelist = ['/auth/login', '/auth/sign-up', '/auth/login-submit', '/auth/sign-up-submit'];
    if (whitelist.includes(req.path)) {
        next();
    } else {
        if (req.cookies.token) {
            const token = req.cookies.token;
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const getUser = await user.findOne({ _id: decoded.id }).lean();
                res.locals.existingUser = getUser;
                if (!res.locals.existingUser || res.locals.existingUser.deleted === true) {
                    res.clearCookie('token');
                    return res.redirect('/auth/login');
                }
                next();
            } catch (error) {
                res.clearCookie('token');
                return res.redirect('/auth/login');
            }
        } else {
            return res.redirect('/auth/login');
        }
    }
}

const adminMiddleware = (req, res, next) => {
    if (res.locals.existingUser.role !== 'Admin') {
        return res.status(403).send('Access denied. Admins only.');
    }
    next();
}

module.exports = {
    authMiddleware,
    adminMiddleware
};
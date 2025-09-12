const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const whitelist = ['/auth/login', '/auth/sign-up'];
    if (whitelist.includes(req.path)) {
        next();
    } else {
        if (req.cookies.token) {
            const token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            next();
        } else {
            return res.redirect('/auth/login');
        }
    }
}

module.exports = authMiddleware;
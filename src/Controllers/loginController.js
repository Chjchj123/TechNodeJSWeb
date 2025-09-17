const user = require("../Models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


class Login {
    loginview(req, res) {
        res.render('auth/login', { layout: false });
    }

    registerview(req, res) {
        res.render('auth/signUp', { layout: false });
    }

    async registerSubmit(req, res, next) {
        try {
            const existingUser = await user.findOne({ email: req.body.email });
            if (existingUser) {
                return res.render('auth/signUp', { toastMessage: 'Email đã tồn tại!', layout: false });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const newUser = new user({ ...req.body, password: hashedPassword });
            await newUser.save();
            res.render('auth/login', { toastMessage: 'Đăng ký thành công!', layout: false });
        } catch (error) {
            next(error);
        }
    }

    async loginSubmit(req, res, next) {
        try {
            const { email, password } = req.body;
            const existingUser = await user.findOne({ email: email });
            const isMatch = await bcrypt.compare(password, existingUser.password);
            if (!isMatch || !existingUser) {
                return res.render('auth/login', { toastMessage: 'Tài Khoản Hoặc Mật khẩu không đúng!', layout: false });
            }
            const payload = {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/');
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie('token');
            res.redirect('/auth/login');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new Login();
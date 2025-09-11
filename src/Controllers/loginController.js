const user = require("../Models/user");
const bcrypt = require("bcryptjs");

class Login {
    loginview(req, res) {
        res.render('auth/login');
    }

    registerview(req, res) {
        res.render('auth/signUp');
    }

    async registerSubmit(req, res, next) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const newUser = new user({ ...req.body, password: hashedPassword });
            await newUser.save();
            res.render('auth/login', { toastMessage: 'Đăng ký thành công!' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = new Login();
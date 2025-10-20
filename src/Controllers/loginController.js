const user = require("../Models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

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
            const newUser = new user({ ...req.body, password: hashedPassword, phone_number: req.body.phone_number });
            await newUser.save();
            res.redirect('auth/login');
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
            res.redirect('/');
        } catch (error) {
            next(error);
        }
    }

    loginWithGoogle(req, res, next) {
        passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }

    loginGoogleCallBack(req, res, next) {
        passport.authenticate("google", { failureRedirect: "/login" }, async (err, userProfile) => {
            if (err) return next(err);

            try {
                let existingUser = await user.findOne({ email: userProfile.emails[0].value });

                if (!existingUser) {
                    existingUser = new user({
                        name: userProfile.displayName,
                        email: userProfile.emails[0].value,
                        password: null,
                        provider: "google"
                    });
                    await existingUser.save();
                }

                const payload = {
                    id: existingUser._id,
                    email: existingUser.email,
                    name: existingUser.name
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.cookie("token", token, { httpOnly: true });

                res.redirect("/");
            } catch (error) {
                next(error);
            }
        })(req, res, next);
    }

    loginWithFacebook(req, res, next) {
        try {
            passport.authenticate('facebook', { scope: ["email"] })(req, res, next);
        } catch (error) {
            next(error)
        }
    }

    loginWithFacebookCallBack(req, res, next) {
        passport.authenticate("facebook", { failureRedirect: "/login" }, async (err, userProfile) => {
            if (err) return next(err);
            try {
                let getUser = await user.findOne({ email: userProfile.emails[0].value });
                if (!getUser) {
                    getUser = new user({
                        name: userProfile.displayName,
                        email: userProfile.emails[0].value,
                        password: null,
                        provider: "facebook"
                    })
                    await getUser.save();
                }

                const payload = {
                    id: getUser._id,
                    email: getUser.email,
                    name: getUser.name
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.cookie("token", token, { httpOnly: true })
                res.redirect("/");
            } catch (error) {
                next(error)
            }
        })(req, res, next);
    }
}

module.exports = new Login();
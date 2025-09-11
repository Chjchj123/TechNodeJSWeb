
class AdminController {
    homepage(req, res) {
        res.render('admin/index', { layout: false });
    }

    async userList(req, res, next) {
        try {
            const user = require("../Models/user");
            const users = await user.find();
            res.render('admin/userList', { layout: false, users });
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new AdminController();
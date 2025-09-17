const user = require("../Models/user");
class AdminController {
    homepage(req, res) {
        res.render('admin/index', { layout: false });
    }

    async userList(req, res, next) {
        try {
            const users = await user.find({ deleted: false });
            res.render('admin/userList', { layout: false, users });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const userToDelete = await user.findOne({ _id: req.params._id });
            userToDelete.deleted = true;
            await userToDelete.save();
            res.redirect('/admin/user-list');
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new AdminController();
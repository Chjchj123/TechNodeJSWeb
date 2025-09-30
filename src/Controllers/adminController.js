const user = require("../Models/user");

class AdminController {
    homepage(req, res) {
        res.render('admin/index', { layout: false });
    }

    async userList(req, res, next) {
        try {
            const users = await user.find({ deleted: false });
            const countUsers = await user.countDocuments({ deleted: false });
            res.render('admin/userList', { layout: false, users, countUsers });
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

    async recycleBin(req, res, next) {
        try {
            const deletedUsers = await user.find({ deleted: true });
            res.render('admin/recycleBin', { layout: false, users: deletedUsers });
        } catch (error) {
            next(error);
        }
    }

    async restoreUser(req, res, next) {
        try {
            const userToRestore = await user.findOne({ _id: req.params.id });
            userToRestore.deleted = false;
            await userToRestore.save();
            res.redirect('/admin/recycle-bin');
        } catch (error) {
            next(error);
        }
    }

    async restoreAllUsers(req, res, next) {
        let userIds = req.body.userId;
        try {
            await user.updateMany(
                { _id: { $in: userIds } },
                { $set: { deleted: false } }
            );
            res.redirect("/admin/recycle-bin");
        } catch (err) {
            next(err);
        }
    }

    async deleteAllUsers(req, res, next) {
        try {
            let userIds = req.body.userId;
            await user.updateMany(
                { _id: { $in: userIds } },
                { $set: { deleted: true } }
            );
            res.redirect("/admin/user-list");
        } catch (error) {
            next(error);
        }
    }

    async hardDeleteUser(req, res, next) {
        try {
            await user.deleteOne({ _id: req.params.id });
            res.redirect('/admin/recycle-bin');
        } catch (error) {
            next(error);
        }
    }

    async hardDeleteAllUsers(req, res, next) {
        try {
            let userIds = req.body.userId;

            if (!Array.isArray(userIds)) {
                userIds = userIds ? [userIds] : [];
            }

            if (userIds.length === 0) {
                return res.status(400).json({ message: "Không có user nào được chọn" });
            }
            await user.deleteMany({ _id: { $in: userIds } });

            res.redirect("/admin/recycle-bin");
        } catch (err) {
            next(err);
        }
    }

    async editUser(req, res, next) {
        try {
            const userToEdit = await user.findOne({ _id: req.body.userId });
            res.json(userToEdit);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            await user.findOneAndUpdate({ _id: req.params._id }, { phone_number: req.body.phone_number, name: req.body.name, city: req.body.city, address: req.body.address });
            res.redirect('/admin/user-list');
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new AdminController();
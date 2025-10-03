const user = require("../Models/user");
const order = require("../Models/orders")

class AdminController {
    async homepage(req, res) {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        let orders = await order.find({ status: "Pending" }).sort({ createdAt: -1 });
        orders = orders.map(odr => {
            odr = odr.toObject();
            odr.isNew = odr.createdAt >= thirtyMinutesAgo;
            return odr;
        })
        res.render('admin/index', { layout: false, orders });
    }

    async userList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20; // số user mỗi trang
            const skip = (page - 1) * limit;

            const [users, countUsers] = await Promise.all([
                user.find({ deleted: false }).skip(skip).limit(limit),
                user.countDocuments({ deleted: false })
            ]);
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            let orders = await order.find({ status: "Pending" }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('item.productId').populate('user');
            orders = orders.map(odr => {
                odr = odr.toObject();
                odr.isNew = odr.createdAt >= thirtyMinutesAgo;
                return odr;
            })
            const totalPages = Math.ceil(countUsers / limit);
            res.render("admin/userList", { users, currentPage: page, totalPages, countUsers, layout: false, orders });
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
            const page = parseInt(req.query.page) || 1;
            const limit = 20; // số user mỗi trang
            const skip = (page - 1) * limit;

            const [users, countUsers] = await Promise.all([
                user.find({ deleted: true }).skip(skip).limit(limit),
                user.countDocuments({ deleted: true })
            ]);
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            let orders = await order.find({ status: "Pending" }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('item.productId').populate('user');
            orders = orders.map(odr => {
                odr = odr.toObject();
                odr.isNew = odr.createdAt >= thirtyMinutesAgo;
                return odr;
            })
            const totalPages = Math.ceil(countUsers / limit);
            res.render("admin/recycleBin", { users, currentPage: page, totalPages, countUsers, layout: false, orders });
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
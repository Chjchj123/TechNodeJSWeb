const order = require('../Models/orders');
const product = require('../Models/product')

class orderController {
    async getOrderViews(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const skip = (page - 1) * limit;
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const orders = await order.find({ status: { $ne: "Pending" } }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('item.productId').populate('user');
            let newOrders = await order.find({ status: "Pending" }).sort({ createdAt: -1 })
            newOrders = newOrders.map(odr => {
                odr = odr.toObject();
                odr.isNew = odr.createdAt >= thirtyMinutesAgo;
                return odr;
            })
            const countOrders = await order.countDocuments();
            const totalPages = Math.ceil(countOrders / limit);

            res.render('admin/orderList', { layout: false, newOrders, orders, countOrders, totalPages, currentPage: page });
        } catch (error) {
            next(error);
        }
    }

    async infoOrder(req, res, next) {
        try {
            const ord = await order.findOne({ orderId: req.body.orderId }).populate('item.productId');
            res.json(ord)
        } catch (error) {
            next(error)
        }
    }

    async getStatus(req, res, next) {
        try {
            const getOrder = await order.findOne({ orderId: req.body.currentOrderId });
            res.json(getOrder);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const getOrder = await order.findOne({ orderId: req.params.id });
            getOrder.status = req.body.status;
            if (getOrder.status === "Cancelled") {
                const products = await product.find({
                    _id: { $in: getOrder.item.map(item => item.productId) }
                });
                for (let prd of products) {
                    const cartItem = getOrder.item.find(
                        c => c.productId.toString() === prd._id.toString()
                    );
                    if (cartItem) {
                        prd.stock += cartItem.quantity;
                        if (prd.stock < 0) prd.stock = 0;
                        await prd.save();
                    }
                }
            }
            await getOrder.save()
            res.json(getOrder)
        } catch (error) {
            next(error)
        }
    }

    async deleteOrder(req, res, next) {
        try {
            await order.findOneAndDelete({ _id: req.params.id });
            res.redirect('/admin/orders-list');
        } catch (error) {
            next()
        }
    }

    async getPendingOrder(req, res, next) {
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const skip = (page - 1) * limit;
            let orders = await order.find({ status: "Pending" }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('item.productId').populate('user');
            const countOrders = await order.countDocuments();
            const totalPages = Math.ceil(countOrders / limit);
            orders = orders.map(odr => {
                odr = odr.toObject();
                odr.isNew = odr.createdAt >= thirtyMinutesAgo;
                return odr;
            })
            res.render('admin/pendingOrder', { layout: false, orders, countOrders, totalPages, currentPage: page });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = new orderController();
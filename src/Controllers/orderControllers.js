const order = require('../Models/orders');

class orderController {
    async getOrderViews(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const skip = (page - 1) * limit;
            const orders = await order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('item.productId').populate('user');
            const countOrders = await order.countDocuments();
            const totalPages = Math.ceil(countOrders / limit);
            res.render('admin/orderList', { layout: false, orders, countOrders, totalPages, currentPage: page });
        } catch (error) {
            next(error);
        }
    }

    async infoOrder(req, res, next) {
        try {
            const ord = await order.findOne({ orderId: req.body.orderId });
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
};

module.exports = new orderController();
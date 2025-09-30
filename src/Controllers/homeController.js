const product = require('../Models/product');
const user = require('../Models/user');
const order = require('../Models/orders');

class homeController {
    async homePage(req, res) {
        const bestDiscountProducts = await product.find({ deleted: false }).sort({ discountPercent: -1 });
        const bannerProducts = await product.findOne({ discountPercent: { $gt: 30 }, deleted: false });
        const newProduct = await product.findOne().sort({
            createdAt: -1
        });
        const vga = await product.find({ category: "GPU" }).limit(12);
        const cpu = await product.find({ category: "CPU" }).limit(12);
        const mainboards = await product.find({ category: "Mainboards" }).limit(12);
        const ram = await product.find({ category: "RAM" }).limit(12);
        const hdd = await product.find({ category: "HDD" }).limit(12);
        const ssd = await product.find({ category: "SSD" }).limit(12);
        const casePC = await product.find({ category: "Case" }).limit(12);
        const psu = await product.find({ category: "PSU" }).limit(12);

        res.render('index', {
            bannerProducts,
            bestDiscountProducts,
            newProduct,
            vga,
            cpu,
            mainboards,
            ram,
            hdd,
            ssd,
            casePC,
            psu
        });
    }

    async shopPage(req, res, next) {
        try {
            const getProductByCategory = await product.find({ category: req.params.category, deleted: false });
            const totalProduct = await product.countDocuments({ category: req.params.category, deleted: false });
            res.render("shop", { getProductByCategory, totalProduct });
        } catch (error) {
            next(error);
        }
    }

    async productDetails(req, res, next) {
        try {
            const getProducts = await product.findOne({ _id: req.params.id, deleted: false });
            const relatedProducts = await product.find({ _id: { $ne: req.params.id }, category: getProducts.category, deleted: false });
            res.render('productDetails', { getProducts, relatedProducts });
        } catch (error) {
            next(error);
        }
    }

    async showCart(req, res, next) {
        try {
            const usr = await user.findOne({ _id: res.locals.existingUser._id, deleted: false }).populate('cart.productId');
            res.render('user/cart', { usr });
        } catch (error) {
            next(error);
        }
    }

    async addToCart(req, res, next) {
        try {
            const productToCart = await product.findOne({ _id: req.params.id, deleted: false });
            if (!res.locals.existingUser.cart) {
                res.locals.existingUser.cart = [];
            }
            res.locals.existingUser.cart.push({
                productId: productToCart._id,
                quantity: parseInt(req.body.quantity)
            });
            await res.locals.existingUser.save();
            res.redirect('/cart/' + res.locals.existingUser._id);
        } catch (error) {
            next(error);
        }
    }

    async removeCart(req, res, next) {
        try {
            await user.updateOne(
                { _id: res.locals.existingUser._id },
                { $pull: { cart: { productId: req.params.id } } }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateQuantity(req, res, next) {
        try {
            const cartItem = res.locals.existingUser.cart.find(item => item.productId._id.toString() === req.params.id);
            cartItem.quantity = req.body.quantity;
            await res.locals.existingUser.save();
        } catch (error) {
            next(error)
        }
    }

    async checkOut(req, res, next) {
        try {
            const usr = await user.findOne({ _id: res.locals.existingUser._id, deleted: false }).populate('cart.productId');
            res.render('checkout', { usr });
        } catch (error) {
            next(error)
        }
    }

    async checkOutSubmit(req, res, next) {
        try {
            const newOrder = new order({
                user: res.locals.existingUser._id,
                item: res.locals.existingUser.cart.map(product => ({
                    productId: product.productId,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity
                })),
                billDetails: {
                    name: req.body.name,
                    address: req.body.streetAddress,
                    city: req.body.city,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email
                },
                totalPrice: req.body.finalPrice,
                paymentMethod: req.body.paymentMethod
            });
            await newOrder.save();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new homeController();

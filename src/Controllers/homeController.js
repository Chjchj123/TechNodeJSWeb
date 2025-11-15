const product = require('../Models/product');
const user = require('../Models/user');
const order = require('../Models/orders');
const randomString = require('randomstring');
const jwt = require('jsonwebtoken');
let webhooks = [];

class homeController {
    async homePage(req, res) {
        const bestDiscountProducts = await product.find({ deleted: false }).sort({ discountPercent: -1 }).limit(12).sort({ createdAt: -1 });
        const bannerProducts = await product.find({ discountPercent: { $gt: 29 }, deleted: false }).limit(6).sort({ createdAt: -1 });
        const newProduct = await product.findOne().sort({
            createdAt: -1
        });
        const vga = await product.find({ category: "GPU" }).limit(12).sort({ createdAt: -1 });
        const cpu = await product.find({ category: "CPU" }).limit(12).sort({ createdAt: -1 });
        const mainboards = await product.find({ category: "Mainboards" }).limit(12).sort({ createdAt: -1 });
        const ram = await product.find({ category: "RAM" }).limit(12).sort({ createdAt: -1 });
        const hdd = await product.find({ category: "HDD" }).limit(12).sort({ createdAt: -1 });
        const ssd = await product.find({ category: "SSD" }).limit(12).sort({ createdAt: -1 });
        const casePC = await product.find({ category: "Case" }).limit(12).sort({ createdAt: -1 });
        const psu = await product.find({ category: "PSU" }).limit(12).sort({ createdAt: -1 });

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
            const page = parseInt(req.query.page) || 1;
            const limit = 18;
            const skip = (page - 1) * limit;
            const totalProduct = await product.countDocuments({ category: req.params.category, deleted: false });
            const totalPages = Math.ceil(totalProduct / limit);
            const getProductByCategory = await product.find({ category: req.params.category, deleted: false }).skip(skip).limit(limit).sort({ createdAt: -1 });
            const categories = await product.find({ category: req.params.category, deleted: false }).distinct("brand");
            res.render("shop", { getProductByCategory, totalProduct, currentPage: page, totalPages, categories });
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
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            const getuser = await user.findOne({ _id: decoded.id });
            const newOrder = new order({
                orderId: randomString.generate({ length: 9 }),
                user: getuser._id,
                item: getuser.cart.map(product => ({
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

            const products = await product.find({
                _id: { $in: getuser.cart.map(item => item.productId) }
            });
            for (let prd of products) {
                const cartItem = getuser.cart.find(
                    c => c.productId.toString() === prd._id.toString()
                );
                if (cartItem) {
                    prd.stock -= cartItem.quantity;
                    if (prd.stock < 0) prd.stock = 0;
                    await prd.save();
                }
            }
            getuser.cart = [];
            if (Array.isArray(webhooks) && webhooks.length > 0) {
                webhooks = webhooks.filter(w => {
                    const userIdStr = getuser._id.toString();

                    const inDescription = w.description?.includes(userIdStr);
                    const inContent = w.content?.includes(userIdStr);

                    return !(inDescription || inContent);
                });
            }
            await getuser.save();
            await newOrder.save();
            console.log(webhooks);
            res.redirect('/user-orders/' + getuser._id);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async showUsersOrders(req, res, next) {
        try {
            const orders = await order.find({ user: res.locals.existingUser._id }).populate("item.productId").sort({ createdAt: -1 });
            const allOrders = await order.countDocuments({ user: res.locals.existingUser._id });
            res.render('user/userOrders', { orders, allOrders });
        } catch (error) {
            next(error);
        }
    }

    async ordersFilter(req, res, next) {
        try {

            let filter = req.body.status && req.body.status !== "Tất cả trạng thái"
                ? { user: res.locals.existingUser._id, status: req.body.status }
                : { user: res.locals.existingUser._id };
            if (req.body.status === "All") {
                filter = { user: res.locals.existingUser._id };
            }

            const orders = await order.find(filter).populate("item.productId").sort({ createdAt: -1 });
            res.json({ orders });
        } catch (error) { next(error); }
    }

    async productFilter(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 18;
            const skip = (page - 1) * limit;
            const { option } = req.body;
            const { category } = req.params;
            let products = await product.find({ category: category, deleted: false }).skip(skip).limit(limit).sort({ createdAt: -1 });

            if (option === "lowToHigh") {
                products.sort((a, b) => a.price - b.price);
            } else if (option === "highToLow") {
                products.sort((a, b) => b.price - a.price);
            }

            res.json({ products });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async brandFilter(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 18;
            const skip = (page - 1) * limit;
            let products;
            if (req.body.brand.length > 0) {
                products = await product.find({ category: req.params.category, brand: req.body.brand, deleted: false }).skip(skip).limit(limit);
            } else {
                products = await product.find({ category: req.params.category, deleted: false }).skip(skip).limit(limit);
            }
            res.json({ products })
        }
        catch (error) {
            next(error)
        }
    }

    async searchProduct(req, res, next) {
        try {
            const { keyword } = req.query;

            if (!keyword || keyword.trim() === "") {
                return res.json([]);
            }
            const products = await product.find({ name: { $regex: keyword, $options: "i" } });
            res.json(products);
        } catch (error) {
            next(error)
        }
    }

    async sortByPriceProduct(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const { minPrice, maxPrice } = req.body;
            const limit = 18;
            const skip = (page - 1) * limit;
            const { category } = req.params;
            let products = await product.find({
                category: category,
                price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) },
                deleted: false
            }).skip(skip).limit(limit).sort({ createdAt: -1 });
            res.json({ products });
        } catch (error) {
            next(error);
        }
    }

    // 404 site 
    get404 = (req, res) => {
        res.status(404).render("404");
    };

    async paymentProcess(req, res, next) {
        try {
            webhooks.push(req.body);
            if (webhooks.length > 100) webhooks.shift();
            return res.status(200).json({
                success: true,
                message: "Payment processed successfully.",
                desc: req.body.description
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Payment failed. Please try again.",
            });
        }
    }

    async getWebhooks(req, res, next) {
        try {
            res.json(webhooks);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new homeController();

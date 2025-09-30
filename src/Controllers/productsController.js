const product = require("../Models/product");
const user = require("../Models/user");
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

class ProductsController {
    async productList(req, res, next) {
        try {
            const products = await product.find({ deleted: false });
            const countProducts = await product.countDocuments({ deleted: false });
            res.render('admin/productManager', { layout: false, products, countProducts });
        } catch (error) {
            next(error);
        }
    }

    async addProduct(req, res, next) {
        try {
            let result = [];
            if (req.files && req.files.length > 0) {
                const uploadResults = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "products/" + req.body.name, resource_type: "image" },
                                (error, result) => {
                                    if (error) return reject(error);
                                    resolve({
                                        url: result.secure_url,
                                        public_id: result.public_id,
                                    });
                                }
                            );
                            stream.end(file.buffer);
                        });
                    })
                );

                result = uploadResults;
                const newProduct = new product({
                    name: req.body.name,
                    price: req.body.price,
                    brand: req.body.brand,
                    category: req.body.category,
                    stock: req.body.stock,
                    details: {
                        description: req.body.details,
                        specifications: req.body.specifications
                    },
                    images: uploadResults
                });
                await newProduct.save();
            }
            res.redirect('/admin/product-list');
        } catch (error) {
            next(error);
        }
    }

    // gui ve modal fe
    async getProduct(req, res, next) {
        try {
            const productId = req.params.id;
            const foundProduct = await product.findOne({ _id: productId });
            res.json(foundProduct);
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const getProduct = await product.findOne({ _id: req.body.ID });
            // Đảm bảo details là object
            if (typeof getProduct.details !== 'object' || getProduct.details === null) {
                getProduct.details = {};
            }
            switch (req.body.action) {
                case "true":
                    getProduct.isTrending = true;
                    break;
                case "false":
                    getProduct.isTrending = false;
                    break;
                default:
                    getProduct.isTrending = false;
                    break;
            }
            getProduct.name = req.body.name;
            getProduct.category = req.body.category;
            getProduct.brand = req.body.brand;
            getProduct.price = req.body.price;
            getProduct.stock = req.body.stock;
            getProduct.discountPercent = req.body.discount;
            getProduct.details = {
                description: req.body.details,
                specifications: req.body.specifications
            }
            if (req.files) {
                const uploadResults = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "products/" + req.body.name, resource_type: "image" },
                                (error, result) => {
                                    if (error) return reject(error);
                                    resolve({
                                        url: result.secure_url,
                                        public_id: result.public_id,
                                    });
                                }
                            );
                            stream.end(file.buffer);
                        });
                    })
                );
                for (let i = 0; i < req.files.length; i++) {
                    const match = req.files[i].fieldname.match(/\d+/);
                    if (getProduct.images[match[0]]) {
                        await cloudinary.uploader.destroy(getProduct.images[match[0]].public_id);
                        getProduct.images[match[0]].url = uploadResults[i].url;
                        getProduct.images[match[0]].public_id = uploadResults[i].public_id;
                    }
                }
            }
            await getProduct.save();
            res.redirect("/admin/product-list");
        } catch (error) {
            next(error);
        }
    }

    async getListDeletedProduct(req, res) {
        const products = await product.find({ deleted: true });
        res.render('admin/productDeleted', { layout: false, products });
    }

    async deleteProduct(req, res, next) {
        try {
            await product.findOneAndUpdate({ _id: req.params.id }, { deleted: true });
            res.redirect('/admin/product-list');
        } catch (error) {
            next(error);
        }
    }

    async hardDelete(req, res, next) {
        try {
            const foundProduct = await product.findOne({ _id: req.params.id });
            if (foundProduct) {
                const folderName = "products/" + foundProduct.name;
                await cloudinary.api.delete_resources_by_prefix(folderName);
                await cloudinary.api.delete_folder(folderName);
            }
            await product.findOneAndDelete({ _id: foundProduct._id });
            res.redirect('/admin/deleted-products');
        } catch (error) {
            next(error);
        }
    }

    async hardDeleteSelected(req, res, next) {
        try {
            const getProducts = await product.find({ _id: { $in: req.body.productIds } });
            for (const element of getProducts) {
                let folderName = "products/" + element.name;
                await cloudinary.api.delete_resources_by_prefix(folderName);
                await cloudinary.api.delete_folder(folderName);
            }
            await product.deleteMany({ _id: { $in: req.body.productIds } });
            res.redirect('/admin/deleted-products');
        } catch (error) {
            next(error);
        }
    }

    async restoreProduct(req, res, next) {
        try {
            await product.findOneAndUpdate({ _id: req.params.id }, { deleted: false });
            res.redirect('/admin/deleted-products');
        } catch (error) {
            next(error);
        }
    }

    async restoreAllSelected(req, res, next) {
        try {
            await product.updateMany({ _id: { $in: req.body.productIds } }, { $set: { deleted: false } });
            res.redirect('/admin/deleted-products');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = new ProductsController();
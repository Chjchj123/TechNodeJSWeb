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
            res.render('admin/productManager', { layout: false, products });
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
            getProduct.name = req.body.name;
            getProduct.category = req.body.category;
            getProduct.brand = req.body.brand;
            getProduct.price = req.body.price;
            getProduct.stock = req.body.stock;
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
};

module.exports = new ProductsController();
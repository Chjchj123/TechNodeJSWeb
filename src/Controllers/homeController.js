const product = require('../Models/product');

class homeController {
    async homePage(req, res) {
        const bestDiscountProducts = await product.find({ discountPercent: { $gt: 20 }, deleted: false });
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
}

module.exports = new homeController();

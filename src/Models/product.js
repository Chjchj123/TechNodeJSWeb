const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        images: [
            {
                url: { type: String, required: true },
                public_id: { type: String }
            }
        ],
        details: { type: Object, default: {} },
        discountPercent: { type: Number, default: 0 },
        isTrending: { type: Boolean, default: false },
        comment: { type: Array, default: [] },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

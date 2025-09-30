const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
    billDetails: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String }
    },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ["COD", "Bank Transfer"],
        default: "COD"
    },
    status: {
        type: String,
        enum: ["Pending", "Confirm", "Shipping", "Success", "Cancelled"],
        default: "Pending",
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
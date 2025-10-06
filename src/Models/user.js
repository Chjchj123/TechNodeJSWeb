const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String },
    password: { type: String },
    avatar: {
        url: { type: String, default: "/asset/images/default-profile-picture1.jpg" },
        public_id: { type: String }
    },
    cart: {
        type: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                quantity: { type: Number, default: 1 },
                addedAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    },
    city: { type: String, default: "None" },
    address: { type: String, default: "None" },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

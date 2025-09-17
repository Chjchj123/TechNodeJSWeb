const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String },
    password: { type: String, required: true },
    avatar: { type: String, default: "/images/default-profile-picture1.jpg" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

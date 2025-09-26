require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const userModel = require('../Models/user');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

class UserController {
    profileView(req, res) {
        res.render('user/profile');
    }

    async updateProfile(req, res, next) {
        try {
            let result = res.locals.existingUser.avatar;
            if (req.file) {
                if (result?.public_id) {
                    await cloudinary.uploader.destroy(result.public_id);
                }
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "avatar_users", resource_type: "image" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(req.file.buffer);
                });

                result = {
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                };
            }

            const getUser = await userModel.findByIdAndUpdate(
                res.locals.existingUser._id,
                {
                    avatar: result,
                    name: req.body.name,
                    phone_number: req.body.phone,
                    email: req.body.email,
                    city: req.body.city,
                    address: req.body.address
                },
                { new: true }
            );
            await getUser.save();
            res.redirect('/user/' + res.locals.existingUser._id);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Upload failed" });
        }
    }

}

module.exports = new UserController();

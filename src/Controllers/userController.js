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
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "avatar_users", resource_type: "image" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            // res.json({
            //     url: result.secure_url,
            //     public_id: result.public_id,
            // });
            res.locals.existingUser.avatar = result.secure_url;
            const getUser = await userModel.findOneAndUpdate({ _id: res.locals.existingUser._id }, { avatar: result.secure_url });
            await getUser.save();
            res.redirect('/user');
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Upload failed" });
        }
    }

}

module.exports = new UserController();

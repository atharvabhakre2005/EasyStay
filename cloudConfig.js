const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Configure Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV', // Specify the Cloudinary folder where images will be stored
        allowed_formats: ['png', 'jpg', 'jpeg'], // Note: `allowedFormats` should be `allowed_formats`
    },
});

module.exports = {
    cloudinary,
    storage
};

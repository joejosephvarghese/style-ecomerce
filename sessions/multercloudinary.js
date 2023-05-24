const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// configuration
cloudinary.config({
    cloud_name: 'dkdwmk5zw',
    api_key:  '615798443618353',
    api_secret: 'cGCQuVpIRP3OJkqM4vKKOTocOc4'
});

// upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce-products',
        allowedFormats: ['jpg', 'jpeg', 'png','webp'],
        public_id: (req, file) => {
            console.log(file);
            // remove the file extension from the file name
            const fileName = file.originalname.split('.').slice(0, -1).join('.');
            return fileName+new Date;
        },
    },
});

const upload = multer({ storage: storage }).array('Image', 10);

module.exports = upload;
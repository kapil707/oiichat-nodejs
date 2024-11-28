const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Log the file for debugging
  console.log('Uploaded file:', file);

  // Check MIME type or file extension
  if (
    file.mimetype.startsWith('image/') || // MIME type check
    ['.png', '.jpg', '.jpeg', '.gif'].includes(path.extname(file.originalname).toLowerCase()) // Extension check
  ) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only image files are allowed!'), false); // Reject file
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
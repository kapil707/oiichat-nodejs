const multer = require("multer");
const path = require("path");

// Configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_images/"); // Directory to store profile images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize Multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;

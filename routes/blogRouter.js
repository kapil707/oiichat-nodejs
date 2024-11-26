const express = require("express");
const router = express.Router();
const multer = require('multer');
const { blogView,blogInsert, blogDelete,blogEdit,blogUpdate } = require("../controllers/blogController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.route("/add")
    .get(async (req, res) => {
        return res.render("./blog/add");
    })
    .post(upload.single('image'), blogInsert); // Use blogInsert controller here

router.get("/view",async (req,res)=>{
    const blogs = await blogView();
    return res.render("./blog/view",{
        blogs:blogs
    });
});

router.delete("/delete/:id", blogDelete);
router.route("/edit/:id")
    .get(blogEdit)
    .post(upload.single('image'), blogUpdate);

module.exports = router;

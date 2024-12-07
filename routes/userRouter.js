const express = require("express");
const {loginUser,registerUser,getAllUser,profile_upload,registerUserOrLoginUser} = require("../controllers/userController");
const upload = require("../middlewares/multer");

const router = express.Router();

// router.get("/users",async (req,res)=>{
//     const allUsers = await User.find({});
//     const html = `<ul>
//         ${allUsers.map((usr)=>`<li>${usr.firstName}</li>`).join("")}
//     </ul>`;
//     res.send(html);
// });

/*router.get("/kapil",async (req,res)=>{
    const allUsers = await getAllUserKapil();
    return res.render("home",{
        allUsers:allUsers
    });
});*/

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/alluser").post(getAllUser);
router.route("/profile_upload").post(upload.single("profileImage"), profile_upload);
router.route("/registerUserOrLoginUser").post(registerUserOrLoginUser);


// router.route("/").get(getAllUser).post(insertUser);

// router.route("/:id")
//     .get(async (req,res)=>{
//         const usr = await User.findById(req.params.id);
//         if(!usr){
//             return res.status(404).json({msg:'user not found'});
//         }else{
//             return res.status(200).json(usr);
//         }
//     }).patch(async (req,res)=>{
//         const body = req.body;
//         const result = await User.findByIdAndUpdate(req.params.id,{
//             firstName:body.firstName,
//             lastName:body.lastName
//         });
//         return res.status(200).json({msg:'sucess'});
//     }).delete(deleteUser);

module.exports = router;
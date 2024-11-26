const express = require("express");
const path = require("path");
const { logReqRes } = require("./middlewares");
const { connectMongoDb } = require("./connection");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const multer  = require('multer');
const { Server } = require("socket.io");
const http = require("http");
const initializeSocket = require("./socketHandler");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      return cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
  
const upload = multer({ storage: storage })

const app = express();
const PORT = 8000;

//Connection
connectMongoDb("mongodb://127.0.0.1:27017/kapil_db")
.then(()=>console.log("MongoDb Connected"))
.catch((err) =>console.log("MongoDb Error",err));

// Serve static files (uploads folder)
app.use('/uploads', express.static('./uploads'));

//Middleware - Plugin
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
/*
app.get("/",(req,res)=>{
    return res.render("home");
});*/

app.get("/kamal",(req,res)=>{
    return res.end("ram ram sa kamal ji");
});

//app.use(logReqRes('log.txt'));

app.use("/api/user",userRouter);

app.get("/profile",async (req,res)=>{
    return res.render("uploads");
});

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    console.log(req.body);
    console.log(req.file.path);
    return res.redirect("./profile");
  });

app.use("/blog",blogRouter);

const server = http.createServer(app);
const io = new Server(server);

// Pass the `io` instance to the Socket.IO handler
initializeSocket(io);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//app.listen(PORT,()=> console.log("Server Start Localhost:" + PORT));
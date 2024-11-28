const express = require("express");
const path = require("path");
const { logReqRes } = require("./middlewares");
const { connectMongoDb } = require("./connection");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const { Server } = require("socket.io");
const http = require("http");
const initializeSocket = require("./socketHandler");

const app = express();
const PORT = 8000;

//Connection
connectMongoDb("mongodb://127.0.0.1:27017/kapil_db")
.then(()=>console.log("MongoDb Connected"))
.catch((err) =>console.log("MongoDb Error",err));

//Middleware - Plugin
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
/*
app.get("/",(req,res)=>{
    return res.render("home");
});*/

//app.use(logReqRes('log.txt'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/user",userRouter);

const server = http.createServer(app);
const io = new Server(server);

// Pass the `io` instance to the Socket.IO handler
initializeSocket(io);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//app.listen(PORT,()=> console.log("Server Start Localhost:" + PORT));
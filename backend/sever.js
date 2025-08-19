import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import connectDB from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();
const server = http.createServer(app);

//initialize socket.io server

export const io = new Server(server,{
    cors: {origin: "*"}
})

//stor online users
export const userSocketMap = {}; //{userId: socketId}

//Socket.io connetion handler

io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online user to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("user dissconnected", userId)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
    
})

app.use(express.json({limit: "4mb"}));

app.use(cors());

app.use("/api/status", (req,res)=>{
    res.send("server is live");
})

app.use("/api/auth",userRouter)

app.use("/api/messages", messageRouter)

await connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log("server is running on PORT: ",PORT));
import express from "express";
import userRoute from './routes/user.js'
import chatRoute from './routes/chat.js'
import adminRoute from './routes/admin.js'
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser"
import { createUser } from "./seeders/user.js";
import { Server } from "socket.io";
import { createServer } from 'http';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING } from "./constants/events.js";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";
dotenv.config({
    path: "./.env"
})
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions
})

app.set("io", io);

const PORT = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION"
const adminSecretKey = process.env.ADMIN_SECRET_KEY || UQURKVFBNVBKZBVPKJ;

const userSocketIDs = new Map();

connectDB(process.env.MONGO_URI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// createUser(10); // create fake user

// middleware
app.use(express.json());

app.use(cookieParser());
app.use(cors(corsOptions)
);


app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use("/api/v1/admin", adminRoute);

// commonly used for tasks such as authentication, logging, or data transformation 
io.use((socket, next) => {

    cookieParser()(
        socket.request,
        socket.request.res,
        async (err) => await socketAuthenticator(err, socket, next)
    );
});



// socket: when the socket is connected, I will map this user ID with the socket ID
io.on("connection", (socket) => {
    const user = socket.user;


    userSocketIDs.set(user._id.toString(), socket.id) // this is active connected user

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {

        const messageForRealTime = {
            // chatId,
            // members,
            // messages
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        };

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId
        }

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        });

        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId }) // "4 new messages" alert

        try {
            await Message.create(messageForDB);
        } catch (error) {
            console.log(error)
        }
    });

    socket.on(START_TYPING, ({ members, chatId }) => {

        const membersSocket = getSockets(members);

        socket.to(membersSocket).emit(START_TYPING, { chatId })
    })

    socket.on(STOP_TYPING, ({ members, chatId }) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(STOP_TYPING, { chatId })
    })

    socket.on("disconnect", () => {
        console.log("user connected");
        userSocketIDs.delete(user._id.toString())
    });
});

app.use(errorMiddleware)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${envMode} Mode `)
})

export {
    envMode, adminSecretKey, userSocketIDs
}
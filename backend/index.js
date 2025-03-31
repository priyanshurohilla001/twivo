import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./route/user.route.js";
import friendRouter from "./route/friend.route.js";
import connectToDb from "./db.js";
import basicUserInfo from "./middelware/basicUserInfo.js";
import { userOnboarding } from "./controller/user.controller.js";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./model/user.model.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

connectToDb();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"],
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Connection handling
export const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Connection attempt from ${socket.id}`);
  const username = socket.handshake.query.username;

  if (!username) {
    console.error("Username missing - disconnecting");
    return socket.disconnect(true);
  }

  console.log(`User ${username} connected (${socket.id})`);
  
  connectedUsers.set(username, socket.id);

  async function notifyOnlineStatusChange() {
    const user = await User.findOne({ username }).lean();
    if (!user) {
      socket.disconnect()
      return ;
    }

    user.friends.forEach((friend) => {
      if(!friend.accepted) return;
      const socketId = connectedUsers.get(friend.username);
      if (socketId) {
        io.to(socketId).emit("onlineStatusChange", username , true);
      }
    })
  }

  notifyOnlineStatusChange();

  socket.on("disconnect", (reason) => {
    console.log(`User ${username} disconnected (${reason})`);
    connectedUsers.delete(username);

    async function goingOffline() {
      const user = await User.findOne({ username }).lean();
      
      user.friends.forEach((friend) => {
        if(!friend.accepted) return;
        const socketId = connectedUsers.get(friend.username);
        if (socketId) {
          io.to(socketId).emit("onlineStatusChange", username , false);
        }
      })
    }
  
    goingOffline();
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`Socket error (${username}):`, error);
  });
});


const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

app.post("/api/user/onboarding", checkJwt, userOnboarding);

app.use("/api/user", checkJwt, basicUserInfo, userRouter);
app.use("/api/friend", checkJwt, basicUserInfo, friendRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    connectedUsers: connectedUsers.size
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
  Server running on port ${PORT}
  Socket.IO transport protocols: ${io.opts.transports}
  CORS origin: ${io.opts.cors.origin}
  `);
});



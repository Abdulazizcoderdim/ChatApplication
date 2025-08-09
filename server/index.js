require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const messagesRoute = require("./routes/messages");
const mongoose = require("mongoose");
const socket = require("socket.io");
const logger = require("./lib/logger");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/ping", (_, res) => {
  return res.json({ msg: "Ping Successful✅✅" });
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoute);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error("Error during connect DB", err);
  });

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

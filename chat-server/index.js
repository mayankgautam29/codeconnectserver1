const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Message = require("../modules/messageModel.js"); // adjust if needed

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Update CORS to allow Vercel + localhost during dev
const CLIENT_ORIGINS = [
  "https://codeconnectmain.vercel.app", // Vercel frontend
  "http://localhost:3000",              // Local development
];

app.use(
  cors({
    origin: CLIENT_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGINS,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.send("✅ Chat Server is running!");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`📡 ${socket.id} joined room: ${roomId}`);
      });

      socket.on("sendMessage", async ({ roomId, message, sender, receiver }) => {
        if (!roomId || !message || !sender || !receiver) {
          console.error("❌ Invalid message payload");
          return;
        }

        io.to(roomId).emit("receiveMessage", {
          text: message,
          sender,
        });

        try {
          const saved = await Message.create({
            senderId: sender,
            receiverId: receiver,
            roomId,
            text: message,
          });

          console.log("✅ Message saved:", saved._id);
        } catch (err) {
          console.error("❌ DB error:", err.message);
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

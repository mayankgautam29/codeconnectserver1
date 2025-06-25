const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Message = require("../modules/messageModel.js");

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.DOMAIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DOMAIN || "http://localhost:3000",
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
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    io.on("connection", (socket) => {
      console.log("✅ A user connected:", socket.id);

      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`📡 User ${socket.id} joined room: ${roomId}`);
        console.log("🔍 Rooms:", Array.from(socket.rooms));
      });

      socket.on("sendMessage", async ({ roomId, message, sender, receiver }) => {
        console.log("📨 Incoming message:", { roomId, message, sender, receiver });

        if (!sender || !receiver || !message || !roomId) {
          console.error("❌ Invalid message payload");
          return;
        }

        io.to(roomId).emit("receiveMessage", {
          text: message,
          sender,
        });

        try {
          const savedMessage = await Message.create({
            senderId: sender,
            receiverId: receiver,
            roomId,
            text: message,
          });

          console.log("✅ Message saved:", savedMessage._id);
        } catch (err) {
          console.error("❌ Error saving message:", err.message);
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

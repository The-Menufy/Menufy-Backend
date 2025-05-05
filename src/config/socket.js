const { Server } = require("socket.io");
const mongoose = require("mongoose");

let io;

// ✅ Schéma Message (ajouté ici)
const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connecté");

    // ✅ Écoute des messages envoyés
    socket.on("sendMessage", async ({ sender, receiver, text }) => {
      try {
        const newMessage = new Message({ sender, receiver, text });
        await newMessage.save();
        // ✅ Diffusion du message à tous les clients
        io.emit("receiveMessage", newMessage);
      } catch (err) {
        console.error("Erreur envoi message :", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client déconnecté");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };

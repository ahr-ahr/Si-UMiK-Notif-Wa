const path = require("path");
const { getLastQRCode, getSocket } = require("./app/whatsapp/client");
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { initWhatsApp } = require("./app/whatsapp/client");
const apiRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "app/whatsapp/qr.html"));
});

// Socket.IO connection event
io.on("connection", (socket) => {
  console.log("Client connected");

  const sock = getSocket();

  if (sock?.user) {
    // Sudah terhubung ke WhatsApp
    socket.emit("connected");
  } else {
    const qr = getLastQRCode();
    if (qr) {
      socket.emit("qr", qr);
    } else {
      socket.emit("status", "waiting"); // optional event tambahan
    }
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

if (!globalThis.crypto?.subtle) {
  const { webcrypto } = require("crypto");
  globalThis.crypto = webcrypto;
}

const PORT = process.env.PORT || 3000;

initWhatsApp(io).then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 wa-notif ready at http://0.0.0.0:${PORT}`);
  });
});

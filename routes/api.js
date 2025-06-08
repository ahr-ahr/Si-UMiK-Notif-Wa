const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");
const { getLastQRCode } = require("../app/whatsapp/client");

router.post("/send-message", MessageController.sendText);
router.post("/send-image", MessageController.sendImage);
router.post("/send-image-url", MessageController.sendImageFromUrl);
router.post("/send-file", MessageController.sendFile);
router.get("/qr", (req, res) => {
  const qr = getLastQRCode();
  if (!qr) {
    return res.status(404).json({ message: "No QR code available" });
  }
  res.json({ qr });
});

module.exports = router;

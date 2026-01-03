const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");
const { getLastQRCode, requestPairingCode } = require("../app/whatsapp/client");

router.post("/send-message", MessageController.sendText);
router.post("/send-image", MessageController.sendImage);
router.post("/send-image-url", MessageController.sendImageFromUrl);
router.post("/send-file", MessageController.sendFile);

// ===== QR =====
router.get("/qr", (req, res) => {
  const qr = getLastQRCode();
  if (!qr) {
    return res.status(404).json({ message: "No QR code available" });
  }
  res.json({ qr });
});

// ===== PAIRING CODE =====
router.post("/pairing", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "phone is required (example: 628123456789)",
      });
    }

    const code = await requestPairingCode(phone);

    res.json({
      pairingCode: code,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;

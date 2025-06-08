const {
  sendText,
  sendImage,
  sendImageFromUrl,
  sendFile,
} = require("../app/whatsapp/messageService");
const logger = require("../utils/logger");

// Kirim text
exports.sendText = async (req, res) => {
  const { receiver, message } = req.body;

  if (!receiver || !message) {
    return res.status(400).json({ error: "receiver and message required" });
  }

  try {
    logger.info(`➡️ Sending message to ${receiver}`);
    await sendText(receiver, message);
    logger.info(`✅ Message sent to ${receiver}`);
    res.json({ success: true, to: receiver });
  } catch (err) {
    logger.error(`❌ Failed sending message to ${receiver}: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Kirim gambar dari file lokal
exports.sendImage = async (req, res) => {
  const { receiver, imagePath, caption } = req.body;

  if (!receiver || !imagePath) {
    return res
      .status(400)
      .json({ error: "receiver and imagePath are required" });
  }

  try {
    logger.info(`➡️ Sending image to ${receiver}`);
    await sendImage(receiver, imagePath, caption);
    logger.info(`✅ Image sent to ${receiver}`);
    res.json({ success: true, to: receiver });
  } catch (err) {
    logger.error(`❌ Failed sending image to ${receiver}: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Kirim gambar dari URL
exports.sendImageFromUrl = async (req, res) => {
  const { receiver, imageUrl, caption } = req.body;

  if (!receiver || !imageUrl) {
    return res
      .status(400)
      .json({ error: "receiver and imageUrl are required" });
  }

  try {
    logger.info(`➡️ Sending image from URL to ${receiver}`);
    await sendImageFromUrl(receiver, imageUrl, caption);
    logger.info(`✅ Image sent to ${receiver}`);
    res.json({ success: true, to: receiver });
  } catch (err) {
    logger.error(`❌ Failed sending image to ${receiver}: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.sendFile = async (req, res) => {
  const { receiver, fileSource, filename, mimetype, caption } = req.body;

  if (!receiver || !fileSource) {
    return res
      .status(400)
      .json({ error: "receiver and fileSource are required" });
  }

  try {
    logger.info(`➡️ Sending file to ${receiver}`);
    await sendFile(receiver, fileSource, filename, mimetype, caption);
    logger.info(`✅ File sent to ${receiver}`);
    res.json({ success: true, to: receiver });
  } catch (err) {
    logger.error(`❌ Failed sending file to ${receiver}: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

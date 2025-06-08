const { getSocket } = require("./client");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const mime = require("mime-types");

async function sendText(
  to,
  teks,
  mention = ["6282331422421@s.whatsapp.net"],
  globalimgreply = "https://suumik.com",
  fVerif = null
) {
  const sock = getSocket();
  if (!sock) throw new Error("WhatsApp client not initialized");

  const jid = `${to}@s.whatsapp.net`;

  return sock.sendMessage(
    jid,
    {
      text: teks,
      contextInfo: {
        mentionedJid: mention, // array JID yang di-mention, contoh ['628123456789@s.whatsapp.net']
        externalAdReply: {
          thumbnailUrl: globalimgreply, // URL thumbnail (pastikan global.imgreply sudah terisi URL valid)
          title: "© Si UMiK",
          body: "Si UMiK",
          previewType: "0",
        },
      },
    },
    {
      quoted: fVerif, // pesan yang mau di-quote (bisa null kalau gak mau)
    }
  );
}

async function sendImage(to, imagePath, caption = "") {
  const sock = getSocket();
  if (!sock) throw new Error("WhatsApp client not initialized");

  const jid = `${to}@s.whatsapp.net`;

  const imageBuffer = fs.readFileSync(imagePath);

  return sock.sendMessage(jid, {
    image: imageBuffer,
    caption,
  });
}

async function sendImageFromUrl(to, imageUrl, caption = "") {
  const sock = getSocket();
  if (!sock) throw new Error("WhatsApp client not initialized");

  const jid = `${to}@s.whatsapp.net`;

  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data, "binary");

  return sock.sendMessage(jid, {
    image: imageBuffer,
    caption,
  });
}

async function sendFile(
  to,
  fileSource,
  filename = null,
  mimetype = null,
  caption = ""
) {
  const sock = getSocket();
  if (!sock) throw new Error("WhatsApp client not initialized");

  const jid = `${to}@s.whatsapp.net`;
  let fileBuffer;

  if (/^https?:\/\//.test(fileSource)) {
    // From URL
    const response = await axios.get(fileSource, {
      responseType: "arraybuffer",
    });
    fileBuffer = Buffer.from(response.data, "binary");
    filename = filename || path.basename(new URL(fileSource).pathname);
    mimetype = mimetype || response.headers["content-type"];
  } else {
    // From local file
    fileBuffer = fs.readFileSync(fileSource);
    filename = filename || path.basename(fileSource);
    mimetype = mimetype || mime.lookup(fileSource);
  }

  return sock.sendMessage(jid, {
    document: fileBuffer,
    mimetype: mimetype || "application/octet-stream",
    fileName: filename,
    caption,
  });
}

module.exports = {
  sendText,
  sendImage,
  sendImageFromUrl,
  sendFile,
};

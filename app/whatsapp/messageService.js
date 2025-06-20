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
  fVerif = null,
  ucapanWaktu = "Halo",
  ch = null,
  media = "https://suumik.com",
  source = "https://suumik.com"
) {
  const sock = getSocket();
  if (!sock) throw new Error("WhatsApp client not initialized");

  const jid = `${to}@s.whatsapp.net`;

  return sock.sendMessage(
    jid,
    {
      text: teks,
      footer: ucapanWaktu,
      contextInfo: {
        mentionedJid: mention,
        forwardingScore: 10,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: ch,
          serverMessageId: null,
          newsletterName: "Join For More Info",
        },
        externalAdReply: {
          title: "© Si UMiK",
          body: "Si UMiK",
          thumbnailUrl: globalimgreply,
          mediaType: 1,
          previewType: "0",
          showAdAttribution: true,
          renderLargerThumbnail: true,
          mediaUrl: media,
          sourceUrl: source,
        },
      },
    },
    {
      quoted: fVerif,
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

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
} = require("@whiskeysockets/baileys");
const P = require("pino");

let sock;
let lastQRCode = null;

if (!globalThis.crypto?.subtle) {
  const { webcrypto } = require("crypto");
  globalThis.crypto = webcrypto;
}

async function initWhatsApp(io) {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  sock = makeWASocket({
    auth: state,
    syncFullHistory: true,
    logger: P({ level: "silent" }), // optionally mute Baileys logs
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      lastQRCode = qr;
      console.log("QR code updated:", qr);
      io.emit("qr", qr);
    }

    if (
      connection === "close" &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    ) {
      console.log("Disconnected, reconnecting...");
      await initWhatsApp(io);
    } else if (connection === "open") {
      lastQRCode = null;
      io.emit("connected");
      console.log("WhatsApp connected");
    }
  });

  // Event listener untuk pesan masuk
  sock.ev.on("messages.upsert", async ({ type, messages }) => {
    if (type === "notify") {
      for (const m of messages) {
        if (!m.message || m.key.fromMe) continue;

        const mtype = getContentType(m.message);
        const msg = m.message;
        const from = m.key.remoteJid;

        const body =
          mtype === "conversation"
            ? msg.conversation
            : mtype === "imageMessage"
            ? msg.imageMessage.caption
            : mtype === "videoMessage"
            ? msg.videoMessage.caption
            : mtype === "extendedTextMessage"
            ? msg.extendedTextMessage.text
            : mtype === "buttonsResponseMessage"
            ? msg.buttonsResponseMessage.selectedButtonId
            : mtype === "listResponseMessage"
            ? msg.listResponseMessage.singleSelectReply?.selectedRowId
            : mtype === "templateButtonReplyMessage"
            ? msg.templateButtonReplyMessage.selectedId
            : m.message?.buttonsResponseMessage?.selectedButtonId ||
              m.message?.listResponseMessage?.singleSelectReply
                ?.selectedRowId ||
              m.text ||
              "";

        console.log("📥 Pesan dari", from, ":", body);
      }
    }
  });

  return sock;
}

function getLastQRCode() {
  return lastQRCode;
}

function getSocket() {
  return sock;
}

module.exports = { initWhatsApp, getSocket, getLastQRCode };

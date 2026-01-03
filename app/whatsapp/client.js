const P = require("pino");

// ===== Baileys v7 dynamic import (WAJIB) =====
let makeWASocket;
let useMultiFileAuthState;
let DisconnectReason;
let getContentType;

async function loadBaileys() {
  const baileys = await import("@whiskeysockets/baileys");
  makeWASocket = baileys.default;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  DisconnectReason = baileys.DisconnectReason;
  getContentType = baileys.getContentType;
}

// ===== GLOBAL STATE =====
let sock;
let lastQRCode = null;
let pairingMode = false;

// ===== crypto polyfill (Node < 20) =====
if (!globalThis.crypto?.subtle) {
  const { webcrypto } = require("crypto");
  globalThis.crypto = webcrypto;
}

// ===== INIT WHATSAPP =====
async function initWhatsApp(io) {
  if (!makeWASocket) {
    await loadBaileys();
  }

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  // ===== SAVE AUTH =====
  sock.ev.on("creds.update", async () => {
    await saveCreds();
    console.log("creds.update: auth saved");
  });

  // ===== CONNECTION UPDATE =====
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !pairingMode) {
      lastQRCode = qr;
      io.emit("qr", qr);
      console.log("QR updated");
    }

    if (connection === "open") {
      pairingMode = false;
      lastQRCode = null;
      io.emit("connected");
      console.log("WhatsApp connected");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("WA connection closed:", reason);

      if (reason === DisconnectReason.loggedOut) {
        console.log("Logged out. Delete auth_info and restart.");
      }
    }
  });

  // ===== MESSAGE LISTENER =====
  sock.ev.on("messages.upsert", async ({ type, messages }) => {
    if (type !== "notify") return;

    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;

      const mtype = getContentType(m.message);
      const msg = m.message;
      const from = m.key.remoteJid;

      const body =
        mtype === "conversation"
          ? msg.conversation
          : mtype === "extendedTextMessage"
          ? msg.extendedTextMessage.text
          : mtype === "imageMessage"
          ? msg.imageMessage.caption
          : mtype === "videoMessage"
          ? msg.videoMessage.caption
          : mtype === "buttonsResponseMessage"
          ? msg.buttonsResponseMessage.selectedButtonId
          : mtype === "listResponseMessage"
          ? msg.listResponseMessage.singleSelectReply?.selectedRowId
          : mtype === "templateButtonReplyMessage"
          ? msg.templateButtonReplyMessage.selectedId
          : "";

      console.log("Message from", from, ":", body);
    }
  });

  return sock;
}

async function requestPairingCode(phoneNumber) {
  if (!sock) {
    throw new Error("WhatsApp belum diinisialisasi");
  }

  pairingMode = true;
  lastQRCode = null;

  const cleanNumber = phoneNumber.replace(/\D/g, "");

  const code = await sock.requestPairingCode(cleanNumber);
  console.log("Pairing code generated:", code);

  return code;
}

// ===== HELPERS =====
function getLastQRCode() {
  return lastQRCode;
}

function getSocket() {
  return sock;
}

module.exports = {
  initWhatsApp,
  getSocket,
  getLastQRCode,
  requestPairingCode,
};

const express = require("express");
const { exec } = require("child_process");
const WebSocket = require("ws");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 9000;
const API_URL = process.env.API_URL;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static("public"));

const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const agents = new Map();

wss.on("connection", (socket) => {
  console.log("🔌 WebSocket connection established");

  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log("Received message:", data);

      switch (data.type) {
        case "connect":
          socket.deviceId = data.deviceId;
          console.log("Fetching known devices from API...");
          axios
            .get(`${API_URL}/api/devices/get-all-devices`)
            .then((res) => {
              console.log("Known devices:", res.data);
              const knownDeviceIds = res.data.map((device) => device.deviceId);
              if (knownDeviceIds.includes(data.deviceId)) {
                agents.set(data.deviceId, socket);
                console.log("Agents Map: ", agents.keys());
                console.log(`🖥️ Agent connected: ${data.deviceId}`);
                socket.send(JSON.stringify({ type: "connect-ok" }));
              } else {
                console.log(`🔐 Unknown deviceId: ${data.deviceId}`);
                socket.send(JSON.stringify({ type: "need-pair" }));
              }
            })
            .catch((err) => {
              console.error(
                "❌ Failed to fetch devices from API:",
                err.message
              );
              socket.send(
                JSON.stringify({
                  type: "error",
                  message: "Server error during connect",
                })
              );
            });
          break;

        case "response":
          console.log(`📥 Response from ${data.deviceId}: ${data.output}`);
          break;

        case "command":
          const { deviceId, command } = data;

          if (!deviceId || !command) {
            socket.send(
              JSON.stringify({
                type: "error",
                message: "Missing deviceId or command",
              })
            );
            break;
          }

          const targetSocket = agents.get(deviceId);

          if (!targetSocket || targetSocket.readyState !== WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "error",
                message: `Device ${deviceId} is not connected`,
              })
            );
            break;
          }

          targetSocket.send(
            JSON.stringify({
              type: "command",
              cmd: command,
            })
          );

          console.log(`📤 Forwarded command "${command}" to ${deviceId}`);
          break;

        case "pair":
          console.log("Fetching valid codes from API...");
          axios
            .get(`${API_URL}/api/codes/get-all-codes`)
            .then((res) => {
              console.log("Valid codes:", res.data);

              const validCodeEntry = res.data.find(
                (code) =>
                  code.code === data.code &&
                  code.used === false &&
                  new Date(code.expiresAt) > new Date()
              );

              if (validCodeEntry) {
                agents.set(data.deviceId, socket);
                socket.deviceId = data.deviceId;
                console.log("📌 Device metadata:", data.metadata);
                console.log(`✅ Paired device: ${data.deviceId}`);

                axios
                  .post(`${API_URL}/api/devices/register`, {
                    deviceId: data.deviceId,
                    metadata: data.metadata,
                    code: data.code,
                  })
                  .then((res) => {
                    console.log("Device registered successfully");
                    socket.send(
                      JSON.stringify({ type: "pair-status", success: true })
                    );
                  })
                  .catch((err) => {
                    console.error("Failed to register device:", err.message);
                    socket.send(
                      JSON.stringify({
                        type: "pair-status",
                        success: false,
                        message: "Failed to register device",
                      })
                    );
                  });
              } else {
                console.log(
                  `❌ Invalid, used, or expired pairing code "${data.code}" from device: ${data.deviceId}`
                );
                socket.send(
                  JSON.stringify({
                    type: "pair-status",
                    success: false,
                    message: "Invalid or expired code",
                  })
                );
              }
            })
            .catch((err) => {
              console.error("❌ Failed to fetch codes from API:", err.message);
              socket.send(
                JSON.stringify({
                  type: "error",
                  message: "Server error during pair",
                })
              );
            });
          break;

        default:
          console.warn(`⚠️ Unknown message type: ${data.type}`);
      }
    } catch (err) {
      console.warn("⚠️ Failed to parse message:", err.message);
    }
  });

  socket.on("close", () => {
    if (socket.deviceId) {
      agents.delete(socket.deviceId);
      console.log(`❌ Agent disconnected: ${socket.deviceId}`);

      axios
        .post(`${API_URL}/api/devices/update-device-status`, {
          deviceId: socket.deviceId,
          status: "offline",
          lastSeen: new Date(),
        })
        .then(() => {
          console.log(`🔻 Marked ${socket.deviceId} as offline`);
        })
        .catch((err) => {
          console.error(
            `❌ Failed to mark ${socket.deviceId} offline:`,
            err.message
          );
        });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🖥️ WebSocket running at http://localhost:${PORT}`);
});

// Poll all connected agents every 5 seconds and update their status
setInterval(() => {
  agents.forEach((socket, deviceId) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "status" }));

      axios
        .post(`${API_URL}/api/devices/update-device-status`, {
          deviceId: deviceId,
          status: "online",
          lastSeen: new Date(),
        })
        .then(() => {
          console.log(`✅ Status updated for ${deviceId}`);
        })
        .catch((err) => {
          console.error(
            `❌ Failed to update status for ${deviceId}:`,
            err.message
          );
        });
    }
  });
}, 5000);

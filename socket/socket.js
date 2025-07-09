const express = require("express");
const { exec } = require("child_process");
const WebSocket = require("ws");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 9000;

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

      if (data.type === "register") {
        socket.deviceId = data.deviceId;
        agents.set(data.deviceId, socket);
        console.log(`🖥️ Agent registered: ${data.deviceId}`);
      }

      if (data.type === "response") {
        console.log(`📥 Response from ${data.deviceId}: ${data.output}`);
      }
    } catch (err) {
      console.warn("⚠️ Failed to parse message:", err.message);
    }
  });

  socket.on("close", () => {
    if (socket.deviceId) {
      agents.delete(socket.deviceId);
      console.log(`❌ Agent disconnected: ${socket.deviceId}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🖥️ WebSocket running at http://localhost:${PORT}`);
});

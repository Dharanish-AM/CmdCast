const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const API_URL = process.env.API_URL;

const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const { agents, viewers } = require("../store/store");

function initWebSocketServer(app, port = process.env.PORT || 8000) {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    console.log("🔌 WebSocket connection established");

    socket.on("message", (msg) => {
      try {
        const data = JSON.parse(msg);
        // console.log("💬 Received message:", data);

        switch (data.type) {
          case "connect":
            socket.deviceId = data.deviceId;
            console.log("Fetching known devices from API...");
            axios
              .get("http://localhost:" + port + "/api/devices/get-all-devices")
              .then((res) => {
                const knownDeviceIds = res.data.map((d) => d.deviceId);
                if (knownDeviceIds.includes(data.deviceId)) {
                  agents.set(data.deviceId, socket);
                  console.log(`🖥️ Agent connected: ${data.deviceId}`);
                  socket.send(JSON.stringify({ type: "connect-ok" }));
                } else {
                  socket.send(JSON.stringify({ type: "need-pair" }));
                }
              })
              .catch((err) => {
                console.error("❌ Error fetching devices:", err.message);
                socket.send(
                  JSON.stringify({
                    type: "error",
                    message: "Server error during connect",
                  })
                );
              });
            break;

          case "response":
            if (data.event === "screenshot" && socket.requestor) {
              socket.requestor.send(JSON.stringify(data));
            }
            // console.log("📥 Response data:", JSON.stringify(data, null, 2));
            break;

          case "command":
            const { deviceId, command, userId } = data;
            const target = agents.get(deviceId);
            if (!target || target.readyState !== WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "error",
                  message: `Device ${deviceId} is not connected`,
                })
              );
              break;
            }
            target.send(JSON.stringify({ type: "command", cmd: command }));
            console.log(`📤 Sent command "${command}" to ${deviceId}`);
            break;

          case "screenshare":
            const { deviceId: targetDeviceId, userId: targetUserId } = data;
            const targetSocket = agents.get(targetDeviceId);

            if (!targetSocket || targetSocket.readyState !== WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "error",
                  message: `Device ${targetDeviceId} is not connected`,
                })
              );
              break;
            }

            // Save reference to requestor to route the screenshot response
            targetSocket.requestor = socket;

            // Ask agent to send a screenshot
            targetSocket.send(
              JSON.stringify({
                type: "screenshare",
              })
            );
            break;

          case "pair":
            console.log("🔍 Validating pairing code...");
            axios
              .get(`http://localhost:${port}/api/codes/get-all-codes`)
              .then((res) => {
                const codeEntry = res.data.find(
                  (c) =>
                    c.code === data.code &&
                    !c.used &&
                    new Date(c.expiresAt) > new Date()
                );
                if (codeEntry) {
                  agents.set(data.deviceId, socket);
                  socket.deviceId = data.deviceId;
                  console.log(
                    `✅ Code valid. Registering device: ${data.deviceId}...`
                  );
                  axios
                    .post(`${API_URL}/api/devices/register`, {
                      deviceId: data.deviceId,
                      metadata: data.metadata,
                      code: data.code,
                    })
                    .then((res) => {
                      const { userId, deviceId } = res.data;
                      console.log(
                        `📦 Device registered. User: ${userId}, Device: ${deviceId}`
                      );
                      socket.send(
                        JSON.stringify({
                          type: "pair-status",
                          success: true,
                          paired: true,
                          userId,
                          deviceId,
                        })
                      );
                    })
                    .catch((err) => {
                      console.error(
                        "❌ Device registration failed:",
                        err.message
                      );
                      socket.send(
                        JSON.stringify({
                          type: "pair-status",
                          success: false,
                          message: "Failed to register device",
                        })
                      );
                    });
                } else {
                  console.warn("❌ Invalid or expired pairing code.");
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
                console.error("❌ Error fetching codes:", err.message);
                socket.send(
                  JSON.stringify({
                    type: "error",
                    message: "Server error during pair",
                  })
                );
              });
            break;

          case "viewer":
            if (!viewers.has(data.deviceId)) viewers.set(data.deviceId, []);
            viewers.get(data.deviceId).push(socket);

            const viewerTarget = agents.get(data.deviceId);
            if (!viewerTarget || viewerTarget.readyState !== WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "error",
                  message: `Device ${data.deviceId} is not connected`,
                })
              );
              break;
            }

            console.log(`📺 Viewer connected for ${data.deviceId}`);

            // Ask agent to start MJPEG streaming
            viewerTarget.send(JSON.stringify({ type: "viewer" }));
            break;

          case "viewer-frame":
            console.log(
              `🖼️ Received viewer-frame for device: ${socket.deviceId}`
            );
            const viewerSockets = viewers.get(socket.deviceId) || [];
            viewerSockets.forEach((viewerSocket) => {
              if (viewerSocket.readyState === WebSocket.OPEN) {
                viewerSocket.send(JSON.stringify(data));
              }
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
      viewers.forEach((sockets, deviceId) => {
        viewers.set(
          deviceId,
          sockets.filter((s) => s !== socket)
        );
      });
    });
  });

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
          .catch((err) => {
            console.error(
              `❌ Failed to update status for ${deviceId}:`,
              err.message
            );
          });
      }
    });
  }, 5000);

  server.listen(port, () => {
    console.log(`🖥️ Server running at http://localhost:${port}`);
  });
}

module.exports = { initWebSocketServer };

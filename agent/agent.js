const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const DEVICE_ID = `${os.hostname()}-${os.arch()}-${os.platform()}`;
const SERVER_URL = "ws://localhost:9000";
const commands = require("./commands.js");

function connectToServer() {
  const socket = new WebSocket(SERVER_URL);

  socket.on("open", () => {
    console.log("✅ Connected to server");
    socket.send(JSON.stringify({ type: "register", deviceId: DEVICE_ID }));
    console.log(`🖥️ Registered this device: ${DEVICE_ID}`);
  });

  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      switch (data.type) {
        case "command":
          const cmd = data.cmd;
          if (!commands[cmd]) {
            console.warn(`⚠️ Unknown command: ${cmd}`);
            return;
          }

          console.log(`🚀 Executing: ${cmd}`);
          exec(commands[cmd], (err, stdout, stderr) => {
            const output = err ? err.message : stdout || stderr || "Done";
            socket.send(
              JSON.stringify({
                type: "response",
                event: "command",
                deviceId: DEVICE_ID,
                cmd,
                output: output.trim(),
                success: !err,
              })
            );
          });
          break;

        case "status":
          socket.send(
            JSON.stringify({
              type: "response",
              event: "status",
              deviceId: DEVICE_ID,
              status: "online",
            })
          );
          break;

        case "details":
          socket.send(
            JSON.stringify({
              type: "response",
              event: "details",
              deviceId: DEVICE_ID,
              hostname: os.hostname(),
              platform: os.platform(),
              arch: os.arch(),
              uptime: os.uptime(),
            })
          );
          break;

        default:
          console.warn(`⚠️ Unknown message type: ${data.type}`);
      }
    } catch (err) {
      console.error("❌ Invalid message received:", err.message);
    }
  });

  socket.on("error", (err) => {
    console.error("🔌 WebSocket error:", err.message);
  });

  socket.on("close", () => {
    console.log("❌ Disconnected from server. Reconnecting in 1s...");
    setTimeout(connectToServer, 1000);
  });
}

connectToServer();

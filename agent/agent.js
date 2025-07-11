const fs = require("fs");
const path = require("path");
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const readline = require("readline");
const DEVICE_ID = `${os.hostname()}-${os.arch()}-${os.platform()}`;
const SERVER_URL = "ws://localhost:8000";
const screenshot = require("screenshot-desktop");
const commands = require("./commands.js");

function connectToServer(code) {
  const socket = new WebSocket(SERVER_URL);

  socket.on("open", () => {
    console.log(`🖥️ Sent connect request: ${DEVICE_ID}`);
    socket.send(
      JSON.stringify({
        type: "connect",
        deviceId: DEVICE_ID,
      })
    );
    console.log("✅ Connected to server");
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

        case "screenshare":
          console.log("Agent: Cleaning old screenshots...");
          fs.readdir(tmpDir, (err, files) => {
            if (!err) {
              files
                .filter(
                  (file) => file.startsWith("screen-") && file.endsWith(".jpg")
                )
                .forEach((file) => {
                  fs.unlink(path.join(tmpDir, file), () => {});
                });
            }

            console.log("Agent: Starting screen capture");
            const screenshotPath = path.join(
              tmpDir,
              `screen-${Date.now()}.jpg`
            );
            exec(`screencapture -x -t jpg "${screenshotPath}"`, (err) => {
              if (err) {
                socket.send(
                  JSON.stringify({
                    type: "response",
                    event: "screenshot",
                    deviceId: DEVICE_ID,
                    success: false,
                    error: err.message,
                  })
                );
                return;
              }

              console.log(`Agent: Screenshot saved to ${screenshotPath}`);

              fs.readFile(
                screenshotPath,
                { encoding: "base64" },
                (err, data) => {
                  if (err) {
                    socket.send(
                      JSON.stringify({
                        type: "response",
                        event: "screenshot",
                        deviceId: DEVICE_ID,
                        success: false,
                        error: err.message,
                      })
                    );
                    return;
                  }

                  socket.send(
                    JSON.stringify({
                      type: "response",
                      event: "screenshot",
                      deviceId: DEVICE_ID,
                      success: true,
                      image: `data:image/jpeg;base64,${data}`,
                    })
                  );

                  console.log(`Agent: Screenshot sent to server`);

                  fs.unlink(screenshotPath, () => {});
                }
              );
            });
          });
          break;

        case "status":
          socket.send(
            JSON.stringify({
              type: "response",
              event: "status",
              deviceId: DEVICE_ID,
              status: "online",
              lastSeen: new Date(),
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

        case "viewer":
          console.log("🖼️ Viewer connected, starting periodic screenshots...");

          let viewerIntervalSet = false;

          let viewerInterval = setInterval(() => {
            const screenshotPath = path.join(
              tmpDir,
              `screen-${Date.now()}.jpg`
            );
            exec(`screencapture -x -t jpg "${screenshotPath}"`, (err) => {
              if (err) return;

              fs.readFile(
                screenshotPath,
                { encoding: "base64" },
                (err, data) => {
                  if (err || socket.readyState !== WebSocket.OPEN) return;
                  socket.send(
                    JSON.stringify({
                      type: "viewer-frame",
                      deviceId: DEVICE_ID,
                      image: `data:image/jpeg;base64,${data}`,
                    })
                  );
                  fs.unlink(screenshotPath, () => {});
                }
              );
            });
          }, 1000);

          if (!socket._viewerCloseHandlerSet) {
            socket._viewerCloseHandlerSet = true;
            socket.on("close", () => {
              console.log("📴 Viewer disconnected, stopping screenshots.");
              clearInterval(viewerInterval);
            });
          }
          break;

        case "connect-ok":
          console.log("✅ Device registered and connected successfully.");
          break;

        case "pair-status":
          if (data.success) {
            console.log("✅ Pairing successful!");
            setTimeout(() => connectToServer(), 1000);
          } else {
            console.log("❌ Pairing failed:", data.message || "Invalid code");

            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            });

            rl.question(
              "🔁 Re-enter 6-digit code from web UI: ",
              function (inputCode) {
                const pairingCode = inputCode.trim().toUpperCase();
                rl.close();

                socket.send(
                  JSON.stringify({
                    type: "pair",
                    deviceId: DEVICE_ID,
                    code: pairingCode,
                    metadata: {
                      hostname: os.hostname(),
                      platform: os.platform(),
                      arch: os.arch(),
                    },
                  })
                );

                console.log(`🔗 Retrying with pairing code: ${pairingCode}`);
              }
            );
          }
          break;

        case "need-pair":
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          rl.question(
            "🔑 Enter 6-digit code from web UI: ",
            function (inputCode) {
              const pairingCode = inputCode.trim().toUpperCase();
              rl.close();

              socket.send(
                JSON.stringify({
                  type: "pair",
                  deviceId: DEVICE_ID,
                  code: pairingCode,
                  metadata: {
                    hostname: os.hostname(),
                    platform: os.platform(),
                    arch: os.arch(),
                  },
                })
              );

              console.log(`🔗 Sent pairing code: ${pairingCode}`);
            }
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
    setTimeout(() => connectToServer(code), 1000);
  });
}

connectToServer();

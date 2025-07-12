const fs = require("fs");
const path = require("path");
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
const WebSocket = require("ws");
const { exec } = require("child_process");
const os = require("os");
const DEVICE_ID = `${os.hostname()}-${os.arch()}-${os.platform()}`;
const SERVER_URL = "ws://localhost:8000";
const commands = require("./commands.js");

function connectToServer(code) {
  const socket = new WebSocket(SERVER_URL);
  // Check for existing pairing with validation of pair.json contents
  const pairPath = path.join(__dirname, "electron", "pair.json");
  let isAlreadyPaired = false;

  if (fs.existsSync(pairPath)) {
    try {
      const pairData = JSON.parse(fs.readFileSync(pairPath));
      isAlreadyPaired = pairData.paired === true;
    } catch {
      isAlreadyPaired = false;
    }
  }

  console.log(`🔍 Checking for existing pairing: ${isAlreadyPaired}`);

  socket.on("open", () => {
    console.log(`🖥️ Sent connect request: ${DEVICE_ID}`);
    socket.send(
      JSON.stringify({
        type: "connect",
        deviceId: DEVICE_ID,
      })
    );
    console.log("✅ Connected to server");

    if (!isAlreadyPaired) {
      // Periodically check for pair-code.json and send the code if found
      const pairCodePath = path.join(__dirname, "electron", "pair-code.json");
      console.log(`🔍 Checking for pair-code.json at: ${pairCodePath}`);
      let alreadySentCode = false;
      pairCheckInterval = setInterval(() => {
        console.log("⏱️ Periodic check: looking for pair-code.json...");
        if (!alreadySentCode && fs.existsSync(pairCodePath)) {
          try {
            const { code } = JSON.parse(fs.readFileSync(pairCodePath));
            if (code) {
              alreadySentCode = true;
              console.log(`🔗 Loaded code from file: ${code}`);

              socket.send(
                JSON.stringify({
                  type: "pair",
                  deviceId: DEVICE_ID,
                  code: code.trim().toUpperCase(),
                  metadata: {
                    hostname: os.hostname(),
                    platform: os.platform(),
                    arch: os.arch(),
                    type:
                      os.platform() === "darwin"
                        ? "mac"
                        : os.platform() === "win32"
                        ? "windows"
                        : os.platform() === "linux"
                        ? "linux"
                        : "unknown",
                  },
                })
              );
              console.log("📤 Sent pairing code to server");
            }
          } catch (err) {
            console.error(
              "❌ Failed to read or parse pair-code.json:",
              err.message
            );
          }
        }
      }, 1000);
    }
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

            const pairData = {
              paired: true,
              deviceId: data.deviceId || null,
              userId: data.userId || null,
            };

            console.log("🔑 Pairing info:", pairData);

            const pairPath = path.join(__dirname, "electron", "pair.json");
            fs.writeFile(pairPath, JSON.stringify(pairData, null, 2), (err) => {
              if (err) {
                console.error("❌ Failed to write pair.json:", err.message);
              } else {
                console.log("📦 Saved pairing info to pair.json");
                // Delete pair-code.json after successful pairing
                const pairCodePath = path.join(
                  __dirname,
                  "electron",
                  "pair-code.json"
                );
                if (fs.existsSync(pairCodePath)) {
                  fs.unlink(pairCodePath, (err) => {
                    if (err) {
                      console.error(
                        "❌ Failed to delete pair-code.json:",
                        err.message
                      );
                    } else {
                      console.log(
                        "🧹 Deleted pair-code.json after successful pairing"
                      );
                    }
                  });
                }
              }
            });

            setTimeout(() => connectToServer(), 1000);
          } else {
            console.log("❌ Pairing failed:", data.message || "Invalid code");
          }
          break;

        case "need-pair":
          console.log("🔑 Waiting for pairing code from UI...");
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

const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 8000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.static("public"));
const fs = require("fs");

const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

app.post("/command", (req, res) => {
  const { cmd } = req.body;
  const token = req.headers.authorization;
  const DEFAULT_PASSWORD = "amd123";

  console.log("📥 Incoming /command request");
  console.log("🔐 Auth Token:", token);
  console.log("📦 Requested Command Key:", cmd);

  if (token !== DEFAULT_PASSWORD) {
    console.warn("❌ Unauthorized access attempt.");
    return res.status(403).send("Unauthorized");
  }

  const commands = {
    volume_unmute: `osascript -e 'set volume without output muted' -e 'set volume output volume 100'`,
    volume_mute: `osascript -e 'set volume with output muted'`,
    lock: `osascript -e 'tell application "System Events" to keystroke "q" using {control down, command down}'`,
    sleep: `pmset sleepnow`,
    shutdown: `osascript -e 'tell app "System Events" to shut down'`,
    restart: `osascript -e 'tell app "System Events" to restart'`,
    open_safari: `open -a Safari`,
    open_terminal: `open -a Terminal`,
    clipboard_hello: `echo 'Hello from iPhone!' | pbcopy`,
    brightness_down: `/opt/homebrew/bin/brightness 0.3`,
    brightness_up: `/opt/homebrew/bin/brightness 1.0`,
    notify: `osascript -e 'display notification "Hello from iPhone" with title "Remote Control"'`,
    mute: `osascript -e 'set volume with output muted'`,
    unmute: `osascript -e 'set volume without output muted'`,
    toggle_dnd: `osascript -e 'tell application "System Events" to key code 97'`,
    open_finder: `open -a Finder`,
    show_mission: `osascript -e 'tell application "Mission Control" to launch'`,
    get_ip: `ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' > /tmp/ip.txt && cat /tmp/ip.txt`,
    battery_status: `pmset -g batt | grep -Eo "\\d+%"`,
    disk_usage: `df -h / | tail -1 | awk '{print $5}'`,
    screenshot: `screencapture -x -t jpg "$HOME/Pictures/Screenshot/screen.jpg" && echo "Screenshot saved to $HOME/Pictures/Screenshot/screen.jpg"`,
  };

  const shellCommand = commands[cmd];
  if (!shellCommand) {
    console.warn(`⚠️ Invalid command received: ${cmd}`);
    return res.status(400).send("Invalid command");
  }

  console.log(`🚀 Executing command for key: ${cmd}`);
  console.log(`📜 Shell command: ${shellCommand}`);

  exec(shellCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Command execution error: ${error.message}`);
      return res.status(500).send("Execution failed");
    }
    const output = stdout.trim();
    console.log(
      `✅ Command executed successfully. Output:\n${output || "(no output)"}`
    );
    res.status(200).send(output || "Command executed");
  });
});

app.get("/screenshot", (req, res) => {
  const filePath = path.join(tmpDir, "screen.jpg");
  const captureCmd = `screencapture -x "${filePath}"`;

  exec(captureCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Screenshot error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Screenshot failed");
    }

    const waitForFile = setInterval(() => {
      if (fs.existsSync(filePath)) {
        clearInterval(waitForFile);
        res.sendFile(filePath);
      }
    }, 50);
  });
});



app.listen(PORT, () => {
  console.log(`🖥️ Server running at http://localhost:${PORT}`);
});

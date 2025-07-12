const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("fs");
const { fork } = require("child_process");

let agentProcess;
const pairFilePath = path.join(__dirname, "pair.json");

function isPaired() {
  console.log("📄 Reading pair.json from:", pairFilePath);
  try {
    const data = JSON.parse(fs.readFileSync(pairFilePath, "utf-8"));
    console.log("🔑 Pairing info:", data);
    return (
      data.paired === true 
    );
  } catch {
    return false;
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  if (isPaired()) {
    console.log("📘 Loading paired.html");
    mainWindow.loadFile("paired.html");
  } else {
    console.log("📗 Loading index.html for pairing");
    mainWindow.loadFile("index.html");
  }
}

module.exports = { mainWindow };

app.whenReady().then(() => {
  console.log("📦 Checking pairing status...");

  const pairCodePath = path.join(__dirname, "pair-code.json");
  const shouldStartAgent = isPaired() || fs.existsSync(pairCodePath);

  if (shouldStartAgent) {
    console.log("✅ Device is paired or pairing code is available. Starting agent...");
    agentProcess = fork(require.resolve("nodemon/bin/nodemon.js"), {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      args: [path.join(__dirname, "../agent.js")],
    });
    agentProcess.stdout.on("data", (data) => {
      console.log(`[agent.js] ${data.toString().trim()}`);
    });
    agentProcess.stderr.on("data", (data) => {
      console.error(`[agent.js ERROR] ${data.toString().trim()}`);
    });
    console.log("🚀 agent.js launched with nodemon");
  }

  createWindow();

  if (fs.existsSync(pairFilePath)) {
    fs.watchFile(pairFilePath, { interval: 1000 }, () => {
      try {
        const updatedData = JSON.parse(fs.readFileSync(pairFilePath, "utf-8"));
        if (updatedData.paired && mainWindow) {
          const currentURL = mainWindow.webContents.getURL();
          const isOnIndex = currentURL.endsWith("index.html");
          if (isOnIndex) {
            console.log("🔄 Paired status detected. Reloading to paired.html...");
            mainWindow.loadFile("paired.html");
            fs.unwatchFile(pairFilePath); 
          }
        }
      } catch (err) {
        console.error("❌ Failed to watch pair.json:", err.message);
      }
    });
  }

  app.on("activate", () => {
    console.log("🔄 App activated");
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  console.log("❌ All windows closed. Quitting app...");
  if (process.platform !== "darwin") {
    app.quit();
  }
});



const WebSocket = require('ws');
const { exec } = require('child_process');

const DEVICE_ID = 'macbook-001'; // Unique device ID
const SERVER_URL = 'wss://your-server.com/agent'; // Replace with your actual WebSocket server URL

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
  get_ip: `ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'`,
  battery_status: `pmset -g batt | grep -Eo "\\d+%"`,
  disk_usage: `df -h / | tail -1 | awk '{print $5}'`,
  screenshot: `screencapture -x -t jpg "$HOME/Pictures/Screenshot/screen.jpg" && echo "Screenshot saved to $HOME/Pictures/Screenshot/screen.jpg"`,
};

const socket = new WebSocket(SERVER_URL);

socket.on('open', () => {
  console.log('✅ Connected to server');
  socket.send(JSON.stringify({ type: 'register', deviceId: DEVICE_ID }));
});

socket.on('message', (msg) => {
  try {
    const { cmd } = JSON.parse(msg);
    const shellCommand = commands[cmd];

    if (!shellCommand) {
      console.warn(`⚠️ Invalid command received: ${cmd}`);
      return;
    }

    console.log(`🚀 Executing command: ${cmd}`);
    exec(shellCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error executing ${cmd}: ${error.message}`);
        socket.send(JSON.stringify({ type: 'response', cmd, error: error.message }));
        return;
      }
      const output = (stdout || stderr).trim();
      console.log(`✅ Output: ${output || '(no output)'}`);
      socket.send(JSON.stringify({ type: 'response', cmd, output }));
    });
  } catch (err) {
    console.error(`❌ Failed to parse message: ${err.message}`);
  }
});

socket.on('close', () => {
  console.log('🔌 Connection closed. Attempting to reconnect in 5s...');
  setTimeout(() => process.exit(1), 5000); // restart via external process manager
});

socket.on('error', (err) => {
  console.error(`❌ WebSocket error: ${err.message}`);
});
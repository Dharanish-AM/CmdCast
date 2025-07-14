const commands = require('./agent/commands'); // Adjust path if needed
const { exec } = require('child_process');

// List of commands you want to test
const testKeys = [
  'volume_unmute',
  'lock',
  'sleep',
  'shutdown',
  'restart',
  'open_safari',
  'open_terminal',
  'clipboard',
  'notify',
  'open_finder',
  'get_ip',
  'battery_status',
  'disk_usage',
  'screenshot'
];

function testCommand(key) {
  const cmd = commands[key];
  if (!cmd) {
    console.log(`❌ Command not found for key: ${key}`);
    return;
  }

  console.log(`\n🧪 Testing "${key}" => ${cmd}\n`);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error executing ${key}:`, err.message);
    } else {
      console.log(`✅ Output for ${key}:\n`, stdout || stderr || '✔️ No output');
    }
  });
}

testCommand("")
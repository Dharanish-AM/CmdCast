const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  lastSeen: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  metadata: {
    hostname: String,
    platform: String,
    arch: String,
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
});

module.exports = mongoose.model("Device", deviceSchema);

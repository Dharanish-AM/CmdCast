const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { agents } = require("../store/store");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !password) {
    return res
      .status(400)
      .json({ message: "Name and password are required." });
  }

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Rmail and password are required." });
  }

  try {
    const user = await User.findOne({ email }).populate("devices");
    if (!user) {
      return res.status(401).json({ message: "Invalid Email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: _, ...safeUser } = user.toObject();

    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  const { token } = req.query || {};
  if (!token) {
    return res.status(401).json({ message: "Token is required." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate("devices");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const { password: _, ...safeUser } = user.toObject();
    return res.status(200).json({ user: safeUser });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendCommand = async (req, res) => {
  const { userId, deviceId_id, command } = req.body;
  console.log("Received command:", req.body);

  if (!userId || !command || !deviceId_id) {
    return res
      .status(400)
      .json({ message: "User ID, device ID, and command are required." });
  }

  try {
    const user = await User.findById(userId).populate("devices");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const userDevices = user.devices;
    if (!userDevices || userDevices.length === 0) {
      return res.status(404).json({ message: "No devices found." });
    }

    const targetDevice = userDevices.find(
      (device) => device._id.toString() === deviceId_id
    );

    console.log("Target Device:", targetDevice);

    if (!targetDevice) {
      return res.status(404).json({ message: "Device not found." });
    }
    if (!targetDevice) {
      return res.status(404).json({ message: "Device not found." });
    }

    const deviceId = targetDevice.deviceId;
    console.log("Device ID:", deviceId);
    if (!targetDevice) {
      return res.status(404).json({ message: "Device not found." });
    }
    if (targetDevice.status !== "online") {
      return res.status(400).json({ message: "Device is offline." });
    }

    console.log("Sending Command", command, "to", deviceId);
    const agentSocket = agents.get(deviceId);
    if (!agentSocket || agentSocket.readyState !== 1) {
      return res.status(400).json({ message: "Agent is not connected." });
    }

    agentSocket.send(
      JSON.stringify({ type: "command", cmd: command, userId, deviceId })
    );

    agentSocket.once("message", (msg) => {
      try {
        const data = JSON.parse(msg);
        if (
          data.type === "response" &&
          data.event === "command" &&
          data.deviceId === deviceId
        ) {
          return res.status(200).json({
            message: "Command executed",
            output: data.output,
            success: data.success,
            cmd: data.cmd,
          });
        } else {
          return res.status(500).json({ message: "Unexpected response from agent." });
        }
      } catch (parseErr) {
        console.error("Error parsing agent response:", parseErr);
        return res.status(500).json({ message: "Failed to parse agent response." });
      }
    });
  } catch (err) {
    console.error("Send command error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, getUser, sendCommand };

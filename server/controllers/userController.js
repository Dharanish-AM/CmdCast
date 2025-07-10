const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Rmail and password are required." });
  }

  try {
    const user = await User.findOne({ email });
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

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendCommand = async (req, res) => {
  const { userId, deviceId, command } = req.body;
  console.log("Received command:", req.body);

  if (!userId || !command || !deviceId) {
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
    const device = userDevices.find(
      (device) => String(device.deviceId) === String(deviceId)
    );
    if (!device) {
      return res.status(404).json({ message: "Device not found." });
    }
    if (device.status !== "online") {
      return res.status(400).json({ message: "Device is offline." });
    }

    const agentSocket = global.agents?.get(deviceId);

    if (!agentSocket || agentSocket.readyState !== 1) {
      return res.status(404).json({ message: "Agent not connected." });
    }

    console.log("Sending Command ",command," to ", deviceId)    
    agentSocket.send(
      JSON.stringify({ type: "command", command, userId, deviceId })
    );

    return res.status(200).json({ message: "Command sent successfully." });
  } catch (err) {
    console.error("Send command error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, getUser, sendCommand };

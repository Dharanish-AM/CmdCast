const Device = require("../models/deviceSchema");
const User = require("../models/userSchema");
const Code = require("../models/codeSchema");

const registerDevice = async (req, res) => {
  const { deviceId, code, metadata } = req.body;
  console.log("Received device registration request:", req.body);
  const codeDetails = await Code.findOne({ code });
  console.log("Code details:", codeDetails);

  if (!codeDetails) {
    return res.status(400).json({ message: "Invalid code" });
  }

  const userId = codeDetails.user;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!deviceId || !userId) {
    return res
      .status(400)
      .json({ message: "deviceId and userId are required." });
  }

  try {
    let device = await Device.findOne({ deviceId });

    if (device) {
      device.lastSeen = new Date();
      device.metadata = metadata || device.metadata;
      device.type = metadata.type 
      await device.save();
    } else {
      device = new Device({
        deviceId,
        user: userId,
        metadata,
      });
      await device.save();

      await User.findByIdAndUpdate(userId, {
        $addToSet: { devices: device._id },
      });
    }

    return res.status(200).json({
      message: "Device registered successfully",
      userId: user._id,
      deviceId: device._id,
    });
  } catch (error) {
    console.error("Device registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getDeviceStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res
        .status(400)
        .json({ message: "deviceId is required in params" });
    }

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({
      message: "Device status fetched successfully",
      device: {
        deviceId: device.deviceId,
        lastSeen: device.lastSeen,
        metadata: device.metadata,
        status: device.status || "unknown",
      },
    });
  } catch (error) {
    console.error("Error fetching device status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    return res.status(200).json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateDeviceStatus = async (req, res) => {
  try {
    const { deviceId, status, lastSeen } = req.body;

    if (!deviceId || !status) {
      return res
        .status(400)
        .json({ message: "deviceId and status are required" });
    }

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    device.status = status;
    if (lastSeen) {
      device.lastSeen = new Date(lastSeen);
    }
    await device.save();

    return res
      .status(200)
      .json({ message: "Device status updated successfully", device });
  } catch (error) {
    console.error("Error updating device status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getDeviceDetails = async (req, res) => {
  try {
    const { userId, deviceId } = req.query;
    console.log("Received request to get device details:", req.query);

    if (!userId || !deviceId) {
      return res
        .status(400)
        .json({ message: "userId and deviceId are required" });
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Device details fetched successfully",
      username: user.name,
      email: user.email,
      deviceName: device.deviceName || "",
      deviceId: device.deviceId,
      hostname: device.metadata?.hostname || "",
      platform: device.metadata?.platform || "",
      arc: device.metadata?.arch || "",
      status: device.status || "offline",
      type: device.type || "",
      lastSeen: device.lastSeen,
    });
  } catch (error) {
    console.error("Error fetching device details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerDevice,
  getDeviceStatus,
  getDevices,
  updateDeviceStatus,
  getDeviceDetails,
};

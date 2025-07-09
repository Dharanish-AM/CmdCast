const Device = require("../models/deviceSchema");
const User = require("../models/userSchema");
const Code = require("../models/codeSchema");

const registerDevice = async (req, res) => {
  const { code, metadata } = req.body;
  const deviceId = `${metadata.hostname}-${metadata.arch}-${metadata.platform}`;
  const codeDetails = Token.findOne({ code }).populate("user");

  if (!codeDetails) {
    return res.status(400).json({ message: "Invalid code" });
  }

  const userId = codeDetails.user._id;
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

    return res
      .status(200)
      .json({ message: "Device registered successfully", device });
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

module.exports = {
  registerDevice,
  getDeviceStatus,
};

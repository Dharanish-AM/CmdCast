const Code = require("../models/codeSchema");
const User = require("../models/userSchema");

const generateCode = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;

    while (true) {
      code = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");

      const existing = await Code.findOne({ code });
      if (!existing) break;
    }

    const newCode = await Code.create({
      code,
      user: userId,
      expiresAt: new Date(Date.now() + 1 * 60 * 1000),
    });

    return res.status(201).json({ code: newCode.code });
  } catch (err) {
    console.error("Error generating code:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Code is required" });
  }

  try {
    const token = await Code.findOne({ code, used: false });

    if (!token) {
      return res.status(404).json({ message: "Invalid or expired code" });
    }

    if (token.expiresAt < new Date()) {
      return res.status(410).json({ message: "Code has expired" });
    }

    token.used = true;
    await token.save();

    const user = await User.findById(token.user).select("-password");

    return res.status(200).json({ message: "Code verified", user });
  } catch (err) {
    console.error("Error verifying code:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllCodes = async (req, res) => {
  try {
    const codes = await Code.find();
    return res.status(200).json(codes);
  } catch (err) {
    console.error("Error fetching codes:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  generateCode,
  verifyCode,
  getAllCodes,
};

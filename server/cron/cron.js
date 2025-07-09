const cron = require("node-cron");
const Code = require("../models/codeSchema");

cron.schedule("* * * * *", () => {
  console.log("Running a task every minute");

  Code.deleteMany({ expiresAt: { $lt: new Date() } })
    .exec()
    .then(() => {
      console.log("✅ Expired codes cleared");
    })
    .catch((err) => {
      console.error("❌ Error clearing expired codes:", err);
    });
});

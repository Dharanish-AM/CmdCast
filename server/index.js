const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const codeRoutes = require("./routes/codeRoutes");

app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/codes", codeRoutes);

app.listen(PORT, () => {
  console.log(`🖥️ Server running at http://localhost:${PORT}`);
});

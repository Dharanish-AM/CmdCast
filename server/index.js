const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8000;

const connectToDB = require("./utils/db");
const {initWebSocketServer} = require("./socket/socket");

const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const codeRoutes = require("./routes/codeRoutes");

connectToDB();
initWebSocketServer(app, PORT)

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/codes", codeRoutes);

module.exports = app;

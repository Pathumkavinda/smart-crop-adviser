// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// ---- CORS (tighten in prod via env) ----
const ALLOWED = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || ALLOWED.includes(origin)),
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const { sequelize } = require("./models");

// ---- Routes (existing + new) ----
app.use("/api/v1/users", require("./routes/users"));             // existing
app.use("/api/v1/predictions", require("./routes/predictions")); // existing
app.use("/api/v1/files", require("./routes/files"));             // existing (message attachments)
app.use("/api/v1/messages", require("./routes/messages"));       // existing
app.use("/api/v1/user-files", require("./routes/userFiles"));    // 🔹 NEW (farmer/adviser uploads)
app.use('/api/v1/appointments', require('./routes/appointments'));
app.use('/api/v1/fertilizers', require('./routes/fertilizers'));
app.use('/api/v1/cultivations', require('./routes/cultivations'));

// Optional: quick health check
app.get("/api/v1/health", (_req, res) => res.json({ ok: true }));

// Create HTTP server and bind Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ALLOWED, credentials: true },
});

// Socket handlers
io.on("connection", (socket) => {
  // Join personal room (for 1-1 DM receipts) or arbitrary rooms
  socket.on("join", ({ userId, room }) => {
    if (userId) socket.join(`user:${userId}`);
    if (room) socket.join(`room:${room}`);
  });

  // Real-time message send relay (optional if you also POST via REST)
  socket.on("message:send", async (payload) => {
    // payload: { id, room, sender_id, receiver_id, text, files, created_at }
    const targets = [];
    if (payload.room) targets.push(`room:${payload.room}`);
    if (payload.receiver_id) targets.push(`user:${payload.receiver_id}`);
    if (payload.sender_id) targets.push(`user:${payload.sender_id}`);

    targets.forEach((t) => io.to(t).emit("message:new", payload));
  });

  socket.on("typing", ({ room, from }) => {
    if (room) socket.to(`room:${room}`).emit("typing", { from });
  });
});

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected ✔");

    // In production prefer migrations; leave alter:false
    await sequelize.sync({ alter: false });

    server.listen(PORT, () =>
      console.log(`HTTP+WS on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Unable to start:", err);
    process.exit(1);
  }
})();

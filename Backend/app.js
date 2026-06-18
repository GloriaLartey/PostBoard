const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// ── Logging ───────────────────────────────────────────────────────────────────
const morganFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(morganFormat));

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.VITE_CLIENT_URL,
  "http://localhost:5173",
  "https://post-board-frontend.vercel.app",
].filter(Boolean);

// Handle preflight for all routes
app.options("*", cors());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, origin);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check Endpoint ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PostBoard API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);

// ── 404 & Error Handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header (such as curl, Invoke-RestMethod, or server-to-server health checks)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsError = new Error(`Origin ${origin} is not allowed by CORS`);
      corsError.statusCode = 403;
      return callback(corsError);
    },
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "mern-posts-crud-app-backend",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/posts", postRoutes);

app.use((req, res, next) => {
  const notFoundError = new Error(`Route ${req.method} ${req.originalUrl} does not exist`);
  notFoundError.statusCode = 404;
  next(notFoundError);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
});

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle malformed JSON request bodies from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Invalid JSON payload in request body",
    });
  }

  const statusCode = Number(err.statusCode || err.status) || 500;
  const responsePayload = {
    error: statusCode >= 500 ? "Internal Server Error" : "Request Error",
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "An unexpected server error occurred"
        : err.message || "An unexpected error occurred",
  };

  if (err.details) {
    responsePayload.details = err.details;
  }

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json(responsePayload);
}

module.exports = errorHandler;

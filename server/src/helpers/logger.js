const { createLogger, transports, format } = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = path.resolve(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.json()
);

const infoTransport = new transports.File({
  filename: path.join(logDir, "info.log"),
  level: "info",
  format: baseFormat,
});

const warnTransport = new transports.File({
  filename: path.join(logDir, "warn.log"),
  level: "warn",
  format: baseFormat,
});

const errorTransport = new transports.File({
  filename: path.join(logDir, "error.log"),
  level: "error",
  format: baseFormat,
});

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), format.simple()),
});

const logger = createLogger({
  level: "info",
  transports: [infoTransport, warnTransport, errorTransport, consoleTransport],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, "exceptions.log") }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, "rejections.log") }),
  ],
});

module.exports = logger;

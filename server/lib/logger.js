const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

const transports = [];

const logFormat = printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length
    ? `\n${JSON.stringify(meta, null, 2)}`
    : "";
});

// Development muhit — konsolga rangli log
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD hh:mm:dd A" }),
        align(),
        logFormat
      ),
    })
  );
} else {
  transports.push(
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
  silent: process.env.NODE_ENV === "test",
});

module.exports = logger;

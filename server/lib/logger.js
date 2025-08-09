const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

const transports = [];

const logFormat = printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length
    ? `\n${JSON.stringify(meta, null, 2)}`
    : "";
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
});

// Development muhit — konsolga rangli log
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
        align(),
        logFormat
      ),
    })
  );
} else {
  transports.push(
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log", // logs papkasida sana bo‘yicha fayl
      datePattern: "YYYY-MM-DD", // kunlik log
      zippedArchive: true, // eski loglarni zip qiladi
      maxSize: "10m", // 10MB dan oshsa yangi fayl
      maxFiles: "30d", // faqat oxirgi 30 kunlik loglar saqlanadi
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
  silent: process.env.NODE_ENV === "test",
});

module.exports = logger;

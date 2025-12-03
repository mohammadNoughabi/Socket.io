const express = require("express");
const { createServer } = require("http");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const router = require("./routes/router");
const logger = require("./helpers/logger");
const { testDbConnection } = require("./config/db");
const { autoCreateTables } = require("./database/autoCreateTables");
const initSocket = require("./socket/index");

const app = express();
const server = createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api", router);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Cannot find ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Initialize Socket.IO server
initSocket(server);

async function main() {
  try {
    await testDbConnection();
    await autoCreateTables();

    const port = process.env.PORT || 3000;

    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Critical error: cannot start server", error);
    process.exit(1);
  }
}

main();

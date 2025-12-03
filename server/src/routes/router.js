const express = require("express");
const path = require("path");

const authRouter = require("./auth.routes");

const router = express.Router();

router.use("/auth", authRouter);



router.get("/chat", (req, res) => {
  try {
    return res
      .status(200)
      .sendFile(path.join(__dirname, "../../../client/chat.html"));
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

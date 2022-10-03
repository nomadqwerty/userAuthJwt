const express = require("express");
const bodyParser = require("body-parser");
const User = require("./userModel/User");

const app = express();
app.use(bodyParser.json({}));

module.exports = app;

app.post("/api/v2/users", async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (error) {}
});

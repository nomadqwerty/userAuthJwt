const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authHandler = require("./handlers/authControllers");
const userHandler = require("./handlers/userController");
const app = express();
app.use(bodyParser.json({}));
app.use(cookieParser());

module.exports = app;

// userSignUp:
app.post("/api/v2/users/signUp", authHandler.signUp);
// login
app.post("/api/v2/users/login", authHandler.login);

// get users
app.get("/api/v2/users", userHandler.getAllusers);
// by id
app.get("/api/v2/users/:id", userHandler.getUserById);

app.post("/api/v2/users/forgotPassword", authHandler.forgortPassword);
app.patch("/api/v2/users/resetPassword/:token", authHandler.resetPassword);

// route to protect.

app.use(
  "/api/v2/resource",
  authHandler.protect,
  authHandler.restrictTo(["worker"])
);

app.get("/api/v2/resource", (req, res) => {
  res.status(200);
  res.send("you have been authenticated and authorized to use this resource");
});

//
app.use(
  "/api/v2/users/updateMe",
  authHandler.protect,
  authHandler.restrictTo(["worker"])
);

app.patch("/api/v2/users/updateMe/:id", authHandler.updatePassword);

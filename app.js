const express = require("express");
const bodyParser = require("body-parser");
const userHandler = require("./handlers/authControllers");
const app = express();
app.use(bodyParser.json({}));

module.exports = app;

// userSignUp:
app.post("/api/v2/users/signUp", userHandler.signUp);

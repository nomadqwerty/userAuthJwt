const User = require("../userModel/User");
const bcrypt = require("bcryptjs");

// jwt:
const jwt = require("jsonwebtoken");

const tokenSign = async (id) => {
  try {
    let webToken = await jwt.sign({ ID: id }, process.env.JWT_SECRET, {
      algorithm: "HS512",
      expiresIn: "30d",
    });
    return webToken;
  } catch (error) {
    throw new Error("failed to create web token: " + error.message);
  }
};

const passwordCompare = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

exports.login = async (req, res, next) => {
  try {
    // get user data
    const user = await User.find({ email: req.body.email });
    const check = await passwordCompare(req.body.password, user[0].password);

    if (!check || !user) {
      throw new Error("invalid credentials");
    }
    // create JWT
    const token = await tokenSign(String(user[0]._id));
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    // failed authentication
    res.status(401).json({
      status: "fail",
      error,
    });
  }
};

exports.signUp = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    console.log(String(user._id));
    console.log(typeof String(user._id));
    if (!user) {
      console.log("thrown error");
      throw new Error("could not create user");
    }
    // convert object id to string, mongoose returns new objectId("ID"), instead of the normal string id '6322fa23ceFg7899a'
    const token = await tokenSign(String(user._id));

    res.status(201).json({
      status: "success",
      data: user,
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error,
    });
  }
};

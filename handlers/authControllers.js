const User = require("../userModel/User");

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

exports.signUp = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    if (!user) {
      console.log("thrown error");
      throw new Error("could not create user");
    }
    const token = await tokenSign(user._id);

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

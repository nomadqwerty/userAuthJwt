const User = require("../userModel/User");
const bcrypt = require("bcryptjs");
const utilityNode = require("util");
const sendMail = require("../utils/email");
const crypto = require("crypto");

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
    const user = await User.find({ email: req.body.email }).select("password");
    const check = await passwordCompare(req.body.password, user[0].password);

    if (!check || !user) {
      throw new Error("invalid credentials");
    }
    let cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    // create JWT
    const token = await tokenSign(String(user[0]._id));
    res.cookie("jwt", token, cookieOptions);
    res.status(200).json({
      status: "success",
      token: token,
    });
  } catch (error) {
    console.log(error);
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
    user.password = undefined;
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

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookie) {
      token = req.cookie.jwt;
    }
    if (!token) {
      throw new Error("");
    }
    // verify jwt.
    const jwtPromise = utilityNode.promisify(jwt.verify);
    // decoded object
    const decoded = await jwtPromise(token, process.env.JWT_SECRET);
    const freshUser = await User.findById(decoded.ID);
    if (!freshUser) {
      throw new Error("");
    }

    // check if passwordchanged before jwt was issued
    const passwordChangedBefore = freshUser.passwordChangedBeforeJwt(
      decoded.iat
    );
    if (!passwordChangedBefore) {
      throw new Error("");
    }

    // add to req object so next middleware can use the user object
    req.user = freshUser;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send("failed");
  }
};

exports.restrictTo = (array) => {
  return async (req, res, next) => {
    try {
      if (!array.includes(req.user.role)) {
        throw new Error("error occured");
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(403).send("forbidden");
    }
  };
};

exports.forgortPassword = async (req, res, next) => {
  //TODO: use findOne instead.
  let user = await User.findOne({ email: req.body.email });
  try {
    if (!user) {
      throw new Error("no user found");
    }
    const token = user.passwordResetToken();
    // turn off validation
    await user.save({ validateBeforeSave: false });

    const protocol = req.protocol;
    const domain = req.get("host");

    // reset url for user
    const resetUrl = `${protocol}://${domain}/api/v2/users/resetPassword/${token}`;

    //   message to  send by email
    const message = `Forgot password? submit a patch request with your new password and confirm to:${resetUrl}\n If not please ignore this message`;

    let mailOptions = {
      email: user.email,
      subject: "password reset token sent through email",
      message,
    };
    await sendMail(mailOptions);
    console.log(user);
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);

    //   reset the user fields to undefiined,
    if (user) {
      user.passwordResetToken = undefined;
      user.resetTokenExpiresIn = undefined;
      await user.save({ validateBeforeSave: false });
    }
    // save

    res.status(500).send("error");
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // hash token in req.params
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    // find user based of token and passExprire gte now
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gte: Date.now() },
    });
    if (!user) {
      throw new Error("no user found");
    }
    if (!req.body.password) {
      throw new Error("please provide new password");
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: true });

    console.log(user);

    res.status(200).send("restpassword");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const User = require("../userModel/User");

exports.getAllusers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      results: users?.length,
      users,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: "no users found",
    });
  }
};
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error();
    }
    res.status(200).json({
      status: "success",
      results: user?.length,
      user,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: "no user found",
    });
  }
};

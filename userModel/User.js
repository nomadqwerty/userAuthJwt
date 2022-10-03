const { Schema, model } = require("mongoose");

const userShema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
  },
  occupation: {
    type: String,
    required: [true, "Please enter an Occupation"],
  },
});

const User = model("Training", userShema);

User.watch().on("change", (data) => {
  console.log("something changed: ", data.fullDocument?.name);
});
User.watch().on("error", (err) => {
  console.log("error occured: ", err.message);
});

module.exports = User;

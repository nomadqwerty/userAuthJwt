const { Schema, model } = require("mongoose");
const _V = require("validator");

const userShema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  photo: {
    type: String,
  },
  email: {
    // TODO: make email unique.
    type: String,
    required: [true, "Please enter a valid email"],
    validate: {
      validator: function (val) {
        return _V.isEmail(val);
      },
      message: `invalid email address`,
    },
  },
  occupation: {
    type: String,
    required: [true, "Please enter an Occupation"],
  },

  location: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      default: [92.888, 91.076],
      alias: "coords",
    },
    address: {
      type: String,
      required: [true, "Please enter a valid address"],
    },
  },
  password: {
    type: String,
    required: [true, "Please enter a valid password"],
    minLength: [8, " at least 8 characters"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please re-enter password"],
    validate: {
      validator: function (v) {
        if (this.password !== v) {
          return false;
        }
      },
      message: `Incorrect value`,
    },
  },
});

const User = model("User", userShema);

User.watch().on("change", (data) => {
  console.log("something changed: ", data.fullDocument?.name);
});
User.watch().on("error", (err) => {
  console.log("error occured: ", err.message);
});

module.exports = User;

const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
  encoding: "utf-8",
  debug: "true",
});

const app = require("./app");

const connectDB = async () => {
  const DB = process.env.DBCONSTR;
  console.log(DB);
  try {
    let con = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connected");
  } catch (err) {
    console.log(err);
  }
};
connectDB();

const port = Number(process.env.port);

app.listen(port, () => {
  console.log("sever on port:", port);
});

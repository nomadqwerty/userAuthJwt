const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.host,
    port: process.env.portMail,
    auth: {
      user: process.env.mailUser,
      pass: process.env.mailPass,
    },
  });

  const mailOpt = {
    from: "davexmike72@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  if (options.email) {
    const sent = await transporter.sendMail(mailOpt);
    console.log("sent: ", sent);
  }
};

module.exports = sendMail;

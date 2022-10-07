const jwt = require("jsonwebtoken");

const password = "password";

const secret = "shhhhhh";

const token = jwt.sign({ pd: password }, secret, { algorithm: "HS512" });
const token2 = jwt.sign({ pd: password }, secret, { algorithm: "HS512" });

console.log(token === token2);

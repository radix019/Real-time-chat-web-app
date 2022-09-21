const express = require("express");
const app = express();
require("dotenv").config();
const databaseConnect = require("./config/database");
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// dotenv.config({
//   path: "/backend/config/.env",
// });
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the messenger Backend service");
});
app.use("/api/messenger", authRouter);

databaseConnect();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

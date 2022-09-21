const mongoose = require("mongoose");
require("dotenv").config();
let MONGO_URI = `mongodb://${process.env.MONGO_DATABASE_HOST}:${process.env.MONGO_DATABASE_PORT}/${process.env.MONGO_DATABASE_DATABASE}`
console.log('MONGO_URI==>>',MONGO_URI)
   
const databaseConnect = () => {
 // console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
  mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((error) => {
    console.log("database connection failed. exiting now...");
    console.error(error);
    process.exit(1);
  });

};

module.exports = databaseConnect;




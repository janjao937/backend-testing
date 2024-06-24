require("dotenv").config();
const express = require("express");
const rateLimit = require("../src/middleware/ratelimit");
const cookieParser =require("cookie-parser");

const authRoute = require("./routes/authRoute.js");
const adminCryptocurrencyRoute = require("./routes/adminCryptocurrencyRoute.js");
const userCryptocurrencyRoute = require("./routes/userCryptocurrencyRoute.js");

const port = process.env.PORT||8888;
const app = express();

app.use(rateLimit);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoute);
app.use("/api/crypto/admin",adminCryptocurrencyRoute);
app.use("/api/crypto/user",userCryptocurrencyRoute);




app.listen(port,()=>{
    console.log("Server is running on Port:"+port);
});
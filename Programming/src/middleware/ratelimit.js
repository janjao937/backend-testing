const {rateLimit} =require("express-rate-limit");

module.exports = rateLimit({
    windowMs:15*60*1000,
    limit:300,
    message:{message:"too many request from this ip"}
});
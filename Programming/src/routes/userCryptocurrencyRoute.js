const express = require("express");
const protectRoute = require("../middleware/ProtectedRoute.js");
const userCryptocurrencyController = require("../controllers/userCryptocurrencyController.js");

const route = express.Router();

//get coin
route.post("/get-coin",protectRoute.protectRouteForUser,userCryptocurrencyController.userGetCoin);
//transfer coin to other
route.post("/transfer",protectRoute.protectRouteForUser,userCryptocurrencyController.userTransferCrypto);

//exchange to other
route.post("/exchange",protectRoute.protectRouteForUser,userCryptocurrencyController.userExchangeCrypto);



module.exports = route;
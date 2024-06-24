const express = require("express");
const protectRoute = require("../middleware/ProtectedRoute.js");
const adminCryptoController = require("../controllers/adminCryptocurrencyController.js");

const route = express.Router();

//GET Admin can see all total balance of all cryptocurrency| (usdt)=>BTC = 100usdt |ETH = 20usdt
route.get("",protectRoute.protectRouteForAdmin,adminCryptoController.getAllCryptoBalance);

//add new cryptocurrency (add new crypto)
route.post("/add",protectRoute.protectRouteForAdmin,adminCryptoController.addNewCryptocurrency);

route.patch("/change-rate",protectRoute.protectRouteForAdmin,adminCryptoController.changeExChangeRateBetweenCrypto);

route.patch("/edit-user-wallet",protectRoute.protectRouteForAdmin,adminCryptoController.EditUserCryptoWalletBalance);

//PATCH edit increase and decrease user cryptocurrency balance |(edit balance of user) userA BTC balance = 10 =>userA BTC balance = 5 or 15
// /:increaseOrDecrease  

//PATCH manage exchange rate between cryptocurrency |(change usdt)




module.exports = route;
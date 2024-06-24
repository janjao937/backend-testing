const express = require("express");
const {pool} =require("../db/db-config.js");
const authController = require("../controllers/authController.js");
// const protectRoute = require("../middleware/ProtectedRoute.js");
const route = express.Router();

route.post("/register/admin",authController.registerAdmin);
route.post("/login/admin",authController.loginAdmin);

route.post("/register/user",authController.registerUser);
route.post("/login/user",authController.loginUser);

route.post("/logout",authController.logout);




module.exports = route;
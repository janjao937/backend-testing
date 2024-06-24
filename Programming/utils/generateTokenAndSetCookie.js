const jwt = require("jsonwebtoken");
const generateTokenAndSetCookieAdmin = (adminId, res) => {
	const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, 
		httpOnly: true, 
		sameSite: "strict", 
		secure: process.env.NODE_ENV !== "development",
	});
};
const generateTokenAndSetCookieUser = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, 
		httpOnly: true, 
		sameSite: "strict", 
		secure: process.env.NODE_ENV !== "development",
	});
};


exports.generateTokenAndSetCookieAdmin =generateTokenAndSetCookieAdmin;
exports.generateTokenAndSetCookieUser =generateTokenAndSetCookieUser;
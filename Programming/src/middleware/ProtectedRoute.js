const jwt = require("jsonwebtoken");
const {pool} =require("../db/db-config.js");

const protectRouteForAdmin  = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        if (!token) {
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}

        const sqlFindAdmin = `Select _id,username From admin Where _id = ?;`;
        const admin = await pool.query(sqlFindAdmin,[decoded.adminId]);
        // console.log(decoded);
        if(!admin[0][0]){
            return res.status(404).json({ error: "User not found" });
        }
        // console.log(admin[0][0]);
        req.admin = admin[0][0];
        next();
    }
    catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}
const protectRouteForUser  = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        if (!token) {
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}

        const sqlFindUser = `Select _id,username From user Where _id = ?;`;
        const user = await pool.query(sqlFindUser,[decoded.userId]);
        if(!user[0][0]){
            return res.status(404).json({ error: "User not found" });
        }
        // console.log(user[0][0]);
        req.user = user[0][0];
        next();
    }
    catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}

exports.protectRouteForAdmin = protectRouteForAdmin;
exports.protectRouteForUser = protectRouteForUser;
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../../utils/generateTokenAndSetCookie.js");

const {pool}=  require("../db/db-config.js");

const registerAdmin =async(req,res)=>{
    try{
        const {username,password} = req.body;

        if(password.length<6){
            console.log("Passwords > 7 character");
            return res.status(400).json({ error: "password > 7 character" });
        }
        //check username
        if(username.length<4){
            console.log("Passwords > 4 character");
            return res.status(400).json({ error: "username > 4 character" });
        }
        const sqlCheckUsername = `Select username From admin Where username = ? Limit 1;`
        const checkUsername = await pool.query(sqlCheckUsername,[username]);
        // console.log(checkUsername[0]?.[0])
        if(checkUsername[0]?.[0])return res.status(400).json({ error: "Username already exists" });

        //hashPassword
        const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
        //create admin
        const sqlCreateAdmin =`Insert Into admin(username,password)Value(?,?);`;
        await pool.query(sqlCreateAdmin,[username,hashedPassword]);

        const sqlGetId = `Select _id From admin Where username = ? Limit 1;`;
        const getId = await pool.query(sqlGetId,[username]);
        // console.log(getId[0][0]._id)
        const id =getId[0][0]._id;
        generateTokenAndSetCookie.generateTokenAndSetCookieAdmin(id,res);

        res.status(201).json({id,username});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const registerUser =async(req,res)=>{
    try{
        const {username,password} = req.body;
        if(password.length<6){
            console.log("Passwords > 7 character");
            return res.status(400).json({ error: "password > 7 character" });
        }
        //check username
        if(username.length<4){
            console.log("Passwords > 4 character");
            return res.status(400).json({ error: "username > 4 character" });
        }
        const sqlCheckUsername = `Select username From user Where username = ? Limit 1;`
        const checkUsername = await pool.query(sqlCheckUsername,[username]);
        if(checkUsername[0][0])return res.status(400).json({ error: "Username already exists" });
        //hashPassword
        const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
        //create user
        const sqlCreateAdmin =`Insert Into user(username,password)Value(?,?);`;
        await pool.query(sqlCreateAdmin,[username,hashedPassword]);

        const sqlGetId = `Select _id From user Where username = ? Limit 1;`;
        const getId = await pool.query(sqlGetId,[username]);
        // console.log(getId[0][0]._id)
        const id =getId[0][0]._id;
        generateTokenAndSetCookie.generateTokenAndSetCookieUser(id,res);

        res.status(201).json({id,username});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const loginAdmin =async(req,res)=>{
    try{
        const {username,password} = req.body;
        //find user
        const sqlCheckUser = `Select * From admin Where username = ? Limit 1;`
        const checkUser = await pool.query(sqlCheckUser,[username]);
        const user = checkUser[0][0];
        // console.log(user);
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

        delete user.password;

        generateTokenAndSetCookie.generateTokenAndSetCookieAdmin(user._id,res);
        res.status(200).json({admin:user});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const loginUser =async(req,res)=>{
    try{
        const {username,password} = req.body;
        //find user
        const sqlCheckUser = `Select * From user Where username = ? Limit 1;`
        const checkUser = await pool.query(sqlCheckUser,[username]);
        const user = checkUser[0][0];
        // console.log(user);
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

        delete user.password;

        generateTokenAndSetCookie.generateTokenAndSetCookieUser(user._id,res);
        res.status(200).json({user:user});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

exports.registerAdmin = registerAdmin;
exports.loginAdmin = loginAdmin;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logout = logout;
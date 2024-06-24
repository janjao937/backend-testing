const {pool}=  require("../db/db-config.js");

//add new cryptocurrency 
const addNewCryptocurrency =async(req,res)=>{
    try{
        const {name,usdt} = req.body;
        const isNumber = typeof usdt === "number";
        if(!isNumber)return res.status(400).json({ error: "usdt must be a number"});

        const sqlCheckCryptoName = `Select name from Cryptocurrency Where name =?;`;
        const checkCryptoName = await pool.query(sqlCheckCryptoName,[name]);

        if(checkCryptoName[0][0])return res.status(400).json({ error: "This Coin name already exists" });

        const sqlCreateCrypto = `Insert Into Cryptocurrency(name,usdt)Value(?,?);`;
        await pool.query(sqlCreateCrypto,[name,usdt]);
        res.status(200).json({message:"Add New Crypto Success",crypto:{name:name,usdt:usdt}});
    }
    catch(error){
        console.error("Error in addNewCryptocurrency: ", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}

//GET Admin can see all total balance of all cryptocurrency| (usdt)=>BTC = 100usdt |ETH = 20usdt
const getAllCryptoBalance = async(req,res)=>{
    try{
        const sqlGetAllCryptoBalance = `Select * From Cryptocurrency;`;
        const result = await pool.query(sqlGetAllCryptoBalance);
        // console.log(result[0]);
        res.status(200).json({allCryptoBalance:result[0]});
     
    }
    catch(error){
        console.error("Error in getAllCryptoBalance: ", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}
//"1dc81d05-2f24-11ef-a85d-0250989ff1cd"
//"a874503b-2f12-11ef-a85d-0250989ff1cd"

const changeExChangeRateBetweenCrypto = async(req,res)=>{
    try{
        const {cryptoA_id,newRateA,cryptoB_id} = req.body;
       
        const sqlFindCoinInDatabase = `Select * From cryptocurrency Where _id= ? OR _id = ?;`; 

        const findCoinInDatabase = await pool.query(sqlFindCoinInDatabase,[cryptoA_id,cryptoB_id]);//select coinA and coinB in database
        
        //validate data
        const cryptoMap = new Map();
        cryptoMap[cryptoA_id] = {key:cryptoA_id,data:null};
        cryptoMap[cryptoB_id] = {key:cryptoB_id,data:null};
      
        findCoinInDatabase[0].map(e=> {
            if(cryptoMap[e._id]) cryptoMap[e._id].data = e;
            } 
        );
        //if dont have some coin return not found X Coin In Database
        for(let value in cryptoMap){
            // console.log(coinsMap[value]);
            if(cryptoMap[value].data===null){
                return res.status(404).json({message:`Not found this id:${value} on database `});
            }
        }

        //find current rate
        const currentARate = (cryptoMap[cryptoA_id].data.usdt/cryptoMap[cryptoB_id].data.usdt);
        //find new usdt on newRate
        const newAUsdt = (cryptoMap[cryptoA_id].data.usdt*newRateA)/currentARate;
        const newRateB = (cryptoMap[cryptoB_id].data.usdt/newAUsdt);
      
        const sqlSendNewUsdtForNewRate = `Update cryptocurrency Set usdt = ? Where _id = ?;`;
        await pool.query(sqlSendNewUsdtForNewRate,[newAUsdt,cryptoA_id]);   //save to database
        res.status(200).json({message:`Rate ${cryptoMap[cryptoA_id].data.name} is ${newRateA} |Rate ${cryptoMap[cryptoB_id].data.name} is ${newRateB}`});
    }
    catch(error){
        console.error("Error in changeExChangeRateBetweenCrypto: ", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}

// "walletId": "eb91583e-306b-11ef-a85d-0250989ff1cd",
// "userId": "ac2f4183-2f02-11ef-a85d-0250989ff1cd",
// "username": "JaneDoe",
// "crypto_Id": "1dc81d05-2f24-11ef-a85d-0250989ff1cd",
// "name": "ETH",
// "balance": "12420.0000"

const EditUserCryptoWalletBalance =async(req,res)=>{
    try{
        const {userId,crypto_Id,newBalance} = req.body;

        //check wallet user have this cryptoCoin
        const sqlUserCryptoBalanceInWallet = `Select wallet._id walletId,u._id userId,u.username,wallet.crypto_Id,c.name,wallet.balance
         FROM wallet Inner Join user u On wallet.userId = u._id Inner Join cryptocurrency c on wallet.crypto_Id = c._id where u._id = ? AND crypto_Id = ? Limit 1;`
        
        const userCryptoBalanceInWallet = await pool.query(sqlUserCryptoBalanceInWallet,[userId,crypto_Id]);
        if(!userCryptoBalanceInWallet[0][0]) return res.status(404).json({ error: "User Dont't have this Crypto in Wallet" });

        //Update balance
        const sqlUpdateBalance= `Update wallet Set balance = ? Where _id = ?;`;
        await pool.query(sqlUpdateBalance,[newBalance,userCryptoBalanceInWallet[0][0].walletId]);
        
        res.status(200).json({message:`${userCryptoBalanceInWallet[0][0].username} have ${userCryptoBalanceInWallet[0][0].name} in wallet balance ${newBalance}`});

    }catch(error){
        console.error("Error in EditUserCryptoWalletBalance: ", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}

exports.addNewCryptocurrency = addNewCryptocurrency;
exports.getAllCryptoBalance = getAllCryptoBalance;
exports.changeExChangeRateBetweenCrypto = changeExChangeRateBetweenCrypto;
exports.EditUserCryptoWalletBalance = EditUserCryptoWalletBalance;
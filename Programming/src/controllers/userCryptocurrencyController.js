const {pool}=  require("../db/db-config.js");
const { use } = require("../routes/adminCryptocurrencyRoute.js");

//"1dc81d05-2f24-11ef-a85d-0250989ff1cd"
//get coin
const userGetCoin = async(req,res)=>{
    try{
        const {crypto_id,addBalance} = req.body;
        const user = req.user;
        // console.log(user);

        //check crypto_id   
        const sqlFindCoinInDatabase = `Select * From cryptocurrency Where _id= ? Limit 1;`;
        const crypto = await pool.query(sqlFindCoinInDatabase,[crypto_id]);
        console.log(crypto[0][0]);
        
        if(!crypto[0][0]) return res.status(404).json({message:`Not found this crypto Id on Database`});
        
        //check user wallet have this coin 
        const sqlCheckUserWallet =`Select * From wallet Where userId = ? AND crypto_Id =? Limit 1`;
        const checkUserWallet = await pool.query(sqlCheckUserWallet,[user._id,crypto_id]);

        console.log(checkUserWallet[0]);
        let sqlWalletQuery = "";
        let balance = 0;

        //if not have insert new row
        if(!checkUserWallet[0][0]){
            console.log("Insert new col");//Insert Into wallet(userId/balance/cryptoId)
            sqlWalletQuery = `Insert Into wallet(balance,userId,crypto_Id)Value(?,?,?); `;
            balance = addBalance;
            // await pool.query(sqlInsertWalletTable,[addBalance,user._id,crypto_id]);
        }else{
            const currentWallet = checkUserWallet[0][0];
            balance = +currentWallet.balance + addBalance;
            console.log(balance);

            console.log("Update balance+add balance"); //Update wallet
            sqlWalletQuery =  `Update wallet Set balance = ? Where userId = ? AND crypto_Id =?;`
            // await pool.query(sqlUpdateWalletTable,[currentBalance,user._id,crypto_id]);
        }

        await pool.query(sqlWalletQuery,[balance,user._id,crypto_id]);
        
        //if have incress balance of coin
        res.status(200).json({message:`User ${user.username} Get ${crypto[0][0].name} Balance ${balance}`});
    }
    catch(error){
        console.error("Error in getCoin:", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}
//transfer coin to other
const userTransferCrypto = async(req,res)=>{
    try{
        const {toUserId,crypto_id,transferBalance} = req.body;

        const myUser = req.user;
        //check cryptoId
        const sqlCheckCryptoId = `Select * From cryptocurrency Where _id= ?;`;
        const checkCrypto = await pool.query(sqlCheckCryptoId,[crypto_id]);
        console.log(checkCrypto[0][0])

        if(!checkCrypto[0][0]){
           return res.status(404).json({error:`Not found this ${crypto_id} Coin Id`});
        }
        //check User
        const sqlCheckToUser = `Select username from user Where _id =?;`;
        const checkToUser = await pool.query(sqlCheckToUser,[toUserId]);
        if(!checkToUser[0][0]){
            return res.status(404).json({error:`Not found user Id ${toUserId}`});
        }
        //check myUser wallet
        const sqlCheckWallet = `Select u._id userId,u.username,wallet._id walletId,c.name cryptoName,wallet.balance From wallet Inner Join user u On wallet.userId = u._id 
        Inner Join cryptocurrency c on wallet.crypto_Id = c._id Where userId = ? OR userId = ? AND crypto_Id = ?;`;

        const checkUserWallet = await pool.query(sqlCheckWallet,[myUser._id,toUserId,crypto_id]);

        const userDataMap = new Map();
        userDataMap[myUser._id] = {data:null};
        userDataMap[toUserId] = {data:null};
        
        checkUserWallet[0].map(e=>userDataMap[e.userId] = {data:e});

        // console.log(userDataMap[myUser._id].data);
        if(!userDataMap[myUser._id].data) return  res.status(404).json({error:`Not found this Coin In ${myUser.username} wallet`});

        if(+userDataMap[myUser._id].data.balance < +transferBalance) return res.status(200).json({error:`your coin is not enough to transfer`});
        //Update MyUser wallet
        const currentBalance = +userDataMap[myUser._id].data.balance - transferBalance;
        // console.log(currentBalance);
        // console.log(userDataMap);

        //update Database
        const sqlUpdateMyBalance = `Update wallet Set balance = ? Where _id = ?`
        await pool.query(sqlUpdateMyBalance,[currentBalance,userDataMap[myUser._id].data.walletId]);

        if(!userDataMap[toUserId].data){
            //insert new wallet row
            const sqlInsertNewWallet = `Insert Into wallet(balance,userId,crypto_Id)Value(?,?,?);`;
            await pool.query(sqlInsertNewWallet,[transferBalance,toUserId,crypto_id]);
        }
        else{
            //Update wallet
            const newBalance = +userDataMap[toUserId].data.balance + transferBalance;  //balance + transferBalance

            const sqlUpdateToUserWallet = `Update wallet Set balance = ? Where userId = ? AND crypto_Id = ?;`;
            await pool.query(sqlUpdateToUserWallet,[newBalance,toUserId,crypto_id]);
        }

        //if Not same cryptocurrency  => userExchangeCrypto
        res.status(200).json({message:`${userDataMap[myUser._id].data.username} transfer ${transferBalance} ${checkCrypto[0][0].name} to ${checkToUser[0][0].username} so ${checkToUser[0][0].username} will recieve ${transferBalance} ${checkCrypto[0][0].name}`});
    }catch(error){
        console.error("Error in userTransferCrypto:", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}
//exchange to other 
const userExchangeCrypto = async(req,res)=>{
    try{
        const {toUserId,fromCrypto_id,transferBalance,exToCrypto_id} = req.body;
        const myUser = req.user;
        const sqlGetToUser =`Select * From user Where _id =?;`;
        const getToUser = await pool.query(sqlGetToUser,[toUserId]);

        if(!getToUser[0][0])return res.status(404).json({message:`Not found this user id:${toUserId} on database `});
        //check crypto Id 
        const sqlGetCryptoData = `Select * From cryptocurrency Where _id= ? OR _id =?;`;

         //get Fromcrypto and toCrypto usdt
        const getCryptoData = await pool.query(sqlGetCryptoData,[fromCrypto_id,exToCrypto_id]);
        
        const mapTransferCrypto = new Map();//crypto map
        mapTransferCrypto[fromCrypto_id] = {data:null};
        mapTransferCrypto[exToCrypto_id] = {data:null};

        getCryptoData[0].map(e=>mapTransferCrypto[e._id] = {data:e});//push data to map

        //validate TransferCrypto
        for(let value in mapTransferCrypto){
            // console.log(coinsMap[value]);
            if(mapTransferCrypto[value].data===null){
                return res.status(404).json({message:`Not found this crypto id:${value} on database `});
            }

        }

        const sqlCheckWallet = `Select u._id userId,u.username,wallet._id walletId,c.name cryptoName,wallet.balance From wallet Inner Join user u On wallet.userId = u._id 
        Inner Join cryptocurrency c on wallet.crypto_Id = c._id Where userId = ? AND crypto_Id = ?;`;
        //check my wallet
        const myWallet = await pool.query(sqlCheckWallet,[myUser._id,fromCrypto_id]);
    
        if(!myWallet[0][0])  return  res.status(404).json({error:`Not found this Coin id ${fromCrypto_id} In ${myUser.username} wallet`});

        const toUserWallet = await pool.query(sqlCheckWallet,[toUserId,exToCrypto_id]);//check toUserWallet
        const rateBetweenCrypto = mapTransferCrypto[fromCrypto_id].data.usdt/mapTransferCrypto[exToCrypto_id].data.usdt;//calculate ex Rate
        // console.log(rateBetweenCrypto);
        const transferBalanceBetweenCrypto = rateBetweenCrypto*transferBalance;

        //check balace is enough
        if(myWallet[0][0].balance<transferBalance) return res.status(200).json({error:`your crypto is not enough to transfer`});

        const myNewBalance = +myWallet[0][0].balance - transferBalance;

        //decrese My wallet
        const sqlUpdateMyWallet = `Update wallet Set balance = ? Where _id = ?`
        await pool.query(sqlUpdateMyWallet,[myNewBalance,myWallet[0][0].walletId]);

        //update wallet database
        let sqlQueryWallet = "";
        let newBalance = transferBalanceBetweenCrypto;
        if(!toUserWallet[0][0]){
            //dont Have Insert
            sqlQueryWallet = `Insert Into wallet(balance,userId,crypto_Id)Value(?,?,?);`;
            await pool.query(sqlQueryWallet,[newBalance,toUserId,exToCrypto_id]);
        }else{
            // console.log(toUserWallet[0][0].balance);
            //have Update
            newBalance = +toUserWallet[0][0].balance +transferBalanceBetweenCrypto;
            sqlQueryWallet = `Update wallet Set balance = ? Where _id = ?`;
            await pool.query(sqlQueryWallet,[newBalance,toUserWallet[0][0].walletId]);
        }
        // console.log(myWallet[0][0]);
        res.status(200).json({message:`${myWallet[0][0].username} transfer ${transferBalance} ${myWallet[0][0].cryptoName} to ${getToUser[0][0].username} with exchange rate ${myWallet[0][0].cryptoName}/${mapTransferCrypto[exToCrypto_id].data.name} equal to ${rateBetweenCrypto} so UserB will recieve ${transferBalanceBetweenCrypto} ${mapTransferCrypto[exToCrypto_id].data.name}`});
    }catch(error){
        console.error("Error in userTransferCrypto:", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}



exports.userGetCoin = userGetCoin;
exports.userTransferCrypto = userTransferCrypto;
exports.userExchangeCrypto = userExchangeCrypto;
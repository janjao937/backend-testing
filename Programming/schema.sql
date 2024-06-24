Create Database simple_wallet_api;
Create Table Admin(
	_id VARCHAR(36) DEFAULT (UUID()) NOT NULL UNIQUE PRIMARY KEY,
    username varchar(25) NOT NULL UNIQUE,
    password Char(60) NOT NULL
);

Create Table User(
	_id VARCHAR(36) DEFAULT (UUID()) NOT NULL UNIQUE PRIMARY KEY,
    username varchar(25) NOT NULL UNIQUE,
    password Char(60) NOT NULL 
);

Create Table Cryptocurrency(
	_id VARCHAR(36) DEFAULT (UUID()) NOT NULL UNIQUE PRIMARY KEY,
    name varchar(25) NOT NULL UNIQUE,
    usdt decimal(19,4) NOT NULL
);
    
Create Table Wallet(
	_id VARCHAR(36) DEFAULT (UUID()) NOT NULL UNIQUE PRIMARY KEY,
    balance decimal(19,4) DEFAULT(0) NOT NULL,
    userId VARCHAR(36), 
    crypto_Id VARCHAR(36),
    CONSTRAINT FK_userId FOREIGN KEY (userId)
    REFERENCES User(_id),
    CONSTRAINT FK_crypto_Id FOREIGN KEY (crypto_Id)
    REFERENCES Cryptocurrency(_id)
);

const Item =  sequelize.define('Item', {
    id: Sequelize.UUID,
    name: Sequelize.STRING,
    detail: Sequelize.STRING,
    price: Sequelize.DECIMAL(19,4),
    start_date:Sequelize.DATE,
    ex_date:Sequelize.DATE,
});
Item.associate = (models) => {
    Item.hasMany(Promotion, { foreignKey: 'item_id' })
}
Item.associate = (models) => {
    Item.hasMany(ItemMatchCode, { foreignKey: 'item_id' })
}
Item.associate = (models) => {
    Item.hasMany(Package, { foreignKey: 'item_id' })
}


const Promotion =  sequelize.define('Promotion', {
    id: Sequelize.UUID,
    item_id: Sequelize.UUID,
    discount: Sequelize.DECIMAL(19,4),
    start_date:Sequelize.DATE,
    ex_date:Sequelize.DATE,
});
Promotion.associate = (models) => {
    Promotion.belongsTo(Item, { foreignKey: 'item_id' })
}


const GameCode = sequelize.define('GameCode', {
    id: Sequelize.UUID,
    code:Sequelize.STRING,
});
GameCode.associate = (models) => {
    GameCode.hasMany(ItemMatchCode, { foreignKey: 'game_code_id' })
}


const ItemMatchCode =  sequelize.define('ItemMatchCode', {
    id: Sequelize.UUID,
    item_id: Sequelize.UUID,
    game_code_id: Sequelize.UUID,
});
ItemMatchCode.associate = (models) => {
    ItemMatchCode.belongsTo(Item, { foreignKey: 'item_id' })
}
ItemMatchCode.associate = (models) => {
    ItemMatchCode.belongsTo(GameCode, { foreignKey: 'game_code_id' })
}


const Bundle = sequelize.define('Bundle', {
    id: Sequelize.UUID,
    price: Sequelize.DECIMAL(19,4),
    start_date:Sequelize.DATE,
    ex_date:Sequelize.DATE,
});
Bundle.associate = (models) => {
    Bundle.hasMany(Package, { foreignKey: 'bundle_id' })
}


const Package =  sequelize.define('Package', {
    id: Sequelize.UUID,
    bundle_id: Sequelize.UUID,
    item_id: Sequelize.UUID,
});
Package.associate = (models) => {
    Package.belongsTo(Item, { foreignKey: 'item_id' })
}
Package.associate = (models) => {
    Package.belongsTo(Bundle, { foreignKey: 'game_code_id' })
}
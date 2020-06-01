module.exports = (sequelize, DataTypes) =>
    sequelize.define('SymbolCount', {
        dollars: DataTypes.INTEGER, 
        questions: DataTypes.INTEGER,
        dollars_counted: DataTypes.INTEGER,
        questions_counted: DataTypes.INTEGER
    })
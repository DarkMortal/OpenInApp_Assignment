module.exports.userModel = (sequelize, DataTypes) => {
    const user = sequelize.define("User",{
        id : {
            type : DataTypes.INTEGER,
            allowNull : false,
            unique: true,
            primaryKey: true
        },
        phone_number : {
            type : DataTypes.NUMBER,
            allowNull : false
        },
        priority : {
            type : DataTypes.INTEGER,
            allowNull : false,
            validate : {
                isIn : {
                    args: [[0, 1, 2]],
                    msg: 'Invalid priority'
                }
            }
        }
    },{
        timestamps: false  // disable auto-generated timestamps
    });
    return user;
}
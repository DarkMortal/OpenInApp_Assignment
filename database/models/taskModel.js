module.exports.taskModel = (sequelize, DataTypes) => {
    const task = sequelize.define("Task",{
        id : {
            type : DataTypes.INTEGER,
            allowNull : false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        user_id : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        title : {
            type : DataTypes.STRING,
            allowNull : false
        },
        description : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        due_date : {
            type : DataTypes.DATEONLY,
            allowNull : false
        },
        status : {
            type : DataTypes.STRING,
            validate : {
                isIn : {
                    args: [["TODO", "IN_PROGRESS", "DONE"]],
                    msg: "Invaid status"
                }
            },
            defaultValue: "TODO"
        },
        priority : {
            type : DataTypes.INTEGER,
            validate : {
                isIn : {
                    args: [[0, 1, 2, 3]],
                    msg: 'Invalid priority'
                }
            }
        }
    }, {
        timestamps: true,  // enable auto-generated timestamps
        paranoid: true  // enable soft-delete
    });
    return task;
}
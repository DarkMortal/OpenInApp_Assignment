module.exports.subTaskModel = (sequelize, DataTypes) => {
    const subTask = sequelize.define("subTask",{
        id : {
            type : DataTypes.INTEGER,
            allowNull : false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        task_id : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        status : {
            type : DataTypes.INTEGER,
            validate : {
                isIn : {
                    args: [[0, 1]],
                    msg: 'Invalid status'
                }
            },
            defaultValue: 0
        },
    }, {
        timestamps: true,  // enable auto-generated timestamps
        paranoid: true,  // enable soft-delete
        createdAt: "created_at",  // rename createdAt to created_at
        updatedAt: "updated_at",  // rename updatedAt to updated_at
        deletedAt: "deleted_at"  // rename deletedAt to deleted_at
    });
    return subTask;
}
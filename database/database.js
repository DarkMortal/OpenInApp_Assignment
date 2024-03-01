const { userModel } = require('./models/userModel');
const { taskModel } = require('./models/taskModel');
const { subTaskModel } = require('./models/subTaskModel');
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database/database.sqlite3'
});

const user = userModel(sequelize, DataTypes);
const task = taskModel(sequelize, DataTypes);
const subtask = subTaskModel(sequelize, DataTypes);

// one-to-many association between user and tasks
user.hasMany(task, {
    foreignKey: 'user_id'
});

// one-to-many association between task and subtasks
task.hasMany(subtask, {
    foreignKey: 'task_id',
    onDelete: 'cascade', hooks: true
});
subtask.belongsTo(task,{
    foreignKey: 'task_id',
    onDelete: 'cascade', // hooks: true
});

// TODO: Test the Connection 
async function ConnectDB() {
    await sequelize.authenticate();
}

// TODO: Create test Users
async function createUsers() {
    await ConnectDB();
    let records = [
        {
            id: 1,
            phone_number: 'twilio_verified_number',
            priority: 0
        },
        {
            id: 2,
            phone_number: 'twilio_verified_number',
            priority: 1
        },
        {
            id: 3,
            phone_number: 'twilio_verified_number',
            priority: 2
        }
    ];

    for(let i = 0; i < records.length; i++){
        let [instance, created] = await user.upsert(records[i]);

        if (created) console.log('A new record was created: ', instance);
        else console.log('The record was updated: ', instance);
    }
}

createUsers().then(() => console.info("Test users created sucessfully"))
.catch(err => console.error(err));
module.exports.DataModels = {user, task, subtask};
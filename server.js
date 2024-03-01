const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {Authenticate} = require('./functions/middleware');

// for querying database
const { Op } = require("sequelize");
const {DataModels} = require('./database/database');
const {dateParser} = require('./functions/dateParser');

// for handling validation errors
const {ValidationError} = require('sequelize');
const {getTaskStatus, getTaskFromObject, getSubTaskFromObject} = require('./functions/objectParser');

// twilio library initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function initializeDatabaseModels(){
    await DataModels.user.sequelize.sync();
    await DataModels.task.sequelize.sync();
    await DataModels.subtask.sequelize.sync();
}

// TODO: Create app and add middlewares
var app = express();
app.use(express.json());
app.use(cookieParser());
app.use(Authenticate);

// for security reasons. data can't be passed through url
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    console.table(req.user);
    res.send("Access granted");
});

app.post("/createTask", (req, res) => {
    let date = dateParser.parseDate_normal_to_sequel(req.body.due_date);
    
    DataModels.task.create({
        user_id: req.user.id,
        title: req.body.title,
        description: req.body.description,
        due_date: date,
        priority: getTaskStatus(date),
    }).then(arg => res.json(getTaskFromObject(arg)))
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(");
    });
});

app.post("/updateTask", async (req, res) => {
    let id = req.query.id;

    if(id === undefined){
        res.status(404).send("Id field is empty");
        return;
    }

    let confirm = await DataModels.task.findOne({where: {
        id: id, user_id: req.user.id
    }});

    if(!confirm){
        res.status(403).send("Either that task doesn't exist or you don't have the permission to update that task");
        return;
    }
   
    if(req.body.status){
        if(req.body.status == "TODO"){
            await DataModels.subtask.update({status: 0},{
                where: { task_id: id }
            });
            await DataModels.task.update(
                req.body.due_date ? {
                    due_date: dateParser.parseDate_normal_to_sequel(req.body.due_date),
                    status: "TODO",
                    priority: getTaskStatus(dateParser.parseDate_normal_to_sequel(req.body.due_date))
                } : {status: "TODO"},{
                where: { id: id }
            });
            res.status(200).send("Task updated"); return;
        }
        if(req.body.status == "DONE"){
            await DataModels.subtask.update({status: 1},{
                where: { task_id: id }
            });
            await DataModels.task.update(
                req.body.due_date ? {
                    due_date: dateParser.parseDate_normal_to_sequel(req.body.due_date),
                    status: "DONE",
                    priority: getTaskStatus(dateParser.parseDate_normal_to_sequel(req.body.due_date))
                } : {status: "DONE"},{
                where: { id: id }
            });
            res.status(200).send("Task updated"); return;
        } else res.status(403).send("Only TODO and DONE acceptable"); return;
    }
    else if (req.body.due_date) {
        await DataModels.task.update({
            due_date: dateParser.parseDate_normal_to_sequel(req.body.due_date),
            priority: getTaskStatus(dateParser.parseDate_normal_to_sequel(req.body.due_date))
        },{where: {id: id}});
        res.status(200).send("Task updated"); return;
    }else res.status(404).send("Please provide a valid payload");
});

app.post('/createSubTask', async (req, res) => {
    let id = req.query.task_id;

    if(id === undefined){
        res.status(404).send("Task Id field is empty");
        return;
    }

    let confirm = await DataModels.task.findOne({where: {
        id: id, user_id: req.user.id
    }});

    if(!confirm){
        res.status(403).send("Either that task doesn't exist or you don't have the permission to add subtask in that task");
        return;
    }

    DataModels.subtask.create({task_id: id})
    .then(arg => res.json(getSubTaskFromObject(arg)))
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(");
    });
});

app.get('/getAllSubTasks', async (req, res) => {
    let task_id = req.query.task_id;
    
    if(task_id !== undefined){
        let confirm = await DataModels.task.findOne({where: {
            id: task_id, user_id: req.user.id
        }});
    
        if(!confirm){
            res.status(403).send("Either that task doesn't exist or you don't have the permission to access that task");
            return;
        }

        DataModels.subtask.findAll({
            where: {task_id: task_id}
        }).then(arg => res.json(Array.from(arg, e => getSubTaskFromObject(e))))
        .catch(err => console.error(err));
    }else{
        DataModels.task.findAll({
            where: {user_id: req.user.id},
            attributes: {exclude: ['status', 'due_date', 'title', 'description', 'priority', 'createdAt', 'deletedAt', 'updatedAt']},
            include: [DataModels.subtask]
        }).then(arg => {
            let subtasks = [];
            for(let i = 0; i < arg.length; i++){
                for(let j = 0; j < arg[i].subTasks.length; j++) subtasks.push(getSubTaskFromObject(arg[i].subTasks[j]));
            }
            res.json(subtasks);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("There was an error :(");
        });
    }
});

app.post('/deleteSubTask', async (req, res) => {
    let subtask_id = req.query.subtask_id;
    
    if(subtask_id === undefined){
        res.status(404).send("Sub task Id field is empty");
        return;
    }
    
    let confirm = await DataModels.subtask.findOne({
        where: {id: subtask_id},
        attributes: {
            exclude: ['status', 'created_at', 'deleted_at', 'updated_at']
        }
    });

    if(!confirm){
        res.status(404).send("Subtask doesn't exist");
        return;
    }

    confirm = await DataModels.task.findOne({
        where: {id: confirm.dataValues.task_id, user_id: req.user.id},
        attributes: {exclude: ['status', 'due_date', 'title', 'description', 'priority', 'createdAt', 'deletedAt', 'updatedAt']},
    });

    if(!confirm){
        res.status(403).send("You don't have the permission to delete that task");
        return;
    }
    
    DataModels.subtask.destroy(
        {where: {id: subtask_id}}
    ).then(() => res.send("Subtask deleted"))
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(");
    });
});

app.post('/updateSubTask', async (req, res) => {
    let subtask_id = req.query.subtask_id;
    let status = req.body.status;

    if(status === undefined){
        res.status(404).send("Status field not present in payload");
        return;
    }

    if(subtask_id === undefined){
        res.status(404).send("Sub task Id field is empty");
        return;
    }
    
    let confirm = await DataModels.subtask.findOne({
        where: {id: subtask_id},
        attributes: {
            exclude: ['status', 'created_at', 'deleted_at', 'updated_at']
        }
    });

    if(!confirm){
        res.status(404).send("Subtask doesn't exist");
        return;
    }

    confirm = await DataModels.task.findOne({
        where: {id: confirm.dataValues.task_id, user_id: req.user.id},
        attributes: {exclude: ['status', 'due_date', 'title', 'description', 'priority', 'createdAt', 'deletedAt', 'updatedAt']},
    });

    if(!confirm){
        res.status(403).send("You don't have the permission to update that task");
        return;
    }
    
    DataModels.subtask.update(
        {status: status},
        {where: {id: subtask_id}}
    ).then(() => res.send("Subtask updated"))
    .catch(err => {
        if(err instanceof ValidationError) res.send(err.errors[0].message);
        else{
            console.error(err);
            res.status(500).send("There was an error :(");
        }
    });
});

app.post('/deleteTask', async (req, res) => {
    let id = req.query.task_id;
    
    if(id === undefined){
        res.status(404).send("Task Id field is empty");
        return;
    }

    let confirm = await DataModels.task.findOne({where: {
        id: id, user_id: req.user.id
    }});

    if(!confirm){
        res.status(403).send("Either that task doesn't exist or you don't have the permission to add subtask in that task");
        return;
    }

    // delete the subtasks first
    await DataModels.subtask.destroy({where: {task_id: id}});

    DataModels.task.destroy({where: {id: id}})
    .then(() => res.send("Task deleted"))
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(");
    });
});

app.get('/updateTaskPriority', async (req, res) => {
    await DataModels.task.update({priority: 0}, {where: {due_date: {[Op.lte]: dateParser.getTodaysDate(0)}}});
    await DataModels.task.update({priority: 1}, {where: {due_date: {[Op.between]: [dateParser.getTodaysDate(1), dateParser.getTodaysDate(2)]}}});
    await DataModels.task.update({priority: 2}, {where: {due_date: {[Op.between]: [dateParser.getTodaysDate(3), dateParser.getTodaysDate(4)]}}});
    await DataModels.task.update({priority: 3}, {where: {due_date: {[Op.gte]: dateParser.getTodaysDate(5)}}});

    return res.sendStatus(200);
});

app.get('/getAllTasks', (req, res) => {
    let priority = req.query.priority;
    let current_date = req.query.current_date;
    let later_than = req.query.later_than;
    let earlier_than = req.query.earlier_than;

    let queries = [];
    if(priority !== undefined) queries.push({priority: priority});
    if(current_date !== undefined) queries.push({due_date: dateParser.string_to_date(current_date)});
    if(later_than !== undefined) queries.push({due_date: {[Op.gt]: dateParser.string_to_date(later_than)}});
    if(earlier_than !== undefined) queries.push({due_date: {[Op.lt]: dateParser.string_to_date(earlier_than)}});

    if(queries.length == 0) DataModels.task.findAll({
        where: {user_id: req.user.id}
    }).then(arg => res.json(Array.from(arg, e => getTaskFromObject(e))))
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(")
    });

    else DataModels.task.findAll({
        where: {user_id: req.user.id, [Op.and]: queries}
    }).then(arg => res.json(Array.from(arg, e => getTaskFromObject(e))))
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(")
    });
});

// get the phone numbers of users with tasks of priority 0 and still in TODO or IN_PROGRESS status
app.get('/getAllDueTasks', async (req, res) => {
    let users = await DataModels.task.findAll({
        where:{
            priority: 0,
            status: {[Op.in]: [["TODO", "IN_PROGRESS"]]}
        },
        attributes: {
            include: ['user_id'],
            exclude: ['title', 'description','due_date','createdAt','updatedAt','deletedAt']
        }
    });
    users = Array.from(users, e => e.dataValues.user_id);
    users = Array.from(new Set(users));
    
    // get all phone numbers of those users whose tasks are pending
    DataModels.user.findAll({
        where:{id: {[Op.in]: users}},
        order: [['priority', 'ASC']]
    }).then(arg => {
        res.sendStatus(200);
        let phone_numbers = Array.from(arg, e => e.dataValues.phone_number);
        phone_numbers.forEach(async number => {

            // call each of the numbers
            await client.calls.create({
                to: `+91${number}`,
                from: "+19497103012",
                twiml: "<Response><Say>Kindly complete your pending tasks</Say></Response>"
            });

        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("There was an error :(");
    });
});

const PORT = process.env.PORT || 8000;
initializeDatabaseModels().
then(app.listen(PORT, () => console.info(`App running on port ${PORT}`)))
.catch(err => console.error(err));
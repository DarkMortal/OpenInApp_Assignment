const {dateParser} = require('./dateParser');

function getTaskStatus(date_string){
    let diffTime = (new Date(date_string) - Date.now());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let priority = 0;
    if (diffDays == 1 || diffDays == 2) priority = 1;
    if (diffDays == 3 || diffDays == 4) priority = 2;
    if (diffDays >= 5) priority = 3;

    return priority;
}

function getTaskFromObject(task_response){
    let json_data = task_response.dataValues;
    json_data.due_date = dateParser.parseDate_sequel_to_normal(json_data.due_date);
    delete json_data.updatedAt;
    delete json_data.createdAt;
    return json_data;
}

function getSubTaskFromObject(task_response){
    let json_data = task_response.dataValues;
    delete json_data.deleted_at;
    json_data.updated_at = dateParser.parse_timestamp(json_data.updated_at);
    json_data.created_at = dateParser.parse_timestamp(json_data.created_at);
    return json_data;
}

module.exports.getTaskStatus = getTaskStatus;
module.exports.getTaskFromObject = getTaskFromObject;
module.exports.getSubTaskFromObject = getSubTaskFromObject;
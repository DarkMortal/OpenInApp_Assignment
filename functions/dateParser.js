function parseDate_normal_to_sequel(date_string){
    let [dd, MM, YYYY] = date_string.split("-");
    return `${YYYY}-${MM}-${dd}`;
}

function parseDate_sequel_to_normal(date_string){
    let [YYYY, MM, dd] = date_string.split("-");
    return `${dd}-${MM}-${YYYY}`;
}

let parse_timestamp = (date_object) => [date_object.getDate(), date_object.getMonth() + 1, date_object.getFullYear()].join("-");

function getTodaysDate(numOfDays){
    let date = new Date();
    date.setDate(date.getDate() + numOfDays);
    return date; //`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function string_to_date(date_string){
    let [dd, MM, YYYY] = Array.from(date_string.split('-'), e => parseInt(e));
    return new Date(YYYY, MM, dd);
}

module.exports.dateParser = {
    parseDate_normal_to_sequel,
    parseDate_sequel_to_normal,
    parse_timestamp, getTodaysDate, string_to_date
};
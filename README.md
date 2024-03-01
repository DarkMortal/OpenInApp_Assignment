# OpenInApp Assignment
<!--
## First things first
Date format to be used: ```dd-MM-YYYY```<br/>
To see which process running on a particular port (example: 8000)

    fuser 8000/tcp
Kill that process

    fuser -k 8000/tcp
Read, write and execute permissions for the cronjob script

    chmod +rwx ./cronjob_1.sh
Start cron service

    service cron start
Stop cron service

    service cron stop
Crontab for updating task priorities

    # for updating task priorities (will run at 4pm everyday)
    0 16 * * * /usr/bin/sh /home/saptarshi-dey/Documents/OpenInApp/cronjob_1.sh
    
    # for alerting user about their pending tasks (will run at 7:30 am everyday)
    30 7 * * * /usr/bin/sh /home/saptarshi-dey/Documents/OpenInApp/cronjob_2.sh
-->
# Entity Rlation Diagram
![Entity Rlation Diagram](https://github.com/DarkMortal/OpenInApp_Assignment/assets/67017303/39981117-1228-40ee-a7d2-44af9e397dfd)
# Documentation
The JWT AuthHeader needs to be passed everytime a user makes a call to the API
- ```/createTask```
    - Request Type: POST
    - Payload should contain the following fields:
        - **title** (STRING): Title of the task
        - **description** (STRING): Description of the task
        - **due_date** STRING: Due date in (dd/MM/YYY) format
    - Returns the newly created Task object
- ```/updateTask```
    - Request Type: POST
    - URL Parameter(s):
        - **id**: Id of the task to be updated (INTEGER)
    - The following fields can be passed in the payload:
        - **due_date** (STRING): Due date in (dd/MM/YYY) format
        - **status** (STRING): Has to be either "TODO" or "DONE"
- ```/createSubTask```
    - Request Type: POST
    - URL Parameter(s):
        - **task_id** (INTEGER): Task Id of the task under which the subtask will be created
- ```/updateSubTask```
    - Request Type: POST
    - URL Parameter(s):
        - **subtask_id** (INTEGER): Subtask Id of the subtask which needs to be updated
    - The following fields needs to be passed in the payload:
        - **status** (INTEGER): Can be either 0 or 1
- ```/getAllTasks```
    - Request Type: GET
    - URL Parameter(s) (optional):
        - **priority** (INTEGER): Filter by priority
        - **current_date** (STRING): Filter by due_date in (dd/MM/YYY) format
        - **earlier_than** (STRING): Filter by due_date in (dd/MM/YYY) format
        - **later_than** (STRING): Filter by due_date in (dd/MM/YYY) format
    - Returns the list of all the tasks, that matches the filters, of the user who made the request
- ```/getAllSubTasks```
    - Request Type: GET
    - URL Parameter(s) (optional):
        - **task_id** (INTEGER): Filter by task_id
    - Returns the list of all the subtasks, that matches the filters, of the user who made the request

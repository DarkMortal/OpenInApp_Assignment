# OpenInApp Assignment
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
# Entity Rlation Diagram
![Entity Rlation Diagram](https://github.com/DarkMortal/OpenInApp_Assignment/assets/67017303/39981117-1228-40ee-a7d2-44af9e397dfd)

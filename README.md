Date format: dd-MM-YYYY

To see which process running on a particular port:

    fuser PORT_NUMBER/tcp
For our example (PORT_NUMBER: 8000)

    fuser 8000/tcp
Kill that process:

    fuser -k 8000/tcp

Read, write and execute permissions for the cronjob script

    chmod +rwx ./cronjob_1.sh
Start cron service

    service cron start
Stop cron service

    service cron stop
Crontab for updating task priorities

    * * * * * /usr/bin/sh /home/saptarshi-dey/Documents/OpenInApp/cronjob_1.sh
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.KhIKFGUXgYYWcQaV2MKzmsN396R0uwMuaWcUUn3TneQ"
/usr/bin/curl --request GET http:/localhost:8000/updateTaskPriority -H "Authorization: Bearer $JWT_TOKEN"
/usr/bin/notify-send --urgency=NORMAL "Task priorities of all tasks updated"
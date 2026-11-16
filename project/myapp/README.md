Run and test:
uv run flask --app myapp run --debug
curl -X POST localhost:5000/tasks -H "Content-Type: application/json" -d '{"title": "Learn Flask"}'
curl localhost:5000/tasks

To delete from database: sqlite3 app.db "DELETE FROM task;"

As of right now, I have the main frontend code in the placeholder.html
It has not been fully completed, but I have the skeleton completed.
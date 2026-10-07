from flask import Blueprint, jsonify, request
from sqlmodel import Session, select

from .db import engine
from .models import Task

bp = Blueprint("tasks", __name__)

@bp.get("/tasks")
def list_tasks():
    with Session(engine) as session:
        tasks = session.exec(select(Task)).all()
        return jsonify([t.model_dump() for t in tasks])

@bp.post("/tasks")
def create_task():
    task = Task.model_validate(request.get_json())
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return jsonify(task.model_dump()), 201

from flask import render_template


@bp.get("/")
def home():
    return render_template("index.html")
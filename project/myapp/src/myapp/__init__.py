from flask import Flask


def create_app():
    app = Flask(__name__)

    from .db import init_db
    from .routes import bp

    init_db()
    app.register_blueprint(bp)
    return app
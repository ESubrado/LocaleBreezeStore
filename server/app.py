import os
from flask import Flask
from flask_smorest import Api

from db import db
import models  # Ensure models are imported before creating tables

from resources.store import blp as StoreBlueprint
from resources.item import blp_item as ItemBlueprint
from resources.tag import blp_tag as TagBlueprint
from resources.catalog import blp_catalog as CatalogBlueprint
from resources.product import blp_product as ProductBlueprint
from sample_data import seed_catalog_product_data

def create_app(db_url=None):

    app = Flask(__name__)

    app.config["PROPAGATE_EXCEPTIONS"] = True
    app.config["API_TITLE"] = "Locale Breeze Store REST API"
    app.config["API_VERSION"] = "v1"
    app.config["API_DESCRIPTION"] = "APIs for managing stores, items, catalogs, and products."
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"   
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url or os.getenv("DATABASE_URL", "sqlite:///data.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    api = Api(app)

    with app.app_context():
        db.create_all()
        seed_catalog_product_data()

    api.register_blueprint(ItemBlueprint)
    api.register_blueprint(StoreBlueprint)
    api.register_blueprint(TagBlueprint)
    api.register_blueprint(CatalogBlueprint)
    api.register_blueprint(ProductBlueprint)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
  

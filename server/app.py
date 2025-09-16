from flask import Flask
from flask_smorest import Api

from resources.store import blp as StoreBlueprint
from resources.item import blp_item as ItemBlueprint

app = Flask(__name__)

app.config["PROPAGATE_EXCEPTIONS"] = True
app.config["API_TITLE"] = "Locale Breeze Store REST API"
app.config["API_VERSION"] = "v1"
app.config["API_DESCRIPTION"] = "APIs for managing stores and items."
app.config["OPENAPI_VERSION"] = "3.0.3"
app.config["OPENAPI_URL_PREFIX"] = "/"
app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/" 

@app.route("/")
def home():
    return "Hello, Flask!"

api = Api(app)
api.register_blueprint(ItemBlueprint)
api.register_blueprint(StoreBlueprint)  

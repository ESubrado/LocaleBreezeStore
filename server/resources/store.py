import uuid
from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from db import stores
from schemas import StoreSchema

blp = Blueprint("Stores", __name__, description="Operations on stores")

@blp.route("/store")
class StoreList(MethodView):
    @blp.response(200, StoreSchema(many=True)) ## Serialize output
    def get(self):
        return stores.values()

    @blp.arguments(StoreSchema) ## Validate input
    @blp.response(201, StoreSchema) ## Serialize output
    def post(self, store_data):       

        ## Check if store with same name already exists
        for store in stores.values():
            if store["name"] == store_data["name"]:
                abort(400, message=f"A store already exists.")

        store_id = uuid.uuid4().hex 
        store = {**store_data, "id": store_id}
        stores[store_id] = store

        return store


@blp.route("/store/<string:store_id>")
class Store(MethodView):
    blp.response(200, StoreSchema) ## Serialize output
    def get(self, store_id):
        try:   
            return stores[store_id]
        except KeyError:
            abort(404, message="Store not found.")

    def delete(self, store_id):
        try:
            del stores[store_id]
            return {"message": "Store deleted."}
        except KeyError:
            abort(404, message="Store not found.")
import uuid
from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint, abort

from db import items
from schemas import ItemSchema, ItemUpdateSchema


blp_item = Blueprint("Items", __name__, description="Operations on items")

@blp_item.route("/item")
class ItemList(MethodView):
    @blp_item.response(200, ItemSchema(many=True)) ## Serialize output
    def get(self):
        return items.values()
    
    @blp_item.arguments(ItemSchema) ## Validate input
    @blp_item.response(201, ItemSchema) ## Serialize output
    def post(self, item_data):      
        ## Check if item with same name already exists
        for item in items.values():
            if item["name"] == item_data["name"] and item["store_id"] == item_data["store_id"]:
                abort(400, message=f"An item with the name '{item_data['name']}' already exists.")

        item_id = uuid.uuid4().hex
        item = {**item_data, "id": item_id}
        items[item_id] = item
        return item, 201


@blp_item.route("/item/<string:item_id>")
class Item(MethodView):
    @blp_item.response(200, ItemSchema) ## Serialize output
    def get(self, item_id):
        try:
            return items[item_id]
        except KeyError:
            abort(404, message="Item not found.")

    @blp_item.arguments(ItemUpdateSchema) ## Validate input    
    @blp_item.response(200, ItemSchema) ## Serialize output
    def put(self, item_data , item_id):
        try:
            item = items[item_id]
            item |= item_data  ## Update existing item with new data
            return item
        except KeyError:
            abort(404, message="Item not found.")

    def delete(self, item_id):
        try:
            del items[item_id]
            return {"message": "Item deleted."}
        except KeyError:
            abort(404, message="Item not found.")
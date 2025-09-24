import uuid
from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError

from db import db
from models import ItemModel
from schemas import ItemSchema, ItemUpdateSchema


blp_item = Blueprint("Items", __name__, description="Operations on items")

@blp_item.route("/item")
class ItemList(MethodView):
    @blp_item.response(200, ItemSchema(many=True)) ## Serialize output
    def get(self):
        return ItemModel.query.all()
    
    @blp_item.arguments(ItemSchema) ## Validate input
    @blp_item.response(201, ItemSchema) ## Serialize output
    def post(self, item_data):  
        item = ItemModel(**item_data)  
        try:
            db.session.add(item)
            db.session.commit()
        except SQLAlchemyError:
            abort(500, message="An error occurred while inserting the item.")
                    
        return item


@blp_item.route("/item/<int:item_id>")
class Item(MethodView):
    @blp_item.response(200, ItemSchema) ## Serialize output
    def get(self, item_id):
        item = ItemModel.query.get_or_404(item_id)
        return item

    @blp_item.arguments(ItemUpdateSchema) ## Validate input    
    @blp_item.response(200, ItemSchema) ## Serialize output
    def put(self, item_data , item_id):
        item = ItemModel.query.get(item_id)
        if item: ## Update existing item
            item.price = item_data["price"]
            item.name = item_data["name"]   
        else: ## Create new item
            item = ItemModel(id=item_id, **item_data)

        db.session.add(item)
        db.session.commit() 
        
        return item


    def delete(self, item_id):
        item = ItemModel.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()

        return {"message": "Item deleted."}
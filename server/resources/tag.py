from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError

from db import db
from models import TagModel, StoreModel, ItemModel
from schemas import TagSchema, TagAndItemSchema

blp_tag = Blueprint("Tags", "tags", description="Operations on tags")

@blp_tag.route("/store/<int:store_id>/tag")
class TagInStore(MethodView):
    @blp_tag.response(200, TagSchema(many=True))  # Serialize output
    def get(self, store_id):
        store = StoreModel.query.get_or_404(store_id)
        return store.tags.all()
        

    @blp_tag.arguments(TagSchema)
    @blp_tag.response(201, TagSchema)  # Serialize output
    def post(self, tag_data, store_id):   

        # if TagModel.query.filter( ## Ensure tag name is unique within the store
        #     TagModel.store_id == store_id, TagModel.name == tag_data["name"]
        # ).first():
        #     abort(400, message="A tag with that name already exists in that store.")    
        
        tag = TagModel(**tag_data, store_id=store_id)
        try:
            db.session.add(tag)
            db.session.commit()
        except SQLAlchemyError as e:
            abort(
                500, 
                message=str(e)
            )

        return tag


@blp_tag.route("/item/<string:item_id>/tag/<string:tag_id>")
class LinkTagsToItem(MethodView):
    ## Link tag to item
    @blp_tag.response(201, TagAndItemSchema)
    def post(self, item_id, tag_id):
        item = ItemModel.query.get_or_404(item_id)
        tag = TagModel.query.get_or_404(tag_id)

        if tag in item.tags:
            abort(400, message="Tag is already associated with the item.")

        item.tags.append(tag)

        try:
            db.session.add(item)
            db.session.commit()
        except SQLAlchemyError:
            abort(500, message="An error occurred while linking the tag to the item.")

        return tag

    ## Unlink tag from item
    @blp_tag.response(200, TagAndItemSchema)
    def delete(self, item_id, tag_id):
        item = ItemModel.query.get_or_404(item_id)
        tag = TagModel.query.get_or_404(tag_id)

        if tag not in item.tags:
            abort(400, message="Tag is not associated with the item.")

        item.tags.remove(tag)

        try:
            db.session.add(item)
            db.session.commit()
        except SQLAlchemyError:
            abort(500, message="An error occurred while unlinking the tag from the item.")

        return {"message": "Tag unlinked from item.", "item": item, "tag": tag}


@blp_tag.route("/tag/<int:tag_id>")
class Tag(MethodView):
    @blp_tag.response(200, TagSchema)
    def get(self, tag_id):
        tag = TagModel.query.get_or_404(tag_id)
        return tag

    # @blp_tag.arguments(TagSchema)
    # @blp_tag.response(200, TagSchema)
    # def put(self, tag_data, tag_id):
    #     tag = TagModel.query.get_or_404(tag_id)
    #     for key, value in tag_data.items():
    #         setattr(tag, key, value)
    #     db.session.commit()
    #     return tag

    ## Delete tag only if no item is tagged with it
    @blp_tag.response(
        202, 
        description="Deletes a tag if no item is tagged with it.",
        example={"message": "Tag deleted."}
    )
    @blp_tag.alt_response(404, description="Tag not found.")
    @blp_tag.alt_response(400, description="Returned if the tag is assigned to one or more items. In this case, the tag is not deleted.")
    def delete(self, tag_id):
        tag = TagModel.query.get_or_404(tag_id)

        if not tag.items:           
            db.session.delete(tag)
            db.session.commit()
            return {"message": "Tag deleted."}
        abort(400, message="Could not delete tag. Make sure tag is not associated with any items, then try again.")
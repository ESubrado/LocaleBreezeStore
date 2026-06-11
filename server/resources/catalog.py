from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError

from db import db
from models import CatalogModel
from schemas import CatalogSchema


blp_catalog = Blueprint("Catalogs", __name__, description="Operations on catalogs")


@blp_catalog.route("/catalogs")
class CatalogList(MethodView):
    @blp_catalog.response(200, CatalogSchema(many=True))
    def get(self):
        return CatalogModel.query.order_by(CatalogModel.display_order).all()

    @blp_catalog.arguments(CatalogSchema)
    @blp_catalog.response(201, CatalogSchema)
    def post(self, catalog_data):
        catalog = CatalogModel(**catalog_data)
        try:
            db.session.add(catalog)
            db.session.commit()
        except SQLAlchemyError:
            abort(500, message="An error occurred while inserting the catalog.")

        return catalog


@blp_catalog.route("/catalogs/<string:catalog_slug>")
class Catalog(MethodView):
    @blp_catalog.response(200, CatalogSchema)
    def get(self, catalog_slug):
        return CatalogModel.query.filter_by(slug=catalog_slug).first_or_404()

from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError

from db import db
from models import CatalogModel, ProductModel
from schemas import ProductSchema


blp_product = Blueprint("Products", __name__, description="Operations on products")


@blp_product.route("/products")
class ProductList(MethodView):
    @blp_product.response(200, ProductSchema(many=True))
    def get(self):
        return ProductModel.query.order_by(ProductModel.display_order).all()

    @blp_product.arguments(ProductSchema)
    @blp_product.response(201, ProductSchema)
    def post(self, product_data):
        product = ProductModel(**product_data)
        try:
            db.session.add(product)
            db.session.commit()
        except SQLAlchemyError:
            abort(500, message="An error occurred while inserting the product.")

        return product


@blp_product.route("/products/featured")
class FeaturedProductList(MethodView):
    @blp_product.response(200, ProductSchema(many=True))
    def get(self):
        return (
            ProductModel.query.filter_by(is_featured=True, is_active=True)
            .order_by(ProductModel.display_order)
            .all()
        )


@blp_product.route("/products/<string:product_slug>")
class Product(MethodView):
    @blp_product.response(200, ProductSchema)
    def get(self, product_slug):
        return ProductModel.query.filter_by(slug=product_slug).first_or_404()


@blp_product.route("/catalogs/<string:catalog_slug>/products")
class ProductsInCatalog(MethodView):
    @blp_product.response(200, ProductSchema(many=True))
    def get(self, catalog_slug):
        catalog = CatalogModel.query.filter_by(slug=catalog_slug).first_or_404()
        return catalog.products

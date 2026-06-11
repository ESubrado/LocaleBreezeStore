from db import db


class ProductModel(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(140), unique=True, nullable=False, index=True)
    sku = db.Column(db.String(64), unique=True, nullable=False, index=True)
    name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    format = db.Column(db.String(80), nullable=False)
    fulfillment_type = db.Column(db.String(32), nullable=False)
    price_amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="USD")
    image_alt = db.Column(db.Text, nullable=False)
    image_position = db.Column(db.String(32), nullable=False, default="center")
    tags = db.Column(db.JSON, nullable=False, default=list)
    stock_quantity = db.Column(db.Integer, nullable=True)
    is_featured = db.Column(db.Boolean, nullable=False, default=False)
    is_sample = db.Column(db.Boolean, nullable=False, default=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    catalog_id = db.Column(
        db.Integer, db.ForeignKey("catalogs.id", ondelete="CASCADE"), nullable=False
    )
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, server_default=db.func.now()
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    catalog = db.relationship("CatalogModel", back_populates="products")

    __table_args__ = (
        db.CheckConstraint("price_amount >= 0", name="ck_products_price_non_negative"),
        db.CheckConstraint(
            "stock_quantity IS NULL OR stock_quantity >= 0",
            name="ck_products_stock_quantity_non_negative",
        ),
    )

    @property
    def price(self):
        if self.currency == "USD":
            return f"${self.price_amount:.2f}"
        return f"{self.currency} {self.price_amount:.2f}"

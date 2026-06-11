from db import db


class CatalogModel(db.Model):
    __tablename__ = "catalogs"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    sample_item_count = db.Column(db.Integer, nullable=False, default=0)
    image_alt = db.Column(db.Text, nullable=False)
    image_position = db.Column(db.String(32), nullable=False, default="center")
    examples = db.Column(db.JSON, nullable=False, default=list)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, server_default=db.func.now()
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    products = db.relationship(
        "ProductModel",
        back_populates="catalog",
        cascade="all, delete-orphan",
        order_by="ProductModel.display_order",
    )

    __table_args__ = (
        db.CheckConstraint(
            "sample_item_count >= 0",
            name="ck_catalogs_sample_item_count_non_negative",
        ),
    )

    @property
    def count_label(self):
        suffix = "item" if self.sample_item_count == 1 else "items"
        return f"{self.sample_item_count} sample {suffix}"

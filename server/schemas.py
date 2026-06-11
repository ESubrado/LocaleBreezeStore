from marshmallow import Schema, fields

class PlainItemSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    price = fields.Float(required=True)

class PlainStoreSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)


class PlainTagSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    

class ItemUpdateSchema(Schema):
    name = fields.Str()
    price = fields.Float() 
    store_id = fields.Int()


class ItemSchema(PlainItemSchema):
    store_id = fields.Int(required=True, load_only=True)
    store = fields.Nested(PlainStoreSchema(), dump_only=True)
    tags = fields.List(fields.Nested(PlainTagSchema()), dump_only=True)


class StoreSchema(PlainStoreSchema):
    items = fields.List(fields.Nested(PlainItemSchema(), dump_only=True))
    tags = fields.List(fields.Nested(PlainTagSchema(), dump_only=True))

class TagSchema(PlainTagSchema):
    store_id = fields.Int(load_only=True)   
    store = fields.Nested(PlainStoreSchema(), dump_only=True)
    items = fields.List(fields.Nested(PlainItemSchema()), dump_only=True)

class TagAndItemSchema(Schema):
    message = fields.Str()
    item = fields.Nested(ItemSchema())
    tag = fields.Nested(TagSchema())


class PlainCatalogSchema(Schema):
    id = fields.Int(dump_only=True)
    slug = fields.Str(required=True)
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    sample_item_count = fields.Int(required=True)
    count_label = fields.Str(dump_only=True)
    image_alt = fields.Str(required=True)
    image_position = fields.Str(load_default="center")
    examples = fields.List(fields.Str(), load_default=list)
    display_order = fields.Int(load_default=0)
    is_active = fields.Bool(load_default=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class PlainProductSchema(Schema):
    id = fields.Int(dump_only=True)
    slug = fields.Str(required=True)
    sku = fields.Str(required=True)
    name = fields.Str(required=True)
    category = fields.Str(required=True)
    description = fields.Str(required=True)
    format = fields.Str(required=True)
    fulfillment_type = fields.Str(required=True)
    price_amount = fields.Decimal(required=True, as_string=True, places=2)
    price = fields.Str(dump_only=True)
    currency = fields.Str(load_default="USD")
    image_alt = fields.Str(required=True)
    image_position = fields.Str(load_default="center")
    tags = fields.List(fields.Str(), load_default=list)
    stock_quantity = fields.Int(allow_none=True, load_default=None)
    is_featured = fields.Bool(load_default=False)
    is_sample = fields.Bool(load_default=True)
    is_active = fields.Bool(load_default=True)
    display_order = fields.Int(load_default=0)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CatalogSchema(PlainCatalogSchema):
    products = fields.List(fields.Nested(PlainProductSchema()), dump_only=True)


class ProductSchema(PlainProductSchema):
    catalog_id = fields.Int(required=True, load_only=True)
    catalog = fields.Nested(PlainCatalogSchema(), dump_only=True)


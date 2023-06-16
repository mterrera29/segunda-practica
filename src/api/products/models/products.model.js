import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null);

const collection = 'products';

const schema = new mongoose.Schema({
    id: Number,
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    category:{ type: String, required: true },
    thumbnail:[{ type: String, required: false }]
});
schema.plugin(mongoosePaginate)
const productModel = mongoose.model(collection, schema);

export default productModel;
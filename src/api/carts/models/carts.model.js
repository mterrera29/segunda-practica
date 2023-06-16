import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const collection = 'carts';

mongoose.pluralize(null)

const schema = new mongoose.Schema({
    id: Number,
    products: {
        type:[
               {
                product:
                       {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "products"
                    },
                quantity: Number
                
               }
            ],
        default:[]
    }
});
schema.plugin(mongoosePaginate)

const cartModel = mongoose.model(collection, schema);

export default cartModel;
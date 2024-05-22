const mongoose = require('mongoose');
require('../config');


const AddproductsShema = new mongoose.Schema({
    productcategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'designs',
        // required:true
    },
    designtopic:{
        type:String,
        required:true,
        
    },
    finishing:{
        type:String,
        required:true,
    },
    size:{
        type:String,
        required:true,
    },
    productimage:{
        type:String,
        required:true
    },
    productstatus:{
        type:Boolean,
        required:true,
        default:true
    }
});

const Products = mongoose.model('products',AddproductsShema);
module.exports = Products;



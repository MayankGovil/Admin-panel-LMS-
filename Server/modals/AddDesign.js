const mongoose = require('mongoose');
require('../config');

const AddDesignSchema = new mongoose.Schema({
    designname:{
        type:String,
        required:true,
        unique:true
    },
    designprice :{
        type:Number,
        required:true,
        min:500,
        max:40000
    },
    designdescription:{
        type:String,
        required:true,
    },
    designstatus:{
        type:Boolean,
        required:true,
        default:true
    }
});

const Design =  mongoose.model('designs',AddDesignSchema);
module.exports = Design;
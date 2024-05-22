const mongoose = require('mongoose');
require('../config');
const AddSliderShema = new mongoose.Schema({
    slidername:{
        type:String,
        required:true
    },
    
    slidersubheading:{
        type:String,
        required:true
    },
    sliderdecription:{
        type:String,
        required:true,
    },
    sliderimage:{
        type:String,
        required:true
    },
    slidertatus:{
        type:Boolean,
        required:true,
        default:true
    }
});

const Slider = mongoose.model('sliders',AddSliderShema);
module.exports = Slider;
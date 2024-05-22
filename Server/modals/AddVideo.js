const mongoose = require('mongoose');
require('../config');


const AddviedoShema = new mongoose.Schema({
    coursecategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'courses',
        // required:true
    },
    videotopic:{
        type:String,
        required:true,
        
    },
    videourl:{
        type:String,
        required:true,
    },
    videostatus:{
        type:Boolean,
        required:true,
        default:true
    }
});

const Video = mongoose.model('videos',AddviedoShema);
module.exports = Video;



const mongoose = require('mongoose');
require('../config');

const AddcourseShema = new mongoose.Schema({
    coursename:{
        type:String,
        required:true
    },
    courseprice:{
        type:Number,
        required:true,
        min:500,
        max:40000
    },
    courseduration:{
        type:String,
        required:true
    },
    coursedecription:{
        type:String,
        required:true,
    },
    courseimage:{
        type:String,
        required:true
    },
    coursestatus:{
        type:Boolean,
        required:true,
        default:true
    }
});

const Course = mongoose.model('courses',AddcourseShema);
module.exports = Course;
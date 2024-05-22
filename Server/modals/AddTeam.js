const mongoose = require('mongoose');
require('../config');

const AddTeamSchema= new mongoose.Schema({
    membername:{
        type: String,
        require:true,
    },
    membercategory:{
        type: String,
        require:true,
    },
    memberimage:{
        type: String,
        require:true,
    },
    memberstatus:{
        type:Boolean,
        required:true,
        default:true
    }
});
const Team = mongoose.model('teams',AddTeamSchema);
module.exports = Team;
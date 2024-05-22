const mongoose = require('mongoose');

const adminData = new mongoose.Schema({
    username:{
        type: 'string',
        unique: true,
        required: true,
    },password:{
        type: 'string',
        required: true,
    }
});
const Admin =  mongoose.model('admins', adminData);


module.exports = Admin;
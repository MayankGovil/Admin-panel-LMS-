const mongoose = require('mongoose');
require('../config');

const CardSchema = new mongoose.Schema({
    mainHeading: {
        type: String,
        required: true,
    },
    subHeading: {
        type: String,
        required: true,
    },
    cardImage: {
        type: String,
        required: true,
    },
    cardStatus: {
        type: Boolean,
        required: true,
        default: true
    }
});

const Card = mongoose.model('cards', CardSchema);

module.exports = Card;

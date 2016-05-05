/**
 * Created by Giga on 5/5/2016.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/lms');

var schema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    year:  { type: Number, min: 0 },
    comment: String,
    room: { type: Number, min: 0 },
    shelf: { type: Number, min: 0 },
    rating: [],
    currRating:  { type: Number, min: 0, max: 10 },
    quantity: String,
    taken: String
});

module.exports = mongoose.model('Book', schema);
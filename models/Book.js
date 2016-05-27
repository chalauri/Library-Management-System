var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    year:  { type: Number, min: 0 },
    comment: String,
    room: { type: Number, min: 0 },
    shelf: { type: Number, min: 0 },
    currRating:  { type: Number, min: 0, max: 10 },
    voteCount : { type: Number, min: 0 },
    quantity: String,
    taken: { type: Number, min: 0 },
    readers : [{
        name: String,
        surname: String,
        personalNo: String,
        mobile: String,
        takeDate: Date,
        takeOperationCode: String
    }]
});

module.exports = mongoose.model('Book', schema);
/**
 * Created by Giga on 5/6/2016.
 */
var mongoose = require('mongoose');



var schema = new mongoose.Schema({
    name: String,
    surname: String,
    personalNo: String,
    phone: String,
    mail: String,
    address: String,
    username: String,
    password: String
});


module.exports = mongoose.model('User', schema);
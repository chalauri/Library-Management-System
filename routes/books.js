/**
 * Created by Giga on 5/3/2016.
 */
var express = require('express');
var router = express.Router();

/*Constructor Of Book*/
function Book(name){
    this.name = name;
}

var books = [];
var book1 = new Book('Book1');
var book2 = new Book('Book2');
var book3 = new Book('Book3');

books.push(book1,book2,book3);


/* GET users listing. */
router.get('/list', function(req, res, next) {
    res.send(books);
});

module.exports = router;

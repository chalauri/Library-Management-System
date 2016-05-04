/**
 * Created by Giga on 5/3/2016.
 */
var express = require('express');
var router = express.Router();

/*Constructor Of Book*/
function Book(title, author, isbn, year, comment, room, shelf) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.year = year;
    this.comment = comment;
    this.room = room;
    this.shelf = shelf;
    this.rating = [];
    this.currRating = 0;
}

var books = [];
var nodeByExamples = new Book('Node.js By Example', 'Krasimir Tsonev', '978-1-78439-571-1', 2015, '', 1, 1);
var spring = new Book('Spring In Action 4th', 'Craig Walls', '9781617291203', 2015, '', 1, 2);
var beginningNodeJs = new Book('Beginning Node.Js', 'Basarat Ali Syed', 2015, '', '', 1, 3);

books.push(nodeByExamples, spring, beginningNodeJs);


/* GET users listing. */
router.get('/list', function (req, res, next) {
    res.send(books);
});


router.post('/add', function (req, res, next) {
    var tempBook = req.body;
    var tempRoom = tempBook.room;
    var tempShelf = tempBook.shelf;

    if (!checkPlace(tempRoom, tempShelf)) {
        res.send("Place Is Not Available");
        return;
    }

    var tempISBN = tempBook.isbn;
    if (!checkISBN(tempISBN)) {
        res.send("ISBN IS NOT UNIQUE");
        return;
    }

    books.push(tempBook);
    res.send(books);
});


router.post('/addRating', function (req, res, next) {
    var isbn = req.body.book.isbn;
    var grade = req.body.grade;

    var book = getBookByISBN(isbn);

    if(grade < 0 || grade > 10){
        res.writeHead(400, "ILLEGAL GRADE", {'content-type' : 'application/json'});
        res.end("ILLEGAL GRADE");
        return;
    }

    if(book == null){
        res.writeHead(400, "ILLEGAL BOOK", {'content-type' : 'application/json'});
        res.end("ILLEGAL BOOK");
        return;
    }

    rating = book.rating;
    rating.push(grade);
    var currRating = 0;
    var sum = 0;
    for(var i = 0; i < rating.length; i++) {
        sum += rating[i];
    }
    currRating = sum / rating.length;
    book.currRating = currRating;

    res.send(books);
});


function checkPlace(tempRoom, tempShelf) {

    var result = true;
    books.forEach(function (item) {
        if (item.room == tempRoom && item.shelf == tempShelf) {
            result = false;
        }
    });

    return result;
}

function checkISBN(tempISBN) {

    var result = true;
    books.forEach(function (item) {
        if (item.isbn == tempISBN) {
            result = false;
        }
    });

    return result;
}

function getBookByISBN(tempISBN) {

    for(var i = 0; i < books.length; i++){
        if(books[i].isbn == tempISBN){
            return books[i];
        }
    }

    return null;
}


module.exports = router;

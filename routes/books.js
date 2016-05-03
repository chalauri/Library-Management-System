/**
 * Created by Giga on 5/3/2016.
 */
var express = require('express');
var router = express.Router();

/*Constructor Of Book*/
function Book(title,author,isbn,year,comment,room,shelf) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.year = year;
    this.comment = comment;
    this.room = room;
    this.shelf = shelf;
    this.rating = [];
}

var books = [];
var nodeByExamples = new Book('Node.js By Example','Krasimir Tsonev','978-1-78439-571-1',2015,'',1,1);
var spring = new Book('Spring In Action 4th', 'Craig Walls','9781617291203',2015,'',1,2 );
var beginningNodeJs = new Book('Beginning Node.Js', 'Basarat Ali Syed',2015,'','',1,3);

books.push(nodeByExamples, spring, beginningNodeJs);


/* GET users listing. */
router.get('/list', function (req, res, next) {
    res.send(books);
});


router.post('/add', function (req, res, next) {
    var tempBook = req.body;
    var tempRoom = tempBook.room;
    var tempShelf = tempBook.shelf;

    if(!checkPlace(tempRoom,tempShelf)){
        res.send("Place Is Not Available");
        return;
    }

    books.push(tempBook);
    res.send(books);
});

function checkPlace(tempRoom,tempShelf){

    var result = true;
    books.forEach(function (item) {
        if(item.room == tempRoom && item.shelf == tempShelf ) {
            result =  false;
        }
    });

    return result;
}

module.exports = router;

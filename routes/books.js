/**
 * Created by Giga on 5/3/2016.
 */
var express = require('express');
var router = express.Router();

var Book = require('../models/Book');


function getBooks(req, res, next) {
    Book.find({}, function (err, books) {
        if (err) return next(err);
        res.send(books);
    });
}

router.get('/list', getBooks);


router.post('/add', function (req, res, next) {
    var tempBook = req.body;
    var tempRoom = tempBook.room;
    var tempShelf = tempBook.shelf;
    var tempISBN = tempBook.isbn;
    var quantity = tempBook.quantity;
    tempBook.taken = 0;

    if (quantity <= 0) {
        res.writeHead(400, "Books quantity in library must be more than 0", {'content-type': 'application/json'});
        res.end("Books quantity in library must be more than 0");
        return;
    }

    Book.find({
        isbn: tempISBN
    }, function (err, books) {
        if (books.length) {
            res.writeHead(400, "ISBN IS NOT UNIQUE", {'content-type': 'application/json'});
            res.end("ISBN IS NOT UNIQUE");
        } else {
            Book.find({
                shelf: tempShelf,
                room: tempRoom
            }, function (err, books) {
                if (books.length) {
                    res.writeHead(400, "Place Is Not Available", {'content-type': 'application/json'});
                    res.end("Place Is Not Available");
                } else {
                    Book.create(tempBook, function (err) {
                        if (err) return next(err);
                    });

                    getBooks(req, res, next);
                }
            });
        }
    });
});

router.post('/edit', function (req, res, next) {
    var tempBook = req.body;
    var tempRoom = tempBook.room;
    var tempShelf = tempBook.shelf;
    var quantity = tempBook.quantity;
    var tempISBN = tempBook.isbn;


    if (quantity <= 0) {
        res.writeHead(400, "Books quantity in library must be more than 0", {'content-type': 'application/json'});
        res.end("Books quantity in library must be more than 0");
        return;
    }

    Book.findOne({
        isbn: tempISBN
    }, function (err, book) {
        if (book == null) {
            res.writeHead(400, "Illegal Argument.", {'content-type': 'application/json'});
            res.end("Illegal Argument.");
        } else {
            if (tempShelf == book.shelf && tempRoom == book.room) {
                Book.update(tempBook, function (err) {
                    if (err) return next(err);
                });

                getBooks(req, res, next);
            } else {
                Book.find({
                    shelf: tempShelf,
                    room: tempRoom
                }, function (err, books) {
                    if (books.length) {
                        res.writeHead(400, "Place Is Not Available", {'content-type': 'application/json'});
                        res.end("Place Is Not Available");
                    } else {
                        Book.update(tempBook, function (err) {
                            if (err) return next(err);
                        });

                        getBooks(req, res, next);
                    }
                });
            }
        }
    });
});


router.get('/remove', function (req, res, next) {
    var tempISBN = req.query.isbn;

    Book.findOne({
        isbn: tempISBN
    }, function (err, book) {
        if (book == null) {
            res.writeHead(400, "Illegal Argument.", {'content-type': 'application/json'});
            res.end("Illegal Argument.");
        } else {
            Book.remove(book, function (err) {
                if (err) return next(err);
            });

            getBooks(req, res, next);
        }
    });

});


router.post('/addRating', function (req, res, next) {
    var tempISBN = req.body.book.isbn;
    var grade = req.body.grade;

    if (grade < 0 || grade > 10) {
        res.writeHead(400, "ILLEGAL GRADE", {'content-type': 'application/json'});
        res.end("ILLEGAL GRADE");
        return;
    } else {
        Book.findOne({
            isbn: tempISBN
        }, function (err, book) {
            if (err) return new Error("Error occuered");

            rating = book.rating;
            rating.push(grade);
            var currRating = 0;
            var sum = 0;
            for (var i = 0; i < rating.length; i++) {
                sum += rating[i];
            }
            currRating = sum / rating.length;
            book.currRating = currRating;

            Book.update(book, function (error, book) {
                if (error) return next(error);

                res.send(book);
            });
        })
    }

    /*
     Book.find({
     isbn: isbn
     }, function (err, books) {
     if (books.length) {
     for (var i = 0; i < books.length; i++) {
     rating = books[i].rating;
     rating.push(grade);
     var currRating = 0;
     var sum = 0;
     for (var j = 0; j < rating.length; j++) {
     sum += rating[i];
     }
     currRating = sum / rating.length;
     books[i].currRating = currRating;
     }

     books.save(function (err) {
     if (err)
     console.log('error')
     else
     console.log('success')
     });
     } else {
     res.writeHead(400, "ILLEGAL ISBN", {'content-type': 'application/json'});
     res.end("ILLEGAL ISBN");
     }
     });
     */

    /*
     var book = getBookByISBN(isbn);

     if (grade < 0 || grade > 10) {
     res.writeHead(400, "ILLEGAL GRADE", {'content-type': 'application/json'});
     res.end("ILLEGAL GRADE");
     return;
     }

     if (book == null) {
     res.writeHead(400, "ILLEGAL BOOK", {'content-type': 'application/json'});
     res.end("ILLEGAL BOOK");
     return;
     }

     rating = book.rating;
     rating.push(grade);
     var currRating = 0;
     var sum = 0;
     for (var i = 0; i < rating.length; i++) {
     sum += rating[i];
     }
     currRating = sum / rating.length;
     book.currRating = currRating;

     res.send(books);

     */
});


module.exports = router;


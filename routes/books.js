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

router.get('/get', function (req, res) {
    Book.findById(req.query.id, function (err, book) {
        res.send(book)
    })
});


router.post('/add', function (req, res, next) {
    var tempBook = req.body;
    var tempRoom = tempBook.room;
    var tempShelf = tempBook.shelf;
    var tempISBN = tempBook.isbn;
    var quantity = tempBook.quantity;
    tempBook.taken = 0;
    tempBook.readers = [];

    if (quantity <= 0) {
        res.writeHead(400, "Books quantity in library must be more than 0", {'content-type': 'application/json'});
        res.end({"message": "წიგნების რაოდენობა უნდა იყოს 0-ზე მეტი"});
        return;
    }

    Book.findOne({
        isbn: tempISBN
    }, function (err, book) {
        if (book != null) {
            //       res.writeHead(400, "ISBN IS NOT UNIQUE", {'content-type': 'application/json'});
            //       res.end("ISBN IS NOT UNIQUE");

            book.title = req.body.title;
            book.author = req.body.author;
            book.year = req.body.year;
            book.room = req.body.room;
            book.shelf = req.body.shelf;
            book.quantity = req.body.quantity;
            book.readers = req.body.readers;

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
                        Book.update(book, function (err) {
                            if (err) return next(err);
                        });

                        getBooks(req, res, next);
                    }
                });
            }
        } else {
            Book.find({
                shelf: tempShelf,
                room: tempRoom
            }, function (err, books) {
                if (books.length) {
                    res.writeHead(400, "Place Is Not Available", {'content-type': 'application/json'});
                    res.end({"message": "მითითებული ადგილი დაკავებულია!"});
                } else {
                    tempBook.voteCount = 0;
                    tempBook.currRating = 0;
                    Book.create(tempBook, function (err) {
                        if (err) return next(err);
                    });

                    getBooks(req, res, next);
                }
            });
        }
    });
});

router.post('/remove', function (req, res, next) {
    var tempISBN = req.body.isbn;

    Book.findOne({
        isbn: tempISBN
    }, function (err, book) {
        if (book == null) {
            res.writeHead(400, "Illegal Argument.", {'content-type': 'application/json'});
            res.end({"message": "არასწორი პარამეტრი !"});
        } else {
            Book.remove(book, function (err) {
                if (err) return next(err);
            });

            getBooks(req, res, next);
        }
    });

});


router.post('/addRating', function (req, res, next) {
    var tempISBN = req.body.isbn;
    var grade = req.body.grade;

    if (grade < 0 || grade > 10) {
        res.writeHead(400, "ILLEGAL GRADE", {'content-type': 'application/json'});
        res.end("ქულა უნდა იყოს [0;10] შუალედში !");
        return;
    } else {
        Book.findOne({
            isbn: tempISBN
        }, function (err, book) {
            if (err) return new Error("Error occurred");

            var sum = book.voteCount * book.currRating;
            sum += grade;
            book.voteCount = book.voteCount + 1;
            book.currRating = sum / book.voteCount;

            Book.update(book, function (error, book) {
                if (error) return next(error);

                res.send(book);
            });
        })
    }

});

router.post('/takeBook', function (req, res, next) {
    var tempISBN = req.body.isbn;
    //  var grade = req.query.grade;
    var tempPersonalNo = req.body.personalNo;
    var tempMobile = req.body.mobile;
    var tempName = req.body.name;
    var tempSurname = req.body.surname;


    Book.findOne({
        isbn: tempISBN
    }, function (err, book) {
        if (err) return new Error("Error occurred");

        if (book == null) {
            res.writeHead(400, "ILLEGAL PARAMETER", {'content-type': 'application/json'});
            res.end("ILLEGAL PARAMETER");
            return;
        }


        var now = new Date();
        console.log(now);
        if (book.taken == book.quantity) {
            res.writeHead(400, "No Books In Library", {'content-type': 'application/json'});
            res.end("No Books In Library");
            return;
        } else {
            var reader = {
                name: tempName,
                surname: tempSurname,
                personalNo: tempPersonalNo,
                mobile: tempMobile,
                takeDate : now,
                takeOperationCode : now.getTime()+"T"
            }

            book.readers.push(reader);
            book.taken = book.taken + 1;

            Book.update(book, function (error, book) {
                if (error) return next(error);

                res.send(book);
            });
        }
    })
});

router.post('/returnBook', function (req, res, next) {
    var tempISBN = req.body.isbn;
    var opCode = req.body.takeOperationCode;


    Book.findOne({
        isbn: tempISBN,
        "readers.takeOperationCode" : opCode
    }, function (err, book) {
        if (err) return new Error("Error occurred");

        if (book == null) {
            res.writeHead(400, "ILLEGAL PARAMETER", {'content-type': 'application/json'});
            res.end("ILLEGAL PARAMETER");
            return;
        }


        var now = new Date();
        console.log(now);

        var ind ;
        var reader ;
        for(var i = 0; i < book.readers.length; i++){
            if(book.readers[i].takeOperationCode == opCode){
                ind = i;
                reader = book.readers[i];
                break;
            }
        }

        reader.returnOperationCode = now.getTime()+"R";
        reader.returnDate = now;
        book.readers[ind] = reader;

        book.taken = book.taken + 1;

        Book.update(book, function (error, book) {
            if (error) return next(error);

            res.send(book);
        });
    })
});

module.exports = router;


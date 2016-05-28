/**
 * Created by Giga on 5/3/2016.
 */
var express = require('express');
var router = express.Router();

var Book = require('../models/Book');


function getBooks(req, res, next) {
    Book.find({}).sort({title: 1}).exec(function (err, books) {
        if (err) return next(err);
        res.send(books);
    });
}

router.get('/list', getBooks);

router.get('/get', function (req, res) {
    Book.findById(req.query.id).exec(function (err, book) {
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
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            "error": "Illegal Parameter",
            "message": "წიგნების რაოდენობა უნდა იყოს 0-ზე მეტი"
        }));
        res.end();
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
                        res.writeHead(400, {'content-type': 'application/json'});
                        res.write(JSON.stringify({"error": "Place is not available"}));
                        res.end();
                        return;
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
                    res.writeHead(400, {'content-type': 'application/json'});
                    res.write(JSON.stringify({"error": "Place is not available"}));
                    res.end();
                    return;
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
            res.writeHead(400, {'content-type': 'application/json'});
            res.write(JSON.stringify({"error": "Illegal Parameter"}));
            res.end();
            return;
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
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            "error": "Illegal Parameter",
            "message": "ქულა უნდა იყოს [0;10] შუალედში !"
        }));
        res.end();
        return;
    } else {
        Book.findOne({
            isbn: tempISBN
        }, {
            voteCount: 1,
            currRating: 1
        }, function (err, book) {
            if (err) return new Error("Error occurred");

            var sum = book.voteCount * book.currRating;
            sum += grade;

            Book.update({isbn: tempISBN}, {
                $set: {
                    voteCount: book.voteCount + 1,
                    currRating: sum / book.voteCount
                }
            }, function (error, book) {
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
    }, {
        taken: 1,
        quantity: 1
    }, function (err, book) {
        if (err) return new Error("Error occurred");

        if (book == null) {
            res.writeHead(400, {'content-type': 'application/json'});
            res.write(JSON.stringify({
                "error": "Illegal Parameter"
            }));
            res.end();
            return;
        }


        var now = new Date();
        if (book.taken == book.quantity) {
            res.writeHead(400, {'content-type': 'application/json'});
            res.write(JSON.stringify({"error": "No Books In Library"}));
            res.end();
            return;
        } else {
            var t_o_code = now.getTime() + "T";
            var reader = {
                name: tempName,
                surname: tempSurname,
                personalNo: tempPersonalNo,
                mobile: tempMobile,
                takeDate: now,
                takeOperationCode: t_o_code
            }

            Book.update({isbn: tempISBN}, {
                $set: {
                    taken: book.taken + 1
                },
                $push: {readers: reader}
            }, function (error, book) {
                if (error) return next(error);

                res.send(t_o_code);
            });
        }
    })
});

router.post('/returnBook', function (req, res, next) {
    var tempISBN = req.body.isbn;
    var opCode = req.body.takeOperationCode;


    Book.findOne({
        isbn: tempISBN,
        "readers.takeOperationCode": opCode
    }, function (err, book) {
        if (err) return new Error("Error occurred");

        if (book == null) {
            res.writeHead(400, {'content-type': 'application/json'});
            res.write(JSON.stringify({"error": "Illegal Parameter"}));
            res.end();
            return;
        }


        var now = new Date();
        console.log(now);

        var ind;
        var reader;
        for (var i = 0; i < book.readers.length; i++) {
            if (book.readers[i].takeOperationCode == opCode) {
                ind = i;
                reader = book.readers[i];
                break;
            }
        }

        reader.returnOperationCode = now.getTime() + "R";
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


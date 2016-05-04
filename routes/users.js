var express = require('express');
var router = express.Router();

function User(name, surname, personalNo, phone, mail, address, username, password) {
    this.name = name;
    this.surname = surname;
    this.personalNo = personalNo;
    this.phone = phone;
    this.mail = mail;
    this.address = address;
    this.username = username;
    this.password = password;
}

var users = [];
var chalauri = new User("Giga", "Chalauri", "01234567891", "591115008", "giga.chalauri@gmail.com", "Unknown", "chalauri", "chalauri");
users.push(chalauri);

router.get('/list', function (req, res, next) {
    res.send(users);
});

router.post('/add', function (req, res, next) {
    var tempUser = req.body;
    var personalNo = tempUser.personalNo;

    var tempISBN = tempBook.isbn;
    if (!checkUser(personalNo)) {
        res.writeHead(400, "User already exists", {'content-type': 'application/json'});
        res.end("User already exists");
        return;
    }

    books.push(tempBook);
    res.send(books);
});

function checkUser(tempPersonalNo) {
    var result = true;
    books.forEach(function (item) {
        if (item.personalNo == tempPersonalNo) {
            result = false;
        }
    });

    return result;
}


module.exports = router;

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

    if (!checkUser(personalNo)) {
        res.writeHead(400, "User already exists", {'content-type': 'application/json'});
        res.end("User already exists");
        return;
    }

    users.push(tempUser);
    res.send(users);
});

router.post('/auth', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;


    for(var i = 0; i < users.length; i++){
        if(users[i].username == username && users[i].password == password){
            res.send(users[i]);
            console.log("adsa")
            return;
        }
    }

    res.writeHead(400, "Invalid username or password", {'content-type': 'application/json'});
    res.end("Invalid username or password");
});

function checkUser(tempPersonalNo) {
    var result = true;
    users.forEach(function (item) {
        if (item.personalNo == tempPersonalNo) {
            result = false;
        }
    });

    return result;
}


module.exports = router;

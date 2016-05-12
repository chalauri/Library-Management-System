var express = require('express');
var router = express.Router();

var User = require('../models/User');
var sss;
function getUsers(req, res, next) {
    User.find({}, function (err, users) {
        if (err) return next(err);
        sss = users;
        res.send(users);
    });
}

router.get('/list', getUsers);

router.get('/get', function (req, res) {
    User.findById(req.query.id, function (err, book) {
        res.send(book)
    })
});

router.post('/add', function (req, res, next) {
    var tempUser = req.body;
    var tempPersonalNo = tempUser.personalNo;
    var tempUsername = tempUser.username;

    User.findOne({
        personalNo: tempPersonalNo
    }, function (err, user) {
        if (user != null) {
            user.name = req.body.name;
            user.surname = req.body.surname;
            user.personalNo = req.body.personalNo;


            if(user.username == tempUsername){
                User.update(user, function (err) {
                    if (err) return next(err);
                });

                getUsers(req, res, next);
                console.log(user)
                console.log(1111)
                console.log(sss)
            }else{
                User.find({
                    username: tempUsername
                },function(err,users){
                    if(users.length){
                        res.writeHead(400, "USERNAME IS ALREADY USED", {'content-type': 'application/json'});
                        res.end({"message" : "ასეთი მომხმარებელი უკვე არსებობს!"});
                    }else{
                        user.username = req.body.username;
                        User.update(user, function (err) {
                            if (err) return next(err);
                        });

                        getUsers(req, res, next);
                    }
                });
            }
        } else {

            User.find({
                username: tempUsername
            }, function (err, users) {
                if (users.length) {
                    res.writeHead(400, "USERNAME IS ALREADY USED", {'content-type': 'application/json'});
                    res.end("USERNAME IS ALREADY USED");
                }else{
                    User.create(tempUser, function (err) {
                        if (err) return next(err);
                    });

                    getUsers(req, res, next);
                }
            });

        }
    });
});

router.post('/edit', function (req, res, next) {
    var tempUser = req.body;
    var tempPersonalNo = tempUser.personalNo;
    var tempUsername = tempUser.username;

    User.findOne({
        personalNo: tempPersonalNo
    }, function (err, user) {
        if (user == null) {
            res.writeHead(400, "USER IS ALREADY REGISTERED", {'content-type': 'application/json'});
            res.end("USER IS ALREADY REGISTERED");
        } else {

            if (tempUsername == user.username) {
                User.update(tempUser, function (err) {
                    if (err) return next(err);
                });

                getUsers(req, res, next);
            } else {
                User.find({
                    username: tempUsername
                }, function (err, users) {
                    if (users.length) {
                        res.writeHead(400, "USERNAME IS ALREADY USED", {'content-type': 'application/json'});
                        res.end("USERNAME IS ALREADY USED");
                    }else{
                        User.update(tempUser, function (err) {
                            if (err) return next(err);
                        });

                        getUsers(req, res, next);
                    }
                });
            }
        }
    });
});

router.post('/auth', function (req, res, next) {
    var tempUsername = req.body.username;
    var tempPassword = req.body.password;


    User.findOne({
        username: tempUsername,
        password: tempPassword
    }, function (err, user) {
        if (!user) {
            res.writeHead(400, "ILLEGAL USERNAME OR PASSWORD", {'content-type': 'application/json'});
            res.end({"message" : "მომხმარებლის სახელი ან პაროლი არასწორია !"});
        } else {
            res.send(user);
        }
    });

});

router.post('/remove', function (req, res, next) {
    var tempPersonalNo = req.body.personalNo;

    User.findOne({
        personalNo: tempPersonalNo
    }, function (err, user) {
        if (user == null) {
            res.writeHead(400, "Illegal Argument.", {'content-type': 'application/json'});
            res.end({"message" : "არასწორი პარამეტრი!"});
        } else {
            User.remove(user, function (err) {
                if (err) return next(err);
            });

            getUsers(req, res, next);
        }
    });

});

module.exports = router;

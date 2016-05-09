var express = require('express');
var router = express.Router();

var User = require('../models/User');

function getUsers(req, res, next) {
    User.find({}, function (err, users) {
        if (err) return next(err);
        res.send(users);
    });
}

router.get('/list', getUsers);

router.post('/add', function (req, res, next) {
    var tempUser = req.body;
    var tempPersonalNo = tempUser.personalNo;
    var tempUsername = tempUser.username;

    User.find({
        personalNo: tempPersonalNo
    }, function (err, users) {
        if (users.length) {
            res.writeHead(400, "USER IS ALREADY REGISTERED", {'content-type': 'application/json'});
            res.end("USER IS ALREADY REGISTERED");
        } else {

            User.find({
               username :  tempUsername
            },function (err, users) {
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

router.post('/auth', function (req, res, next) {
    var tempUsername = req.body.username;
    var tempPassword = req.body.password;


    User.findOne({
        username: tempUsername,
        password: tempPassword
    }, function (err, user) {
        if (!user) {
            res.writeHead(400, "ILLEGAL USERNAME OR PASSWORD", {'content-type': 'application/json'});
            res.end("ILLEGAL USERNAME OR PASSWORD");
        } else {
            res.send(user);
        }
    });

});


module.exports = router;

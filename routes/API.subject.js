/**
 * Created with JetBrains WebStorm.
 * User: admin
 * Date: 16/01/13
 * Time: 00:30
 * To change this template use File | Settings | File Templates.
 */
var ExpRes = require('express-resource'),
    DB = require('../DB/knownodeDB');

var callBack = function (res) {
    return function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    };
};

exports.index = function (req, res) {
    var subjects = [];
    DB.Post.all(function (err, result) {
        result.forEach(function (subject, index) {
            subjects.push({
                id: index,
                subjectId: subject.__ID__,
                title: subject.title,
                content: subject.bodyText
            });
        });

        res.json(subjects);
    });
};

exports.show = function(req, res) {
    var callBackRes;

    res.json(req.subject[0]);
};

exports.load = function(req, id, fn) {
    var cb = function(error, postSubject) {
            process.nextTick(function() {
                fn(error, postSubject);
            })
        }
    id = id.split(':');
    id = (id.length > 1)?id[1]:id[0];

    DB.Post.all({
        where: {
            __ID__: id
        }
    }, cb);
};

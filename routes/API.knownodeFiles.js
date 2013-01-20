/*
 * Serve JSON to the AngularJS client by sending a request
 */
// GET
var ExpRes = require('express-resource'),
    DB = require('../DB/knownodeDB'),
    postDB = require('../DB/postDB');

var callBack = function (res) {
    return function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    }
};

// Add new knownode post
// ToDo: add relation saving function (?)
exports.create = function (req, res) {
    var cb = callBack(res);

    if(req.files) {
        postDB.SavePostFile(req, function(err, articleFile){
            if(err)
            {
                cb(err)
            }
            res.json(articleFile);
        });
    }
    else {
        cb({"error": "no files were found"}, null);
    }
};

exports.show = function (req, res) {
    req.knownode.relatedNodes = [];
};

// PUT
exports.update = function (req, res) {
};

// DELETE
exports.destroy = function (req, res) {
};
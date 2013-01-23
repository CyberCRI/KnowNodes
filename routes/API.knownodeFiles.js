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
            return res.json({error: err });
        } else {
            return res.json({success: result });
        }
    }
};

// Add new knownode post
// ToDo: add relation saving function (?)
exports.create = function (req, res) {
    var cb = callBack(res);

    if(req.files) {
        return postDB.SavePostFile(req, cb);
    }
    else {
        return cb("no files were found");
    }
};

exports.show = function (req, res) {
    return req.knownode.relatedNodes = [];
};

// PUT
exports.update = function (req, res) {
};

// DELETE
exports.destroy = function (req, res) {
};
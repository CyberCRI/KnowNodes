/*
 * Serve JSON to the AngularJS client by sending a request
 */
// GET
var ExpRes = require('express-resource'),
    DB = require('../DB/knownodeDB');

var callBack = function (res) {
    return function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json({
                "knownode": result
            });
        }
    }
};

exports.index = function (req, res) {
    var nodes = [];
    DB.Post.all({
        limit: 10
    }, function (err, result) {
        result.forEach(function (node, index) {
            nodes.push({
                id: index,
                nodeId: node.__ID__,
                title: node.title,
                url: node.url,
                text: node.bodyText.substr(0, 50) + '...'
            });
        });

        res.json({
            nodes: nodes
        });
    });
};

exports.show = function (req, res) {
    var id;
    id = req.params.knownode;

    DB.Edge.all({
        where: {
            __ID__: id
        }
    }, callBack(res));
};

// POST
exports.create = function (req, res) {
    DB.User.findOne({
        where: {
            '__ID__': '10cc7ba9-c651-4e4c-9eb6-a1143397ceae'
        }
    }, function (err, user) {
        if (err) {
            res.json(err);
        } else {
            DB.Post.create(req.body, function (err, post) {
                if (err) {
                    res.json(err);
                    return;
                }
                DB.Post.createRelationshipTo(user.id, post.id, 'createdBy', {
                    creationDate: new Date().now()
                }, function (err, something) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json(post);
                });
            });
        }
    });
    //create(req.body, callBack(res));
};

// PUT
exports.update = function (req, res) {
    var id = req.params.knownode;
    DB.Post.all({
        where: {
            __ID__: id
        }
    }, callBack(res));
};

// DELETE
exports.destroy = function (req, res) {
    var id = req.params.knownode;
    DB.Post.all({
        where: {
            __ID__: id
        }
    }, callBack(res));
};
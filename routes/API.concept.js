/**
 * Created with JetBrains WebStorm.
 * User: admin
 * Date: 16/01/13
 * Time: 00:30
 *
 * Concept represents a special type of knwonode Post which is a category or a concept in the system.
 * It saves/displays the same way as a post - just that we use the type of concept
 * and it lacks a files (for now).
 * since it currently has a special meaning with a designated page, it gets its own API code. lucky him.
 */
var ExpRes = require('express-resource'),
    DB = require('../DB/knownodeDB');

var callBack = function (res) {
    return function (err, result) {
        if (err) {
            res.json({error: err });
        } else {
            res.json({success: result });
        }
    };
};

// fetching ONLY the concept posts
exports.index = function (req, res) {
    var concepts = [];
    DB.Post.all({where: {
                postType: DB.getPostTypes().concept
            }
        },
        function (err, result) {
            result.forEach(function (concept, index) {
                concepts.push({
                    id: index,
                    conceptId: concept.KN_ID,
                    title: concept.title,
                    content: concept.bodyText
                });
            });
           res.json(concepts);
        }
    );
};

// show is connected to 'load' function (below) which fetches the concept to show according to the supplied ID
exports.show = function(req, res) {
    var callBackRes;

    res.json(req.concept[0]);
};

exports.load = function(req, id, fn) {
    var cb = function(error, postSubject) {
            process.nextTick(function() {
                fn(error, postSubject);
            })
    };

    // let's isolate the id, removing the leading ':'
    id = id.split(':');
    id = (id.length > 1)?id[1]:id[0];

    DB.Post.all({
        where: {
            KN_ID: id
        }
    }, cb);
};

exports.create = function (req, res) {
    var cb = callBack(res);
    if (!req.user) {
        cb({error: "User is not logged in"});
    } else {
        var db = DB.getNeo4jDB();

        db.getNodeById(req.user.id, function (err, userNode) {
            if(err)
            {
                cb(err);
            }

            // setting hard-coded the post type to be a concept
            req.body.postType = DB.getPostTypes().concept;

            DB.Post.create(req.body, function (err, newPost) {
                if(err)
                {
                    cb(err);
                }

                db.getNodeById(newPost.id, function (err, newNeo4jPost) {
                    if(err)
                    {
                        cb(err);
                    }

                    newNeo4jPost.createRelationshipTo(userNode, 'CREATED_BY', null, function (err, relation) {
                        if(err)
                        {
                            cb(err);
                        }

                        cb(null, newPost);
                    });
                });
            });
        });
    }
};
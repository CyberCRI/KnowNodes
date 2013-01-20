/*
 * Serve JSON to the AngularJS client by sending a request
 */
// GET
var ExpRes = require('express-resource'),
    DB = require('../DB/knownodeDB'),
    postDB = require('../DB/postDB'),
    neo4js = DB.getNeo4jDB();

var callBack = function (res) {
    return function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    }
};

function saveKnownodeData(req, userNode, cb) {
    DB.Post.create(req.body.knownodeForm, function (err, post) {
        if(err)
        {
            return cb(err, post)
        }

        var relationData = {
            creationDate: new Date()
        };

       neo4js.rel(post, 'CREATED_BY', userNode, relationData);
        return saveKnownodeRelation(req, post, userNode, cb);
        /*
        userNode.createRelationshipTo(post, 'CREATED_BY', relationData, function (err, rel) {
            if (err) {
                return cb(err, rel);
            }

        });
        */
    });
}

function saveKnownodeRelation(req, post, userNode, cb) {
    DB.Edge.create(req.body.knownodeRelation, function(err, edgeNode) {
       if(err) {
           return cv(err, post);
       }

        var relationshipData = {
            createdBy: userNode.id,
            connectionType: req.body.knownodeRelation.connectionType
        };

        neo4js.rel(edgeNode, 'CREATED_BY', userNode);
        var originalPostPromise = neo4js.node(req.body.knownodeRelation.originalPostId);
        originalPostPromise.then(function(originalPost){
            neo4js.rel(originalPost, 'RELATED_TO', edgeNode, relationshipData);
            neo4js.rel(edgeNode, 'RELATED_TO', post, relationshipData);
        });

        /*edgeNode.createRelationShipFrom(userNode, 'CREATED_BY', function(err, rel){

        });

        edgeNode.createRelationShipTo(post, 'RELATED_TO', relationshipData, function(err, rel){
            if(err){
                return cb(err, rel);
            }

            neo4j.getNodeById(req.body.knownodeRelation.originalPostId, function(err, originalPostId){
                if(err){
                    return cb(err, originalPostId);
                }

                originalPostId.createRelationshipTo(edgeNode, 'RELATED_TO', relationshipData, function( err, rel2) {
                    if(err){
                        return cb(err, rel2);
                    }

                    post.relation = edge;
                    return cb(null, post);
                });
            })
        });
         */
    });
}

// Add new knownode post
// ToDo: add relation saving function (?)
exports.create = function (req, res) {
    var cb = callBack(res);
    if(req.user) {
        DB.User.find(req.user.id, function(err, userNode){
            if(err) {
                cb("Problem with the user connected");
            }

            saveKnownodeData(req, userNode, cb);
        });
    }
    else {
        cb("User is not logged in");
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
    req.knownode.relatedNodes = [];

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

exports.load = function(req, id, fn) {
    var cb = function(error, postSubject) {
        process.nextTick(function() {
            fn(error, postSubject);
        })
    }
    id = id.split(':');
    id = (id.length > 1)?id[1]:id[0];

    // loading the knownode itself, then the related knownodes are added on 'show'.
    DB.Post.all({
        where: {
            __ID__: id
        }
    }, cb);
};
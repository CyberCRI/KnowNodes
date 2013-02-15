/*
 * Serve JSON to the AngularJS client by sending a request
 */
// GET
var ExpRes = require('express-resource'),
    DB = require('../DB/knownodeDB'),
    postDB = require('../DB/postDB'),
    email = require('./.'),
    neo4js = DB.getNeo4jDB();

var callBack = function (res) {
    return function (err, result) {
        if (err) {
            return res.json({error: err });
        } else {
            return res.json({success: result });
        }
    }
};

// creates a new relation edge-node and connect it to the source and target
function saveKnownodeRelation(req, post, userNode, cb) {
    var db = DB.getNeo4jDB();

    var relationshipData = {
        createdBy: userNode.id,
        connectionType: req.body.knownodeRelation.connectionType
    };
    DB.Edge.create(req.body.knownodeRelation, function(err, edge){
        db.getNodeById(edge.id, function(err, neo4jEdge){
            neo4jEdge.createRelationshipTo(userNode, 'CREATED_BY', function(err, rel) { });
            neo4jEdge.createRelationshipTo(post, 'RELATED_TO', relationshipData, function(err, rel1)
                {
                    DB.Post.all({
                        where: {
                            KN_ID : req.body.knownodeRelation.originalPostId
                        }
                    }, function(err, originalPost)
                    {
                        return (err) ? cb(err) : db.getNodeById(originalPost[0].id, function(err, originalNeo4JPost){
                            return (err) ? cb(err) : originalNeo4JPost.createRelationshipTo(neo4jEdge, 'RELATED_TO', relationshipData, function(err, rel2){
                                post.relation1 = rel1;
                                post.relation2 = rel2;
                                cb(null, post);
                            })
                        });

                    });
                });
        });
    });
}

// Add new knownode post
// ToDo: add relation saving function (?)
exports.create = function (req, res) {
    var cb = callBack(res),
        db = DB.getNeo4jDB();

    if (!req.user) {
        return cb("User is not logged in");
    } else {
        db.getNodeById(req.user.id, function (err, userNode) {
            return (err) ? cb(err) : DB.Post.create(req.body.knownodeForm, function (err, newPost) {
                return (err) ? cb(err) : db.getNodeById(newPost.id, function (err, newNeo4jPost) {
                    return (err) ? cb(err) :newNeo4jPost.createRelationshipTo(userNode, 'CREATED_BY', null, function (err, relation) {
                        if(err)
                        {
                            return cb(err);
                        }

                        if(req.body.knownodeRelation) {
                            return saveKnownodeRelation(req, newNeo4jPost, userNode, cb);
                        }
                    });
                });
            });
        });
    }
};

exports.index = function (req, res) {
    var nodes = [],
        startPointId = null,
        db,
        query,
        params;

    if (req.concept && req.concept.length > 0) {
        startPointId = req.concept[0].id;
    }

    if (req.knownode && req.knownode.length > 0) {
        startPointId = req.knownode[0].id;
    }

    if (startPointId) {
        db = DB.getNeo4jDB();
        query = [
            'START firstNode=node({startNode})',
            'MATCH (firstNode) -[:RELATED_TO]- (edge) -[:RELATED_TO]- (article) -[:CREATED_BY]- (articleUser),' +
            '(edge) -[:CREATED_BY]- (edgeUser) ' +
            'RETURN article, articleUser, edge, edgeUser'].join('\n');
        params = {
            startNode: startPointId
        };

        return db.query(query, params, function (err, result) {
            if (err) {
                return res.json({
                    "error": err
                });
            }

            result.forEach(function (kn, index) {
                nodes.push({
                    id: index,
                    knownodeID: kn.article.data.KN_ID,
                    title: kn.article.data.title,
                    bodyText: kn.article.data.bodyText,
                    connection: {
                        data: kn.edge.data,
                        user: kn.edgeUser.data
                    },
                    user: kn.articleUser.data
                });
            });

            return res.json({
                'success': nodes
            });
        });
    }
    else {
        return DB.Post.all({
            limit: 10
        }, function (err, result) {
            result.forEach(function (node, index) {
                nodes.push({
                    id: index,
                    nodeId: node.KN_ID,
                    title: node.title,
                    url: node.url,
                    text: node.bodyText.substr(0, 50) + '...'
                });
            });

            return res.json({
                nodes: nodes
            });
        });
    }
};

// PUT
exports.update = function (req, res) {
    var id = req.params.knownode;
    return DB.Post.all({
        where: {
            KN_ID: id
        }
    }, callBack(res));
};

// DELETE
exports.destroy = function (req, res) {
    var id = req.params.knownode;
    return DB.Post.all({
        where: {
            KN_ID: id
        }
    }, callBack(res));
};

exports.show = function (req, res) {
    res.json(req.knownode[0]);
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
    return DB.Post.all({
        where: {
            KN_ID: id
        }
    }, cb);
};

/*
exports.test = function(req, res){
    email.sendTemplateEmail('newUserActivation', 'this is a test', req.user, function(err, something){
        if(err) {
            return res.json(err);
        }
        res.json(something);
    });
};
*/
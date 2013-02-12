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
            return res.json({error: err });
        } else {
            var jsonResult = JSON.stringify(result, function(key, value) {
                if(key == 'parent') {
                    return value.KN_ID;
                }
                else {
                    return value;
                }
            });
            return res.json({success: jsonResult });
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
    var nodes = [];
    DB.Post.all({
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
};

exports.show = function (req, res) {
    return req.knownode.relatedNodes = [];
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

exports.listKnownodesInConcept = function(req, res) {
    var query, params, nodes = [],
        conceptId = req.param('id'),
        db = DB.getNeo4jDB();

    conceptId = conceptId.split(':');
    conceptId = (conceptId.length > 1)?conceptId[1]:conceptId[0];

   DB.Post.all({ where: {
       KN_ID: conceptId
   }}, function(err, concept){
       if(err)
       {
           return res.json({ "error" : err });
       }

       query = [
           'START concept=node({conceptId})',
           'MATCH (concept) -[:RELATED_TO]- (edge) -[:RELATED_TO]- (article)',
           'RETURN article'
       ].join('\n');

       params = {
           conceptId: concept[0].id
       };

       db.query(query, params, function(err, result){
           if(err)
           {
               return res.json({ "error" : err });
           }

           result.forEach(function (kn, index) {
               nodes.push({
                   id: index,
                   knownodeID: kn.KN_ID,
                   title: kn.title,
                   content: kn.bodyText
               });
           });

           return res.json({'success': nodes });
       });
   });

};
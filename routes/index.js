/*
 * GET: home page and general usages
 * It is called for EVERY partial view (jade) that is being sent to the client
 * that's why the getParameters is here, with the user and title
 */

var neo4j = require('neo4j'),
    DBData = require('../config/DB.conf');
/*
exports.test = function(req, res) {
    var ndb = new neo4j.GraphDatabase(DBData.getDBURL("neo4j"));
    ndb.getNodeById(85, function(err, node1){
        ndb.getNodeById(86, function(err, node2) {
            node1.createRelationshipTo(node2, 'RELATION_SHIP', { creationDate: new Date()}, function(err, rel) {
                if(err) {
                    return res.json(err);
                }
                res.json(rel);
            });
        });
    });

//    ndb.createRelationship(85, 86, 'RELATION_SHIP', function(err, rel){    })
};
*/

function getParameters(req) {
    var displayName = '';
    if(req.user) {
        if(req.user.displayName) {
            displayName = req.user.displayName;
        }
        else {
            displayName = req.user.firstName + ' ' + req.user.lastName;
        }
    }
    return {
        title: 'KnowNodes',
        user: req.user,
        userDisplayName: displayName
    };
}

exports.index = function(req, res){
  res.render('index', getParameters(req));
};

exports.partialsDir = function(req, res) {
    var name = req.params.name;
    var dir = req.params.dir;
    res.render('partials/' + dir + '/' + name, getParameters(req));
};

exports.partials = function(req, res) {
    var name = req.params.name;
    res.render('partials/' + name, getParameters(req));
};

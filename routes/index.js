/*
 * GET: home page and general usages
 * It is called for EVERY partial view (jade) that is being sent to the client
 * that's why the getParameters is here, with the user and title
 */

var neo4j = require('neo4j'),
    DBData = require('../config/DB.conf');

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

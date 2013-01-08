/*
 * GET: home page and general usages
 */

function getParameters(req) {
    return {
        title: 'KnowNodes',
        user: req.user,
        userDisplayName: req.user?req.user.displayName:''
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

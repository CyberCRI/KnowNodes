(function() {
    var DB, callBack;

    DB = require('../DB/knownodeDB');

    callBack = function(res) {
        return function(err, result) {
            if (err) {
                return res.json({
                    user: err
                });
            } else {
                return res.json({
                    user: result
                });
            }
        };
    };

    exports.index = function(req, res) {
        var user, userList;
        userList = [];
        user = new DB.User;
        return DB.User.all({
            limit: 10
        }, function(err, result) {
            var currentUser, currentUserObj;
            if (err) {
                return res.json(err);
            } else {
                for (currentUser in result) {
                    currentUserObj = result[currentUser];
                    userList.push(currentUserObj);
                }
                return res.json({
                    users: userList
                });
            }
        });
    };

    exports.show = function(req, res) {
        var callBackRes, userEmail;
        userEmail = req.params.email;
        callBackRes = callBack(res);
        return DB.User.all({
            where: {
                email: userEmail
            }
        }, callBackRes);
    };

    exports.create = function(req, res) {
        var callBackRes;
        callBackRes = callBack(res);
        return DB.User.create(req.body, callBackRes);
    };

    exports.edit = function(req, res) {
        var callBackRes, userEmail;
        userEmail = req.params.email;
        callBackRes = callBack(res);
        return DB.User.all({
            where: {
                email: userEmail
            }
        }, callBackRes);
    };

    exports.update = function(req, res) {
        var callBackRes, userEmail;
        userEmail = req.params.email;
        callBackRes = callBack(res);
        return DB.User.all({
            where: {
                email: userEmail
            }
        }, callBackRes);
    };

    exports.destroy = function(req, res) {
        var callBackRes, userId;
        userId = req.params.user.substring(1);
        callBackRes = callBack(res);
        DB.User.find(userId, function(err, user) {
            if(err){
                return res.json(err);
            }
            return user.destroy(callBackRes);
        });
    };

}).call(this);

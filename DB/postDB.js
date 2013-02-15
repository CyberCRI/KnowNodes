/*

Deprecated. Will be deleted soon

 */



var config = require('../config/DB.conf'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    gridfs = require('../DB/gridFS'),
    postSchema = require('../DB/PostSchema');
    /*
    ObjectID = mongoose.mongo.BSONPure.ObjectID,
    GridStore = mongoose.mongo.GridStore,
    Grid      = mongoose.mongo.Grid
*/

function initialize(callback) {
    var db, opts = { server: { auto_reconnect: false }, user: config.getDBDetails('mongoDB').user, pass: config.getDBDetails('mongoDB').pass },
        dbURL = config.getDBURL('mongoDB').url;

    mongoose.connect(dbURL, opts);
    db = mongoose.connection;
    db.on('error', callback);
    db.on('open', function() {
        Post = db.model('Post', postSchema);
        callback(null, Post);
    });
}

exports.getPostFile = function(id, callback) {
  initialize(function(Post) {
     gridfs.get(id, callback);
  });
};

exports.SavePostFile = function (req, callBack) {
    if(!req.user)
    {
        callBack("User is not connected. Please login first");
    }
    initialize(function(err, Post){
        if(err) {
            try{
                mongoose.disconnect;
            }
            catch(e) {}

            return callBack(err, null);
        }

        var post = new Post({
            fileURL: req.param.url,
            fileName: req.files.uploadedFile.name,
            abstract: req.param.bodyText,
            title: req.param.title,
            meta: {
                uploaderId: req.user.id,
                uploaderEmail: req.user.email,
                size: req.files.uploadedFile.size
            }
        }), opts = {
                content_type: req.files.uploadedFile.type
            }

        post.save(function(err, post) {
            if(err) {
                callBack(err, null);
            }

            try {
                post.addFile(req.files.uploadedFile, opts, callBack);
                mongoose.disconnect;
            }
            catch(e) {
                return callBack(e);
            }
        });
    });

    /*
    db_connector.open(function(err, db){
        db.createCollection("test", function(err, collection){
            var fileId = new ObjectID();
            var gs = new mongodb.GridStore(db, fileId, req.files.uploadedFile.name, "w", {
                "content_type": req.files.uploadedFile.type,
                "metadata":{
                    "author": req.user.displayName,
                    "size": req.files.uploadedFile.size
                },
                "chunk_size": 1024*4
            });

            gs.open(function(err, gs) {
                fs.readFile(req.files.uploadedFile, function(err, data){
                    gs.write(data, function(err, gs) {
                        gs.close(function(err, result) {
                            var article = {
                                fileURL: req.param.url,
                                fileName: req.files.file.fileName,
                                abstract: req.param.bodyText,
                                title: req.param.title,
                                _id: fileId
                            };
                            collection.save(article); // collection.save({_id:"abc", user:"David"},{safe:true}, callback)

                            callBack(gs, article);
                        });
                    });
                });
            });
        });
    });
    */
};
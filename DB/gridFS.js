var mongoose = require('mongoose');

var GridStore = mongoose.mongo.GridStore,
    Grid      = mongoose.mongo.Grid,
    ObjectID  = mongoose.mongo.BSONPure.ObjectID;

exports.getGridFile = function(id, fn) {
    var db = mongoose.connection.db,
        id = new ObjectID(id),
        store = new GridStore(db, id, "r", {root: 'fs'} );

    store.open(function(err, store) {
        if (err) {
            return fn(err);
        }
        else {
            if ((store.filename.toString() == store.fileId.toString())
                && store.metadata
                && store.metadata.filename) {
                store.filename = store.metadata.filename;
            }
            fn(null, store);
        }
    })
}

exports.putGridFile = function(buf, name, options, fn) {
    var db = mongoose.connection.db,
        options = parse(options);
    options.metadata.filename = name;

    new GridStore(db, name, "w", options).open(function(err, file){
        if (err)
            return fn(err);
        else
            file.write(buf, true, fn);
        //TODO: Should we gridStore.close() manully??
    });
}

exports.putGridFileByPath = function(path, name, options, fn) {
    var db = mongoose.connection.db,
        options = parse(options);
    options.metadata.filename = name;

    new GridStore(db, name, "w", options).open(function(err, file){
        if (err)
            return fn(err);
        else
            file.writeFile(path, fn);
    });
}

exports.deleteGridFile = function(id, fn){
    console.log('Deleting GridFile '+id);
    var db= mongoose.connection.db,
        id = new mongoose.mongo.BSONPure.ObjectID(id),
        store = new GridStore(db, id, 'r', {root: 'fs'});

    store.unlink(function(err, result){
        if (err)
            return fn(err);

        return fn(null);
    });
}

function parse(options) {
    var opts = {};
    if (options.length > 0) {
        opts = options[0];
    }
    else
        opts = options;

    if (!opts.metadata)
        opts.metadata = {};

    return opts;
}
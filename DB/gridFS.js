var Grid, GridStore, ObjectID, mongoose, parse,
    __slice = [].slice;

mongoose = require("mongoose");
GridStore = mongoose.mongo.GridStore;
Grid = mongoose.mongo.Grid;
ObjectID = mongoose.mongo.BSONPure.ObjectID;

exports.putFile = function() {
    var db, name, fn, options, path, _i;
    path = arguments[0], name = arguments[1], options = 4 <= arguments.length ? __slice.call(arguments, 2, _i = arguments.length - 1) : (_i = 2, []), fn = arguments[_i++];
    db = mongoose.connection.db;
    options = parse(options);
    options.metadata.filename = name;
    return new GridStore(db, name, "w", options).open(function(err, file) {
        if (err) {
            return fn(err);
        }
        return file.writeFile(path, fn);
    });
};

parse = function(options) {
    var opts;
    opts = {};
    if (options.length > 0) {
        opts = options[0];
    }
    if (!opts.metadata) {
        opts.metadata = {};
    }
    return opts;
};

exports.get = function(id, fn) {
    var db, store;
    db = mongoose.connection.db;
    store = new GridStore(db, new ObjectID(id), "r", {
        root: "fs"
    });
    return store.open(function(err, store) {
        if (err) {
            return fn(err);
        }
        if (("" + store.filename) === ("" + store.fileId) && store.metadata && store.metadata.filename) {
            store.filename = store.metadata.filename;
        }
        return fn(null, store);
    });
};
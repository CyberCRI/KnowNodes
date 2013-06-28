var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    gridfs = require('../DB/gridFS'),
    postSchema;

postSchema = new Schema({
    fileURL: String,
    abstract: String,
    title: String,
    dateAdded: { type: Date, default: Date.now },
    _id: String,
    files: [ mongoose.Schema.Mixed ],
    meta: {
        uploaderId: String,
        size: Number
    }
});

postSchema.methods.addFile = function(file, options, fn) {
    var _this = this;
    return gridfs.putGridFileByPath(file.path, file.filename, options, function(err, result) {
        if(err) {
            fn(err, null);
        }
        _this.files.push(result);
        return _this.save(fn);
    });
};

postSchema.methods.getFile = function(id, fn) {
    return gridfs.getGridFile(id, fn);
};

postSchema.methods.deleteFile = function(id, fn) {
    return gridfs.deleteGridFile(id, fn);
};


exports = module.exports = postSchema;
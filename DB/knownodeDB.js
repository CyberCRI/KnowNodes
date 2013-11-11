var Schema = require('jugglingdb').Schema,
    DBData = require('../config/DB.conf');


//var schema = new Schema('neo4j', {url: 'http://localhost', port: 7474});
var schema = new Schema('neo4j', DBData.getDBURL("neo4j"));

// Generates a new GUID string
function GUID ()
{
    // TODO Guarantee Uniqueness
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var kn_UserGroup = exports.UserGroup = schema.define('UserGroup', {
    KN_ID :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_User  = exports.User = schema.define('kn_User', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date,    default: Date.now },

    email:          { type: String, length: 255, index: true },
    firstName:      { type: String, length: 255 },
    lastName:       { type: String, length: 255 },
    password:       { type: String, length: 255},
    gender:         { type: String, length: 1 },
    dateOfBirth:    { type: Date },

    origin:         { type: String, length: 50 },

    connectionGUID:     { type: String, length: 36, index: true },
    lastConnectionDate: { type: Date }
});

kn_User.prototype.displayName = function() {
    return this.firstName + ' ' + this.lastName;
};

var kn_Tag = exports.Tag = schema.define('kn_Tag', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_KnowledgeDomain = exports.KnowledgeDomain = schema.define('kn_KnowledgeDomain', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_ConnectionType = exports.ConnectionType = schema.define('ConnectionType', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_Post = exports.Post = schema.define('kn_Post', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 350 },
    url:            { type: String, length: 2000, index: true },
    bodyText:       { type: Schema.Text },
    postType:       { type: String, length: 50, index: true },
    active:         { type: Boolean, default: true, index: true },

    fileId:         { type: String, length: 255 },
    fileName:       { type: String, length: 255 },
    fileData:       { type: String, length: 2000 }
});

var kn_Edge = exports.Edge = schema.define('kn_Edge', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date, default: Date.now, index: true },

    title:          { type: String, length: 255 },
    bodyText:       { type: Schema.Text },
    connectionType: { type: String, length: 255 },
    fromNodeId:     { type: String, length: 20, index: true },
    toNodeId:       { type: String, length: 20, index: true },

    active:         { type: Boolean, default: true, index: true }
});

var kn_Comment = exports.Comment = schema.define('kn_Comment', {
    KN_ID :        { type: String, length: 36, default: GUID, index: true },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 },
    bodyText:       { type: Schema.Text },
    active:         { type: Boolean, default: true, index: true }
});

/*
 //setup relationships
 kn_Source.hasMany(kn_Tag,   {as: 'tags',  foreignKey: 'KN_ID'});
 kn_Source.hasMany(kn_KnowledgeDomain,   {as: 'knowledgeDomains',  foreignKey: 'KN_ID'});
 kn_User.hasMany(kn_UserGroup,   {as: 'userGroups',  foreignKey: 'KN_ID'});
 kn_User.hasMany(kn_Source, {as: 'knownodeSources', foreignKey: 'kn_User.KN_ID' });

 kn_Source.belongsTo(kn_User, {as: 'CreatedBy', foreignKey: 'kn_User.KN_ID'});

 kn_Edge.belongsTo(kn_User, {as: '__CreatedBy__', foreignKey: 'KN_ID'});
 kn_Comment.belongsTo(kn_User, {as: '__CreatedBy__', foreignKey: 'KN_ID'});
 kn_ConnectionType.belongsTo(kn_User, {as: '__CreatedBy__', foreignKey: 'KN_ID'});
 kn_ConnectionType.belongsTo(kn_Edge, {as: 'connectionType', foreignKey: 'KN_ID'});
 */

//validations
kn_User.validatesPresenceOf('email', 'firstName', 'lastName');
kn_User.validatesUniquenessOf('email', {message: 'email is not unique'});
//kn_User.validatesLengthOf('password', {min: 5, message: {min: 'Password is too short'}});

kn_Post.validatesPresenceOf('title');


// DAL Methods
var neo4jDB;

function initDBConnection(){
    var neo4j;

    if(!neo4jDB)
    {
        neo4j = require('neo4j');
        neo4jDB = new neo4j.GraphDatabase(DBData.getDBURL("neo4j"));
    }
    return neo4jDB;
}

exports.getNeo4jDB = function(){
    return initDBConnection();
}

exports.getUsersByName = function(name, callback) {
    var db = initDBConnection();
    return db.queryNodeIndex('User', "START n=node(*) WHERE n.name =~ '"+ name + "*' RETURN n", callback);
};

exports.getPostTypes = function() {
    return {
        resource: 'Resource',
        openQuestion: 'Open_Question',
        query: 'Query',
        publication: 'Publication',
        tutorial: 'Tutorial',
        concept: 'Concept',
        problem: 'Problem',
        article: 'Article'
    }
}
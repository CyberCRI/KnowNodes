/**
 * Created with JetBrains WebStorm.
 * User: Liad Magen
 * Date: 26/11/12
 * Time: 14:07
 * To change this template use File | Settings | File Templates.
 */
var Schema = require('jugglingdb').Schema,
    DBData = require('../config/DB.conf');


//var schema = new Schema('neo4j', {url: 'http://localhost', port: 7474});
var schema = new Schema('neo4j', DBData.getDBURL("neo4j"));

function GUID ()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var kn_UserGroup = exports.UserGroup = schema.define('UserGroup', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_University = exports.University = schema.define('kn_University', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_Lab  = exports.Lab = schema.define('kn_Lab', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_User  = exports.User = schema.define('kn_User', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    email:          { type: String, length: 255 },
    firstName:      { type: String, length: 255 },
    lastName:       { type: String, length: 255 },
    gender:         { type: String, length: 1 },
    dateOfBirth:    { type: Date }
});

var kn_Tag = exports.Tag = schema.define('kn_Tag', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_KnowledgeDomain = exports.KnowledgeDomain = schema.define('kn_KnowledgeDomain', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_ConnectionType = exports.ConnectionType = schema.define('ConnectionType', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 }
});

var kn_Post = exports.Post = schema.define('kn_Post', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 },
    url:            { type: String, length: 2000 },
    bodyText:        { type: Schema.Text },
    active:         { type: Boolean, default: true, index: true }
});

var kn_Edge = exports.Edge = schema.define('kn_Edge', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date, default: Date.now },

    title:          { type: String, length: 255 },

    active:         { type: Boolean, default: true, index: true }
});

var kn_Comment = exports.Comment = schema.define('kn_Comment', {
    __ID__ :        { type: String, length: 36, default: GUID },
    __CreatedOn__:  { type: Date,    default: Date.now },

    title:          { type: String, length: 255 },
    bodyText:        { type: Schema.Text },
    active:         { type: Boolean, default: true, index: true }
});

/*
//setup relationships
kn_Source.hasMany(kn_Tag,   {as: 'tags',  foreignKey: '__ID__'});
kn_Source.hasMany(kn_KnowledgeDomain,   {as: 'knowledgeDomains',  foreignKey: '__ID__'});
kn_User.hasMany(kn_UserGroup,   {as: 'userGroups',  foreignKey: '__ID__'});
kn_User.hasMany(kn_Source, {as: 'knownodeSources', foreignKey: 'kn_User.__ID__' });

kn_Source.belongsTo(kn_User, {as: 'CreatedBy', foreignKey: 'kn_User.__ID__'});

kn_Edge.belongsTo(kn_User, {as: '__CreatedBy__', foreignKey: '__ID__'});
kn_Comment.belongsTo(kn_User, {as: '__CreatedBy__', foreignKey: '__ID__'});
kn_ConnectionType.belongsTo(kn_User, {as: '__CreatedBy__', foreignKey: '__ID__'});
kn_ConnectionType.belongsTo(kn_Edge, {as: 'connectionType', foreignKey: '__ID__'});
*/

//validations
kn_User.validatesPresenceOf('email', 'firstName', 'lastName');
kn_User.validatesUniquenessOf('email', {message: 'email is not unique'});

kn_Post.validatesPresenceOf('title', 'bodyText');
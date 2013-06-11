var Schema = require('jugglingdb').Schema,
    DBData = require('../config/DB.conf');

var schema = new Schema('mysql', DBData.getDBDetails('mysql'));

var kn_log = exports.Log = schema.define('Log', {
    __CreatedOn__:  { type: Date,   default: Date.now },
    user:           { type: String, length: 255 },
    title:          { type: String, length: 255 },
    content:        { type: Schema.Text }
});

kn_log.validatesPresenceOf('title');

var request = require("request");
var lineReader =  require('line-reader');
var fs = require("fs");

var HOST = "http://localhost:3000";
var LOGIN = {
  username: "wikipedia@wikipedia.org",
  password: "aidepikiw"
}


function login(callback) {
  request.post(HOST + "/login", { form: LOGIN }, function(error, response, body) {
    if(body == "ERROR") return callback("Error logging in");

    responseObj = JSON.parse(body);
    if(responseObj.KN_ID && callback) callback(null);
  });
}


function createWikiNode(title, callback) {
  request.post(HOST + "/knownodes/wikinode", { form: { title: title } }, function(error, response, body) {
    responseObj = JSON.parse(body);
    if(responseObj.success.KN_ID) {
      console.log("Created Wikinode " + responseObj.success.KN_ID + " (" + title + ")");
      if(callback) callback(null);
    }
    else {
      console.log("Error creating Wikinode");
      if(callback) callback("Error creating Wikinode");
    }
  });
}

// Read command-line arguments
if(process.argv.length < 3) 
{
  console.log("usage: node makeNodes.js <file> [start] [count]");
  process.exit(1);
}

var start = process.argv.length > 3 ? parseInt(process.argv[3]) : 0;
var count = process.argv.length > 4 ? parseInt(process.argv[4]) : Number.MAX_VALUE;

console.log("Logging in...")
login(function(err) {
  if(err) return console.log(err);

  console.log("Logged in");

  var lineNumber = 0;
  lineReader.eachLine(process.argv[2], function(line, last, cb) {
    lineNumber++;

    // Skip lines before start
    if(lineNumber < count) return cb(true); 

    // Expecting a CSV format with the article title first
    var array = line.toString().split(',');
    // HACK: avoid two many commas 
    if(array.length > 2) 
    {
      console.log("ERROR: TWO MANY COMMAS", line);
      return cb(true)
    }

    console.log("Creating Wikinode for " + array[0]);
    createWikiNode(array[0], function(err) { 
      if(err) return cb(false); 

      cb(lineNumber < start + count); 
    });
  }).then(function() { 
      console.log("Processed up to line " + lineNumber);
    });
});

var request = require("request");
var lazy =  require('lazy');
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
      if(callback) callback(NULL);
    }
    else {
      console.log("Error creating Wikinode");
      if(callback) callback("Error creating Wikinode");
    }
  });
}


if(process.argv.length < 3) 
{
  console.log("usage: node makeNodes.js <file> [start] [count]");
  process.exit(1);
}

console.log("Logging in...")
login(function(err) {
  if(err) return console.log(err);

  console.log("Logged in");

  var list = new lazy(fs.createReadStream(process.argv[2])).lines;
  if(process.argv.length > 3) list = list.skip(process.argv[3]);
  if(process.argv.length > 4) list = list.take(process.argv[4]);

  list = list.forEach(function(line){
      var array = line.toString().split(',');
      console.log("Creating Wikinode for " + array[0]);
      createWikiNode(array[0]);
    });
});

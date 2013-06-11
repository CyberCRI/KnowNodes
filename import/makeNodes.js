var request = require("request");

var HOST = "http://localhost:3000";
var LOGIN = {
  username: "wikipedia@wikipedia.org",
  password: "aidepikiw"
}


function login(callback) {
  request.post(HOST + "/login", { form: LOGIN }, function(error, response, body) {
    if(body == "ERROR")
    {
      console.log("Error logging in");
      return callback("Error logging in");
    }

    responseObj = JSON.parse(body);
    if(responseObj.KN_ID) {
      console.log("Logged in");
      if(callback) callback(null);
    }
  });
}


function createWikiNode(title, callback) {
  request.post(HOST + "/knownodes/wikinode", { form: { title: title } }, function(error, response, body) {
    responseObj = JSON.parse(body);
    if(responseObj.success.KN_ID) {
      console.log("Created Wikinode " + responseObj.success.KN_ID);
      if(callback) callback(NULL);
    }
    else {
      console.log("Error creating Wikinode");
      if(callback) callback("Error creating Wikinode");
    }
  });
}

console.log("Logging in...")
login(function(err) {
  if(err) return;

  console.log("Done.")
  createWikiNode(process.argv[2]);
});

var request = require("request");

var HOST = "http://localhost:3000";


request(HOST + "/login", function(error, response, body) {
  console.log(error, response, body);
});





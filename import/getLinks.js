var bot = require('nodemw');

// pass configuration object
var client = new bot({
  server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
  path: '/w',                  // path to api.php script
  debug: false                // is more verbose when set to true
});

// get the object being the first key/value entry of a given object
var getFirstItem = function(object) {
  for(var key in object);
  return object[key];
};

function getLinks(title, callback) {
  query = { 
    action: 'query',
    prop: 'links',
    titles: title,
    pllimit: 5000
  };

  function makeCall() {
    client.api.call(query,
      function(data, info, next) {
        for(var i in getFirstItem(data.pages).links)
        {
          callback(getFirstItem(data.pages).links[i]);
        }

        /*if(next && next["query-continue"]) {
          query.plcontinue = next["query-continue"].links.plcontinue;
          makeCall();
        }*/
      }
    );
  }

  makeCall();
}

getLinks("Computer_science", console.log);

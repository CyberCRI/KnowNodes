var bot = require('nodemw');

// pass configuration object
var client = new bot({
  server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
  path: '/w',                  // path to api.php script
  debug: false                // is more verbose when set to true
});

function getAllPages(category, callback) {
  client.getPagesInCategory(category, function(pages) { 
    for(var i in pages) { 
      callback(pages[i]); 
    }
  });

  client.getCategories(category, function(subCategories) { 
    for(var i in subCategories) { 
      getAllPages(subCategories[i], callback); 
    }
  });
}

function isRegularPage(pageData)
{
  return pageData.ns == 0;
}

getAllPages("Computer_science", function(pageData) { 
  if(isRegularPage(pageData)) console.log(pageData);
}); 
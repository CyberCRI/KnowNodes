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
  };

  function makeCall() {
    client.api.call(query,
      function(data, info, next) {
        for(var i in getFirstItem(data.pages).links)
        {
          callback(getFirstItem(data.pages).links[i]);
        }

        if(next && next["query-continue"]) {
          query.plcontinue = next["query-continue"].links.plcontinue;
          makeCall();
        }
      }
    );
  }

  makeCall();
}

function getSubCategories(prefix,callback){
	if(typeof prefix === 'function') {
				callback = prefix;
			}
			client.api.call({
				action: 'query',
				cmnamespace:'14|0',
				list: 'categorymembers',
				cmtitle:prefix,
				cmlimit: 500
			}, function(data){
				callback && callback(data && data.categorymembers || []);
			})
}
function getInternalLinks(title,callback){
		client.api.call({
					action: 'query',
					prop: 'links',
					titles: title,
					ellimit: 5000

				}, function(data) {
					callback && callback((data && getFirstItem(data.pages).links) || []);
			});
}



/*
 get first Paragraph
 require the txtjs module
 */

function getFirstParagraph(title,callback){
	var txtwiki=require('./txtwiki');
	client.getArticle(title,function(data){
		callback(txtwiki.parseWikitext(data.substring(0,data.indexOf("\n\n"))));
	});
}


//@todo get all pages
	var pageCount=0;
	var catCount=0;
	var existingCategories = {};
	var fs=require('fs');
function writeAllPagesAndCat(catagory,callback){
	getSubCategories(catagory,function(data){
		for(var i in data){
			if(data[i].ns===0){
				/*
				this is the article in this catagory
				write article into the article.txt,format: articleTitle,catagory
				article might be in the different catagory
                */ 
              fs.appendFile("article.txt",data[i].title+","+catagory+"\n",function(){});
               pageCount++;
			}else{
				/* this is the catagory
				 write catagory into the catagory.txt,format: catagory,parentCatagory
				*/
               // check if we already has the catogory, check in the txt files
               if(!existingCategories[data[i].title]){
               	  // add it into the exsistingCategories
               	  existingCategories[data[i].title]=true;
                  fs.appendFile("catagory.txt",data[i].title+","+catagory+"\n",function(){});
                  // get it's subcatagories
                  writeAllPagesAndCat(data[i].title,callback);
                  catCount++;
               }
			}
		}
		callback(catagory);
	})
}

writeAllPagesAndCat('Category:Computer_science',function(catagory){
	console.log(catagory,pageCount,catCount);
});


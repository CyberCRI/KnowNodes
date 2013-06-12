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
    pllimit:5000
  };

  function makeCall() {
    client.api.call(query,
      function(data, info, next) {
        for(var i in getFirstItem(data.pages).links)
        {
          callback(getFirstItem(data.pages).links[i]);
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
					pllimit: 5000

				}, function(data) {
					callback && callback((data && getFirstItem(data.pages).links) || []);
			});
}







//import  pages and cat within 7 level
	var pageCount=0;
	var catCount=0;
	var existingCategories = {};
	var fs=require('fs');
function writeAllPagesAndCat(catagory,level,callback){
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
                  if(level<7){
                  	writeAllPagesAndCat(data[i].title,level+1,callback);
                  }                  
                  
                  catCount++;
               }
			}
		}
		callback(level,catagory);
	})
}

/*
import all the datas 
writeAllPagesAndCat('Category:Computer_science',1,function(level,catagory){
	console.log(level,catagory,pageCount,catCount);
});
*/
// read the file and save it into the other new files
/*
var lazy=require('lazy');
// read all the txt and convert it with title, 
new lazy(fs.createReadStream('article.txt'))
	.lines
	.forEach(function(line){
		var array=line.toString().split(',');
		var title=array[0].replace(" ","_");
		var catagory=array[1].replace("Category:","");
		var url="http://en.wikipedia.org/wiki/"+title;
		//console.log(title,url,catagory);
	})
*/


function calculateStrength(startingNode,endingnode,callback)  {
   var connected=0;
	getInternalLinks(startingNode,function(datas){
		
        getInternalLinks(endingnode,function(endNodeDatas){
           var titles=[];
           for(var i in endNodeDatas){
               titles[i]=endNodeDatas[i].title;
           }

            for(var i=0;i<datas.length;i++){
		       	 if(titles.indexOf(datas[i].title)!=-1){
                   connected++ ;
		       	 	 
		       	 }
		    }
		      callback(connected/datas.length,connected,connected/endNodeDatas.length);
        })
        
    });  
}



function getFirstParagraph(title,callback){
	
	client.api.call({
		action: 'parse',
		page:title,
		prop: 'text',
		},function(data){
		var regex = /<p>.+<\/p>/;
		match = regex.exec(data.text['*']);
         callback(match[0]);
	})
}
getFirstParagraph("Python (programming language)",console.log);




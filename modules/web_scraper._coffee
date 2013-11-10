settings = require('../config/settings')
key = settings.getSettings().url_scraper;

pm = require('pagemunch')
pm.set({key:key})

pm.summary(process.argv[2], -> console.log(arguments))

# http://www.youtube.com/watch?v=9bZkp7q19f0
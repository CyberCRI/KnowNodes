apiKey = require('../config/settings')
apiValue = apiKey.settings.url_scraper

pm = require('pagemunch')
pm.set({key:'apiValue'})

pm.summary('http://www.youtube.com/watch?v=9bZkp7q19f0', _)
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , Resource = require('express-resource')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
    app.use(express.errorHandler());
});


app.resource('API/users', require('./routes/userAPI'));
app.resource('API/knownodes', require('./routes/knownodeAPI'));

app.get('/', routes.index);
app.get('/partials/:dir/:name', routes.partialsDir);
app.get('/partials/:name', routes.partials);

app.get('*', routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

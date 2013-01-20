/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , Resource = require('express-resource')
  , http = require('http')
  , passport = require('passport')
  , passportConfig = require('./config/passport.conf')
  , path = require('path');

// passport: Login initialization
passportConfig.initializePassport();

var app = express();

// configuration
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser());
  app.use(express.session({ secret: 'dorIsGarbash' }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// routing
app.resource('API/users', require('./routes/API.user'));
app.resource('API/knownodes', require('./routes/API.knownode'));
app.resource('API/knownodeFiles', require('./routes/API.knownodeFiles'));
app.resource('API/subjects', require('./routes/API.subject'));

app.post('/API/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

/*app.post('/API/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        if(req.user) {
            res.send('OK');
        }
        else {
            req.send('NO');
        }
    });
*/
app.post('/API/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            //req.flash('error', info.message);
            //return res.redirect('/login')
            return res.send('ERROR');
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.send('OK');
            //return res.redirect('/subjectList/:' + user.username);
        });
    })(req, res, next);
});

app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res){
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/auth/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res){
        // The request will be redirected to Google for authentication, so
        // this function will not be called.
    });

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

// routing fallback - MUST (!!) be the last line of all routing
app.get('/', routes.index);
app.get('/partials/:dir/:name', routes.partialsDir);
app.get('/partials/:name', routes.partials);

app.get('*', routes.index);


// let's do it!
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

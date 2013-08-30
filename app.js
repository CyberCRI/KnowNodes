/**
 * Module dependencies.
 */
var express = require('express')
  , controller = require('./controllers')
  , adminController = require('./controllers/admin/index')
  , voteController = require('./controllers/vote/index')

  , Resource = require('express-resource-new')
  //, Resource = require('express-resource')
  , http = require('http')
  , passport = require('passport')
  , passportConfig = require('./config/passport.conf')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , ConfigSettings = require('./config/settings')

// passport: Login initialization
passportConfig.initializePassport();

var app = express();
var settings = ConfigSettings.getSettings();

function errorHandler(err, req, res, next) {
    res.status(500);
    res.json(err);
    //res.render('error', { error: err });
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}


// configuration
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'clientApp/views'));
    app.set('view engine', 'jade');
    app.set('controllers', path.join(__dirname, 'controllers'));

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    //app.use(express.session({ secret: 'dorIsGarbash' }));

    app.use(express.session({
        secret: settings.cookie_secret,
        store: new MongoStore({
            url: settings.session_db_url,
            db: settings.session_db
        })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/js', express.static(path.join(__dirname, 'clientApp/js')));
    app.use('/css', express.static(path.join(__dirname, 'clientApp/css')));
    app.use('/img', express.static(path.join(__dirname, 'clientApp/img')));
    app.use(app.router);
});

/*
app.configure('development', function(){
  app.use(errorHandler);
});

app.configure('production', function(){
    app.use(clientErrorHandler);
});
*/

// routing
app.resource('resources', function() {
    this.member.get('searchByKeyword');
    this.member.get('triplets');
    this.collection.post('findByUrl');
});

app.resource('wiki');

app.resource('connections', function() {
    this.collection.post('latestTriplets');
    this.collection.post('hottestTriplets');
    this.member.get('getTripletByConnectionId');
    this.member.get('getTripletsByUserId');
});

app.post('/vote/voteUp',voteController.voteUp );
app.post('/vote/voteDown',voteController.voteDown );
app.post('/vote/cancelVote',voteController.cancelVote );


app.resource('scrape');
app.resource('users');


app.post('/admin/indexAllResources', adminController.indexAllResources);
app.post('/admin/indexAllConnections', adminController.indexAllConnections);
app.post('/admin/hashAllPasswords', adminController.hashAllPasswords);

app.resource('edges');
app.resource('users');

app.resource('comments', function () {
    this.member.get('getRelatedComments');
});
app.resource('concepts', function () {
    //this.collection.get('getRelatedKnownodes');
    this.member.get('getRelatedKnownodes');
    this.member.get('getRelatedComments');
    this.resource('knownodes', function() {
    });
});
app.resource('knownodes', function () {
    this.member.get('getRelatedKnownodes');
    this.member.get('getRelatedComments');
    this.member.get('getNodesByKeyword');

    this.collection.post('getResourceByUrl');
    this.collection.post('wikinodeIfExists');
    this.collection.post('wikinode');
    this.collection.post('scrapeUrl');

    this.resource('knownodes', { id: 'related' });
    this.resource('files');
    this.resource('comments');
});
app.resource('files', { name: 'knownodeFiles', id: 'files'});
//app.get('/concepts/:cid/knownodes/:kid', require('./routes/API.concept').load, require('./routes/API.knownode').load);

app.post('/logout', function(req, res){
    req.logout();
    res.json({ success: "Logout" });
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            console.log("login error:", err);
            return next(err); }
        if (!user) {
            //req.flash('error', info.message);
            //return res.redirect('/login')
            console.log("no user:", err);

            // FIXME send an explicit HTTP code
            return res.send('ERROR');
        }
        req.logIn(user, function (err) {
            return err ? next(err) : res.send(user);
        });
    })(req, res, next);
});

app.get('/auth/facebook',
    passport.authenticate('facebook', {  scope: [ 'email' ] }),
    function (req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/auth/google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // The request will be redirected to Google for authentication, so
        // this function will not be called.
    });

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

// routing fallback - MUST (!!) be the last line of all routing
app.get('/', controller.index);
app.get('/partials/:dir/:name', controller.partialsDir);
app.get('/partials/:name', controller.partials);
app.get('/screens/:name', controller.screens);

app.get('*', controller.index);

/*
app.get('/', function(request, response) {
    response.redirect('/knownodes');
});
*/

// let's do it!
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

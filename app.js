/**
 * Module dependencies.
 */
var express = require('express')
    , controller = require('./controllers')
    , adminController = require('./controllers/admin/index')
    , voteController = require('./controllers/vote/index')
    , GexfController = require('./controllers/gexf/index')
    , AuthController = require('./controllers/auth/AuthController')
    , UserConverter = require('./model/conversion/json/UserConverter')

    , Resource = require('express-resource-new')
    //, Resource = require('express-resource')
    , http = require('http')
    , passport = require('passport')
    , passportConfig = require('./config/passport.conf')
    , path = require('path')
    , MongoStore = require('connect-mongo')(express)
    , ConfigSettings = require('./config/settings')
    , mongoose = require('mongoose')
    , DBConf = require('./config/DB.conf.js')

// passport: Login initialization
passportConfig.initializePassport();

var app = express();
var settings = ConfigSettings.getSettings();

// configuration
app.configure(function () {
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
    app.use('/json', express.static(path.join(__dirname, 'clientApp/json')));
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

// NEW API

app.resource('users', function () {
    this.member.get('findByEmail');
    this.member.get('karma');
    this.member.get('triplets');
});

app.resource('resources', function () {
    this.member.get('searchByKeyword');
    this.member.get('triplets');
    this.collection.post('findByUrl');
});

app.resource('connections', function () {
    this.member.get('triplet');
    this.member.get('comments');
});

app.resource('triplets', function () {
    this.collection.post('latest');
    this.collection.post('hottest');
});

app.resource('comments');

app.resource('notifications', function () {
    this.collection.post('markAllAsRead');
});

app.resource('wiki');

app.post('/vote/voteUp', voteController.voteUp);
app.post('/vote/voteDown', voteController.voteDown);
app.post('/vote/cancelVote', voteController.cancelVote);

app.resource('scrape');

app.post('/admin/indexAllResources', adminController.indexAllResources);
app.post('/admin/indexAllConnections', adminController.indexAllConnections);
//app.post('/admin/indexAllUsers', adminController.indexAllUsers);


app.get('/gexf/triplet/:connectionId', GexfController.exportTriplet);
app.get('/gexf/userTriplets/:userId.gexf', GexfController.exportUserTriplets);
app.get('/gexf/resourceTriplets/:resourceId.gexf', GexfController.exportResourceTriplets);

// AUTH

app.post('/auth/local', AuthController.loginLocal);

// OLD API

app.resource('files', { name: 'knownodeFiles', id: 'files'});

app.resource('concepts', function () {
    this.member.get('getRelatedKnownodes');
});
app.resource('knownodes');

app.post('/auth/logout', function (req, res) {
    req.logOut();
    res.json({ success: "Logout" });
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

app.get('/', controller.index);
app.get('/partials/:dir/:name', controller.partialsDir);
app.get('/partials/:name', controller.partials);
app.get('/screens/:name', controller.screens);

// routing fallback - MUST (!!) be the last line of all routing
app.get('*', controller.index);

mongoose.connect(DBConf.getDBURL('mongoDB').url);
mongoose.connection.once('open', function () {
    console.log('mongoose : connected to MongoDB')
    // Start Web Server
    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });
});


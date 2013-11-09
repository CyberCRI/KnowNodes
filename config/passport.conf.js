(function () {
    var passport = require('passport'),
        FacebookStrategy = require('passport-facebook').Strategy,
        GoogleStrategy = require('passport-google').Strategy,
        LocalStrategy = require('passport-local').Strategy,

        emailConf = require('./email.conf'),
        nodemailer = require('nodemailer'),

        LOG = require('../modules/log'),
        // TODO Remove reference to deprecated DB
        DB = require('../DB/knownodeDB'),
        bcrypt = require('bcrypt'),
        User = require('../model/User')

        basicURL = 'http://www.knownodes.com/',
        // basicURL = 'http://localhost:3000/',

        FACEBOOK_APP_ID = "138799776273826",
        FACEBOOK_APP_SECRET = "6e3e885f57d1eaaca309509a7e86479a";

    function findByEmail(email, profile, fn) {
        DB.User.all({ where: { email: email }}, function (err, user) {
            if (err) {
                return fn(err, profile);
            }
            return fn(err, user[0]);
        });
    }

    exports.ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login');
    };

    exports.initializePassport = function () {

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (id, done) {
            /*
            DB.User.all({ where: { KN_ID: id }}, function(err, user) {
                if(err) {
                    return done(err, null);
                }
                return done(err, user[0]);
            });
           */
            return done(null, id);
        });

        passport.use(new LocalStrategy(
            function (email, password, done) {
                findByEmail(email, null, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    var isPasswordCorrect = bcrypt.compareSync(password, user.password);
                    if (isPasswordCorrect) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            }
        ));

        passport.use(new FacebookStrategy({
                clientID: FACEBOOK_APP_ID,
                clientSecret: FACEBOOK_APP_SECRET,
                callbackURL: basicURL + "auth/facebook/callback"
            },

            function (accessToken, refreshToken, profile, done) {
                var prof = JSON.stringify(profile),
                    logger = new LOG();
                logger.logActivity('facebook profile', prof);

                if (profile.emails && profile.emails.length > 0) {
                    return findByEmail(profile.emails[0].value, profile, function (err, user) {
                        if (err)
                        {
                            return DB.User.create({
                                email: user.emails[0].value,
                                firstName: user.first_name,
                                lastName: user.last_name,
                                origin: 'facebook'
                            }, done);
                        }

                        return done(null, user);
                    });
                }
                return done(null, profile);
        }));

        passport.use(new GoogleStrategy({
                returnURL: basicURL + 'auth/google/callback',
                realm: basicURL
            },
            function(identifier, profile, done) {
                // asynchronous verification, for effect...
                console.log('arrived');
                process.nextTick(function () {

                    profile.identifier = identifier;

                    if(profile.emails && profile.emails.length > 0){
                        return findByEmail(profile.emails[0].value, profile, function(err, user){
                            if(err)
                            {
                                return DB.User.create({
                                    email: user.emails[0].value,
                                    firstName: user.name.givenName,
                                    lastName: user.name.familyName,
                                    origin: 'google'
                                }, done);
                            }

                            profile = user;
                            profile.identifier = identifier;

                            return done(null, user);
                        });
                    }

                    return done(null, profile);
                    /*

                    User.findByOpenID({ openId: identifier }, function (err, user) {
                        return done(err, user);
                    });
                    */
                });
            }
        ));
    };
}).call(this);
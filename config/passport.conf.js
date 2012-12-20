(function () {
    var passport = require('passport'),
        FacebookStrategy = require('passport-facebook').Strategy,
        GoogleStrategy = require('passport-google').Strategy,

        FACEBOOK_APP_ID = "138799776273826"
        FACEBOOK_APP_SECRET = "6e3e885f57d1eaaca309509a7e86479a";

    exports.initializePassport = function () {
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        passport.use(new FacebookStrategy({
                clientID: FACEBOOK_APP_ID,
                clientSecret: FACEBOOK_APP_SECRET,
                callbackURL: "http://localhost:3000/auth/facebook/callback"
            },

            function (accessToken, refreshToken, profile, done) {
                User.findOrCreate({
                    facebookId: profile.id
                }, function (err, user) {
                    return done(err, user);
                });
            }));

        passport.use(new GoogleStrategy({
                returnURL: 'http://localhost:3000/auth/google/callback',
                realm: 'http://localhost:3000/'
            },
            function(identifier, profile, done) {
                // asynchronous verification, for effect...
                process.nextTick(function () {

                    // To keep the example simple, the user's Google profile is returned to
                    // represent the logged-in user.  In a typical application, you would want
                    // to associate the Google account with a user record in your database,
                    // and return that user instead.
                    profile.identifier = identifier;
                    /*
                    User.findByOpenID({ openId: identifier }, function (err, user) {
                        return done(err, user);
                    });
                    */
                });
            }
        ));
    }
}).call(this);
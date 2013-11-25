passport = require 'passport'

LocalStrategy = require('passport-local').Strategy
GoogleStrategy = require('passport-google').Strategy

bcrypt = require('bcrypt-nodejs')
Users = require('../data/Users')

basicURL = 'http://www.knownodes.com/'
# basicURL = 'http://localhost:3000/'


findByEmail = (email, fn) ->
  callback = (error, result) ->
    if error
      throw error
      fn(error)
    else
      fn(null, result)
  Users.findByEmail(email, callback);

module.exports =

  initialize: ->

    passport.serializeUser (user, done) ->
      user.toJSON (error, result) ->
        done error, result


    passport.deserializeUser (user, done) ->
      done null, user


    fields =
      usernameField: "email"
      passwordField: "password"
    callback = (email, password, done) ->
        findByEmail email, (err, user) ->
          if err
            done err
          else unless user
            done null, false
          else
            isPasswordCorrect = bcrypt.compareSync(password, user.password)
            if isPasswordCorrect
              done null, user
            else
              done null, false
    localStragegy = new LocalStrategy(fields, callback)
    passport.use localStragegy


    passport.use new GoogleStrategy(
      returnURL: basicURL + "auth/google/callback"
      realm: basicURL
    , (identifier, profile, done) ->

      process.nextTick ->
        profile.identifier = identifier
        if profile.emails and profilecallback.emails.length > 0
          return findByEmail(profile.emails[0].value, (err, user) ->
            if err
              return DB.User.create(
                email: user.emails[0].value
                firstName: user.name.givenName
                lastName: user.name.familyName
                origin: "google"
              , done)
            profile = user
            profile.identifier = identifier
            done null, user
          )
        done null, profile
    )
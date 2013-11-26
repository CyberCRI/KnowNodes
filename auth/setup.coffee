passport = require 'passport'

LocalStrategy = require('passport-local').Strategy
GoogleStrategy = require('passport-google').Strategy

bcrypt = require('bcrypt-nodejs')
Users = require('../data/Users')
Logger = require '../../log/Logger'

basicURL = 'http://www.knownodes.com/'
#basicURL = 'http://localhost:3000/'

logger = new Logger('Callback')

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
            throw err
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
        if profile.emails and profile.emails.length > 0
          return findByEmail(profile.emails[0].value, (err, user) ->
            if err
              # User not found ?
              logger.error(err)
              return Users.create(
                email: profile.emails[0].value
                firstName: profile.name.givenName
                lastName: profile.name.familyName
                origin: "google"
              , done)
            else
              # User found, login
              done null, user
          )
        done null, profile
    )
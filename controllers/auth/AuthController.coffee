passport = require('passport')
passportConfig = require('../../config/passport.conf')

module.exports =


  loginLocal: (request, response, next) ->
    passport.authenticate("local", (err, user, info) ->
      if err
        throw error
      else if user
        # User credentials match
        request.logIn user, (err) ->
          if err
            throw error
          else
            user.toJSON (err, json) ->
              response.json "200",
                message:
                  status: "success"
                  message: "User logged in"
                user: json
      else
        response.json "403",
          message:
            status: "error"
            message: "incorrect username/password ?"


    ) request, response, next
passport = require('passport')
Logger = require '../../log/Logger'

logger = new Logger('Callback')

module.exports =

  loginLocal: (request, response, next) ->
    passport.authenticate("local", (err, user, info) ->
      if err
        logger.error(err)
        response.json(500, err)
      else if user
        # User credentials match
        request.logIn user, (err) ->
          if err
            logger.error(err)
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
var emailConf = {
    smtp : {
        service: "Gmail",
        auth: {
            user: "knownodes@gmail.com",
            pass: "secretnode"
        }
    }
}

exports.getEmailConfiguration = function() {
    return emailConf;
}
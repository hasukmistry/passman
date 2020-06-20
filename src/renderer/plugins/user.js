exports.login = function (name, email) {
    // lets set login to true
    process.env.PASSMAN_USER_LOGGED_IN = true

    process.env.PASSMAN_LOGGED_IN_USER_NAME = name

    process.env.PASSMAN_LOGGED_IN_EMAIL = email
}

exports.logOut = function() {
    // lets set logout to false
    process.env.PASSMAN_USER_LOGGED_IN = false

    process.env.PASSMAN_LOGGED_IN_USER_NAME = null

    process.env.PASSMAN_LOGGED_IN_EMAIL = null
}
// mixin for logged in user
export default {
    data() {
        return {
            loggedin_user: {
                user: process.env.PASSMAN_USER_LOGGED_IN,
                name: process.env.PASSMAN_LOGGED_IN_USER_NAME,
                email: process.env.PASSMAN_LOGGED_IN_EMAIL
            }
        }
    },
}
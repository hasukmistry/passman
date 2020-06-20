<template>
    <div class="container aligner">
        <div class="landing-screen">
            <h1>Password Manager</h1>
            <div v-if="isLoading">
                <screen-loader></screen-loader>
            </div>
            <div v-else>
                <div v-if="registered">
                    <div v-if="is_reg_done" class="reg-done">
                        <p>Congratulations, You are all set to use password manager.</p>
                    </div>
                    <login-form></login-form>
                </div>
                <div v-else>
                    <register-form></register-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ScreenLoader from '@/components/ScreenLoader'
import Login from '@/components/Login'
import Register from '@/components/Register'

export default {
    data() {
        return {
            isLoading: true,
            port: process.env.PASSMAN_BACKEND_PORT,
            registered: false,
            is_reg_done: false,
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'screen-loader': ScreenLoader,
       'login-form': Login,
       'register-form': Register
    },
    created() {
        let main = this

        // listen a registered event from register form
        EventBus.$on('USER_REGISTERED', () => {
            main.registered = true
            main.is_reg_done = true
        })

        // listen when user logged in
        EventBus.$on('USER_LOGGED_IN', () => {
            if (process.env.PASSMAN_USER_LOGGED_IN) {
                this.$router.push({ path: '/profile' })
            }
        })

        // second step after login, when google authenticator is enabled.
        EventBus.$on('VERIFY_GOOGLE_AUTHENTICATOR', () => {
            this.$router.push({ path: '/gauth' })
        })

        this.$http.post('/regStatus', {
                nonce: this.form_token
            })
            .then(function (response) {
                main.isLoading = false
                main.registered = response.data.status
            })
            .catch(function (error) {
                main.isLoading = false
                console.log(error);
            })
    }
}
</script>

<style lang="sass">
    .aligner {
        display: flex;
        align-items: center;
        justify-content: center;

        .landing-screen{
            margin-top:30px;
        }
        .reg-done{
            position: relative;
            padding: .25rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: .25rem;
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
    }
</style>
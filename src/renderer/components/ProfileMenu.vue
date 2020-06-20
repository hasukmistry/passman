<template>
    <div class="login-actions">
        <div class="description">
            <p>Welcome back {{ loggedin_user.name }}</p>
        </div>
        <div class="actions">
            <button v-if="isPasswordForm || isSettingsPage" class="btn profile" @click="profilePage">Profile</button>
            <button v-if="isProfilePage || isSettingsPage" class="btn create-new" @click="passwordForm">Create new</button>
            <button v-if="isPasswordForm || isProfilePage" @click="settingsPage" class="btn settings">Settings</button>
            <button @click="generateNewKey" class="btn key">Key</button>
            <button class="btn logout" @click="logout">Logout</button>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import login from '../mixins/login'

export default {
    name: 'ProfileMenu',
    mixins: [login],
    props: {
        isPasswordForm: {
            type: Boolean
        },
        isProfilePage: {
            type: Boolean
        },
        isSettingsPage: {
            type: Boolean
        }
    },
    methods: {
        logout() {
            // global event of user loging out
            EventBus.$emit('USER_LOG_OUT')
        },
        profilePage() {
            this.$router.push({ path: '/profile' })
        },
        passwordForm() {
            this.$router.push({ path: '/create-new' })
        },
        settingsPage() {
            this.$router.push({ path: '/settings' })
        },
        generateNewKey() {
            // sets markup
            let markup = ''

            markup += '<div class="text">This will generate a new security key if it does not exist.</div>'
            markup += '<div class="text">Before continuing,</div>'

            markup += '<ol>'

            markup += `<li>Security key and Encrpted images are related to each other.</li>`
            markup += `<li>If security key is lost, it will be impossible to get data back from images.</li>`
            markup += `<li>Viceversa is also true, When images are encrypted using different security key.</li>`
            markup += `<li>To generate a new key, Make sure you have no encrypted images and key here: <span class="location">${process.env.PASSMAN_USER_DIR}</span></li>`

            markup += '</ol>'

            EventBus.$emit('SHOW_NEW_KEY_POPUP', markup)
        }
    }
}
</script>

<style lang="sass">
    .login-actions{
        width:100%;
        display: flex;
        justify-content: space-between;
        .description{
            line-height:40px;
            p{
                margin:0;
                padding:0;
            }
        }
    }
    .login-actions .actions{
        right:0;
        position:relative;
        text-align:right;
        button.btn{
            cursor:pointer;
            display: inline-block;
            font-weight: 400;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            border: 1px solid transparent;
            padding: .375rem .75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: .25rem;
            transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
            margin-bottom:10px;
        }
        button.create-new, button.profile{
            color: #fff;
            background-color: #28a745;
            border-color: #28a745;
            &:hover{
                background-color: #218838;
                border-color: #1e7e34;
            }
        }
        button.settings{
            color: #fff;
            background-color: #17a2b8;
            border-color: #17a2b8;
            &:hover{
                background-color: #138496;
                border-color: #117a8b;
            }
        }
        button.key{
            color: #fff;
            background-color: #343a40;
            border-color: #343a40;
            &:hover{
                color: #fff;
                background-color: #23272b;
                border-color: #1d2124;
            }
        }
        button.logout{
            color: #fff;
            background-color: #dc3545;
            border-color: #dc3545;
            &:hover{
                background-color: #c82333;
                border-color: #bd2130;
            }
        }
    }
</style>
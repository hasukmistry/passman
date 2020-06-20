<template>
    <div>
        <user-dialogue v-if="logoutConfirmation" behaviour="confirm" :confirmAction="doLogout">Do you want to logout?</user-dialogue>

        <user-dialogue v-if="isInformation" behaviour="alert"><div class="information-text" v-html="informationText"></div></user-dialogue>

        <user-dialogue v-if="isNewKeyGeneration" behaviour="confirm" :confirmAction="generateNewKey"><div class="information-text" v-html="newKeyInformationText"></div></user-dialogue>

        <user-dialogue v-if="removeConfirmation" behaviour="confirm" :confirmAction="doRemove">Do you want to remove this?</user-dialogue>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import UserDialogue from '@/components/UserDialogue'
const user = require('../plugins/user')
const { clipboard } = require('electron').remote

export default {
    name: 'ProfileFooter',
    data() {
        return {
            logoutConfirmation: false,
            isInformation: false,
            informationText: '',
            isNewKeyGeneration: false,
            newKeyInformationText: '',
            removeConfirmation: false,
            removeFile: '',
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'user-dialogue': UserDialogue
    },
    created() {
        // disable loading
        this.isLoading = false

        let main = this
        // listen when user logged out
        EventBus.$on('USER_LOG_OUT', () => {
            if (process.env.PASSMAN_USER_LOGGED_IN) {
                main.logoutConfirmation = true
            }
        })

        // handle close dialogue event.
        EventBus.$on('CLOSE_DIALOGUE', () => {
            main.logoutConfirmation = false
        })

        // listen when information box enabled
        EventBus.$on('SHOW_INFORMATION', (data) => {
            main.isInformation = true
            main.informationText = data
        })

        // handles hide information
        EventBus.$on('HIDE_INFORMATION', () => {
            main.isInformation = false
            main.informationText = ''
        })

        document.addEventListener('click',function(e){
            if(e.target && e.target.getAttribute('class') === 'reveal-button'){
                let dataPass = e.target.getAttribute('data-password')
                e.target.innerText = 'Copied'
                main.copyTextToClipboard(dataPass)
            }
        })

        // listen when generate key button is clicked
        EventBus.$on('SHOW_NEW_KEY_POPUP', (data) => {
            main.isNewKeyGeneration = true
            main.newKeyInformationText = data
        })

        // handles hide new key popup
        EventBus.$on('HIDE_NEW_KEY_POPUP', () => {
            main.isNewKeyGeneration = false
            main.newKeyInformationText = ''
        })

        // listen when user wants to remove entry
        EventBus.$on('OPEN_CONFIRM_REMOVAL', (file) => {
            main.removeConfirmation = true
            main.removeFile = file
        })

        // handle close dialogue event.
        EventBus.$on('CLOSE_CONFIRM_REMOVAL', () => {
            main.removeConfirmation = false
            main.removeFile = ''
        })
    },
    methods: {
        doLogout() {
            user.logOut()

            this.$router.push({ path: '/' })
        },
        copyTextToClipboard(text) {
            clipboard.writeText(text)
        },
        generateNewKey() {
            EventBus.$emit('STARTED_PROGRESSING')

            this.$http.post('/generate', {
                nonce: this.form_token
            })
            .then(function (response) {
                // finish progressing and hides popup
                EventBus.$emit('FINISHED_PROGRESSING')
                EventBus.$emit('HIDE_NEW_KEY_POPUP')

                // sets markup
                let markup = ''

                if ( response.data.status ) {
                    markup += '<div class="success">New security key is successfully generated.</div>'
                } else {
                    markup += '<div class="error">Security key already exists.</div>'
                }

                // fires information popup
                EventBus.$emit('SHOW_INFORMATION', markup)
            })
            .catch(function (error) {
                // finish progressing and hides popup
                EventBus.$emit('FINISHED_PROGRESSING')
                EventBus.$emit('HIDE_NEW_KEY_POPUP')

                // sets markup
                let markup = ''

                markup += `<div class="error">${error}</div>`

                // fires information popup
                EventBus.$emit('SHOW_INFORMATION', markup)
            })

        },
        doRemove() {
            let removeFile = this.removeFile

            EventBus.$emit('STARTED_PROGRESSING')

            this.$http.post('/remove-entry', {
                nonce: this.form_token,
                file: removeFile
            })
            .then(function (response) {
                // finish progressing and hides popup
                EventBus.$emit('FINISHED_PROGRESSING')
                EventBus.$emit('CLOSE_CONFIRM_REMOVAL')

                // sets markup
                let markup = ''

                if ( response.data.status ) {
                    EventBus.$emit('FILTER_IMAGES', removeFile)
                    markup += '<div class="success">Entry is removed successfully.</div>'
                } else {
                    markup += '<div class="error">Failed, removing selected entry.</div>'
                }

                // fires information popup
                EventBus.$emit('SHOW_INFORMATION', markup)
            })
            .catch(function (error) {
                // finish progressing and hides popup
                EventBus.$emit('FINISHED_PROGRESSING')
                EventBus.$emit('CLOSE_CONFIRM_REMOVAL')

                // sets markup
                let markup = ''

                markup += `<div class="error">${error}</div>`

                // fires information popup
                EventBus.$emit('SHOW_INFORMATION', markup)
            })
        }
    }
}
</script>

<style lang="sass">
    .information-text{
        div{
            label{
                font-weight:bold;
                font-size:18px;
            }
            div.text{
                font-size:16px;
            }
            div.text.withButton{
                font-size:16px;
                line-height:30px;
                button{
                    position:relative;
                    top:-2px;
                    margin-left:10px;
                    cursor:pointer;
                }
            }
            padding-bottom:10px;
        }
        div.success{
            color:#28a745;
        }
        div.error{
            color:#dc3545;
        }
        ol{
            margin:0px 15px;
            padding:0px;
            li {
                margin-bottom:10px;
                line-height:20px;
                .location{
                    display: inline-block;
                    padding: .25em .4em;
                    line-height: 1;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: baseline;
                    border-radius: .25rem;
                    color: #fff;
                    background-color: #6c757d;
                }
            }
        }
    }
</style>
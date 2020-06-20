<template>
    <div class="settings-form">
        <h3>Settings</h3>
        <div v-if="isSuccessMsg" class="success">
            <p>{{ successMsg }}</p>
        </div>
        <div v-if="this.errors.length > 0" class="error-groups">
            <div class="error" v-for="error in this.errors" :key="error">
                {{ error }}
            </div>
        </div>
        <div class="form">
            <form @submit.prevent="submit">
                <div class="field">
                    <input type="checkbox" v-model.trim="google_authenticator.model" />
                    <label class="withCheckbox">Enable google authenticator</label>
                </div>
                <div v-if="qrGenerated && google_authenticator.model" class="authentication_qrcode">
                    <div class="codeinfo">
                        <p>Please scan the following qr code in google authenticator app.</p>
                        <p>If you lost an access to the device in which google authenticator is installed, use <b>{{mastercode}}</b> to login.</p>
                    </div>
                    <img :src="qrcode">
                </div>
                <div class="actions">
                    <input type="hidden" name="_token" v-model.trim="form_token">
                    <button :disabled="isProcessing" type="submit" class="default button">Save</button>
                    <loader v-if="isProcessing"></loader>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ProcessLoader from '@/components/ProcessLoader'

export default {
    name: 'SettingsForm',
    data() {
        return {
            google_authenticator :{
                model: false
            },
            errors: [],
            isProcessing: false,
            isSuccessMsg: false,
            successMsg: '',
            qrcode: '',
            mastercode: '',
            authSecret: '',
            qrGenerated: false,
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'loader': ProcessLoader
    },
    created() {
        let main = this
        main.$http.get(`/qrcode/${main.form_token}`)
            .then(function (response) {
                main.qrcode = response.data.data
                main.mastercode = response.data.mastercode
                main.google_authenticator.model = response.data.isEnabled
                main.authSecret = response.data.authSecret
                main.qrGenerated = true
            })
            .catch(function (error) {
                console.log(error)
            })
    },
    methods: {
        submit() {
            console.log('Saving a user setting!')

            let main = this

            // turn on processing.
            this.isProcessing = true;

            this.$http.post('/settings', {
                    isEnabled: this.google_authenticator.model,
                    mastercode: this.mastercode,
                    authSecret: this.authSecret,
                    nonce: this.form_token
                })
                .then(function (response) {
                    // turn off processing.
                    main.isProcessing = false;

                    main.isSuccessMsg = true
                    main.successMsg = 'Success, Settings saved.'

                    // global event for successfull saving
                    EventBus.$emit('SETTINGS_SAVED')
                })
                .catch(function (error) {
                    console.log(error);

                    // turn off processing.
                    main.isProcessing = false;
                })
        }
    }
}
</script>

<style lang="sass">
    .settings-form{
        height:400px;
        border:1px solid #343a40;
        margin-top:10px;
        padding:20px;
        overflow-y:scroll;
        h3{
            margin:0;
            padding:0;
            padding-bottom:10px;
            border-bottom:1px solid #e9ecef;
        }
        .success{
            position: relative;
            padding: .25rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: .25rem;
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
        .error-groups{
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
            padding: .25rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: .25rem;
        }
        .error {
            margin: 0.2rem;
        }
        .form{
            padding: 0px 20px 0px 0px;
            .field{
                padding:10px 0px;
                label {
                    display: block;
                    padding-bottom: 5px;
                }
                label.withCheckbox{
                    display: inline-block;
                }
                input {
                    width: 100%;
                    line-height:20px;
                    padding: 5px;
                    transition: border .1s ease;
                }
                input[type='checkbox'] {
                    display:inline-block;
                    width:auto;
                }
            }
            .authentication_qrcode{
                .codeinfo p{
                    margin:0;
                    padding:0;
                    padding-bottom:10px;
                    padding-left:15px;
                }
            }
            .actions {
                .button.default{
                    cursor:pointer;
                    border:none;
                    border-radius: 2px;
                    background-color: #428500;
                    transition-duration: .5s;
                    color: #fff;
                    padding: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    display: inline-block;
                    min-width:100px;
                    &:hover {
                        color: #fff;
                        background-color: #316300;
                    }
                }
            }
            .form-group--error{
                color:#721c24;
                input {
                    border-color: #721c24;
                }
            }
        }
    }
</style>
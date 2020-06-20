<template>
    <div class="login">
        <div>
            <p>Please, Enter your password to login.</p>
            <p>You will be asked to enter 6 digit code, If google authenticator is enabled.</p>
            <p>After verification you can start managing your passwords using steganography.</p>
        </div>
        <div v-if="this.errors.length > 0" class="error-groups">
            <div class="error" v-for="error in this.errors" :key="error">
                {{ error }}
            </div>
        </div>
        <div class="form">
            <form @submit.prevent="submit">
                <div class="field" :class="{ 'form-group--error': pass.error }">
                    <label>Password</label>
                    <input v-focus type="password" name="app_pass" v-model.trim="pass.model" />
                </div>
                <div class="actions">
                    <input type="hidden" name="_token" v-model.trim="form_token">
                    <button :disabled="isProcessing" type="submit" class="default button">Login</button>
                    <loader v-if="isProcessing"></loader>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ProcessLoader from '@/components/ProcessLoader'
const user = require('../plugins/user')

export default {
    name: 'Login',
    data() {
        return {
            pass: {
                model: '',
                error: false,
                validation: {
                    required: true,
                    minLength: 6
                }
            },
            errors: [],
            isProcessing: false,
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'loader': ProcessLoader
    },
    methods: {
        submit() {
            console.log('Logging in user!')

            // turn on processing.
            this.isProcessing = true;

            // resets field errors
            this.pass.error = false;

            this.errors = [];

            if (!this.pass.model && this.pass.validation.required) {
                this.pass.error = true;
                this.errors.push('Password is required.');
            } else if (this.pass.model.length < this.pass.validation.minLength) {
                this.pass.error = true;
                this.errors.push(`Password must have at least ${this.pass.validation.minLength} letters.`);
            }

            let main = this

            if (this.errors.length === 0) {
                this.$http.post('/login', {
                    password: this.pass.model,
                    nonce: this.form_token
                })
                .then(function (response) {
                    if ( response.data.status ) {
                        // lets check if google authenticator is enabled.
                        if(response.data.isGauthEnabled === 1) {
                            EventBus.$emit('VERIFY_GOOGLE_AUTHENTICATOR')
                        } else {
                            user.login(response.data.name, response.data.email)

                            // global event of user registration
                            EventBus.$emit('USER_LOGGED_IN')
                        }
                    } else {
                        main.pass.error = true;
                        main.errors.push('Login failed, Invalid password.');
                    }

                    // turn off processing.
                    main.isProcessing = false;
                })
                .catch(function (error) {
                    console.log(error);

                    // turn off processing.
                    main.isProcessing = false;
                })
            } else {
                // turn off processing.
                main.isProcessing = false;
            }
        }
    }
}
</script>

<style lang="sass">
    .login{
        margin-top:30px;
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
            margin-top:40px;
            .field{
                padding:10px 0px;
                label {
                    display: block;
                    padding-bottom: 5px;
                }
                input {
                    width: 100%;
                    line-height:20px;
                    padding: 5px;
                    transition: border .1s ease;
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
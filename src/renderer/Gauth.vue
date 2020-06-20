<template>
    <div class="container aligner">
        <div class="gauth-screen">
            <h1>Password Manager</h1>
            <div v-if="isLoading">
                <screen-loader></screen-loader>
            </div>
            <div v-else class="gauth">
                <div>
                    <p>You have enabled google authenticator.</p>
                    <p>Please, Enter verification code from a google authenticator app.</p>
                    <p>After verification you can start managing your passwords using steganography.</p>
                </div>
                <div v-if="this.errors.length > 0" class="error-groups">
                    <div class="error" v-for="error in this.errors" :key="error">
                        {{ error }}
                    </div>
                </div>
                <div class="form">
                    <form @submit.prevent="submit">
                        <div class="field" :class="{ 'form-group--error': code.error }">
                            <label>Verification Code</label>
                            <input v-focus type="text" name="app_code" v-model.trim="code.model" />
                        </div>
                        <div class="actions">
                            <input type="hidden" name="_token" v-model.trim="form_token">
                            <button :disabled="isProcessing" type="submit" class="default button">Login</button>
                            <loader v-if="isProcessing"></loader>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ScreenLoader from '@/components/ScreenLoader'
import ProcessLoader from '@/components/ProcessLoader'
const user = require('./plugins/user')

export default {
    name: 'Gauth',
    data() {
        return {
            code: {
                model: '',
                error: false,
                validation: {
                    required: true,
                    minLength: 6
                }
            },
            isLoading: true,
            errors: [],
            isProcessing: false,
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'screen-loader': ScreenLoader,
       'loader': ProcessLoader
    },
    created() {
        // disable main loader
        this.isLoading = false
    },
    methods: {
        submit() {
            console.log('Verifying google authenticator code for user!')

            // turn on processing.
            this.isProcessing = true;

            // resets field errors
            this.code.error = false;

            this.errors = [];

            if (!this.code.model && this.code.validation.required) {
                this.code.error = true;
                this.errors.push('Verification code is required.');
            } else if (this.code.model.length < this.code.validation.minLength) {
                this.code.error = true;
                this.errors.push(`Code must have at least ${this.code.validation.minLength} letters.`);
            }

            let main = this

            if (this.errors.length === 0) {
                this.$http.post('/gauth', {
                    code: this.code.model,
                    nonce: this.form_token
                })
                .then(function (response) {
                    if ( response.data.status ) {
                        user.login(response.data.name, response.data.email)

                        // global event of user registration
                        EventBus.$emit('USER_LOGGED_IN')
                    } else {
                        main.code.error = true;
                        main.errors.push('Login failed, Code is expired or invalid.');
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
    .aligner {
        display: flex;
        align-items: center;
        justify-content: center;

        .gauth-screen{
            margin-top:30px;
        }
        .gauth{
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
    }
</style>
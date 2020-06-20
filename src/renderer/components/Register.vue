<template>
    <div class="register">
        <div>
            <p>Please, Enter your details to start using an app.</p>
        </div>
        <div v-if="this.errors.length > 0" class="error-groups">
            <div class="error" v-for="error in this.errors" :key="error">
                {{ error }}
            </div>
        </div>
        <div class="form">
            <form @submit.prevent="submit">
                <div class="field" :class="{ 'form-group--error': name.error }">
                    <label>Name</label>
                    <input v-focus type="text" name="app_name" v-model.trim="name.model" />
                </div>
                <div class="field" :class="{ 'form-group--error': email.error }">
                    <label>Email</label>
                    <input type="text" name="app_email" v-model="email.model" />
                </div>
                <div class="field" :class="{ 'form-group--error': pass.error }">
                    <label>Password</label>
                    <input type="password" name="app_pass" v-model.trim="pass.model" />
                </div>
                <div class="field" :class="{ 'form-group--error': rpass.error }">
                    <label>Retype Password</label>
                    <input type="password" name="app_rpass" v-model.trim="rpass.model" />
                </div>
                <div class="actions">
                    <input type="hidden" name="_token" v-model.trim="form_token">
                    <button :disabled="isProcessing" type="submit" class="default button">Setup</button>
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
    name: 'Register',
    data() {
        return {
            name: {
                model: '',
                error: false,
                validation: {
                    required: true,
                    minLength: 4
                }
            },
            email: {
                model: '',
                error: false,
                validation: {
                    required: true,
                    isEmail: true
                }
            },
            pass: {
                model: '',
                error: false,
                validation: {
                    required: true,
                    minLength: 6
                }
            },
            rpass: {
                model: '',
                error: false,
                validation: {
                    sameAs: null
                }
            },
            errors: [],
            isProcessing: false,
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    created() {
        // add validation.
        this.rpass.validation.sameAs = this.pass
    },
    components: {
       'loader': ProcessLoader
    },
    methods: {
        submit() {
            console.log('Setting up user!')

            // turn on processing.
            this.isProcessing = true;

            // resets field errors
            this.name.error = false;
            this.email.error = false;
            this.pass.error = false;
            this.rpass.error = false;

            this.errors = [];

            if (!this.name.model && this.name.validation.required) {
                this.name.error = true;
                this.errors.push('Name is required.');
            } else if (this.name.model.length < this.name.validation.minLength) {
                this.name.error = true;
                this.errors.push(`Name must have at least ${this.name.validation.minLength} letters.`);
            }

            if (!this.email.model && this.email.validation.required) {
                this.email.error = true;
                this.errors.push('Email is required.');
            } else if (this.email.validation.isEmail) {
                let regexp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
                if (!regexp.test(this.email.model))
                {
                    this.email.error = true;
                    this.errors.push('Valid email is required.');
                }
            }

            if (!this.pass.model && this.pass.validation.required) {
                this.pass.error = true;
                this.errors.push('Password is required.');
            } else if (this.pass.model.length < this.pass.validation.minLength) {
                this.pass.error = true;
                this.errors.push(`Password must have at least ${this.pass.validation.minLength} letters.`);
            }

            if (this.rpass.model !== this.rpass.validation.sameAs.model) {
                this.rpass.error = true;
                this.errors.push('Passwords must be identical.');
            }

            let main = this

            if (this.errors.length === 0) {
                this.$http.post('/register', {
                    name: this.name.model,
                    email: this.email.model,
                    password: this.pass.model,
                    nonce: this.form_token
                })
                .then(function (response) {
                    console.log(response);

                    // turn off processing.
                    main.isProcessing = false;

                    // global event of user registration
                    EventBus.$emit('USER_REGISTERED')
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
    .register{
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
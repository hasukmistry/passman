<template>
    <div class="password-form">
        <h3 v-if="model.mode==='create'">Create a new entry</h3>
        <h3 v-else-if="model.mode==='edit'">Edit an entry</h3>

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
                <div class="field" :class="{ 'form-group--error': title.error }">
                    <label>Title</label>
                    <input v-focus type="text" v-model.trim="title.model" />
                </div>
                <div class="field" :class="{ 'form-group--error': description.error }">
                    <label>Description</label>
                    <textarea v-model.trim="description.model" rows="3"></textarea>
                </div>
                <div class="field" :class="{ 'form-group--error': pass.error }">
                    <label>Password to save</label>
                    <input type="password" v-model.trim="pass.model" />
                </div>
                <div v-if="!hasInternet" class="field" :class="{ 'form-group--error': image.error }">
                    <label>Image</label>
                    <div @click="openDialogue" >
                        <input class="disabled" v-model.trim="image.model" type="text" disabled />
                        <button type="button" name="selectedImageFile" id="selectedImageFile" class="choose-file">Choose File</button>
                    </div>
                </div>
                <div class="actions">
                    <input type="hidden" name="_token" v-model.trim="form_token">
                    <button :disabled="isProcessing" type="submit" class="default button">{{ model.mode==='create' ? 'Save' : 'Update'}}</button>
                    <loader v-if="isProcessing"></loader>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ProcessLoader from '@/components/ProcessLoader'
const { dialog } = require('electron').remote

export default {
    name: 'PasswordForm',
    props: {
        mode: {
            type: String,
            required: true
        },
        entryData: {
            type: Object,
            required: false
        },
        currentEntry: {
            type: String,
            required: false
        },
    },
    data() {
        return {
            title: {
                model: '',
                error: false,
                validation: {
                    required: true,
                    minLength: 4
                }
            },
            description: {
                model: '',
                error: false
            },
            pass: {
                model: '',
                error: false,
                validation: {
                    required: true
                }
            },
            image: {
                model: '',
                error: false,
                validation: {
                    required: true
                }
            },
            errors: [],
            isProcessing: false,
            isSuccessMsg: false,
            successMsg: '',
            hasInternet: false,
            model: {
                mode: this.mode,
                entryData : this.entryData,
                currentEntry: this.currentEntry
            },
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'loader': ProcessLoader
    },
    created() {
        let main = this

        // sets value if edit mode
        if (main.model.mode === 'edit') {
            main.title.model = main.model.entryData.title
            main.description.model = main.model.entryData.description
            main.pass.model = main.model.entryData.password
        }

        // check internet access
        main.hasInternet = main.isOnline()

        EventBus.$on('ENTRY_CREATED', (file, msg) => {
            if (file!=='') {
                main.isSuccessMsg = true
                main.successMsg = 'Success, Encrypted file created at :' + file

                // resets field errors and field
                // on successfull edit, reset mode as well
                main.model.mode = 'create'
                main.model.entryData = {}
                main.model.currentEntry = ''

                main.title.error = false;
                main.title.model = '';

                main.description.model = '';

                main.pass.error = false;
                main.pass.model = '';

                if ( ! main.hasInternet ) {
                    main.image.error = false;
                    main.image.model = '';
                }
            } else if(msg!=='') {
                this.errors = []
                this.errors.push(msg)

                // resets field errors
                main.title.error = false;
                main.pass.error = false;

                if ( ! main.hasInternet ) {
                    main.image.error = false;
                }
            } else {
                this.errors = []
                this.errors.push('Internal error or Invalid image provided.')

                // resets field errors
                main.title.error = false;
                main.pass.error = false;

                if ( ! main.hasInternet ) {
                    main.image.error = false;
                }
            }
        })
    },
    methods: {
        isOnline(){
            return navigator.onLine;
        },
        submit() {
            console.log('Creating a new entry!')

            // turn on processing.
            this.isProcessing = true;

            // resets field errors
            this.title.error = false;
            this.pass.error = false;
            this.image.error = false;

            // resets success msg
            this.isSuccessMsg = false
            this.successMsg = ''

            this.errors = [];

            if (!this.title.model && this.title.validation.required) {
                this.title.error = true;
                this.errors.push('Title is required.');
            } else if (this.title.model.length < this.title.validation.minLength) {
                this.title.error = true;
                this.errors.push(`Title must have at least ${this.title.validation.minLength} letters.`);
            }

            if (!this.pass.model && this.pass.validation.required) {
                this.pass.error = true;
                this.errors.push('Password is required.');
            }

            // checks only if client do not have active internet.
            if ( ! this.hasInternet ) {
                if (!this.image.model && this.image.validation.required) {
                    this.image.error = true;
                    this.errors.push('Image is required.');
                }
            }

            let main = this

            if (this.errors.length === 0) {
                this.$http.post('/encrypt', {
                    title: this.title.model,
                    description: this.description.model,
                    password: this.pass.model,
                    image: this.image.model,
                    mode: this.model.mode,
                    currentEntry: encodeURIComponent(this.model.currentEntry),
                    nonce: this.form_token
                })
                .then(function (response) {
                    // console.log(response.data.file);

                    // turn off processing.
                    main.isProcessing = false;

                    if ( response.data.status ) {
                        // global event for successfull entry
                        EventBus.$emit('ENTRY_CREATED', response.data.file, '')
                    } else {
                        EventBus.$emit('ENTRY_CREATED', '', response.data.msg)
                    }
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
        },
        async openDialogue() {
            // https://github.com/electron/electron/blob/v0.36.9/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
            // open file dialogue
            const files = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'Images', extensions: ['jpg', 'jpeg'] }
                ]
            })

            // if no files
            if (!files) {
                this.image.model = ''
                return;
            }

            // lets get first file path.
            const file = files.filePaths[0];

            this.image.model = file
        }
    }
}
</script>

<style lang="sass">
    .password-form{
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
                input {
                    width: 100%;
                    line-height:20px;
                    padding: 5px;
                    transition: border .1s ease;
                }
                input.disabled{
                    line-height:10px;
                    width:auto;
                }
                textarea {
                    width: calc(100% + 8px);
                    transition: border .1s ease;
                }
            }
            button.choose-file{
                -webkit-appearance: button;
                -webkit-writing-mode: horizontal-tb !important;
                text-rendering: auto;
                color: -internal-light-dark-color(buttontext, rgb(170, 170, 170));
                letter-spacing: normal;
                word-spacing: normal;
                text-transform: none;
                text-indent: 0px;
                text-shadow: none;
                display: inline-block;
                text-align: center;
                align-items: flex-start;
                cursor: default;
                background-color: -internal-light-dark-color(rgb(239, 239, 239), rgb(74, 74, 74));
                box-sizing: border-box;
                margin: 0em;
                font: 400 13.3333px Arial;
                padding: 1px 6px;
                border-width: 2px;
                border-style: outset;
                border-color: -internal-light-dark-color(rgb(118, 118, 118), rgb(195, 195, 195));
                border-image: initial;
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
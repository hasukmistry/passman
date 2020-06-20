<template>
    <div class="passwords-gallery">
        <div v-if="isProcessing" class="gallery-loader">
            <profile-loader></profile-loader>
        </div>
        <div v-if="images.length > 0" class="gallery">
            <div class="images">
                <div v-for="image in images" :key="image.file" class="image" :style="{ backgroundImage: `url('${image.url}')` }">
                    <div class="data">
                        <div class="content">
                            <label>{{image.data.title}}</label>
                            <div class="actions-panel">
                                <button title="Edit" @click="editInformation(image.file)">&#9998;</button>
                                <button title="Remove" @click="removeInformation(image.file)">&times;</button>
                            </div>
                            <button @click="revealInformation(image.data)">Reveal</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="no-images">
                <p>No entries are found.</p>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ProfileLoader from '@/components/ProfileLoader'

export default {
    name: 'PasswordsGallery',
    data() {
        return {
            isProcessing: true,
            entries: [],
            images: [],
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'profile-loader': ProfileLoader
    },
    created() {
        let main = this

        // turn on processing
        main.isProcessing = true

        this.$http.post('/entries', {
            nonce: this.form_token
        })
        .then(function (response) {
            // console.log(response.data);

            if(response.data.status) {
                main.entries = response.data.entries

                main.entries.forEach(function (img) {
                    // lets make a request to retrieve image
                    let img_url = main.$http.defaults.baseURL + `/image/${main.form_token}/file/${encodeURIComponent(img.file)}`

                    // make request to get single file data
                    main.$http.post('/entry', {
                        nonce: main.form_token,
                        file: encodeURIComponent(img.file)
                    })
                    .then(function (response) {
                        if (response.data.isValid) {
                            main.images.push({
                                file: img.file,
                                url: img_url,
                                data: response.data.data
                            })
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                })

                main.isProcessing = false
            } else {
                main.isProcessing = false
            }
        })
        .catch(function (error) {
            console.log(error);

            main.isProcessing = false
        })

        // filter images on removal
        EventBus.$on('FILTER_IMAGES', (file) => {
            main.images = main.images.filter(function (image) {
                if (file!==image.file) {
                    return image
                }
            })
        })
    },
    methods:{
        revealInformation(data) {
            // sets markup
            let markup = ''

            markup += `<div><label>Title: </label><div class="text">${data.title}</div></div>`
            if (data.description!=='') {
                markup += `<div><label>Description: </label><div class="text">${data.description}</div></div>`
            }
            markup += `<div><label>Password: </label><div class="text withButton">********<button class="reveal-button" data-password="${data.password}">Copy</button></div></div>`

            // fires information popup
            EventBus.$emit('SHOW_INFORMATION', markup)
        },
        removeInformation(file) {
            // Open confirmation popup
            EventBus.$emit('OPEN_CONFIRM_REMOVAL', file)
        },
        editInformation(file) {
            this.$router.push({ path: '/create-new', query: { entry: encodeURIComponent(file) } })
        }
    }
}
</script>

<style lang="sass">
    .passwords-gallery{
        width:100%;
        height:420px;
        border:1px solid #343a40;
        margin-top:10px;
        position:relative;
        overflow-y:scroll;

        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.1);
        .gallery-loader{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            -ms-transform: translate(-50%,-50%);
        }

        .gallery{
            display: flex;
            align-items:center;
            .image{
                -webkit-background-size: cover;
                -moz-background-size: cover;
                -o-background-size: cover;
                background-size: cover;
                background-repeat:no-repeat;
                background-position:center;
                width:185px;
                height:185px;
                margin:14px 10px 0px 14px;
                display:inline-block;
                cursor:pointer;
                position:relative;
                .data{
                    width:100%;
                    height:100%;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.6);
                    position:absolute;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    word-wrap: break-word;
                    overflow:hidden;
                    overflow-y:scroll;
                    .content{
                        text-align:center;
                        label{
                            display:block;
                            color:#fff;
                            text-align:center;
                            font-size:18px;
                            line-height:20px;
                            margin-bottom:5px;
                        }
                        button{
                            cursor:pointer;
                            text-align: center;
                            white-space: nowrap;
                            vertical-align: middle;
                            -webkit-user-select: none;
                            -moz-user-select: none;
                            -ms-user-select: none;
                            user-select: none;
                            border: 1px solid transparent;
                            &:hover{
                                color: #23272b;
                                background-color: #fff;
                                border-color: #fff;
                            }
                        }
                        .actions-panel{
                            position:absolute;
                            top:0;
                            right:0;
                            padding:2px;
                            button{
                                color: #343a40;
                                background-color: #ededed;
                                border-color: #ededed;
                                &:hover{
                                    color: #23272b;
                                    background-color: #fff;
                                    border-color: #fff;
                                }
                            }
                        }
                    }
                }
            }
        }
        .no-images{
            display:flex;
            align-items:center;
            justify-content:center;

            width:100%;
            height:100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            position:absolute;
        }
    }

</style>
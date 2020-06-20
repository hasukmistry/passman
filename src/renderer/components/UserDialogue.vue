<template>
    <div v-if="behaviour" class="overlay display">
        <div class="content">
            <div class="header">
                <h4 class="title">{{ behaviour==='confirm' ? 'Confirm' : 'Information'}}</h4>
            </div>

            <div class="body"><slot></slot></div>

            <div v-if="behaviour==='confirm'">
                <div class="footer">
                    <loader class="progess-bar" v-if="isProcessing"></loader>
                    <button :disabled="isProcessing" type="button" @click="confirmAction" class="btn yes">
                        Yes
                    </button>
                    <button :disabled="isProcessing" type="button" @click="closeDialogue" class="btn no">
                        No
                    </button>
                </div>
            </div>
            <div v-if="behaviour==='alert'">
                <div class="footer">
                    <button type="button" @click="closeInformation" class="btn close">
                        Okay
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ProcessLoader from '@/components/ProcessLoader'

export default {
    name: 'ProfileFooter',
    props: {
        behaviour: {
            type: String,
            required: true
        },
        confirmAction: {
            type: Function,
            required: false
        }
    },
    components: {
       'loader': ProcessLoader
    },
    data() {
        return {
            isProcessing: false
        }
    },
    created() {
        let main = this
        EventBus.$on('STARTED_PROGRESSING', () => {
            main.isProcessing = true
        })

        EventBus.$on('FINISHED_PROGRESSING', () => {
            main.isProcessing = false
        })
    },
    methods: {
        closeDialogue() {
            // global event of closing a popup
            EventBus.$emit('CLOSE_DIALOGUE')
            EventBus.$emit('HIDE_NEW_KEY_POPUP')
            EventBus.$emit('CLOSE_CONFIRM_REMOVAL')
        },
        closeInformation() {
            // global event of closing a popup
            EventBus.$emit('HIDE_INFORMATION')
        }
    }
}
</script>

<style lang="sass">
    .overlay {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 9999;
        &.none{
            display:none;
        }
        &.display {
            display: block;
        }
        .content{
            position: absolute;
            top: 50%;
            left: 50%;
            color: white;
            transform: translate(-50%,-50%);
            -ms-transform: translate(-50%,-50%);
            padding:10px;
            background-color: #fff;
            border: 1px solid rgba(0,0,0,.2);
            border-radius: .3rem;
            outline: 0;
            color: #212529;
            min-width:400px;
            .header{
                width:100%;
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #e9ecef;
                border-top-left-radius: .3rem;
                border-top-right-radius: .3rem;
                padding:10px 0px;
                h4{
                    margin:0;
                    padding:0;
                    line-height: 30px;
                }
                button.close{
                    cursor:pointer;
                    padding: 5px 10px;
                }
            }
            .body{
                padding:15px 0px;
                font-size: 16px;
            }
            .footer{
                .progess-bar{
                    margin-right:10px;
                }
                width:100%;
                display: flex;
                justify-content: flex-end;
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
                    padding: .25rem .75rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    border-radius: .25rem;
                    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                    margin-bottom:10px;
                }
                button.close{
                    color: #fff;
                    background-color: #6c757d;
                    border-color: #6c757d;
                    &:hover{
                        background-color: #5a6268;
                        border-color: #545b62;
                    }
                }
                button.yes{
                    color: #fff;
                    background-color: #28a745;
                    border-color: #28a745;
                    margin-right:10px;
                    &:hover{
                        background-color: #218838;
                        border-color: #1e7e34;
                    }
                }
                button.no{
                    color: #fff;
                    background-color: #dc3545;
                    border-color: #dc3545;
                    &:hover{
                        background-color: #c82333;
                        border-color: #bd2130;
                    }
                }
            }
        }
    }
</style>
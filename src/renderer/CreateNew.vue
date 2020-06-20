<template>
    <div v-if="loggedin_user.user" class="container aligner">
        <div class="profile-screen">
            <h1>Password Manager</h1>
            <div v-if="isLoading">
                <screen-loader></screen-loader>
            </div>
            <div v-else>
                <profile-menu :isPasswordForm="true"></profile-menu>
                <password-form :mode="mode" :entryData="entryData" :currentEntry="currentEntry"></password-form>
                <profile-footer></profile-footer>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ScreenLoader from '@/components/ScreenLoader'
import ProfileMenu from '@/components/ProfileMenu'
import PasswordForm from '@/components/PasswordForm'
import ProfileFooter from '@/components/ProfileFooter'
import login from '@/mixins/login'

export default {
    name: 'CreateNew',
    mixins: [login],
    data() {
        return {
            isLoading: true,
            mode: 'create',
            entryData : {},
            currentEntry: '',
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'screen-loader': ScreenLoader,
       'profile-menu': ProfileMenu,
       'password-form': PasswordForm,
       'profile-footer': ProfileFooter
    },
    created() {
        let main = this

        // edit mode is on
        if ( main.$route.query.entry !== undefined ) {
            // make request to get single file data
            main.$http.post('/entry', {
                nonce: main.form_token,
                file: encodeURIComponent(main.$route.query.entry)
            })
            .then(function (response) {
                if (response.data.isValid) {
                    // set if entry is valid
                    main.mode = 'edit'
                    main.entryData = response.data.data
                    main.currentEntry = main.$route.query.entry

                    // disable loading
                    main.isLoading = false
                } else {
                    main.isLoading = false
                }
            })
            .catch(function (error) {
                console.log(error);

                // disable loading
                main.isLoading = false
            })
        } else {
            // disable loading
            main.isLoading = false
        }
    }
}
</script>

<style lang="sass">
    .aligner {
        display: flex;
        align-items: center;
        justify-content: center;

        .profile-screen{
            margin-top:30px;
            width: 80%;
        }
    }
</style>
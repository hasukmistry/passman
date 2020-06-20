<template>
    <div v-if="loggedin_user.user" class="container aligner">
        <div class="settings-screen">
            <h1>Password Manager</h1>
            <div v-if="isLoading">
                <screen-loader></screen-loader>
            </div>
            <div v-else>
                <profile-menu :isSettingsPage="true"></profile-menu>
                <settings-form></settings-form>
                <profile-footer></profile-footer>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus'
import ScreenLoader from '@/components/ScreenLoader'
import ProfileMenu from '@/components/ProfileMenu'
import SettingsForm from '@/components/SettingsForm'
import ProfileFooter from '@/components/ProfileFooter'
import login from '@/mixins/login'

export default {
    name: 'Settings',
    mixins: [login],
    data() {
        return {
            isLoading: true,
            form_token: process.env.PASSMAN_FORM_TOKEN
        }
    },
    components: {
       'screen-loader': ScreenLoader,
       'profile-menu': ProfileMenu,
       'settings-form': SettingsForm,
       'profile-footer': ProfileFooter
    },
    created() {
        // disable loading
        this.isLoading = false
    }
}
</script>

<style lang="sass">
    .aligner {
        display: flex;
        align-items: center;
        justify-content: center;

        .settings-screen{
            margin-top:30px;
            width: 80%;
        }
    }
</style>
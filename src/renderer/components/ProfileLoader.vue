<template>
    <div class="profile-loader">
        <img :src="isDevelopment ? 'assets/loader-32X32.gif' : '../assets/loader-32X32.gif'" />
    </div>
</template>

<script>
export default {
    name: 'ProfileLoader',
    data() {
        return {
            isDevelopment: process.env.NODE_ENV !== 'production'
        }
    }
}
</script>

<style lang="sass">
    .profile-loader{
        display:inline-block;
        position:relative;
        margin: 0px;
        top: 5px;
    }
</style>
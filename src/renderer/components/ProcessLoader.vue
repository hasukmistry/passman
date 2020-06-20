<template>
    <div class="process-loader">
        <img :src="isDevelopment ? 'assets/loader-24X24.gif' : '../assets/loader-24X24.gif'" />
    </div>
</template>

<script>
export default {
    name: 'ProcessLoader',
    data() {
        return {
            isDevelopment: process.env.NODE_ENV !== 'production'
        }
    }
}
</script>

<style lang="sass">
    .process-loader{
        display:inline-block;
        position:relative;
        margin: 0px;
        top: 5px;
    }
</style>
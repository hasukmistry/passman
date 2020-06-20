<template>
    <div class="loader">
        <div><img :src="isDevelopment ? 'assets/loader-48X48.gif' : '../assets/loader-48X48.gif'" /></div>
        <label>Please wait</label>
    </div>
</template>

<script>
export default {
    name: 'ScreenLoader',
    data() {
        return {
            isDevelopment: process.env.NODE_ENV !== 'production'
        }
    }
}
</script>

<style lang="sass">
    .loader{
        text-align: center;
        padding: 30px;
        label{
            padding:10px;
            display:block;
            line-height:20px;
        }
    }
</style>
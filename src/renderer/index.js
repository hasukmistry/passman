import Vue from 'vue'
import axios from 'axios'

import VueRouter from 'vue-router'

const appUser = require('./plugins/user')

Vue.use(VueRouter)

// import App from './App.vue'

// lets create routes
const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: require('./App').default
    },
    {
        path: '/gauth',
        name: 'Gauth',
        component: require('./Gauth').default
    },
    {
        path: '/profile',
        name: 'Profile',
        component: require('./Profile').default
    },
    {
        path: '/create-new',
        name: 'CreateNew',
        component: require('./CreateNew').default
    },
    {
        path: '/settings',
        name: 'Settings',
        component: require('./Settings').default
    },
    {
        path: '*',
        redirect: '/'
    }
]

const router = new VueRouter({
    routes // short for `routes: routes`
})

// console.log(__static)

Vue.config.productionTip = false

axios.defaults.baseURL = `http://localhost:${process.env.PASSMAN_BACKEND_PORT}/passman`

// https://stackoverflow.com/questions/48650107/use-axios-globally-in-all-my-components-vue
Vue.prototype.$http = axios

Vue.directive('focus', {
    // When the bound element is inserted into the DOM...
    inserted: function (el) {
        // Focus the element
        el.focus()
    }
})

// console.log( process.env.PASSMAN_BACKEND_PORT )

let PassManApp = new Vue({
    //   render: h => h(App),
    router
}).$mount('#app')

// handles minimize event of main window
require('electron').remote.getCurrentWindow().on('minimize', () => {
    // if not home page of the app.
    if ( PassManApp.$router.currentRoute.name !== 'HomePage' ) {
        appUser.logOut()

        PassManApp.$router.push({ path: '/' })
    }
})
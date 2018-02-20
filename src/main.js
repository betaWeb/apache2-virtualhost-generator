import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.filter('join', function (value, glue = ', ') {
  if (!value) return ''
  return value.join(glue)
})

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

window.listen = (name, cb) => app.$root.$on(name, cb)
window.dispatch = (name, data = {}) => app.$root.$emit(name, data)
window.flash = (message, type, timeout) => dispatch('flash', { message, type, timeout })

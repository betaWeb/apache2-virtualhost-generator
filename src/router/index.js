import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Form from '@/components/Form'
import Show from '@/components/Show'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'vh.index',
      component: Home
    }, {
      path: '/add',
      name: 'vh.add',
      component: Form
    }, {
      path: '/:id/edit',
      name: 'vh.edit',
      component: Form
    }, {
      path: '/:id/show',
      name: 'vh.show',
      component: Show
    }
  ]
})

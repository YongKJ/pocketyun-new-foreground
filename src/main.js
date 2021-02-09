import Vue from 'vue'
import App from './App.vue'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });
Vue.prototype.$NProgress = NProgress;

import store from './store'
import router from './router'
router.beforeEach((to, from, next) => {
  NProgress.start();
  if(to.path == '/') {
    next()
  }else if(to.path == '/login') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/yun') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/register') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/reset') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/setting') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/change') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/operate') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/delete') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/recycle') {
    document.title = to.meta.title
    next()
  }else if(to.path == '/email') {
    document.title = to.meta.title
    next()
  }else {
    next({path: '/'})
  }
})

router.afterEach(() => {
  NProgress.done();
})

import 'default-passive-events'

import axios from 'axios'
Vue.prototype.$axios = axios;

// axios请求拦截器
axios.interceptors.request.use(
  config => {
    NProgress.start(); // 设置加载进度条(开始..)
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)
// axios响应拦截器
axios.interceptors.response.use(
  function(response) {
    NProgress.done(); // 设置加载进度条(结束..)
    return response;
  },
  function(error) {
    return Promise.reject(error);
  }
)

import qs from 'qs'
Vue.prototype.$qs = qs;

import md5 from 'js-md5';
Vue.prototype.$md5 = md5;

import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'
Vue.use(VueDPlayer);

import APlayer from '@moefe/vue-aplayer';
Vue.use(APlayer, {
  defaultCover: 'https://github.com/u3u.png',
  productionTip: false,
});

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer);
Viewer.setDefaults({
  Options: {
    "inline": true,
    "button": true,
    "navbar": true,
    "title": true,
    "toolbar": true,
    "tooltip": true,
    "movable": true,
    "zoomable": true,
    "rotatable": true,
    "scalable": true,
    "transition": true,
    "fullscreen": true,
    "keyboard": true,
    "url": "data-source"
  }
});

import Editor from 'vue2-ace-editor'
Vue.component('editor', Editor)

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
Vue.use(mavonEditor);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')


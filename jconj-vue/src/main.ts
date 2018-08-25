import Vue from 'vue';
import App from './App.vue';

import Buefy from 'buefy';
import 'buefy/lib/buefy.css';

import jconjPlugin from './plugins/jconj';

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(jconjPlugin);
new Vue({
  render: (h) => h(App),
}).$mount('#app');

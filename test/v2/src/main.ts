import './test.css';
import '@vdnd/demo.css';
import Test from './Test.vue';
import Vue from 'vue';

new Vue({
  el: '#app',
  render(h) {
    return h(Test);
  },
});

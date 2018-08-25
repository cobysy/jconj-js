<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row mx-auto">
        <!-- Search input section -->
        <section class="col-sm-12 pt-3 px-0">
          <vs-input @search="onSearch"></vs-input>
        </section>
        <!-- Results section -->
        <section class="results">
          <vs-results :data="results"></vs-results>
        </section>
      </div>
     </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import VsResults from './components/vs-results.vue';
import VsInput from './components/vs-input.vue';
import jconjPlugin from './plugins/jconj';
import * as jconj from '../../src';

@Component({
  components: {
    VsResults,
    VsInput,
  },
})
export default class App extends Vue {

  private results: any[] = [];

  // vs-input in the template
  // uses the @search directive to bind the onSearch function
  private async onSearch(params: any) {
    console.log(params);

    // results is bound to vs-results component
    this.results = this.$jconj.conjugate(params.kanj, params.kana, params.pos, this.$conjtables);
    console.log('results:');
    console.log(this.results);
  }
}
</script>
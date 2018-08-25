<template>
    <section>
        <b-field>
            <b-input v-model="kanjterm" placeholder="漢字" type="search"></b-input>
            <b-input v-model="kanaterm" placeholder="片仮名" type="search"></b-input>
            <b-select placeholder="Type">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
            </b-select>
            <p class="control">
                <button class="button is-primary" @click="search()">Search</button>
            </p>
        </b-field>
    </section>
</template>

<script lang="ts">
    import { Component, Vue, Provide } from 'vue-property-decorator';

    @Component
    export default class VsInput extends Vue {
        @Provide() private kanjterm = '行く';
        @Provide() private kanaterm = 'いく';
        @Provide() private posterm = 33;

        private search() {
            // enables use of the @search directive
            // to bind the onSearch function in App.vue
            this.$emit('search', {
                kanj: this.kanjterm,
                kana: this.kanaterm,
                pos: this.posterm,
            });
        }
  }
</script>
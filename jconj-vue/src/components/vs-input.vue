<template>
    <section>
        <b-field>
            <b-input v-model="kanjterm" placeholder="漢字" type="search"></b-input>
            <b-input v-model="kanaterm" placeholder="片仮名" type="search"></b-input>
            <b-select placeholder="Part-of-speech" v-model="posid">
                <option
                    v-for="option in posData"
                    :value="option[0]"
                    :key="option[0]">
                    {{ option[1] }} {{ option[2] }}
                </option>
            </b-select>
            <p class="control">
                <button class="button is-primary" @click="search()">Conjugate</button>
            </p>
        </b-field>
    </section>
</template>

<script lang="ts">
    import { Component, Vue, Provide } from 'vue-property-decorator';
    import { csvtype } from '../../../src';

    @Component
    export default class VsInput extends Vue {
        @Provide() private kanjterm = '行く';
        @Provide() private kanaterm = 'いく';
        @Provide() private posid = 33;

        get posData() {
            const ct = this.$conjtables;
            // tslint:disable-next-line:no-string-literal
            const poskws = [...new Set(Object.values(ct['conjo'])
                // get posid
                .map((v) => v[0]))];

            const availpos = poskws
                // tslint:disable-next-line:no-string-literal
                .map((posid) => ct['kwpos'][posid as number])
                .sortBy((x) => x[1]);

            return availpos;
        }

        private search() {
            // enables use of the @search directive
            // to bind the onSearch function in App.vue
            this.$emit('search', {
                kanj: this.kanjterm,
                kana: this.kanaterm,
                pos: this.posid,
            });
        }
  }
</script>
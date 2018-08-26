<template>
    <b-table 
        :data="tableData" 
        :columns="columns"
        :narrowed="true"
        :mobile-cards="false">
        <template slot-scope="props" slot="header">
        </template>
    </b-table>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component
export default class VsResults extends Vue {

  // Component Props
  @Prop() private data!: any[];

  // Data properties
  private columns = [
      {
                        field: 'descr',
                    },
                    {
                        field: 'label',
                    },
                    {
                        field: 'txt',
                    },
                ];

  // Computed properties are written as getters and setters on the class.
  get tableData() {
    if (!this.data[0]) {
        return [];
    }

    const conjs = this.data[0];
    const ct = this.$conjtables;

    const labels: Record<string, string> = {};
    labels[[false, false].toString()] = 'aff-plain';
    labels[[false, true].toString()] = 'aff-formal';
    labels[[true, false].toString()] = 'neg-plain';
    labels[[true, true].toString()] = 'neg-formal';

    const result = [];
    for (const key of Object.keys(conjs).sort()) {
        // tslint:disable-next-line:no-shadowed-variable
        const [pos, conj, neg, fml] = key.split(','); // js stores keytext
        const txt = conjs[key];

        console.log('key: ' + key);
        console.log('conj: ' + conj);

        // Get the conjugation description from the conjugation
        // number 'conj'.
        // tslint:disable-next-line:no-string-literal
        const conjdescr = ct['conj'][conj][1];
        const label = labels[[neg, fml].toString()];

        result.push({
          descr: conjdescr,
          label,
          txt,
        });
    }
    return result;
  }

  // Watchers
  @Watch('results', { immediate: true, deep: true })
  private onResultsChanged(val: any, oldVal: any) {
    console.log('onTableDataChanged');
    return;
  }
}
</script>
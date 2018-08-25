<template>
    <b-table :data="tableData" :columns="columns"></b-table>
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
                        field: 'name',
                        label: 'Conj',
                    },
                ];

  // Computed properties are written as getters and setters on the class.
  get tableData() {
    return Object.values(this.data[0] || []).map((txt) => {
        return { name: txt };
    }) || [];
  }

  // Watchers
  @Watch('results', { immediate: true, deep: true })
  private onResultsChanged(val: any, oldVal: any) {
    console.log('onTableDataChanged');
    return;
  }
}
</script>
import { VueConstructor } from 'vue';
import { conjugator } from '../../../src';
// tslint:disable-next-line:no-var-requires
const conjtables = require('./conj-tables.json');

export default function jconjPlugin(v: VueConstructor): void {
    console.log('jconjPlugin install');

    v.prototype.$conjtables = conjtables;
    v.prototype.$jconj = new conjugator();

    console.log(v.prototype.$conjtables);
}

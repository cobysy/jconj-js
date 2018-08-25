import { VueConstructor } from 'vue';
import * as jconj from '../../../src';
// tslint:disable-next-line:no-var-requires
const conjtables = require('./conj-tables.json');

export default function jconjPlugin(v: VueConstructor): void {
    console.log('jconjPlugin install');

    v.prototype.$conjtables = conjtables;
    v.prototype.$jconj = new jconj.conjugator();

    console.log(v.prototype.$conjtables);
}

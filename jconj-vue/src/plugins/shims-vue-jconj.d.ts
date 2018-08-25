import Vue from 'vue';
import * as jconj from '../../../src';

declare module 'vue/types/vue' {
    interface Vue {
        $conjtables: jconj.conjtables;
        $jconj: jconj.conjugator;
    }
}
#!/usr/bin/env node
export declare type csvtype = 'conj' | 'conjo' | 'conotes' | 'conjo_notes' | 'kwpos';
export declare type csvvals = Array<any>;
export declare type conjtableitem = Record<string, csvvals>;
export declare type conjtables = Record<csvtype, conjtableitem>;
export declare class conjugator {
    conjugate(kanj: string, kana: string, pos: number, ct: conjtables): Record<string, string>;
    private combine_onums;
    private _conjugate;
    private construct;
    private range;
}

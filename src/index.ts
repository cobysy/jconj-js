#!/usr/bin/env node

/*
jconv-ts Copyright (c) 2018 cobysy

Original Python Script Copyright Notice: Copyright (c) 2014,2018 Stuart McGraw
*/

export type csvtype = 'conj' | 'conjo' | 'conotes' | 'conjo_notes' | 'kwpos';
export type csvvaltype = string | boolean | number | undefined;
export type csvvals = csvvaltype[];
export type conjtableitem = Record<string, csvvals>;
export type conjtables = Record<csvtype, conjtableitem>;

// tslint:disable-next-line:class-name
export class conjugator {
    public conjugate(kanj: string, kana: string, pos: number, ct: conjtables): [Record<string, string>, string[]] {

        const conjs = this._conjugate(kanj, kana, pos, ct);

        // Some conjugations have multiple forms (e.g. ~なくて and ~ないで) that
        // are disinguished by 'onum' in the conjugation key.  The following
        // call will combine these into a single conjugation entry with a text
        // value of the individual conjugations separated by '/' in one string.
        return this.combine_onums(conjs, ct);
    }

    // Combine multiple conjugation variant "onum" forms of the same
    // conjugation into an a single entry with the onum vaiant texts
    // combined into a single string with "　/　" separating the forms.
    // The structure of the dict returned is identical to 'conjs' except
    // instead of having keys, (pos,conj,neg,fml,onum) the keys are
    // (pos,conj,neg,fml).
    // We also append any relevant note numbers to the text string here.
    private combine_onums(conjs: Record<string, string>, ct: conjtables): [Record<string, string>, string[]] {
        const newconjs: Record<string, string> = {};
        const allnotes: string[] = [];

        for (const key of Object.keys(conjs).sort()) {
            const [pos, conj, neg, fml, onum] = key.split(','); // js stores key as text

            let txt = conjs[key];
            // tslint:disable-next-line:no-string-literal
            const notes = ct['conjo_notes'][key];
            // console.log(notes);
            if (notes) {
                allnotes.push(...(notes as string[]));
            }

            if (notes) {
                txt += '[' + notes.join(',') + ']';
            }

            const newkey = [pos, conj, neg, fml].toString();
            if (!newconjs[newkey]) {
                newconjs[newkey] = txt;
            } else {
                newconjs[newkey] += ' / ' + txt;
            }
        }
        const sorteduniquenotes = [...new Set(Object.values(allnotes))].sort();
        return [newconjs, sorteduniquenotes];
    }

    // Generate a dict containing all the conjugated forms of the kanji
    // and/or kana texts 'ktxt' and 'rtxt'.
    // Parameters:
    //   ktxt -- (str) Kanji text of the word to be conjugated.
    //   rtxt -- (str) Reading text of the word to be conjugated.
    //   pos -- (int) Id number for the part-of-speech of the word
    //       to be conjugated.
    //   ct -- Conjugation table.  This data for these are in the "data/"
    //       subdirectory and may be read in with read_conj_tables().
    // Returns:
    //   A dictionary whose keys are 5-tuples:
    //     pos: Part-of-speech number (all the generated conjugations
    //            will have the same pos value which will be the same
    //            as parameter 'pos'.)
    //     conj: The conjugation number (an id field value from conj.id)
    //     neg: A bool, false for affirmative conjugation, true for negative.
    //     fml: A bool, false for plain, true for formal (-masu) form.
    //     onum: Int index (starting from one) to disambiguate conjugations
    //            that have multiple forms (e.g, ～なくて and ～ないで).
    //   These keys are of the same form as used in the 'ct' conjugation
    //   table, see read_csv_files() for more details.
    //   The value of each item is a string with the combined conjugated
    //   form of 'ktxt' and 'rtxt' for that conjugation.
    private _conjugate(ktxt: string, rtxt: string, pos: number, ct: conjtables): Record<string, string> {
        // debug("ktxt: " + ktxt);
        // debug("rtxt: " + rtxt);

        // Get pos number from kw
        // tslint:disable-next-line:no-string-literal
        const sorted = Object.values(ct['conj'])
            .sortBy((x) => x[0]);
            // .sort((a, b) => (a[0] as number) < (b[0] as number) ? -1 : 1);

        const negfml = [
            [false, false],
            [false, true],
            [true, false],
            [true, true]];

        const conjs: Record<string, string> = {};

        for (const [conj, conjnm] of sorted) {
            for (const [neg, fml] of negfml) {
                for (const onum of this.range(1, 10)) {
                    // Python:
                    //   _, _, _, _, _, stem, okuri, euphr, euphk, _ = \
                    //      ct['conjo'][pos, conj, neg, fml, onum]
                    let ctAtIdx;
                    try {
                        // tslint:disable-next-line:no-string-literal
                        ctAtIdx = ct['conjo'][[pos, conj, neg, fml, onum].toString()];
                    } catch (error) {
                        break;
                    }
                    if (!ctAtIdx) {
                        break;
                    }

                    const stem = ctAtIdx[5] as number;
                    const okuri = ctAtIdx[6] as string;
                    const euphr = ctAtIdx[7] as string;
                    const euphk = ctAtIdx[8] as string;

                    // debug("stem,okuri,euphr,euphk: " + [stem,okuri,euphr,euphk]);

                    let kt;
                    let rt;
                    if (ktxt) {
                        kt = this.construct(ktxt, stem, okuri, euphr, euphk);
                    } else {
                        kt = '';
                    }
                    if (rtxt) {
                        rt = this.construct(rtxt, stem, okuri, euphr, euphk);
                    } else {
                        rt = '';
                    }

                    let txt;
                    if (kt && rt) {
                        txt = (kt + '【' + rt + '】');
                    } else {
                        txt = kt || rt;
                    }

                    conjs[[pos, conj, neg, fml, onum].toString()] = txt;

                    // debug("conjugate: " + txt);
                }
            }
        }

        return conjs;
    }

    // Given a word (in kanji or kana), generate its conjugated form by
    // by removing removing 'stem' characters from its end (and an additional
    // character if the word is kana and 'euphr' is true or the word is in
    // kanji and 'euphk' are true), then appending either 'euphr' or 'euphk'.
    // We determine if the word is kanji or kana by looking at its next-to-
    // last character.  Finally, 'okuri' is appended.
    private construct(txt: string, stem: number, okuri: string, euphr: string, euphk: string) {
        if (txt.length < 2) {
            throw new Error('ValueError: Conjugatable words must be at least 2 characters long');
        }

        // debug("txt: " + txt);

        const checkchar = txt[txt.length - 2][0];

        const iskana = (checkchar >= 'あ'
            && checkchar <= 'ん');
        // debug('iskana: ' + iskana);

        if (iskana && euphr || !iskana && euphk) {
            stem += 1;
        }

        // debug('stem:' + stem);
        let ret;
        if (iskana) {
            ret = txt.substring(0, txt.length - stem) + (euphr || '') + (okuri || '');
        } else {
            ret = txt.substring(0, txt.length - stem) + (euphk || '') + (okuri || '');
        }
        return ret;
    }

    // create a generator function returning an
    // iterator to a specified range of numbers
    private *range(begin: number, end: number, interval: number = 1) {
        for (let i = begin; i < end; i += interval) {
            yield i;
        }
    }
}

// export{}

declare global {
    interface Array<T> {
        sortBy(selector: (elem: T) => any): T[];
    }
}

if (!Array.prototype.sortBy) {
    Array.prototype.sortBy = function <T>(selector: (elem: T) => any): T[] {
        return this.sort((a, b) => selector(a) < selector(b) ? -1 : 1);
    };
}

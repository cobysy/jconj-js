#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class conjugator {
    conjugate(kanj, kana, pos, ct) {
        const conjs = this._conjugate(kanj, kana, pos, ct);
        // Some conjugations have multiple forms (e.g. ~なくて and ~ないで) that
        // are disinguished by 'onum' in the conjugation key.  The following
        // call will combine these into a single conjugation entry with a text
        // value of the individual conjugations separated by '/' in one string.
        this.combine_onums(conjs, ct);
        return conjs;
    }
    // Combine multiple conjugation variant "onum" forms of the same
    // conjugation into an a single entry with the onum vaiant texts
    // combined into a single string with "　/　" separating the forms.
    // The structure of the dict returned is identical to 'conjs' except
    // instead of having keys, (pos,conj,neg,fml,onum) the keys are
    // (pos,conj,neg,fml).
    // We also append any relevant note numbers to the text string here.
    combine_onums(conjs, ct) {
        const newconjs = {};
        const allnotes = new Set();
        for (const key of Object.keys(conjs).sort()) {
            const [pos, conj, neg, fml, onum] = key.split(','); // js stores key as text
            let txt = conjs[key];
            const notes = ct['conjo_notes'][key];
            allnotes.add(notes);
            if (notes) {
                txt += '[' + notes.join(',') + ']';
            }
            const newkey = [pos, conj, neg, fml].toString();
            if (!newconjs[newkey]) {
                newconjs[newkey] = txt;
            }
            else {
                newconjs[newkey] += ' / ' + txt;
            }
        }
        return [newconjs, allnotes];
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
    _conjugate(ktxt, rtxt, pos, ct) {
        //debug("ktxt: " + ktxt);
        //debug("rtxt: " + rtxt);
        // Get pos number from kw
        const sorted = Object.values(ct['conj']).sort((a, b) => {
            if (a[0] > b[0])
                return 1;
            if (a[0] < b[0])
                return -1;
            return 0;
        });
        const negfml = [
            [false, false],
            [false, true],
            [true, false],
            [true, true]
        ];
        const conjs = {};
        for (const [conj, conjnm] of sorted) {
            for (const [neg, fml] of negfml) {
                for (const onum of this.range(1, 10)) {
                    // Python: 
                    //   _, _, _, _, _, stem, okuri, euphr, euphk, _ = \
                    //      ct['conjo'][pos, conj, neg, fml, onum]
                    var ctAtIdx;
                    try {
                        ctAtIdx = ct['conjo'][[pos, conj, neg, fml, onum].toString()];
                    }
                    catch (error) {
                        break;
                    }
                    if (!ctAtIdx) {
                        break;
                    }
                    const stem = ctAtIdx[5];
                    const okuri = ctAtIdx[6];
                    const euphr = ctAtIdx[7];
                    const euphk = ctAtIdx[8];
                    //debug("stem,okuri,euphr,euphk: " + [stem,okuri,euphr,euphk]);
                    var kt, rt;
                    if (ktxt) {
                        kt = this.construct(ktxt, stem, okuri, euphr, euphk);
                    }
                    else {
                        kt = '';
                    }
                    if (rtxt) {
                        rt = this.construct(rtxt, stem, okuri, euphr, euphk);
                    }
                    else {
                        rt = '';
                    }
                    var txt;
                    if (kt && rt) {
                        txt = (kt + '【' + rt + '】');
                    }
                    else {
                        txt = kt || rt;
                    }
                    ;
                    conjs[[pos, conj, neg, fml, onum].toString()] = txt;
                    //debug("conjugate: " + txt);
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
    construct(txt, stem, okuri, euphr, euphk) {
        if (txt.length < 2) {
            throw 'ValueError: Conjugatable words must be at least 2 characters long';
        }
        //debug("txt: " + txt);
        const checkchar = txt[txt.length - 2][0];
        const iskana = (checkchar >= 'あ'
            && checkchar <= 'ん');
        //debug('iskana: ' + iskana);
        if (iskana && euphr || !iskana && euphk)
            stem += 1;
        //debug('stem:' + stem);
        var ret;
        if (iskana) {
            ret = txt.substring(0, txt.length - stem) + (euphr || '') + (okuri || '');
        }
        else {
            ret = txt.substring(0, txt.length - stem) + (euphk || '') + (okuri || '');
        }
        return ret;
    }
    // create a generator function returning an
    // iterator to a specified range of numbers
    *range(begin, end, interval = 1) {
        for (let i = begin; i < end; i += interval) {
            yield i;
        }
    }
}
exports.conjugator = conjugator;
//# sourceMappingURL=index.js.map
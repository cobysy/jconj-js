#!/usr/bin/env node

'use strict';

const ArgumentParser = require('argparse').ArgumentParser;
const fs = require('fs');
const path = require('path');
const Enumerable = require('linq');
const scriptName = path.basename(__filename);

// DEBUG=conj-js ./index.js vk 来る
// DEBUG=conj-js ./index.js v5r やる
// DEBUG=conj-js ./index.js vs-i する
const debug = require('debug')('conj-js');

const args = parse_args();
debug("args: " + JSON.stringify(args));

const ct = read_conj_tables(args.dir);

// DEBUG=conj-js ./index.js --list
if (args.list) {
    print_help(ct);
    process.exit();
}

// Convert the given pos keyword into pos id number.
let pos = undefined;
try {
    pos = ct['kwpos'][args.pos][0];
} catch (error) {
    console.log(`unknown part-of-speech: ${args.pos}`);
    console.log(`'${scriptName} --list' will print a list of conjugatable parts-of-speech`);
    process.exit();
}
debug('posid: ' + pos);

if (!Enumerable.from(Object.values(ct['conjo'])).select(c => {
    return c[0];
}).contains(pos)) {
    console.log(`no conjugation data available for part-of-speech: ${args.pos}`);
    console.log(`'${scriptName} --list' will print a list of conjugatable parts-of-speech`);
    process.exit();
}

const conjs = conjugate(args.kanj, args.kana, pos, ct);

// Some conjugations have multiple forms (e.g. ~なくて and ~ないで) that
// are disinguished by 'onum' in the conjugation key.  The following
// call will combine these into a single conjugation entry with a text
// value of the individual conjugations separated by '/' in one string.
combine_onums(conjs, ct);

// Display the conjugations.
print_conjs(conjs, ct);


// Print the conjugation table returned by combine_onums()
function print_conjs(conjs, ct) {
    // Create a dictionary to map combinations of 'neg' and 'fml' in the
    // 'conjs' dict keys to printable text.
    const labels = {};
    labels[[false, false]] = "aff-plain:  ";
    labels[[false, true]] = "aff-formal: ";
    labels[[true, false]] = "neg-plain:  ";
    labels[[true, true]] = "neg-formal: ";

    // Go though all the entries in 'conjs' (each of which is a conjugation)
    // of the given kanji and kana) and print them.
    for (const key of Object.keys(conjs)) {
        const [pos, conj, neg, fml] = key.split(','); // js stores key as text
        const txt = conjs[key];
        
        // Get the conjugation description from the conjugation
        // number 'conj'.
        const conjdescr = ct['conj'][conj][1]
        const label = labels[[neg, fml]];
        console.log(`${conjdescr} ${label} ${txt}`);
    }
}

// Combine multiple conjugation variant "onum" forms of the same
// conjugation into an a single entry with the onum vaiant texts
// combined into a single string with "　/　" separating the forms.
// The structure of the dict returned is identical to 'conjs' except
// instead of having keys, (pos,conj,neg,fml,onum) the keys are
// (pos,conj,neg,fml).
// We also append any relevant note numbers to the text string here.
function combine_onums(conjs, ct) {
    const newconjs = {};
    const allnotes = new Set();
    
    for (const key of Enumerable.from(Object.keys(conjs))
        .orderBy(k => { return k }).toArray()) {
        const [pos, conj, neg, fml, onum] = key.split(','); // js stores key as text

        let txt = conjs[key];
        const notes = ct['conjo_notes'][key];
        allnotes.add(notes);

        if (notes) {
            txt += '[' + notes.join(',') + ']';
        }

        const newkey = [pos, conj, neg, fml];
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
function conjugate(ktxt, rtxt, pos, ct) {
    const conjs = {};

    debug("ktxt: " + ktxt);
    debug("rtxt: " + rtxt);

    // Get pos number from kw
    const sorted = Enumerable.from(Object.values(ct['conj'])).orderBy(c => {
        return c[0];
    }).toArray();
    
    const negfml = [
        [false, false],
        [false, true],
        [true, false],
        [true, true]];
    
    for (const [conj, conjnm] of sorted) {
        for (const [neg, fml] of negfml) {
            for (const onum of Enumerable.range(1, 10).toArray()) {
                // Python: 
                //   _, _, _, _, _, stem, okuri, euphr, euphk, _ = \
                //      ct['conjo'][pos, conj, neg, fml, onum]
                var stem, okuri, euphr, euphk;
                var ctAtIdx;
                try {
                    ctAtIdx = ct['conjo'][[pos, conj, neg, fml, onum]];
                } catch (error) {
                    break;
                }
                if (!ctAtIdx) {
                    break;
                }

                stem = ctAtIdx[5];
                okuri = ctAtIdx[6];
                euphr = ctAtIdx[7];
                euphk = ctAtIdx[8];
                
                //debug("stem,okuri,euphr,euphk: " + [stem,okuri,euphr,euphk]);

                var kt, rt;
                if (ktxt) {
                    kt = construct(ktxt, stem, okuri, euphr, euphk);
                } else {
                    kt = '';
                }
                if (rtxt) {
                    rt = construct(rtxt, stem, okuri, euphr, euphk);
                } else {
                    rt = '';
                }

                var txt;
                if (kt && rt) {
                    txt = (kt + '【' + rt + '】')
                }
                else {
                    txt = kt || rt;
                };

                conjs[[pos, conj, neg, fml, onum]] = txt;

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
function construct(txt, stem, okuri, euphr, euphk) {
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
    } else {
        ret = txt.substring(0, txt.length - stem) + (euphk || '') + (okuri || '');
    }
    return ret;
}

// Print a list of the art-of-speech keywords for pos' that this
// program can conjugate.
function print_help(ct) {
    // Get all conjugatable pos id numbers from the main conjugations
    // table, conjo.csv. 
    const poskws = Enumerable.from(Object.values(ct['conjo']))
        .select(v => {
            return v[0]; // get the pos id number
        })
        .distinct()
        .toArray();
    
    // Get a list of kwpos rows (each containing a pos id number, keyword
    // and description text, for all the pos numbers in 'poskws'.  Sort
    // the resulting list by keyword alphabetically.
    const availpos = Enumerable.from(poskws)
        .select(posid => {
            return ct['kwpos'][posid];
        })
        .orderBy(x => {
            return x[1];
        })
        .toArray();
    
    console.log("Conjugatable PoS values:");
    for (const [pos, poskw, descrip] of availpos) {
        console.log(`${poskw}\t${descrip}`);
    }
}

// Parse command line, use --help for info.
// read the conjugation .csv files into a single data structure.
// See read_conj_tables() for description of 'ct's structure.
function parse_args(argv = process.argv) {
    const p = ArgumentParser({
        addHelp: false,
        description: scriptName + " will print a list of the conjugated forms " +
            "of the Japanese word given by the kanji and/or kana words " +
            "given in the ARGS argument(s).  POS is a part-of-speech " +
            "code as used in wwwjdic, JMdict, etc ('v1', 'v5k', " +
            "'adj-i', etc.)"
    });
    p.addArgument("pos", {
        nargs: '?',
        help: "Part-of-speech code word as used in wwjdic, JMdict, etc.  " +
            +"Run program with \"--list\" to get list of valid pos values."
    });
    p.addArgument("word", {
        nargs: '*',
        help: "Word to be conjugated.  Either or both kanji or kana " +
            +"forms may be given.  If both are given, both will be " +
            +"conjugated, and the program will look for kanji in one " +
            +"to determine which is which."
    });
    p.addArgument("--list", {
        action: "storeTrue",
        defaultValue: false,
        help: "Print list of valid pos values to stdout and exit."
    });
    p.addArgument(["-d", "--dir"], {
        defaultValue: './data',
        help: "Directory where the conjugation csv data files are kept."
    });
    p.addArgument("--help", {
        action: "help",
        help: "Print this help message."
    });

    const args = p.parseArgs();

    debug('args: ' + args);
    debug('args.list: ' + args.list);
    if (args.list)
        return args;

    debug('args.pos: ' + args.pos);
    const posMatch = /[a-z0-9-]+$/.test(args.pos);
    debug('posMatch: ' + posMatch);
    if (args.pos != null && !posMatch)
        p.error("Argument 'pos' is required if --list not given.");

    // The shell won't distinguish args separated by jp space characters
    // as seperate.  But users will frequently enter jp space characters
    // to separate kanji and reading because it is pain to switch back
    // to ascii for one character.  So we split them here.
    let words = [];
    debug('args.word(1): ' + args.word);
    for (const w of args.word) {
        //debug('w: ' + w);
        let ws = w.split(/\s+/);
        //debug('ws:' + ws);
        words.push(...ws); // expand ws to it's elements
    }

    args.word = words;
    debug('args.word(2): ' + args.word);

    debug('args.word.length: ' + args.word.length);
    if (!(1 <= args.word.length <= 2))
        p.error("You must give one or two words to conjugate")

    const pw = parse_word(args.word);
    args.kanj = pw.kanj;
    args.kana = pw.kana;

    //debug('args.kanj: ' + args.kanj);
    //debug('args.kana: ' + args.kana);
    //debug(JSON.stringify(args));

    return args;
}

function parse_word(args) {
    // args' is a list of one or two strs that are the kanji, kana
    // arguments from the command line.  If two, we take them to be in the
    // order kanji, kana.  But if one, it could be either kanji or kana
    // and we identify which by looking for any kanji character (>=0x4000)
    // in it.  We return separate kanji and kana strs accordingly.
    debug('args.length: ' + args.length);
    if (args.length == 1) {
        //debug(args[0]);
        const isKanji = [...args[0]].some(c => {
            //debug(c.charCodeAt(0));
            return c.charCodeAt(0) >= 0x4000;
        });
        debug('isKanji: ' + isKanji);
        if (isKanji) {
            return {
                kanj: args[0],
                kana: null
            }
        } else {
            return {
                kana: args[0],
                kanj: null
            }
        }
    } else {
        return {
            kana: args,
            kanj: args
        }
    }
}

function read_conj_tables(dir) {
    // Read the conjugation .csv files located in directory 'dir'.
    // Returned is a dict whose keys are the names of each file sans
    // the .csv part.  Each value is the contents of the corresponding
    // csv file in the form of another dict.  The keys of each of
    // these dicts are the values of the first column of the csv
    // file (as converted by 'coltypes' below), except for 'conjo'
    // where the key is a tuple of the first five columns.  An
    // additional set of keys is added in the case of 'kwpos' which
    // from the second (kw) column to allow looking up pos records
    // by either id int or keyword str.
    // The values of each of these dict's entries are a list of all
    // the values in the csv file row (with each converted to the
    // right datatype as specified by 'coltypes'.)
    // Or, shown schematically:
    //     dict { 'conj': { 1: [1, 'Non-past'],    # Data from conj.csv...
    //                      2: [2, 'Past (~ta)'],
    //                      ... },
    //            'conjo': { (1,1,False,False,1): [1,1,False,False,1,'い',None,None,None],
    //                        ...
    //                       (45,2,False,True,1): [45,2,False,True,1,'ました,','き',None,None],
    //                        ... },
    //            'conjo_notes': { (2,1,True,False,1): [3],
    //                             (2,1,True,True,1):  [3],
    //                             ....
    //                             (28,9,True,True,1): [5,6],
    //                             ... },
    //            'kwpos': { 1: [1, 'adj-i', 'adjective...'],
    //                       2: [2, 'adj-na', 'adjectival noun...'],
    //                       ...
    //                       'adj-i':  [1, 'adj-i', 'adjective...'],
    //                       'adj-na': [2, 'adj-na', 'adjectival noun...'],
    //                       ... },
    //              ...

    // For each csv file (identified sans the .csv suffix), give a
    // list of functions, one for each column in the file, that will
    // convert the text str read into the correct data type.
    // Note that xint() is the same as int() but handles empty
    // ('') strs, sbool() converts text strs "t..." or "f..."
    // to bools.
    const coltypes = {
        conj: [int, str],
        conjo: [int, int, sbool, sbool, int, int, str, str, str, xint],
        conotes: [int, str],
        conjo_notes: [int, int, sbool, sbool, int, int],
        kwpos: [int, str, str],
    }
    let ct = {}
    for (const fn in coltypes) {
        const filename = path.join(dir, fn + '.csv');
        const csvtbl = readcsv(filename, coltypes[fn], fn != 'kwpos');
        if (fn == 'conjo') {
            // Handle conjo.csv specially: add each row to its dict under
            // the key of a 5-tuple of the first five row values.  These
            // (pos,conj,new,fml,onum) identify the okurigana and other
            // data needed for a specific conjugation.
            const dict = {};
            for (const row of csvtbl) {
                dict[row.slice(0, 5)] = row;
            }
            ct[fn] = dict;

            //console.log(dict[[45, 2, false, true, 1]]);
        }
        else if (fn == 'conjo_notes') {
            // conjo_notes maps multiple conjugations (pos,conj,neg,fml,
            // onum) to multiple note numbers.  So instead of using a
            // dictionary keyed by conjugation and where each value is
            // a row, we use one where each value is a list of note
            // numbers for that conjugation.
            // @cobysy-18aug17: where are currently no entries w/ multiple note numbers 
            const dict = {};
            for (const row of csvtbl) {
                const key = row.slice(0, 5);
                const lst = dict[key] || [];
                lst.push(row[5]);
                dict[key] = lst;
            }
            ct[fn] = dict;
        }
        else {
            // For all other csv files, add the row to the dict with a key
            // of the first column which is an id number.
            const dict = {};
            for (const row of csvtbl) {
                dict[row[0]] = row;
            }

            // Do the same to kwpos.csv but in addition add the same row
            // with a key of the 2nd column (the kw abbr string.)  This 
            // will allow us to look up kwpos records by either id number
            // or keyword string.
            if (fn == 'kwpos') {
                for (const row of csvtbl) {
                    dict[row[1]] = row;
                }
            }
            ct[fn] = dict;

            // if (fn == 'kwpos') {
            //     console.log(dict[1]);
            //     console.log(dict['adj-i']);
            // }
        }
    }

    return ct;
}

function readcsv(filename, coltypes, hasHeader) {
    // Read the csv file 'filename', using the function in 'coltypes'
    // to convert each datum to the correct datatype.  'coltypes' is indexed
    // by file, and then by column number.  If 'hasheader is true, then the
    // first line (containing column names) is skipped.  All the "conj*.csv
    // file have headers, the "kwpos.csv" file doesn't.
    // A list of rows, with each row a list of row items by column, is
    // returned.
    debug("readcsv: " + filename);

    const raw = fs.readFileSync(filename).toString();
    const reader = raw.split(/\r?\n/).filter(s => s) // Split lines by newline, skip empty lines
        .map(s => {
            // Split columns by tab
            return s.split(/\t/).map(s => {
                // Unescape double quotes
                if (s.match(/^"|"$/))
                    return s.replace(/^"|"$/g, '').replace('""', '"');
                else
                    return s;
            });
        });

    //console.log(reader);

    if (hasHeader) {
        reader.shift(); // Skip header row.
    }

    let table = [];
    for (const row of reader) {
        // Apply a conversion function from 'coltypes'
        // to convert each datum read from the file (as
        // a string) to the right type (int, bool, etc).

        const newrow = [];
        for (const [cnum, col] of row.entries()) {
            newrow.push(coltypes[cnum](col));
        }
        table.push(newrow);
    }

    return table;
}

// Convert a str to a bool.
function sbool(arg) {
    if (arg.match(/f/)) return false;
    if (arg.match(/t/)) return true;
    throw 'ValueError: ' + arg
}

// Convert a str to an int or to undefined if blank.
function xint(arg) {
    if (!arg) return undefined;
    const n = int(arg);
    if (n) return n;
    return undefined;
}

function str(arg) {
    if (!arg) return undefined;
    return String(arg);
}

function int(arg) {
    return Number(arg);
}
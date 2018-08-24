import * as jconj from '../src';

import { ArgumentParser } from 'argparse';
import fs = require('fs');
import path = require('path');
const scriptName = path.basename(__filename);

type csvvalconverters = Array<(data: string) => jconj.csvvaltype>;

// DEBUG=conj-js node ./dist/demo/jconj.js vk 来る
// DEBUG=conj-js node ./dist/demo/jconj.js vk 来る くる
// DEBUG=conj-js node ./dist/demo/jconj.js v5r やる
// DEBUG=conj-js node ./dist/demo/jconj.js vs-i する
// DEBUG=conj-js node ./dist/demo/jconj.js vk 来る くる
const debug = require('debug')('conj-js');

const args = parse_args();
debug("args: " + JSON.stringify(args));

const ct = read_conj_tables(args.dir);

if (args.conjtables) {
    console.log(JSON.stringify(ct));
    process.exit();
}

// DEBUG=conj-js node ./dist/demo/jconj.js --list
if (args.list) {
    print_help(ct);
    process.exit();
}

// Convert the given pos keyword into pos id number.
let pos!:number;
try {
    pos = ct['kwpos'][args.pos][0] as number;
} catch (error) {
    console.log(`unknown part-of-speech: ${args.pos}`);
    console.log(`'${scriptName} --list' will print a list of conjugatable parts-of-speech`);
    process.exit();
}
debug('posid: ' + pos);

if (!Object.values(ct['conjo']).map(c => c[0]).some(x => x == pos)) {
    console.log(`no conjugation data available for part-of-speech: ${args.pos}`);
    console.log(`'${scriptName} --list' will print a list of conjugatable parts-of-speech`);
    process.exit();
}

const [conjs, notes] = new jconj.conjugator().conjugate(args.kanj, args.kana, pos, ct);

// Display the conjugations.
print_conjs(conjs, ct);

// Display the notes
print_notes(notes, ct);

function print_notes(notes:string[], ct:jconj.conjtables) {
    if (notes) {
        console.log("Notes:");
        //debug(notes);
        for (const n of notes) {
             console.log(`[${n}] -- ${ct['conotes'][n][1]}`);
        }
    }
}

// Print the conjugation table returned by combine_onums()
function print_conjs(conjs:Record<string,string>, ct:jconj.conjtables) {
    // Create a dictionary to map combinations of 'neg' and 'fml' in the
    // 'conjs' dict keys to printable text.
    const labels: Record<string, string> = {};
    labels[[false, false].toString()] = "aff-plain:  ";
    labels[[false, true].toString()] = "aff-formal: ";
    labels[[true, false].toString()] = "neg-plain:  ";
    labels[[true, true].toString()] = "neg-formal: ";

    // Go though all the entries in 'conjs' (each of which is a conjugation)
    // of the given kanji and kana) and print them.
    for (const key of Object.keys(conjs)) {
        const [pos, conj, neg, fml] = key.split(','); // js stores keytext
        const txt = conjs[key];
        
        // Get the conjugation description from the conjugation
        // number 'conj'.
        const conjdescr = ct['conj'][conj][1]
        const label = labels[[neg, fml].toString()];
        console.log(`${conjdescr} ${label} ${txt}`);
    }
}

// Parse command line, use --help for info.
// read the conjugation .csv files into a single data structure.
// See read_conj_tables() for description of 'ct's structure.
function parse_args(argv:string[] = process.argv) {
    const p = new ArgumentParser({
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
    p.addArgument("--conjtables", {
        action: "storeTrue",
        defaultValue: false
    });
    
    const args = p.parseArgs();

    debug('args: ' + args);
    debug('args.list: ' + args.list);
    if (args.list)
        return args;
    if (args.conjtables)
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
    if (!(1 <= args.word.length && args.word.length <= 2))
        p.error("You must give one or two words to conjugate")

    const pw = parse_word(args.word);
    args.kanj = pw.kanj;
    args.kana = pw.kana;

    //debug('args.kanj: ' + args.kanj);
    //debug('args.kana: ' + args.kana);
    //debug(JSON.stringify(args));

    return args;
}

function parse_word(args:string[]) {
    // args' is a list of one or two strs that are the kanji, kana
    // arguments from the command line.  If two, we take them to be in the
    // order kanji, kana.  But if one, it could be either kanji or kana
    // and we identify which by looking for any kanji character (>=0x4000)
    // in it.  We return separate kanji and kana strs accordingly.
    debug('args.length: ' + args.length);
    if (args.length == 1) {
        //debug(args[0]);
        const isKanji = [...args[0]].some(c => c.charCodeAt(0) >= 0x4000);
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
            kana: args[1],
            kanj: args[0]
        }
    }
}

function read_conj_tables(dir: string): jconj.conjtables {
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
    const coltypes: Record<jconj.csvtype, csvvalconverters> = {
        'conj': [int, str],
        'conjo': [int, int, sbool, sbool, int, int, str, str, str, xint],
        'conotes': [int, str],
        'conjo_notes': [int, int, sbool, sbool, int, int],
        'kwpos': [int, str, str],
    }
    let ct: Partial<jconj.conjtables> = {};
    for (const fn in coltypes) {
        const filename = path.join(dir, fn + '.csv');
        const csvtbl = readcsv(filename, coltypes[fn as jconj.csvtype], fn != 'kwpos');
        if (fn == 'conjo') {
            // Handle conjo.csv specially: add each row to its dict under
            // the key of a 5-tuple of the first five row values.  These
            // (pos,conj,new,fml,onum) identify the okurigana and other
            // data needed for a specific conjugation.
            const ctitem: jconj.conjtableitem = {};
            for (const row of csvtbl) {
                ctitem[row.slice(0, 5).toString()] = row;
            }
            ct[fn] = ctitem;

            //console.log(dict[[45, 2, false, true, 1]]);
        }
        else if (fn == 'conjo_notes') {
            // conjo_notes maps multiple conjugations (pos,conj,neg,fml,
            // onum) to multiple note numbers.  So instead of using a
            // dictionary keyed by conjugation and where each value is
            // a row, we use one where each value is a list of note
            // numbers for that conjugation.
            // @cobysy-18aug17: where are currently no entries w/ multiple note numbers 
            const ctitem: jconj.conjtableitem= {};
            for (const row of csvtbl) {
                const key = row.slice(0, 5).toString();
                const lst = ctitem[key] || [];
                lst.push(row[5]);
                ctitem[key] = lst;
            }
            ct[fn] = ctitem;
        }
        else {
            // For all other csv files, add the row to the dict with a key
            // of the first column which is an id number.
            const ctitem: jconj.conjtableitem = {};
            for (const row of csvtbl) {
                ctitem[row[0] as string] = row;
            }

            // Do the same to kwpos.csv but in addition add the same row
            // with a key of the 2nd column (the kw abbr string.)  This 
            // will allow us to look up kwpos records by either id number
            // or keyword string.
            if (fn == 'kwpos') {
                for (const row of csvtbl) {
                    ctitem[row[1] as string] = row;
                }
            }
            ct[fn as jconj.csvtype] = ctitem;

            // if (fn == 'kwpos') {
            //     console.log(dict[1]);
            //     console.log(dict['adj-i']);
            // }
        }
    }

    return ct as jconj.conjtables;
}

function readcsv(filename: string, coltypes: csvvalconverters, hasHeader: boolean) {
    // Read the csv file 'filename', using the function in 'coltypes'
    // to convert each datum to the correct datatype.  'coltypes' is indexed
    // by file, and then by column number.  If 'hasheader is true, then the
    // first line (containing column names) is skipped.  All the "conj*.csv
    // file have headers, the "kwpos.csv" file doesn't.
    // A list of rows, with each row a list of row items by column, is
    // returned.
    debug("readcsv: " + filename);

    const raw: string = fs.readFileSync(filename).toString();
    const reader: Array<Array<string>> = raw.split(/\r?\n/).filter(s => s) // Split lines by newline, skip empty lines
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

    let table: Array<jconj.csvvals> = [];
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
function sbool(arg: string): boolean {
    if (arg.match(/f/)) return false;
    if (arg.match(/t/)) return true;
    throw 'ValueError: ' + arg
}

// Convert a str to an int or to undefined if blank.
function xint(arg: string): number | undefined {
    if (!arg) return undefined;
    const n = int(arg);
    if (n) return n;
    return undefined;
}

function str(arg: string): string | undefined {
    if (!arg) return undefined;
    return String(arg);
}

function int(arg: string): number {
    return Number(arg);
}

// Print a list of the art-of-speech keywords for pos' that this
// program can conjugate.
function print_help(ct:jconj.conjtables) {
    // Get all conjugatable pos id numbers from the main conjugations
    // table, conjo.csv. 
    const poskws = [...new Set(Object.values(ct['conjo'])
        // get posid
        .map(v => v[0]))];
            
    // Get a list of kwpos rows (each containing a pos id number, keyword
    // and description text, for all the pos numbers in 'poskws'.  Sort
    // the resulting list by keyword alphabetically.
    const availpos = poskws
        .map(posid => ct['kwpos'][posid as number])
        .sort((a, b) => {
            if ((a[1] as string) > (b[1] as string)) return 1;
            if ((a[1] as string) < (b[1] as string)) return -1;
            return 0;
        });
    
    console.log("Conjugatable PoS values:");
    for (const [pos, poskw, descrip] of availpos) {
        console.log(`${poskw}\t${descrip}`);
    }
}
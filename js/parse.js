// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */
var Parse, empty, firstLineCol, kstr, lastLineCol, print, ref, valid,
    indexOf = [].indexOf;

kstr = require('kstr');

print = require('./print');

ref = require('./utils'), empty = ref.empty, valid = ref.valid, firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol;

Parse = (function() {
    function Parse(kode) {
        this.kode = kode;
        this.debug = this.kode.args.debug;
        this.verbose = this.kode.args.verbose;
        this.raw = this.kode.args.raw;
    }

    Parse.prototype.parse = function(block) {
        var ast;
        this.stack = [];
        this.sheap = [];
        ast = [];
        ast = ast.concat(this.exps('tl', block.tokens));
        if (this.raw) {
            print.noon('raw ast', ast);
        }
        return {
            vars: [],
            exps: ast
        };
    };

    Parse.prototype.exps = function(rule, tokens, stop) {
        var b, block, blockExps, blocked, colon, e, es, last, nl, numTokens, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
        if (empty(tokens)) {
            return;
        }
        this.sheapPush('exps', rule);
        es = [];
        while (tokens.length) {
            numTokens = tokens.length;
            b = (function() {
                var ref1, ref2, ref3;
                switch (this.stack.slice(-1)[0]) {
                    case '▸arg':
                        return es.length;
                    case 'if':
                    case 'switch':
                    case 'then':
                    case '▸else':
                        return tokens[0].text === 'else';
                    case '[':
                        return tokens[0].text === ']';
                    case '{':
                        return ref1 = tokens[0].text, indexOf.call('}', ref1) >= 0;
                    case '(':
                        return tokens[0].text === ')';
                    case '▸args':
                        return (ref2 = tokens[0].text) === ']' || ref2 === ';' || ref2 === 'else' || ref2 === 'then';
                    case '▸return':
                        return tokens[0].text === 'if';
                    case 'call':
                        return ref3 = tokens[0].text, indexOf.call(';', ref3) >= 0;
                    case rule:
                        return tokens[0].text === stop;
                    default:
                        return false;
                }
            }).call(this);
            if (b) {
                this.verb("exps break for " + tokens[0].text + " and stack top", this.stack);
                break;
            }
            if (stop && tokens[0].text === stop) {
                this.verb("exps break for " + tokens[0].text + " and stop", stop);
                break;
            }
            if (tokens[0].type === 'block') {
                if (stop === 'nl') {
                    this.verb("exps block start with stop " + stop + " break!");
                    break;
                }
                block = tokens.shift();
                this.verb("exps block start stop:" + stop + " block:", block);
                blocked = true;
                blockExps = this.exps('block', block.tokens);
                es = es.concat(blockExps);
                if (block.tokens.length) {
                    this.verb('exps block end remaining block tokens:', block.tokens.length);
                    if (this.debug) {
                        print.tokens('before unshifting dangling block tokens', tokens);
                    }
                    while (block.tokens.length) {
                        tokens.unshift(block.tokens.pop());
                    }
                    if (this.debug) {
                        print.tokens('exps after unshifting dangling block tokens', tokens);
                    }
                }
                if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ',') {
                    this.verb("exps block end shift comma , and continue...");
                    tokens.shift();
                    continue;
                } else if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'nl' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) === ',') {
                    this.shiftNewline("exps block end nl comma , and continue...", tokens);
                    tokens.shift();
                    continue;
                }
                this.verb('exps block end, break!');
                break;
            }
            if (tokens[0].type === 'block') {
                this.verb('exps break on block');
                break;
            }
            if (tokens[0].text === ')') {
                this.verb('exps break on )');
                break;
            }
            if (((ref4 = tokens[0].text) === 'in' || ref4 === 'of') && rule === 'for vals') {
                this.verb('exps break on in|of');
                break;
            }
            if (tokens[0].type === 'nl') {
                this.verb('exps nl stop:', stop, tokens[0], this.stack);
                if (this.stack.slice(-1)[0] === '[' && ((ref5 = tokens[1]) != null ? ref5.text : void 0) === ']') {
                    this.shiftNewline('exps nl ] in array', tokens);
                    break;
                }
                if (stop) {
                    this.verb('exps nl with stop', stop);
                    if (((ref6 = this.stack.slice(-1)[0]) === '▸args' || ref6 === '▸body' || ref6 === '▸return' || ref6 === 'then' || ref6 === '▸else') || stop !== 'nl') {
                        this.verb("exps nl with stop '" + stop + "' in " + this.stack.slice(-1)[0] + " (break, but don't shift nl)");
                    } else {
                        this.shiftNewline("exps nl with stop '" + stop + "'", tokens);
                    }
                    break;
                }
                nl = this.shiftNewline("exps nl (no stop) ...", tokens);
                if (((ref7 = tokens[0]) != null ? ref7.text : void 0) === '.' && ((ref8 = tokens[1]) != null ? ref8.type : void 0) === 'var') {
                    console.log('exps nl next line starts with .var!');
                    es.push(this.prop(es.pop(), tokens));
                }
                this.verb('exps nl continue...');
                continue;
            }
            e = this.exp(tokens);
            last = lastLineCol(e);
            while (((ref9 = (ref10 = tokens[0]) != null ? ref10.text : void 0) === 'if' || ref9 === 'for' || ref9 === 'while') && ((ref11 = this.stack.slice(-1)[0]) !== '▸args' && ref11 !== '▸return') && last.line === tokens[0].line) {
                this.verb("exps " + tokens[0].text + "Tail", e, this.stack);
                switch (tokens[0].text) {
                    case 'if':
                        e = this.ifTail(e, tokens.shift(), tokens);
                        break;
                    case 'for':
                        e = this.forTail(e, tokens.shift(), tokens);
                        break;
                    case 'while':
                        e = this.whileTail(e, tokens.shift(), tokens);
                }
            }
            es.push(e);
            if (((ref12 = (ref13 = tokens[0]) != null ? ref13.text : void 0) === 'if' || ref12 === 'then' || ref12 === 'for' || ref12 === 'while') && tokens[0].col > last.col && es.length && !blocked && last.line === tokens[0].line) {
                this.verb('exps break on if|then|for|while');
                break;
            }
            if (((ref14 = tokens[0]) != null ? ref14.text : void 0) === ';') {
                if ((ref15 = this.stack.slice(-1)[0]) !== '▸args' && ref15 !== 'when' && ref15 !== '{') {
                    this.verb('exps shift colon', this.stack);
                    colon = tokens.shift();
                } else {
                    this.verb('exps break on colon', this.stack);
                    break;
                }
            }
            if (numTokens === tokens.length) {
                this.verb('exps no token consumed', tokens);
                break;
            }
        }
        this.sheapPop('exps', rule);
        return es;
    };

    Parse.prototype.exp = function(tokens) {
        var e, numTokens, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, tok;
        if (empty(tokens)) {
            return;
        }
        tok = tokens.shift();
        if (this.debug) {
            console.log(Y5(w1(tok != null ? tok.text : void 0)));
        }
        switch (tok.type) {
            case 'block':
                return console.error("INTERNAL ERROR: unexpected block token in exp!");
            case 'nl':
                return console.error("INTERNAL ERROR: unexpected nl token in exp!");
            case ';':
                return console.error("INTERNAL ERROR: unexpected ; token in exp!");
            case 'keyword':
                if (ref1 = (ref2 = tokens[0]) != null ? ref2.text : void 0, indexOf.call(':', ref1) < 0) {
                    switch (tok.text) {
                        case 'return':
                            return this["return"](tok, tokens);
                        case 'switch':
                            return this["switch"](tok, tokens);
                        case 'class':
                            return this["class"](tok, tokens);
                        case 'function':
                            return this["function"](tok, tokens);
                        case 'while':
                            return this["while"](tok, tokens);
                        case 'when':
                            return this.when(tok, tokens);
                        case 'try':
                            return this["try"](tok, tokens);
                        case 'for':
                            return this["for"](tok, tokens);
                        case 'if':
                            if ((ref3 = this.stack.slice(-1)[0]) !== '▸args' && ref3 !== '▸return') {
                                if (this.stack.length) {
                                    this.verb('if', this.stack);
                                }
                                return this["if"](tok, tokens);
                            }
                    }
                }
                break;
            default:
                switch (tok.text) {
                    case '->':
                    case '=>':
                        return this.func(null, tok, tokens);
                }
        }
        this.sheapPush('exp', (ref4 = tok.text) != null ? ref4 : tok.type);
        e = tok;
        while (tokens.length) {
            numTokens = tokens.length;
            e = this.rhs(e, tokens);
            if (this.verbose) {
                print.ast("rhs", e);
            }
            e = this.lhs(e, tokens);
            if (this.verbose) {
                print.ast("lhs", e);
            }
            if (ref5 = (ref6 = tokens[0]) != null ? ref6.text : void 0, indexOf.call(';', ref5) >= 0) {
                this.verb('exp break on ;');
                break;
            }
            if (numTokens === tokens.length) {
                if (ref7 = (ref8 = tokens[0]) != null ? ref8.text : void 0, indexOf.call(',', ref7) >= 0) {
                    this.verb('exp shift comma');
                    tokens.shift();
                }
                this.verb('exp no token consumed: break!');
                break;
            }
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
        this.sheapPop('exp', (ref9 = tok.text) != null ? ref9 : tok.type);
        return e;
    };

    Parse.prototype.rhs = function(e, tokens) {
        var llc, numTokens, nxt, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, spaced, unspaced;
        this.sheapPush('rhs', 'rhs');
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            unspaced = (llc = lastLineCol(e)).col === nxt.col && llc.line === nxt.line;
            spaced = !unspaced;
            if ((ref1 = nxt.text, indexOf.call('({', ref1) >= 0) && ((ref2 = e.type) === 'single' || ref2 === 'double' || ref2 === 'triple' || ref2 === 'num' || ref2 === 'regex')) {
                break;
            }
            if (this.stack.slice(-1)[0] === '▸arg' && nxt.type === 'op') {
                this.verb('rhs break for ▸arg');
                break;
            } else if (nxt.text === ':' && ((ref3 = this.stack.slice(-1)[0]) === 'class')) {
                if (this.debug) {
                    print.tokens('rhs is class method', tokens.slice(0, 21));
                }
                e = this.keyval(e, tokens);
                break;
            } else if (nxt.text === ':' && (unspaced || indexOf.call(this.stack, '?') < 0)) {
                if (this.stack.slice(-1)[0] !== '{') {
                    this.verb('rhs is first key of implicit object', e);
                    if (this.verbose) {
                        print.tokens('rhs is first key of implicit object', tokens);
                    }
                    e = this.object(e, tokens);
                } else {
                    this.verb('rhs is key of (implicit) object', e);
                    e = this.keyval(e, tokens);
                }
            } else if (nxt.text === 'in' && this.stack.slice(-1)[0] !== 'for') {
                this.verb('incond', e, tokens);
                e = this.incond(e, tokens);
            } else if (e.text != null) {
                if (e.text === '[') {
                    e = this.array(e, tokens);
                } else if (e.text === '(') {
                    e = this.parens(e, tokens);
                } else if (e.text === '{') {
                    e = this.curly(e, tokens);
                } else if (e.text === 'not') {
                    e = this.operation(null, e, tokens);
                } else if (((ref4 = e.text) === '++' || ref4 === '--') && unspaced) {
                    this.verb('rhs increment');
                    e = this.operation(null, e, tokens);
                } else if (((ref5 = e.text) === '+' || ref5 === '-') && unspaced) {
                    if (nxt.type === 'num') {
                        this.verb('rhs +- num');
                        if (e.text === '-') {
                            nxt.text = '-' + nxt.text;
                            nxt.col -= 1;
                        }
                        e = tokens.shift();
                    } else {
                        this.verb('rhs +- operation');
                        e = this.operation(null, e, tokens);
                    }
                } else if (((ref6 = nxt.text) === '++' || ref6 === '--') && unspaced) {
                    if ((ref7 = e.type) !== 'var') {
                        return console.error('wrong rhs increment');
                    }
                    e = this.operation(e, tokens.shift());
                } else {
                    if (this.verbose) {
                        print.tokens("rhs no nxt match? break! stack:" + this.stack + " nxt:", [nxt]);
                    }
                    break;
                }
            } else {
                if (((ref8 = nxt.text) === '++' || ref8 === '--') && unspaced) {
                    e = this.operation(e, tokens.shift());
                    break;
                } else if (this.stack.slice(-1)[0] === 'call' && nxt.text === ']') {
                    this.verb('rhs call array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('rhs curly end');
                    break;
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('rhs array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('rhs [ array end', nxt);
                    break;
                } else {
                    if (this.verbose) {
                        print.ast("rhs no nxt match?? stack:" + this.stack + " e:", e);
                        print.tokens("rhs no nxt match?? nxt:", nxt);
                    }
                    break;
                }
            }
            if (numTokens === tokens.length) {
                this.verb('rhs no token consumed, break!');
                break;
            }
        }
        this.sheapPop('rhs', 'rhs');
        return e;
    };

    Parse.prototype.lhs = function(e, tokens) {
        var b, first, last, numTokens, nxt, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, spaced, unspaced;
        this.sheapPush('lhs', 'lhs');
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            last = lastLineCol(e);
            first = firstLineCol(e);
            unspaced = last.col === nxt.col && last.line === nxt.line;
            spaced = !unspaced;
            b = (function() {
                switch (this.stack.slice(-1)[0]) {
                    case '[':
                        return nxt.text === ']';
                    case '{':
                        return nxt.text === '}';
                }
            }).call(this);
            if (b) {
                break;
            }
            if (e.text === '@') {
                if (nxt.type === 'block' && this.stack.slice(-1)[0] === 'if' || (spaced && nxt.text === 'then') || nxt.type === 'nl') {
                    break;
                } else {
                    e = this["this"](e, tokens);
                    break;
                }
            }
            if (nxt.text === '.') {
                e = this.prop(e, tokens);
            } else if (nxt.type === 'dots' && !this.stack.slice(-1)[0].startsWith('op')) {
                e = this.slice(e, tokens);
            } else if (nxt.text === 'each') {
                e = this.each(e, tokens);
            } else if (nxt.text === '?') {
                if (unspaced) {
                    e = this.assert(e, tokens);
                } else {
                    e = this.qmrkop(e, tokens);
                }
            } else if (nxt.text === ':' && e.qmrkop) {
                e = this.qmrkcolon(e.qmrkop, tokens);
            } else if (nxt.type === 'op' && ((ref1 = nxt.text) !== '++' && ref1 !== '--' && ref1 !== '+' && ref1 !== '-' && ref1 !== 'not') && ((ref2 = e.text) !== '[' && ref2 !== '(') && indexOf.call(this.stack, '▸arg') < 0) {
                if ((ref3 = this.stack.slice(-1)[0]) != null ? ref3.startsWith('op' && this.stack.slice(-1)[0] !== 'op=') : void 0) {
                    this.verb('lhs stop on operation', e, nxt);
                    break;
                } else if (this.stack.slice(-1)[0] === 'in?') {
                    this.verb('lhs stop on in?', e, nxt);
                    break;
                } else {
                    this.verb('lhs is lhs of op', e, nxt);
                    e = this.operation(e, tokens.shift(), tokens);
                }
            } else if (((ref4 = nxt.text) === '+' || ref4 === '-') && ((ref5 = e.text) !== '[' && ref5 !== '(') && spaced && ((ref6 = tokens[1]) != null ? ref6.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('lhs is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && e.parens) {
                this.verb('lhs is args for func', e);
                e = this.func(e, tokens.shift(), tokens);
            } else if (nxt.text === '(' && unspaced) {
                this.verb('lhs is lhs of call');
                e = this.call(e, tokens);
            } else if (nxt.text === '[' && unspaced && ((ref7 = tokens[1]) != null ? ref7.text : void 0) !== ']') {
                this.verb('lhs is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === 'not' && ((ref8 = tokens[1]) != null ? ref8.text : void 0) === 'in') {
                e = {
                    operation: {
                        operator: tokens.shift(),
                        rhs: this.incond(e, tokens)
                    }
                };
            } else if (spaced && (nxt.line === last.line || (nxt.col > first.col && ((ref9 = this.stack.slice(-1)[0]) !== 'if'))) && ((ref10 = nxt.text) !== 'if' && ref10 !== 'then' && ref10 !== 'else' && ref10 !== 'break' && ref10 !== 'continue' && ref10 !== 'in' && ref10 !== 'of' && ref10 !== 'for' && ref10 !== 'while') && ((ref11 = nxt.type) !== 'nl') && ((ref12 = e.type) !== 'num' && ref12 !== 'single' && ref12 !== 'double' && ref12 !== 'triple' && ref12 !== 'regex' && ref12 !== 'punct' && ref12 !== 'comment' && ref12 !== 'op') && ((ref13 = e.text) !== 'null' && ref13 !== 'undefined' && ref13 !== 'Infinity' && ref13 !== 'NaN' && ref13 !== 'true' && ref13 !== 'false' && ref13 !== 'yes' && ref13 !== 'no' && ref13 !== 'if' && ref13 !== 'then' && ref13 !== 'else' && ref13 !== 'for' && ref13 !== 'while') && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && !e.qmrkop && ((ref14 = (ref15 = e.call) != null ? (ref16 = ref15.callee) != null ? ref16.text : void 0 : void 0) !== 'delete' && ref14 !== 'new' && ref14 !== 'typeof') && indexOf.call(this.stack, '▸arg') < 0) {
                this.verb('lhs is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                this.verb('    is lhs of implicit call! nxt', nxt);
                this.verb('    is lhs first', first);
                e = this.call(e, tokens);
                break;
            } else if (((ref17 = nxt.text) === '+' || ref17 === '-') && ((ref18 = e.text) !== '[' && ref18 !== '(')) {
                if (spaced && ((ref19 = tokens[1]) != null ? ref19.col : void 0) === nxt.col + nxt.text.length) {
                    this.verb('lhs op is unbalanced +- break...', e, nxt, this.stack);
                    break;
                }
                this.verb('lhs is lhs of +- op', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else {
                if (this.verbose) {
                    print.tokens("lhs no nxt match? break! stack:" + this.stack + " nxt:", [nxt]);
                }
                break;
            }
            if (numTokens === tokens.length) {
                console.error('lhs no token consumed?');
                break;
            }
        }
        this.sheapPop('lhs', 'lhs');
        return e;
    };

    Parse.prototype.shiftClose = function(rule, text, tokens) {
        var ref1, ref2, ref3;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === text) {
            return tokens.shift();
        }
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'nl' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) === text) {
            this.shiftNewline(rule, tokens);
            return tokens.shift();
        }
        console.error("parse.shiftClose: '" + rule + "' expected closing '" + text + "'");
        return print.tokens("shiftClose missing close '" + text + "'", tokens);
    };

    Parse.prototype.shiftNewline = function(rule, tokens) {
        if (this.debug) {
            console.log(M3(y5(" ◂ " + (w1(rule)))));
        }
        return tokens.shift();
    };

    Parse.prototype.shiftNewlineTok = function(rule, tokens, tok, cond) {
        var ref1, ref2;
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl' && cond) {
            if (((ref2 = tokens[1]) != null ? ref2.col : void 0) === tok.col) {
                return this.shiftNewline(rule, tokens);
            }
        }
    };

    Parse.prototype.nameMethods = function(mthds) {
        var i, len, m, name, ref1, ref2, ref3;
        if (mthds != null ? mthds.length : void 0) {
            for (i = 0, len = mthds.length; i < len; i++) {
                m = mthds[i];
                if (name = (ref1 = m.keyval) != null ? (ref2 = ref1.key) != null ? ref2.text : void 0 : void 0) {
                    if (((ref3 = m.keyval.val) != null ? ref3.func : void 0) != null) {
                        m.keyval.val.func.name = {
                            type: 'name',
                            text: name
                        };
                    } else {
                        console.log('no function for method?', name, m);
                    }
                }
            }
        }
        return mthds;
    };

    Parse.prototype.then = function(id, tokens) {
        var block, ref1, ref2, ref3, ref4, thn;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'then') {
            tokens.shift();
            if ((ref2 = (ref3 = tokens[0]) != null ? ref3.type : void 0) === 'block' || ref2 === 'nl') {
                this.verb('empty then!');
                thn = [];
            } else {
                this.push('then');
                thn = this.exps(id, tokens, 'nl');
                this.pop('then');
            }
        } else if (((ref4 = tokens[0]) != null ? ref4.type : void 0) === 'block') {
            block = tokens.shift();
            this.push('then');
            thn = this.exps(id, block.tokens);
            this.pop('then');
            if (block.tokens.length) {
                if (this.debug) {
                    print.tokens('then: dangling block tokens', tokens);
                }
                while (block.tokens.length) {
                    this.verb('unshift', block.tokens.slice(-1)[0]);
                    tokens.unshift(block.tokens.pop());
                }
                print.tokens('then after unshifting dangling block tokens', tokens);
            }
        } else {
            this.verb("no then and no block after " + id + "!");
        }
        return thn;
    };

    Parse.prototype.block = function(id, tokens) {
        var block, exps, nl, origTokens, ref1;
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            origTokens = tokens;
            block = tokens.shift();
            tokens = block.tokens;
            nl = null;
        } else {
            nl = 'nl';
        }
        this.push('▸' + id);
        exps = this.exps(id, tokens, nl);
        this.pop('▸' + id);
        if (block && block.tokens.length) {
            if (this.debug) {
                print.tokens('dangling block tokens', tokens);
            }
            while (block.tokens.length) {
                this.verb('unshift', block.tokens.slice(-1)[0]);
                origTokens.unshift(block.tokens.pop());
            }
            if (this.debug) {
                print.tokens('block after unshifting dangling block tokens', origTokens);
            }
        }
        return exps;
    };

    Parse.prototype.subBlocks = function(tokens) {
        var elseBlock, elseTokens, ref1, subbs, t;
        subbs = [[]];
        if (tokens.slice(-1)[0].type === 'block' && tokens.slice(-1)[0].tokens[0].text === 'then') {
            elseBlock = tokens.pop();
            elseTokens = elseBlock.tokens;
            elseTokens[0].text = 'else';
        }
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'then') {
            tokens[0].text = 'else';
            return [tokens];
        }
        while (valid(tokens)) {
            t = tokens.shift();
            if (t.type === 'nl') {
                subbs.push([]);
                if (tokens[0].text === 'then') {
                    tokens[0].text = 'else';
                }
            } else {
                subbs.slice(-1)[0].push(t);
            }
        }
        if (elseTokens) {
            subbs.push(elseTokens);
        }
        return subbs;
    };

    Parse.prototype.sheapPush = function(type, text) {
        this.sheap.push({
            type: type,
            text: text
        });
        if (this.debug) {
            return print.sheap(this.sheap);
        }
    };

    Parse.prototype.sheapPop = function(m, t) {
        var popped;
        popped = this.sheap.pop();
        if (popped.text !== t && popped.text !== kstr.strip(t, "'")) {
            console.error('wrong pop?', popped.text, t);
        }
        if (this.debug) {
            return print.sheap(this.sheap, popped);
        }
    };

    Parse.prototype.push = function(node) {
        if (this.debug) {
            print.stack(this.stack, node);
        }
        this.stack.push(node);
        return this.sheapPush('stack', node);
    };

    Parse.prototype.pop = function(n) {
        var p;
        p = this.stack.pop();
        this.sheapPop('stack', p);
        if (p !== n) {
            console.error("unexpected pop!", p, n);
        }
        if (this.debug) {
            return print.stack(this.stack, p, function(s) {
                return W1(w1(s));
            });
        }
    };

    Parse.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Parse;

})();

module.exports = Parse;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0VBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsZUFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLEdBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztJQUp4Qjs7b0JBWUgsS0FBQSxHQUFPLFNBQUMsS0FBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULEdBQUEsR0FBTTtRQUVOLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFXLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFXLEtBQUssQ0FBQyxNQUFqQixDQUFYO1FBRU4sSUFBRyxJQUFDLENBQUEsR0FBSjtZQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFxQixHQUFyQixFQUFiOztlQUVBO1lBQUEsSUFBQSxFQUFLLEVBQUw7WUFDQSxJQUFBLEVBQUssR0FETDs7SUFYRzs7b0JBK0JQLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsSUFBZjtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxNQUFOLENBQVY7QUFBQSxtQkFB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QUpFOztvQkFNTixHQUFBLEdBQUssU0FBQyxDQUFEO0FBQ0QsWUFBQTtRQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBQTtRQUNKLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFrQixDQUFsQjtRQUNBLElBQUcsQ0FBQSxLQUFLLENBQVI7WUFDRyxPQUFBLENBQUMsS0FBRCxDQUFPLGlCQUFQLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBREg7O1FBR0EsSUFBRyxJQUFDLENBQUEsS0FBSjttQkFDSSxLQUFLLENBQUMsS0FBTixDQUFZLElBQUMsQ0FBQSxLQUFiLEVBQW9CLENBQXBCLEVBQXVCLFNBQUMsQ0FBRDt1QkFBTyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUgsQ0FBSDtZQUFQLENBQXZCLEVBREo7O0lBTkM7O29CQVNMLElBQUEsR0FBTSxTQUFBO1FBQUcsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQU8sQ0FBQyxHQUExQixFQUErQixTQUEvQixFQUFqQjs7SUFBSDs7Ozs7O0FBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuXG57IGVtcHR5LCB2YWxpZCwgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEB2ZXJib3NlICA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAcmF3ICAgICAgPSBAa29kZS5hcmdzLnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cbiAgICAgICAgQHNoZWFwID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgdmFyczpbXSBcbiAgICAgICAgZXhwczphc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAgICAjXG4gICAgIyB0aGUgZW50cnkgcG9pbnQgZm9yIC4uLlxuICAgICMgICAtIHRoZSB0bCBzY29wZVxuICAgICMgICAtIGNsYXNzIGFuZCBmdW5jdGlvbiBib2RpZXNcbiAgICAjICAgLSBhcmd1bWVudCBsaXN0c1xuICAgICMgICAtIGFycmF5cyBhbmQgb2JqZWN0c1xuICAgICMgICAtIHBhcmVuc1xuICAgICMgICAtIC4uLlxuICAgICMgZXNzZW50aWFsbHkgZXZlcnl0aGluZyB0aGF0IHJlcHJlc2VudHMgYSBsaXN0IG9mIHNvbWV0aGluZ1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cHMnIHJ1bGVcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJnJyAgICAgICAgICAgICAgICAgdGhlbiBlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgJ3N3aXRjaCcgJ3RoZW4nICfilrhlbHNlJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnXScgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICd9J1xuICAgICAgICAgICAgICAgIHdoZW4gJygnICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZ3MnICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gWyddJyAnOycgJ2Vsc2UnICd0aGVuJ11cbiAgICAgICAgICAgICAgICB3aGVuICfilrhyZXR1cm4nICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICdpZidcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnOycgIyBiYWlsIG91dCBmb3IgaW1wbGljaXQgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBydWxlICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gc3RvcCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgICBpZiBiIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RhY2sgdG9wXCIgQHN0YWNrIDsgYnJlYWsgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdG9wIGFuZCB0b2tlbnNbMF0udGV4dCA9PSBzdG9wIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RvcFwiIHN0b3AgOyBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcCBpbiBbJ25sJ11cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0IHdpdGggc3RvcCAje3N0b3B9IGJyZWFrIVwiXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydCBzdG9wOiN7c3RvcH0gYmxvY2s6XCIgYmxvY2tcblxuICAgICAgICAgICAgICAgICMgcHJpbnQuYXN0ICdleHBzIGJsb2NrIHN0YXJ0JyBlcyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9ja2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGJsb2NrRXhwcyA9IEBleHBzICdibG9jaycgYmxvY2sudG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBwcmludC5hc3QgJ2V4cHMgYmxvY2sgc3RhcnQnIGJsb2NrRXhwcyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlcyA9IGVzLmNvbmNhdCBibG9ja0V4cHNcblxuICAgICAgICAgICAgICAgIGlmIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kIHJlbWFpbmluZyBibG9jayB0b2tlbnM6JyBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnYmVmb3JlIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ2V4cHMgYWZ0ZXIgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgZW5kIHNoaWZ0IGNvbW1hICwgYW5kIGNvbnRpbnVlLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBibG9jayBlbmQgbmwgY29tbWEgLCBhbmQgY29udGludWUuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kLCBicmVhayEnXG4gICAgICAgICAgICAgICAgIyBwcmludC5hc3QgJ2V4cHMgYmxvY2sgZW5kLCBicmVhayEnIGVzIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uIGJsb2NrJyAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcpJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gKScgICAgICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgaW4gWydpbicnb2YnXSAgIGFuZCBydWxlID09ICdmb3IgdmFscycgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZicgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnbmwnIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIHN0b3A6JyBzdG9wLCB0b2tlbnNbMF0sIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lICdleHBzIG5sIF0gaW4gYXJyYXknIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBzdG9wXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIHdpdGggc3RvcCcgc3RvcFxuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIGluIFsn4pa4YXJncycgJ+KWuGJvZHknICfilrhyZXR1cm4nICd0aGVuJyAn4pa4ZWxzZSddIG9yIHN0b3AgIT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIG5sIHdpdGggc3RvcCAnI3tzdG9wfScgaW4gI3tAc3RhY2tbLTFdfSAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCB3aXRoIHN0b3AgJyN7c3RvcH0nXCIgdG9rZW5zIFxuICAgICAgICAgICAgICAgICAgICBicmVhayBcblxuICAgICAgICAgICAgICAgIG5sID0gQHNoaWZ0TmV3bGluZSBcImV4cHMgbmwgKG5vIHN0b3ApIC4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLicgYW5kIHRva2Vuc1sxXT8udHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ2V4cHMgbmwgbmV4dCBsaW5lIHN0YXJ0cyB3aXRoIC52YXIhJ1xuICAgICAgICAgICAgICAgICAgICBlcy5wdXNoIEBwcm9wIGVzLnBvcCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgY29udGludWUuLi4nXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGUgPSBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgbGFzdCA9IGxhc3RMaW5lQ29sIGVcblxuICAgICAgICAgICAgd2hpbGUgICAoXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1swXT8udGV4dCBpbiBbJ2lmJyAnZm9yJyAnd2hpbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIEBzdGFja1stMV0gbm90IGluIFsn4pa4YXJncycgJ+KWuHJldHVybiddIGFuZFxuICAgICAgICAgICAgICAgICAgICAjIEBzdGFja1stMV0gbm90IGluIFsn4pa4YXJncyddIGFuZFxuICAgICAgICAgICAgICAgICAgICBsYXN0LmxpbmUgPT0gdG9rZW5zWzBdLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyAje3Rva2Vuc1swXS50ZXh0IH1UYWlsXCIgZSwgQHN0YWNrXG4gICAgICAgICAgICAgICAgIyBwcmludC50b2tlbnMgJ3RhaWwnIHRva2Vuc1xuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2tlbnNbMF0udGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgIHRoZW4gZSA9IEBpZlRhaWwgICAgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgdGhlbiBlID0gQGZvclRhaWwgICBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyB0aGVuIGUgPSBAd2hpbGVUYWlsIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXMucHVzaCBlXG5cbiAgICAgICAgICAgIGlmICAoXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1swXT8udGV4dCBpbiBbJ2lmJyd0aGVuJydmb3InJ3doaWxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0uY29sID4gbGFzdC5jb2wgYW5kXG4gICAgICAgICAgICAgICAgICAgIGVzLmxlbmd0aCBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG5vdCBibG9ja2VkIGFuZFxuICAgICAgICAgICAgICAgICAgICBsYXN0LmxpbmUgPT0gdG9rZW5zWzBdLmxpbmVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gaWZ8dGhlbnxmb3J8d2hpbGUnIDsgYnJlYWsgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnOycgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSBub3QgaW4gWyfilrhhcmdzJyAnd2hlbicgJ3snXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBzaGlmdCBjb2xvbicgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIGNvbG9uJyBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubyB0b2tlbiBjb25zdW1lZCcgdG9rZW5zICMgaGFwcGVucyBmb3IgdW5iYWxhbmNlZCBjbG9zaW5nIF1cbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwcycgcnVsZVxuICAgICAgICBcbiAgICAgICAgZXNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIHNpbmdsZSBleHByZXNzaW9uXG4gICAgI1xuICAgICMgZXhwcmVzc2lvbiBjYW4gYmUgYW55dGhpbmcsIGZyb20gc2luZ2xlIGRpZ2l0cyB0byB3aG9sZSBjbGFzc2VzIFxuICAgICMgYnV0IGl0IGlzIGFsd2F5cyBhIHNpbmdsZSBvYmplY3RcbiAgICAjXG4gICAgIyBhc3N1bWVzIHRoYXQgdGhlIGhhbmRsaW5nIG9mIG5ld2xpbmVzIGlzIGRvbmUgc29tZXdoZXJlIGVsc2VcbiAgICAjIHNraXBzIG92ZXIgbGVhZGluZyBzZW1pY29sb25zXG5cbiAgICBleHA6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIHRvayA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgbG9nIFk1IHcxIHRvaz8udGV4dCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0b2sudHlwZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdibG9jaycgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIG5sIHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgd2hlbiAnOycgICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgOyB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2tleXdvcmQnICMgZGlzcGF0Y2ggdG8gYmxvY2sgcnVsZXMgaWRlbnRpZmllZCBieSBrZXl3b3JkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0IG5vdCBpbiAnOicgIyBhbGxvdyBrZXl3b3JkcyBhcyBrZXlzXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICB0aGVuIHJldHVybiBAcmV0dXJuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICB0aGVuIHJldHVybiBAc3dpdGNoICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICB0aGVuIHJldHVybiBAY2xhc3MgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bmN0aW9uJyB0aGVuIHJldHVybiBAZnVuY3Rpb24gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICB0aGVuIHJldHVybiBAd2hpbGUgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICB0aGVuIHJldHVybiBAd2hlbiAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICB0aGVuIHJldHVybiBAdHJ5ICAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICB0aGVuIHJldHVybiBAZm9yICAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICfilrhyZXR1cm4nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnaWYnIEBzdGFjayBpZiBAc3RhY2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAaWYgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuXG4gICAgICAgICMgaGVyZSBzdGFydHMgdGhlIGhhaXJ5IHBhcnQgOi0pXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICBlID0gdG9rXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGggICAgICAgICAgICAgICAgICAjIHJlcGVhdGVkbHkgY2FsbCByaHMgYW5kIGxocyB1bnRpbCBhbGwgdG9rZW5zIGFyZSBzd2FsbG93ZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBlID0gQHJocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIGZpcnN0LCB0cnkgdG8gZWF0IGFzIG11Y2ggdG9rZW5zIGFzIHBvc3NpYmxlIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgXCJyaHNcIiBlIGlmIEB2ZXJib3NlICAgIFxuXG4gICAgICAgICAgICBlID0gQGxocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIHNlZSwgaWYgd2UgY2FuIHVzZSB0aGUgcmVzdWx0IGFzIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiBzb21ldGhpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZVxuXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgaW4gJzsnXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBicmVhayBvbiA7J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBubyB0b2tlbiBjb25zdW1lZDogYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICAjIHJlY3Vyc2l2ZWx5IGJ1aWxkIHVwIHN0dWZmIHRoYXQgY2FuIGJlIGlkZW50aWZpZWQgYnkgbG9va2luZyBhdCB0aGUgbmV4dCB0b2tlbiBvbmx5OlxuICAgICNcbiAgICAjIGFueXRoaW5nIHRoYXQgb3BlbnMgYW5kIGNsb3Nlc1xuICAgICMgICAtIG9iamVjdHNcbiAgICAjICAgLSBhcnJheXNcbiAgICAjICAgLSBwYXJlbnNcbiAgICAjXG4gICAgIyBidXQgYWxzbyBcbiAgICAjICAgLSBzaW5nbGUgb3BlcmFuZCBvcGVyYXRpb25zXG4gICAgXG4gICAgcmhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAncmhzJyAncmhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdW5zcGFjZWQgPSAobGxjID0gbGFzdExpbmVDb2woZSkpLmNvbCA9PSBueHQuY29sIGFuZCBsbGMubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGlmIG54dC50ZXh0IGluICcoeycgYW5kIGUudHlwZSBpbiBbJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ251bScgJ3JlZ2V4J11cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICfilrhhcmcnIGFuZCBueHQudHlwZSA9PSAnb3AnIHRoZW4gQHZlcmIgJ3JocyBicmVhayBmb3Ig4pa4YXJnJzsgYnJlYWtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6JyBhbmQgQHN0YWNrWy0xXSBpbiBbJ2NsYXNzJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ3JocyBpcyBjbGFzcyBtZXRob2QnIHRva2Vuc1suLjIwXSBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kICh1bnNwYWNlZCBvciAnPycgbm90IGluIEBzdGFjaylcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdyaHMgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBAdmVyYiAnaW5jb25kJyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0P1xuICAgICAgICAgICAgICAgIGlmICAgICAgZS50ZXh0ID09ICdbJyAgIHRoZW4gZSA9IEBhcnJheSAgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJygnICAgdGhlbiBlID0gQHBhcmVucyAgICAgICAgICBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAneycgICB0aGVuIGUgPSBAY3VybHkgICAgICAgICAgIGUsIHRva2VucyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAnbm90JyB0aGVuIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysnJy0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ251bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgKy0gbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZS50ZXh0ID09ICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0ID0gJy0nICsgbnh0LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQuY29sIC09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50eXBlIG5vdCBpbiBbJ3ZhciddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IgJ3dyb25nIHJocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSAjIGlmIGUgaXMgbm90IGEgdG9rZW4gYW55bW9yZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gICAgYW5kIHVuc3BhY2VkICAgICAgICB0aGVuIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpOyBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCcgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgY2FsbCBhcnJheSBlbmQnOyAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgICAgYW5kIG54dC50ZXh0ID09ICd9JyB0aGVuIEB2ZXJiICdyaHMgY3VybHkgZW5kJzsgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBhcnJheSBlbmQnOyAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBbIGFycmF5IGVuZCcgbnh0OyAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwicmhzIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAncmhzIG5vIHRva2VuIGNvbnN1bWVkLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgICMgaWYgbnh0ID0gdG9rZW5zWzBdXG4jICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBpZiBlbXB0eSBAc3RhY2tcbiMgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgQHZlcmIgJ3JocyBlbXB0eSBzdGFjayBueHQnIG54dFxuIyAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgICAgICAjIEB2ZXJiICdyaHMgaXMgbGFzdCBtaW51dGUgaW5kZXggb2YgbGhzJyBlXG4gICAgICAgICAgICAgICAgICAgICMgZSA9IEBpbmRleCBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ3JocycgJ3JocydcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyByZWN1cnNpdmVseSBidWlsZCB1cCBzdHVmZiB0aGF0IGNhbiBiZSBpZGVudGlmaWVkIGJ5IGxvb2tpbmcgYXQgdGhlIG5leHQgdG9rZW4gKmFuZCogd2hhdCB3YXMganVzdCBwYXJzZWRcbiAgICAjXG4gICAgIyBhbnl0aGluZyB0aGF0IGNhbiBiZSBjaGFpbmVkXG4gICAgIyAgIC0gb3BlcmF0aW9uc1xuICAgICMgICAtIHByb3BlcnRpZXNcbiAgICAjICAgLSBjYWxsc1xuICAgIFxuICAgIGxoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2xocycgJ2xocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxhc3QgID0gbGFzdExpbmVDb2wgIGVcbiAgICAgICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGVcbiAgICAgICAgICAgIHVuc3BhY2VkID0gbGFzdC5jb2wgPT0gbnh0LmNvbCBhbmQgbGFzdC5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgdGhlbiBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICB3aGVuICd7JyB0aGVuIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLnRleHQgPT0gJ0AnIFxuICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdibG9jaycgYW5kIEBzdGFja1stMV0gPT0gJ2lmJyBvciAoc3BhY2VkIGFuZCBueHQudGV4dCA9PSAndGhlbicpIG9yIG54dC50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAdGhpcyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgICAgICBueHQudGV4dCA9PSAnLicgICAgdGhlbiBlID0gQHByb3AgICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIGFuZCBub3QgQHN0YWNrWy0xXS5zdGFydHNXaXRoKCdvcCcpIHRoZW4gZSA9IEBzbGljZSAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdlYWNoJyB0aGVuIGUgPSBAZWFjaCAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnPycgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdW5zcGFjZWQgIyBhbmQgdG9rZW5zWzFdPy50ZXh0IGluICcoWy4nXG5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBhc3NlcnQgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcW1ya29wIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonIGFuZCBlLnFtcmtvcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGUgPSBAcW1ya2NvbG9uIGUucW1ya29wLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBueHQudHlwZSA9PSAnb3AnIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnKysnICctLScgJysnICctJyAnbm90J10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRleHQgbm90IGluIFsnWycgJygnXSBhbmQgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJ+KWuGFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXT8uc3RhcnRzV2l0aCAnb3AnIGFuZCBAc3RhY2tbLTFdICE9ICdvcD0nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgc3RvcCBvbiBvcGVyYXRpb24nIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnaW4/J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIHN0b3Agb24gaW4/JyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCBlLnBhcmVuc1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgYXJncyBmb3IgZnVuYycgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJyBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdW5zcGFjZWQgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdub3QnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2luJ1xuXG4gICAgICAgICAgICAgICAgZSA9IG9wZXJhdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3I6dG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgcmhzOkBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgKG54dC5saW5lID09IGxhc3QubGluZSBvciAobnh0LmNvbCA+IGZpcnN0LmNvbCBhbmQgQHN0YWNrWy0xXSBub3QgaW4gWydpZiddKSkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJ2lmJyAndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZicgJ2ZvcicgJ3doaWxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudHlwZSBub3QgaW4gWydubCddIGFuZFxuICAgICAgICAgICAgICAgICAgICAoZS50eXBlIG5vdCBpbiBbJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ3JlZ2V4JyAncHVuY3QnICdjb21tZW50JyAnb3AnXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICAoZS50ZXh0IG5vdCBpbiBbJ251bGwnICd1bmRlZmluZWQnICdJbmZpbml0eScgJ05hTicgJ3RydWUnICdmYWxzZScgJ3llcycgJ25vJyAnaWYnICd0aGVuJyAnZWxzZScgJ2ZvcicgJ3doaWxlJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuYXJyYXkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9iamVjdCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUua2V5dmFsIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vcGVyYXRpb24gYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmluY29uZCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUucW1ya29wIGFuZFxuICAgICAgICAgICAgICAgICAgICBlLmNhbGw/LmNhbGxlZT8udGV4dCBub3QgaW4gWydkZWxldGUnJ25ldycndHlwZW9mJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIGUnIGUsIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIGZpcnN0JyBmaXJzdCBcbiAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIGUudGV4dCBub3QgaW4gWydbJyAnKCddXG4gICAgICAgICAgICAgICAgaWYgc3BhY2VkIGFuZCB0b2tlbnNbMV0/LmNvbCA9PSBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy0gb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwibGhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2xocyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdsaHMnICdsaHMnICAgICAgIFxuICAgICAgICBlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICAjIHJ1bGVzIGluIHBhcnNlciBzaG91bGQgdXNlIHRoaXMgaW5zdGVhZCBvZiBjYWxsaW5nIHNoaWZ0TmV3bGluZSBkaXJlY3RseVxuICAgIFxuICAgIHNoaWZ0Q2xvc2U6IChydWxlLCB0ZXh0LCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5zaGlmdCgpIFxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBydWxlLCB0b2tlbnNcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgICAgIGVycm9yIFwicGFyc2Uuc2hpZnRDbG9zZTogJyN7cnVsZX0nIGV4cGVjdGVkIGNsb3NpbmcgJyN7dGV4dH0nXCJcbiAgICAgICAgcHJpbnQudG9rZW5zIFwic2hpZnRDbG9zZSBtaXNzaW5nIGNsb3NlICcje3RleHR9J1wiIHRva2Vuc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgIyB0aGlzIHNob3VsZCBiZSB0aGUgb25seSBtZXRob2QgdG8gcmVtb3ZlIG5ld2xpbmVzIGZyb20gdGhlIHRva2Vuc1xuICAgICMgaXQgaXMgdmVyeSBpbXBvcnRhbnQgdG8ga2VlcCB0aGUgbmV3bGluZXMgYXMgYSByZWN1cnNpb24gYnJlYWtlciB1bnRpbCB0aGUgbGFzdCBwb3NzaWJsZSBtb21lbnRcbiAgICAjIHVzaW5nIHRoaXMgbWV0aG9kIG1ha2VzIGl0IG11Y2ggZWFzaWVyIHRvIGRldGVybWluZSB3aGVuIG9uZSBnZXRzIHN3YWxsd2VkIHRvbyBlYXJseVxuICAgIFxuICAgIHNoaWZ0TmV3bGluZTogKHJ1bGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1ZyB0aGVuIGxvZyBNMyB5NSBcIiDil4IgI3t3MSBydWxlfVwiIFxuICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICBzaGlmdE5ld2xpbmVUb2s6IChydWxlLCB0b2tlbnMsIHRvaywgY29uZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCBjb25kXG4gICAgICAgICAgIGlmIHRva2Vuc1sxXT8uY29sID09IHRvay5jb2xcbiAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgcnVsZSwgdG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG4gICAgIyBhZGRzIG5hbWUgdG9rZW5zIHRvIGZ1bmN0aW9ucyB0aGF0IGFyZSB2YWx1ZXMgaW4gY2xhc3Mgb2JqZWN0c1xuICAgIFxuICAgIG5hbWVNZXRob2RzOiAobXRoZHMpIC0+XG4gXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgaWYgbmFtZSA9IG0ua2V5dmFsPy5rZXk/LnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5rZXl2YWwudmFsPy5mdW5jP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6bmFtZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIGZ1bmN0aW9uIGZvciBtZXRob2Q/JyBuYW1lLCBtXG4gICAgICAgIG10aGRzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICAjIGVhdHMgZWl0aGVyIHRva2VucyB0byB0aGUgcmlnaHQgb2YgJ3RoZW4nIHRva2Vuc1xuICAgICMgb3Igb2YgdGhlIG5leHQgYmxvY2tcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSBpbiBbJ2Jsb2NrJyAnbmwnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdlbXB0eSB0aGVuISdcbiAgICAgICAgICAgICAgICB0aG4gPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICd0aGVuJ1xuICAgICAgICAgICAgICAgIHRobiA9IEBleHBzIGlkLCB0b2tlbnMsICdubCdcbiAgICAgICAgICAgICAgICBAcG9wICd0aGVuJ1xuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgQHB1c2ggJ3RoZW4nXG4gICAgICAgICAgICB0aG4gPSBAZXhwcyBpZCwgYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBAcG9wICd0aGVuJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuOiBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICd1bnNoaWZ0JyBibG9jay50b2tlbnNbLTFdXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ3RoZW4gYWZ0ZXIgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdmVyYiBcIm5vIHRoZW4gYW5kIG5vIGJsb2NrIGFmdGVyICN7aWR9IVwiXG4gICAgICAgICAgICAjIHdhcm4gXCInI3tpZH0nIGV4cGVjdGVkIHRoZW4gb3IgYmxvY2tcIlxuICAgICAgICBcbiAgICAgICAgdGhuXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgICMgZWl0aGVyIGVhdHMgYmxvY2sgdG9rZW5zXG4gICAgIyBvciB1bnRpbCBuZXh0IG5ld2xpbmVcbiAgICAjIHVzZWQgZm9yIHRoaW5ncyB0aGF0IGRvZXNuJ3QgZXhwZWN0ICd0aGVuJyB3aGVuIGNvbnRpbnVlZCBpbiBzYW1lIGxpbmVcbiAgICAjICAgLSBmdW5jdGlvbiBib2R5XG4gICAgIyAgIC0gY2FsbCBhcmd1bWVudHNcbiAgICAjICAgLSB0cnksIGNhdGNoLCBmaW5hbGx5XG4gICAgIyAgIC0gZWxzZVxuICAgICMgICAtIHJldHVyblxuICAgIFxuICAgIGJsb2NrOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgICMgQHZlcmIgJ2Jsb2NrIG5leHQgdG9rZW4gdHlwZScgdG9rZW5zWzBdPy50eXBlIFxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIG9yaWdUb2tlbnMgPSB0b2tlbnNcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBubCA9ICdubCdcblxuICAgICAgICBAcHVzaCAn4pa4JytpZFxuICAgICAgICBleHBzID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgQHBvcCAn4pa4JytpZFxuXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICd1bnNoaWZ0JyBibG9jay50b2tlbnNbLTFdXG4gICAgICAgICAgICAgICAgb3JpZ1Rva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdibG9jayBhZnRlciB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2Vucycgb3JpZ1Rva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHN1YkJsb2NrczogKHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIHN1YmJzID0gW1tdXVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWy0xXS50eXBlID09ICdibG9jaycgYW5kIHRva2Vuc1stMV0udG9rZW5zWzBdLnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICBlbHNlQmxvY2sgPSB0b2tlbnMucG9wKClcbiAgICAgICAgICAgIGVsc2VUb2tlbnMgPSBlbHNlQmxvY2sudG9rZW5zXG4gICAgICAgICAgICBlbHNlVG9rZW5zWzBdLnRleHQgPSAnZWxzZSdcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgdG9rZW5zWzBdLnRleHQgPSAnZWxzZSdcbiAgICAgICAgICAgIHJldHVybiBbdG9rZW5zXVxuICAgICAgICAgICAgXG4gICAgICAgIHdoaWxlIHZhbGlkIHRva2Vuc1xuICAgICAgICAgICAgdCA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIHN1YmJzLnB1c2ggW11cbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zWzBdLnRleHQgPSAnZWxzZSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzdWJic1stMV0ucHVzaCB0XG5cbiAgICAgICAgc3ViYnMucHVzaCBlbHNlVG9rZW5zIGlmIGVsc2VUb2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3ViYnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICBcbiAgICBzaGVhcFB1c2g6ICh0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICBzaGVhcFBvcDogKG0sIHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3BwZWQgPSBAc2hlYXAucG9wKClcbiAgICAgICAgaWYgcG9wcGVkLnRleHQgIT0gdCBhbmQgcG9wcGVkLnRleHQgIT0ga3N0ci5zdHJpcCh0LCBcIidcIikgdGhlbiBlcnJvciAnd3JvbmcgcG9wPycgcG9wcGVkLnRleHQsIHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwLCBwb3BwZWQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQGRlYnVnXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcbiAgICAgICAgQHNoZWFwUHVzaCAnc3RhY2snIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgQHNoZWFwUG9wICdzdGFjaycgcFxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZVxuIl19
//# sourceURL=../coffee/parse.coffee
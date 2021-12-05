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
                    if (((ref6 = this.stack.slice(-1)[0]) === '▸args' || ref6 === '▸body' || ref6 === '▸return' || ref6 === 'then') || stop !== 'nl') {
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
            if (((ref12 = (ref13 = tokens[0]) != null ? ref13.text : void 0) === 'if' || ref12 === 'then' || ref12 === 'for' || ref12 === 'while') && es.length && !blocked && last.line === tokens[0].line) {
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
                if (nxt.type === 'block' && this.stack.slice(-1)[0] === 'if' || nxt.text === 'then' || nxt.type === 'nl') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0VBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsZUFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLEdBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztJQUp4Qjs7b0JBWUgsS0FBQSxHQUFPLFNBQUMsS0FBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULEdBQUEsR0FBTTtRQUVOLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFXLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFXLEtBQUssQ0FBQyxNQUFqQixDQUFYO1FBRU4sSUFBRyxJQUFDLENBQUEsR0FBSjtZQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFxQixHQUFyQixFQUFiOztlQUVBO1lBQUEsSUFBQSxFQUFLLEVBQUw7WUFDQSxJQUFBLEVBQUssR0FETDs7SUFYRzs7b0JBK0JQLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsSUFBZjtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxNQUFOLENBQVY7QUFBQSxtQkFBQTs7UUFFQSxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBa0IsSUFBbEI7UUFFQSxFQUFBLEdBQUs7QUFFTCxlQUFNLE1BQU0sQ0FBQyxNQUFiO1lBRUksU0FBQSxHQUFZLE1BQU0sQ0FBQztZQUVuQixDQUFBOztBQUFJLHdCQUFPLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQWhCO0FBQUEseUJBRUssTUFGTDsrQkFFaUMsRUFBRSxDQUFDO0FBRnBDLHlCQUdLLElBSEw7QUFBQSx5QkFHVSxRQUhWO0FBQUEseUJBR21CLE1BSG5CO0FBQUEseUJBRzBCLE9BSDFCOytCQUd3QyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixLQUFrQjtBQUgxRCx5QkFJSyxHQUpMOytCQUlpQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixLQUFrQjtBQUpuRCx5QkFLSyxHQUxMO3NDQUtpQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixFQUFBLGFBQWtCLEdBQWxCLEVBQUEsSUFBQTtBQUxqQyx5QkFNSyxHQU5MOytCQU1pQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixLQUFrQjtBQU5uRCx5QkFPSyxPQVBMO3VDQU9pQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBVixLQUFtQixHQUFuQixJQUFBLElBQUEsS0FBdUIsR0FBdkIsSUFBQSxJQUFBLEtBQTJCLE1BQTNCLElBQUEsSUFBQSxLQUFrQztBQVBuRSx5QkFRSyxTQVJMOytCQVFpQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixLQUFrQjtBQVJuRCx5QkFTSyxNQVRMO3NDQVNpQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixFQUFBLGFBQWtCLEdBQWxCLEVBQUEsSUFBQTtBQVRqQyx5QkFXSyxJQVhMOytCQVdpQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixLQUFrQjtBQVhuRDsrQkFZSztBQVpMOztZQWNKLElBQUcsQ0FBSDtnQkFBVSxJQUFDLENBQUEsSUFBRCxDQUFNLGlCQUFBLEdBQWtCLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUE1QixHQUFpQyxnQkFBdkMsRUFBdUQsSUFBQyxDQUFBLEtBQXhEO0FBQWdFLHNCQUExRTs7WUFFQSxJQUFHLElBQUEsSUFBUyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixLQUFrQixJQUE5QjtnQkFBd0MsSUFBQyxDQUFBLElBQUQsQ0FBTSxpQkFBQSxHQUFrQixNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBNUIsR0FBaUMsV0FBdkMsRUFBa0QsSUFBbEQ7QUFBeUQsc0JBQWpHOztZQUVBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVYsS0FBa0IsT0FBckI7Z0JBRUksSUFBRyxJQUFBLEtBQVMsSUFBWjtvQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLDZCQUFBLEdBQThCLElBQTlCLEdBQW1DLFNBQXpDO0FBQ0EsMEJBRko7O2dCQUlBLEtBQUEsR0FBUSxNQUFNLENBQUMsS0FBUCxDQUFBO2dCQUVSLElBQUMsQ0FBQSxJQUFELENBQU0sd0JBQUEsR0FBeUIsSUFBekIsR0FBOEIsU0FBcEMsRUFBNkMsS0FBN0M7Z0JBSUEsT0FBQSxHQUFVO2dCQUNWLFNBQUEsR0FBWSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sRUFBYyxLQUFLLENBQUMsTUFBcEI7Z0JBSVosRUFBQSxHQUFLLEVBQUUsQ0FBQyxNQUFILENBQVUsU0FBVjtnQkFFTCxJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBaEI7b0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSx3Q0FBTixFQUErQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQTVEO29CQUNBLElBQWlFLElBQUMsQ0FBQSxLQUFsRTt3QkFBQSxLQUFLLENBQUMsTUFBTixDQUFhLHlDQUFiLEVBQXVELE1BQXZELEVBQUE7O0FBQ0EsMkJBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFuQjt3QkFDSSxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBYixDQUFBLENBQWY7b0JBREo7b0JBRUEsSUFBcUUsSUFBQyxDQUFBLEtBQXRFO3dCQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsNkNBQWIsRUFBMkQsTUFBM0QsRUFBQTtxQkFMSjs7Z0JBT0Esc0NBQVksQ0FBRSxjQUFYLEtBQW1CLEdBQXRCO29CQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sOENBQU47b0JBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBQTtBQUNBLDZCQUhKO2lCQUFBLE1BS0ssc0NBQVksQ0FBRSxjQUFYLEtBQW1CLElBQW5CLHNDQUFxQyxDQUFFLGNBQVgsS0FBbUIsR0FBbEQ7b0JBQ0QsSUFBQyxDQUFBLFlBQUQsQ0FBYywyQ0FBZCxFQUEwRCxNQUExRDtvQkFDQSxNQUFNLENBQUMsS0FBUCxDQUFBO0FBQ0EsNkJBSEM7O2dCQUtMLElBQUMsQ0FBQSxJQUFELENBQU0sd0JBQU47QUFFQSxzQkF0Q0o7O1lBd0NBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVYsS0FBa0IsT0FBckI7Z0JBQWlFLElBQUMsQ0FBQSxJQUFELENBQU0scUJBQU47QUFBZ0Msc0JBQWpHOztZQUNBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVYsS0FBa0IsR0FBckI7Z0JBQWlFLElBQUMsQ0FBQSxJQUFELENBQU0saUJBQU47QUFBZ0Msc0JBQWpHOztZQUNBLElBQUcsU0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBVixLQUFtQixJQUFuQixJQUFBLElBQUEsS0FBdUIsSUFBdkIsQ0FBQSxJQUFtQyxJQUFBLEtBQVEsVUFBOUM7Z0JBQWlFLElBQUMsQ0FBQSxJQUFELENBQU0scUJBQU47QUFBZ0Msc0JBQWpHOztZQUNBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVYsS0FBa0IsSUFBckI7Z0JBRUksSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLEVBQXNCLElBQXRCLEVBQTRCLE1BQU8sQ0FBQSxDQUFBLENBQW5DLEVBQXVDLElBQUMsQ0FBQSxLQUF4QztnQkFFQSxJQUFHLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQVQsS0FBYyxHQUFkLHNDQUErQixDQUFFLGNBQVgsS0FBbUIsR0FBNUM7b0JBQ0ksSUFBQyxDQUFBLFlBQUQsQ0FBYyxvQkFBZCxFQUFtQyxNQUFuQztBQUNBLDBCQUZKOztnQkFJQSxJQUFHLElBQUg7b0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixFQUEwQixJQUExQjtvQkFDQSxJQUFHLFNBQUEsSUFBQyxDQUFBLEtBQU0sVUFBRSxDQUFBLENBQUEsRUFBVCxLQUFlLE9BQWYsSUFBQSxJQUFBLEtBQXVCLE9BQXZCLElBQUEsSUFBQSxLQUErQixTQUEvQixJQUFBLElBQUEsS0FBeUMsTUFBekMsQ0FBQSxJQUFvRCxJQUFBLEtBQVEsSUFBL0Q7d0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxxQkFBQSxHQUFzQixJQUF0QixHQUEyQixPQUEzQixHQUFrQyxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUEzQyxHQUE2Qyw4QkFBbkQsRUFESjtxQkFBQSxNQUFBO3dCQUdJLElBQUMsQ0FBQSxZQUFELENBQWMscUJBQUEsR0FBc0IsSUFBdEIsR0FBMkIsR0FBekMsRUFBNEMsTUFBNUMsRUFISjs7QUFJQSwwQkFOSjs7Z0JBUUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxZQUFELENBQWMsdUJBQWQsRUFBc0MsTUFBdEM7Z0JBRUwsc0NBQVksQ0FBRSxjQUFYLEtBQW1CLEdBQW5CLHNDQUFvQyxDQUFFLGNBQVgsS0FBbUIsS0FBakQ7b0JBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxxQ0FBTDtvQkFDQyxFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBRSxDQUFDLEdBQUgsQ0FBQSxDQUFOLEVBQWdCLE1BQWhCLENBQVIsRUFGSjs7Z0JBSUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxxQkFBTjtBQUNBLHlCQXZCSjs7WUF5QkEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtZQUNKLElBQUEsR0FBTyxXQUFBLENBQVksQ0FBWjtBQUVQLG1CQUNRLDRDQUFTLENBQUUsY0FBWCxLQUFvQixJQUFwQixJQUFBLElBQUEsS0FBeUIsS0FBekIsSUFBQSxJQUFBLEtBQStCLE9BQS9CLENBQUEsSUFDQSxVQUFBLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLEVBQVQsS0FBbUIsT0FBbkIsSUFBQSxLQUFBLEtBQTJCLFNBQTNCLENBREEsSUFHQSxJQUFJLENBQUMsSUFBTCxLQUFhLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUovQjtnQkFNSSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQUEsR0FBUSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBbEIsR0FBd0IsTUFBOUIsRUFBb0MsQ0FBcEMsRUFBdUMsSUFBQyxDQUFBLEtBQXhDO0FBRUEsd0JBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWpCO0FBQUEseUJBQ1MsSUFEVDt3QkFDc0IsQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELENBQVcsQ0FBWCxFQUFjLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FBZCxFQUE4QixNQUE5QjtBQUFqQjtBQURULHlCQUVTLEtBRlQ7d0JBRXNCLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBRCxDQUFXLENBQVgsRUFBYyxNQUFNLENBQUMsS0FBUCxDQUFBLENBQWQsRUFBOEIsTUFBOUI7QUFBakI7QUFGVCx5QkFHUyxPQUhUO3dCQUdzQixDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYLEVBQWMsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFkLEVBQThCLE1BQTlCO0FBSDFCO1lBUko7WUFhQSxFQUFFLENBQUMsSUFBSCxDQUFRLENBQVI7WUFFQSxJQUNRLDZDQUFTLENBQUUsY0FBWCxLQUFvQixJQUFwQixJQUFBLEtBQUEsS0FBd0IsTUFBeEIsSUFBQSxLQUFBLEtBQThCLEtBQTlCLElBQUEsS0FBQSxLQUFtQyxPQUFuQyxDQUFBLElBQ0EsRUFBRSxDQUFDLE1BREgsSUFFQSxDQUFJLE9BRkosSUFHQSxJQUFJLENBQUMsSUFBTCxLQUFhLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUovQjtnQkFNSSxJQUFDLENBQUEsSUFBRCxDQUFNLGlDQUFOO0FBQTBDLHNCQU45Qzs7WUFRQSx3Q0FBWSxDQUFFLGNBQVgsS0FBbUIsR0FBdEI7Z0JBQ0ksYUFBRyxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxFQUFULEtBQW1CLE9BQW5CLElBQUEsS0FBQSxLQUEyQixNQUEzQixJQUFBLEtBQUEsS0FBa0MsR0FBckM7b0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxrQkFBTixFQUF5QixJQUFDLENBQUEsS0FBMUI7b0JBQ0EsS0FBQSxHQUFRLE1BQU0sQ0FBQyxLQUFQLENBQUEsRUFGWjtpQkFBQSxNQUFBO29CQUlJLElBQUMsQ0FBQSxJQUFELENBQU0scUJBQU4sRUFBNEIsSUFBQyxDQUFBLEtBQTdCO0FBQ0EsMEJBTEo7aUJBREo7O1lBUUEsSUFBRyxTQUFBLEtBQWEsTUFBTSxDQUFDLE1BQXZCO2dCQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sd0JBQU4sRUFBK0IsTUFBL0I7QUFDQSxzQkFGSjs7UUE1SEo7UUFnSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWlCLElBQWpCO2VBRUE7SUExSUU7O29CQTBKTixHQUFBLEdBQUssU0FBQyxNQUFEO0FBRUQsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsS0FBUCxDQUFBO1FBQWMsSUFFRyxJQUFDLENBQUEsS0FGSjtZQUFBLE9BQUEsQ0FFcEIsR0FGb0IsQ0FFaEIsRUFBQSxDQUFHLEVBQUEsZUFBRyxHQUFHLENBQUUsYUFBUixDQUFILENBRmdCLEVBQUE7O0FBSXBCLGdCQUFPLEdBQUcsQ0FBQyxJQUFYO0FBQUEsaUJBRVMsT0FGVDtBQUV5Qix1QkFBSyxPQUFBLENBQUUsS0FBRixDQUFRLGdEQUFSO0FBRjlCLGlCQUdTLElBSFQ7QUFHeUIsdUJBQUssT0FBQSxDQUFFLEtBQUYsQ0FBUSw2Q0FBUjtBQUg5QixpQkFJUyxHQUpUO0FBSXlCLHVCQUFLLE9BQUEsQ0FBRSxLQUFGLENBQVEsNENBQVI7QUFKOUIsaUJBTVMsU0FOVDtnQkFRUSw0Q0FBWSxDQUFFLGFBQVgsRUFBQSxhQUF1QixHQUF2QixFQUFBLElBQUEsS0FBSDtBQUNJLDRCQUFPLEdBQUcsQ0FBQyxJQUFYO0FBQUEsNkJBQ1MsUUFEVDtBQUN5QixtQ0FBTyxJQUFDLEVBQUEsTUFBQSxFQUFELENBQVEsR0FBUixFQUFhLE1BQWI7QUFEaEMsNkJBRVMsUUFGVDtBQUV5QixtQ0FBTyxJQUFDLEVBQUEsTUFBQSxFQUFELENBQVEsR0FBUixFQUFhLE1BQWI7QUFGaEMsNkJBR1MsT0FIVDtBQUd5QixtQ0FBTyxJQUFDLEVBQUEsS0FBQSxFQUFELENBQVEsR0FBUixFQUFhLE1BQWI7QUFIaEMsNkJBSVMsT0FKVDtBQUl5QixtQ0FBTyxJQUFDLEVBQUEsS0FBQSxFQUFELENBQVEsR0FBUixFQUFhLE1BQWI7QUFKaEMsNkJBS1MsTUFMVDtBQUt5QixtQ0FBTyxJQUFDLENBQUEsSUFBRCxDQUFRLEdBQVIsRUFBYSxNQUFiO0FBTGhDLDZCQU1TLEtBTlQ7QUFNeUIsbUNBQU8sSUFBQyxFQUFBLEdBQUEsRUFBRCxDQUFRLEdBQVIsRUFBYSxNQUFiO0FBTmhDLDZCQU9TLEtBUFQ7QUFPeUIsbUNBQU8sSUFBQyxFQUFBLEdBQUEsRUFBRCxDQUFRLEdBQVIsRUFBYSxNQUFiO0FBUGhDLDZCQVFTLElBUlQ7NEJBU1EsWUFBRyxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxFQUFULEtBQW1CLE9BQW5CLElBQUEsSUFBQSxLQUEyQixTQUE5QjtnQ0FDSSxJQUFxQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTVCO29DQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFXLElBQUMsQ0FBQSxLQUFaLEVBQUE7O0FBQ0EsdUNBQU8sSUFBQyxFQUFBLEVBQUEsRUFBRCxDQUFJLEdBQUosRUFBUyxNQUFULEVBRlg7O0FBVFIscUJBREo7O0FBRkM7QUFOVDtBQXNCUSx3QkFBTyxHQUFHLENBQUMsSUFBWDtBQUFBLHlCQUNTLElBRFQ7QUFBQSx5QkFDYyxJQURkO0FBQ3lCLCtCQUFPLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUIsTUFBakI7QUFEaEM7QUF0QlI7UUEyQkEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxLQUFYLHFDQUE0QixHQUFHLENBQUMsSUFBaEM7UUFFQSxDQUFBLEdBQUk7QUFDSixlQUFNLE1BQU0sQ0FBQyxNQUFiO1lBRUksU0FBQSxHQUFZLE1BQU0sQ0FBQztZQUVuQixDQUFBLEdBQUksSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMLEVBQVEsTUFBUjtZQUVKLElBQXFCLElBQUMsQ0FBQSxPQUF0QjtnQkFBQSxLQUFLLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBZ0IsQ0FBaEIsRUFBQTs7WUFFQSxDQUFBLEdBQUksSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMLEVBQVEsTUFBUjtZQUVKLElBQXFCLElBQUMsQ0FBQSxPQUF0QjtnQkFBQSxLQUFLLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBZ0IsQ0FBaEIsRUFBQTs7WUFFQSw0Q0FBWSxDQUFFLGFBQVgsRUFBQSxhQUFtQixHQUFuQixFQUFBLElBQUEsTUFBSDtnQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLGdCQUFOO0FBQ0Esc0JBRko7O1lBSUEsSUFBRyxTQUFBLEtBQWEsTUFBTSxDQUFDLE1BQXZCO2dCQUVJLDRDQUFZLENBQUUsYUFBWCxFQUFBLGFBQW1CLEdBQW5CLEVBQUEsSUFBQSxNQUFIO29CQUNJLElBQUMsQ0FBQSxJQUFELENBQU0saUJBQU47b0JBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBQSxFQUZKOztnQkFJQSxJQUFDLENBQUEsSUFBRCxDQUFNLCtCQUFOO0FBQ0Esc0JBUEo7O1FBaEJKO1FBeUJBLElBQTZELElBQUMsQ0FBQSxPQUE5RDtZQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBQSxHQUFNLENBQUksS0FBQSxDQUFNLElBQUMsQ0FBQSxLQUFQLENBQUgsR0FBc0IsTUFBdEIsR0FBa0MsRUFBbkMsQ0FBaEIsRUFBd0QsQ0FBeEQsRUFBQTs7UUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYscUNBQTJCLEdBQUcsQ0FBQyxJQUEvQjtlQUNBO0lBbEVDOztvQkFvRkwsR0FBQSxHQUFLLFNBQUMsQ0FBRCxFQUFJLE1BQUo7QUFFRCxZQUFBO1FBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxLQUFYLEVBQWlCLEtBQWpCO0FBRUEsZUFBTSxHQUFBLEdBQU0sTUFBTyxDQUFBLENBQUEsQ0FBbkI7WUFFSSxTQUFBLEdBQVksTUFBTSxDQUFDO1lBRW5CLElBQUcsQ0FBSSxDQUFQO0FBQWMsdUJBQUssT0FBQSxDQUFFLEtBQUYsQ0FBUSxPQUFSLEVBQWdCLEdBQWhCLEVBQW5COztZQUVBLFFBQUEsR0FBVyxDQUFDLEdBQUEsR0FBTSxXQUFBLENBQVksQ0FBWixDQUFQLENBQXNCLENBQUMsR0FBdkIsS0FBOEIsR0FBRyxDQUFDLEdBQWxDLElBQTBDLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBRyxDQUFDO1lBQ3JFLE1BQUEsR0FBUyxDQUFJO1lBRWIsSUFBRyxRQUFBLEdBQUcsQ0FBQyxJQUFKLEVBQUEsYUFBWSxJQUFaLEVBQUEsSUFBQSxNQUFBLENBQUEsSUFBcUIsU0FBQSxDQUFDLENBQUMsS0FBRixLQUFXLFFBQVgsSUFBQSxJQUFBLEtBQW9CLFFBQXBCLElBQUEsSUFBQSxLQUE2QixRQUE3QixJQUFBLElBQUEsS0FBc0MsS0FBdEMsSUFBQSxJQUFBLEtBQTRDLE9BQTVDLENBQXhCO0FBQ0ksc0JBREo7O1lBR0EsSUFBRyxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUFULEtBQWMsTUFBZCxJQUF5QixHQUFHLENBQUMsSUFBSixLQUFZLElBQXhDO2dCQUFrRCxJQUFDLENBQUEsSUFBRCxDQUFNLG9CQUFOO0FBQTRCLHNCQUE5RTthQUFBLE1BRUssSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLEdBQVosSUFBb0IsU0FBQSxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxFQUFULEtBQWUsT0FBZixDQUF2QjtnQkFFRCxJQUFtRCxJQUFDLENBQUEsS0FBcEQ7b0JBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxxQkFBYixFQUFtQyxNQUFPLGFBQTFDLEVBQUE7O2dCQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFBVyxNQUFYO0FBQ0osc0JBSkM7YUFBQSxNQU1BLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxHQUFaLElBQW9CLENBQUMsUUFBQSxJQUFZLGFBQVcsSUFBQyxDQUFBLEtBQVosRUFBQSxHQUFBLEtBQWIsQ0FBdkI7Z0JBQ0QsSUFBRyxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUFULEtBQWMsR0FBakI7b0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxxQ0FBTixFQUE0QyxDQUE1QztvQkFDQSxJQUE2RCxJQUFDLENBQUEsT0FBOUQ7d0JBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxxQ0FBYixFQUFtRCxNQUFuRCxFQUFBOztvQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQUhSO2lCQUFBLE1BQUE7b0JBS0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxpQ0FBTixFQUF3QyxDQUF4QztvQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQU5SO2lCQURDO2FBQUEsTUFRQSxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBWixJQUFxQixJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUFULEtBQWMsS0FBdEM7Z0JBQ0QsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWUsQ0FBZixFQUFrQixNQUFsQjtnQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQUZIO2FBQUEsTUFHQSxJQUFHLGNBQUg7Z0JBQ0QsSUFBUSxDQUFDLENBQUMsSUFBRixLQUFVLEdBQWxCO29CQUE2QixDQUFBLEdBQUksSUFBQyxDQUFBLEtBQUQsQ0FBaUIsQ0FBakIsRUFBb0IsTUFBcEIsRUFBakM7aUJBQUEsTUFDSyxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsR0FBYjtvQkFBd0IsQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELENBQWlCLENBQWpCLEVBQW9CLE1BQXBCLEVBQTVCO2lCQUFBLE1BQ0EsSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLEdBQWI7b0JBQXdCLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBRCxDQUFpQixDQUFqQixFQUFvQixNQUFwQixFQUE1QjtpQkFBQSxNQUNBLElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxLQUFiO29CQUF3QixDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYLEVBQWlCLENBQWpCLEVBQW9CLE1BQXBCLEVBQTVCO2lCQUFBLE1BQ0EsSUFBRyxTQUFBLENBQUMsQ0FBQyxLQUFGLEtBQVcsSUFBWCxJQUFBLElBQUEsS0FBZSxJQUFmLENBQUEsSUFBeUIsUUFBNUI7b0JBQ0QsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOO29CQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsQ0FBakIsRUFBb0IsTUFBcEIsRUFGSDtpQkFBQSxNQUdBLElBQUcsU0FBQSxDQUFDLENBQUMsS0FBRixLQUFXLEdBQVgsSUFBQSxJQUFBLEtBQWMsR0FBZCxDQUFBLElBQXVCLFFBQTFCO29CQUNELElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxLQUFmO3dCQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sWUFBTjt3QkFDQSxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsR0FBYjs0QkFDSSxHQUFHLENBQUMsSUFBSixHQUFXLEdBQUEsR0FBTSxHQUFHLENBQUM7NEJBQ3JCLEdBQUcsQ0FBQyxHQUFKLElBQVcsRUFGZjs7d0JBR0EsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxLQUFQLENBQUEsRUFMUjtxQkFBQSxNQUFBO3dCQU9JLElBQUMsQ0FBQSxJQUFELENBQU0sa0JBQU47d0JBQ0EsQ0FBQSxHQUFJLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQixDQUFqQixFQUFvQixNQUFwQixFQVJSO3FCQURDO2lCQUFBLE1BVUEsSUFBRyxTQUFBLEdBQUcsQ0FBQyxLQUFKLEtBQWEsSUFBYixJQUFBLElBQUEsS0FBaUIsSUFBakIsQ0FBQSxJQUEyQixRQUE5QjtvQkFDRCxZQUFHLENBQUMsQ0FBQyxLQUFGLEtBQWUsS0FBbEI7QUFDSSwrQkFBSyxPQUFBLENBQUUsS0FBRixDQUFRLHFCQUFSLEVBRFQ7O29CQUVBLENBQUEsR0FBSSxJQUFDLENBQUEsU0FBRCxDQUFXLENBQVgsRUFBYyxNQUFNLENBQUMsS0FBUCxDQUFBLENBQWQsRUFISDtpQkFBQSxNQUFBO29CQUtELElBQXNFLElBQUMsQ0FBQSxPQUF2RTt3QkFBQSxLQUFLLENBQUMsTUFBTixDQUFhLGlDQUFBLEdBQWtDLElBQUMsQ0FBQSxLQUFuQyxHQUF5QyxPQUF0RCxFQUE2RCxDQUFDLEdBQUQsQ0FBN0QsRUFBQTs7QUFDQSwwQkFOQztpQkFsQko7YUFBQSxNQUFBO2dCQTRCRCxJQUFHLFNBQUEsR0FBRyxDQUFDLEtBQUosS0FBYSxJQUFiLElBQUEsSUFBQSxLQUFpQixJQUFqQixDQUFBLElBQThCLFFBQWpDO29CQUFzRCxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYLEVBQWMsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFkO0FBQThCLDBCQUF4RjtpQkFBQSxNQUNLLElBQUcsSUFBQyxDQUFBLEtBQU0sVUFBRSxDQUFBLENBQUEsQ0FBVCxLQUFjLE1BQWQsSUFBeUIsR0FBRyxDQUFDLElBQUosS0FBWSxHQUF4QztvQkFBaUQsSUFBQyxDQUFBLElBQUQsQ0FBTSxvQkFBTjtBQUFrQywwQkFBbkY7aUJBQUEsTUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQVQsS0FBYyxHQUFkLElBQXlCLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBeEM7b0JBQWlELElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTjtBQUFrQywwQkFBbkY7aUJBQUEsTUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQVQsS0FBYyxHQUFkLElBQXlCLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBeEM7b0JBQWlELElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTjtBQUFrQywwQkFBbkY7aUJBQUEsTUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQVQsS0FBYyxHQUFkLElBQXlCLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBeEM7b0JBQWlELElBQUMsQ0FBQSxJQUFELENBQU0saUJBQU4sRUFBd0IsR0FBeEI7QUFBa0MsMEJBQW5GO2lCQUFBLE1BQUE7b0JBRUQsSUFBRyxJQUFDLENBQUEsT0FBSjt3QkFDSSxLQUFLLENBQUMsR0FBTixDQUFVLDJCQUFBLEdBQTRCLElBQUMsQ0FBQSxLQUE3QixHQUFtQyxLQUE3QyxFQUFrRCxDQUFsRDt3QkFDQSxLQUFLLENBQUMsTUFBTixDQUFhLHlCQUFiLEVBQXVDLEdBQXZDLEVBRko7O0FBR0EsMEJBTEM7aUJBaENKOztZQXVDTCxJQUFHLFNBQUEsS0FBYSxNQUFNLENBQUMsTUFBdkI7Z0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSwrQkFBTjtBQUNBLHNCQUZKOztRQXRFSjtRQW9GQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsRUFBZ0IsS0FBaEI7ZUFDQTtJQXpGQzs7b0JBd0dMLEdBQUEsR0FBSyxTQUFDLENBQUQsRUFBSSxNQUFKO0FBRUQsWUFBQTtRQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsS0FBWCxFQUFpQixLQUFqQjtBQUVBLGVBQU0sR0FBQSxHQUFNLE1BQU8sQ0FBQSxDQUFBLENBQW5CO1lBRUksU0FBQSxHQUFZLE1BQU0sQ0FBQztZQUVuQixJQUFHLENBQUksQ0FBUDtBQUFjLHVCQUFLLE9BQUEsQ0FBRSxLQUFGLENBQVEsT0FBUixFQUFnQixHQUFoQixFQUFuQjs7WUFFQSxJQUFBLEdBQVEsV0FBQSxDQUFhLENBQWI7WUFDUixLQUFBLEdBQVEsWUFBQSxDQUFhLENBQWI7WUFDUixRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQUwsS0FBWSxHQUFHLENBQUMsR0FBaEIsSUFBd0IsSUFBSSxDQUFDLElBQUwsS0FBYSxHQUFHLENBQUM7WUFDcEQsTUFBQSxHQUFTLENBQUk7WUFFYixDQUFBO0FBQUksd0JBQU8sSUFBQyxDQUFBLEtBQU0sVUFBRSxDQUFBLENBQUEsQ0FBaEI7QUFBQSx5QkFDSyxHQURMOytCQUNjLEdBQUcsQ0FBQyxJQUFKLEtBQVk7QUFEMUIseUJBRUssR0FGTDsrQkFFYyxHQUFHLENBQUMsSUFBSixLQUFZO0FBRjFCOztZQUlKLElBQVMsQ0FBVDtBQUFBLHNCQUFBOztZQUVBLElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxHQUFiO2dCQUNJLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxPQUFaLElBQXdCLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQVQsS0FBYyxJQUF0QyxJQUE4QyxHQUFHLENBQUMsSUFBSixLQUFZLE1BQTFELElBQW9FLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBbkY7QUFDSSwwQkFESjtpQkFBQSxNQUFBO29CQUdJLENBQUEsR0FBSSxJQUFDLEVBQUEsSUFBQSxFQUFELENBQU0sQ0FBTixFQUFTLE1BQVQ7QUFDSiwwQkFKSjtpQkFESjs7WUFPQSxJQUFRLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBcEI7Z0JBQWdDLENBQUEsR0FBSSxJQUFDLENBQUEsSUFBRCxDQUFRLENBQVIsRUFBVyxNQUFYLEVBQXBDO2FBQUEsTUFDSyxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksTUFBWixJQUF1QixDQUFJLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQUMsQ0FBQyxVQUFYLENBQXNCLElBQXRCLENBQTlCO2dCQUErRCxDQUFBLEdBQUksSUFBQyxDQUFBLEtBQUQsQ0FBUSxDQUFSLEVBQVcsTUFBWCxFQUFuRTthQUFBLE1BQ0EsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLE1BQWY7Z0JBQTJCLENBQUEsR0FBSSxJQUFDLENBQUEsSUFBRCxDQUFRLENBQVIsRUFBVyxNQUFYLEVBQS9CO2FBQUEsTUFDQSxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBZjtnQkFFRCxJQUFHLFFBQUg7b0JBRUksQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUixFQUFXLE1BQVgsRUFGUjtpQkFBQSxNQUFBO29CQU1JLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxDQUFRLENBQVIsRUFBVyxNQUFYLEVBTlI7aUJBRkM7YUFBQSxNQVVBLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxHQUFaLElBQW9CLENBQUMsQ0FBQyxNQUF6QjtnQkFFRCxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFDLENBQUMsTUFBYixFQUFxQixNQUFyQixFQUZIO2FBQUEsTUFJQSxJQUNHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBWixJQUNBLFNBQUEsR0FBRyxDQUFDLEtBQUosS0FBaUIsSUFBakIsSUFBQSxJQUFBLEtBQXNCLElBQXRCLElBQUEsSUFBQSxLQUEyQixHQUEzQixJQUFBLElBQUEsS0FBK0IsR0FBL0IsSUFBQSxJQUFBLEtBQW1DLEtBQW5DLENBREEsSUFFQSxTQUFBLENBQUMsQ0FBQyxLQUFGLEtBQWUsR0FBZixJQUFBLElBQUEsS0FBbUIsR0FBbkIsQ0FGQSxJQUdBLGFBQWMsSUFBQyxDQUFBLEtBQWYsRUFBQSxNQUFBLEtBSkg7Z0JBTUQsbURBQWEsQ0FBRSxVQUFaLENBQXVCLElBQUEsSUFBUyxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUFULEtBQWMsS0FBOUMsVUFBSDtvQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOLEVBQThCLENBQTlCLEVBQWlDLEdBQWpDO0FBQ0EsMEJBRko7aUJBQUEsTUFHSyxJQUFHLElBQUMsQ0FBQSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQVQsS0FBYyxLQUFqQjtvQkFDRCxJQUFDLENBQUEsSUFBRCxDQUFNLGlCQUFOLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCO0FBQ0EsMEJBRkM7aUJBQUEsTUFBQTtvQkFJRCxJQUFDLENBQUEsSUFBRCxDQUFNLGtCQUFOLEVBQXlCLENBQXpCLEVBQTRCLEdBQTVCO29CQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsU0FBRCxDQUFXLENBQVgsRUFBYyxNQUFNLENBQUMsS0FBUCxDQUFBLENBQWQsRUFBOEIsTUFBOUIsRUFMSDtpQkFUSjthQUFBLE1BZ0JBLElBQ0csU0FBQSxHQUFHLENBQUMsS0FBSixLQUFhLEdBQWIsSUFBQSxJQUFBLEtBQWlCLEdBQWpCLENBQUEsSUFDQSxTQUFBLENBQUMsQ0FBQyxLQUFGLEtBQWUsR0FBZixJQUFBLElBQUEsS0FBbUIsR0FBbkIsQ0FEQSxJQUVBLE1BRkEsc0NBRW9CLENBQUUsYUFBWCxHQUFpQixHQUFHLENBQUMsR0FBSixHQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFIaEQ7Z0JBS0QsSUFBQyxDQUFBLElBQUQsQ0FBTSxvQkFBTixFQUEyQixDQUEzQixFQUE4QixHQUE5QjtnQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYLEVBQWMsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFkLEVBQThCLE1BQTlCLEVBTkg7YUFBQSxNQVFBLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxNQUFaLElBQXVCLENBQUMsQ0FBQyxNQUE1QjtnQkFDRCxJQUFDLENBQUEsSUFBRCxDQUFNLHNCQUFOLEVBQTZCLENBQTdCO2dCQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sRUFBUyxNQUFNLENBQUMsS0FBUCxDQUFBLENBQVQsRUFBeUIsTUFBekIsRUFGSDthQUFBLE1BSUEsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLEdBQVosSUFBb0IsUUFBdkI7Z0JBQ0QsSUFBQyxDQUFBLElBQUQsQ0FBTSxvQkFBTjtnQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLEVBQVMsTUFBVCxFQUZIO2FBQUEsTUFJQSxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksR0FBWixJQUFvQixRQUFwQixzQ0FBMEMsQ0FBRSxjQUFYLEtBQW1CLEdBQXZEO2dCQUNELElBQUMsQ0FBQSxJQUFELENBQU0scUJBQU4sRUFBNEIsQ0FBNUI7Z0JBQ0EsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBUCxFQUFVLE1BQVYsRUFGSDthQUFBLE1BSUEsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLEtBQVosc0NBQStCLENBQUUsY0FBWCxLQUFtQixJQUE1QztnQkFFRCxDQUFBLEdBQUk7b0JBQUEsU0FBQSxFQUNBO3dCQUFBLFFBQUEsRUFBUyxNQUFNLENBQUMsS0FBUCxDQUFBLENBQVQ7d0JBQ0EsR0FBQSxFQUFJLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUixFQUFXLE1BQVgsQ0FESjtxQkFEQTtrQkFGSDthQUFBLE1BTUEsSUFDRyxNQUFBLElBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSixLQUFZLElBQUksQ0FBQyxJQUFqQixJQUF5QixDQUFDLEdBQUcsQ0FBQyxHQUFKLEdBQVUsS0FBSyxDQUFDLEdBQWhCLElBQXdCLFNBQUEsSUFBQyxDQUFBLEtBQU0sVUFBRSxDQUFBLENBQUEsRUFBVCxLQUFtQixJQUFuQixDQUF6QixDQUExQixDQUFYLElBQ0EsVUFBQSxHQUFHLENBQUMsS0FBSixLQUFpQixJQUFqQixJQUFBLEtBQUEsS0FBc0IsTUFBdEIsSUFBQSxLQUFBLEtBQTZCLE1BQTdCLElBQUEsS0FBQSxLQUFvQyxPQUFwQyxJQUFBLEtBQUEsS0FBNEMsVUFBNUMsSUFBQSxLQUFBLEtBQXVELElBQXZELElBQUEsS0FBQSxLQUE0RCxJQUE1RCxJQUFBLEtBQUEsS0FBaUUsS0FBakUsSUFBQSxLQUFBLEtBQXVFLE9BQXZFLENBREEsSUFFQSxVQUFBLEdBQUcsQ0FBQyxLQUFKLEtBQWlCLElBQWpCLENBRkEsSUFHQSxVQUFDLENBQUMsQ0FBQyxLQUFGLEtBQWUsS0FBZixJQUFBLEtBQUEsS0FBcUIsUUFBckIsSUFBQSxLQUFBLEtBQThCLFFBQTlCLElBQUEsS0FBQSxLQUF1QyxRQUF2QyxJQUFBLEtBQUEsS0FBZ0QsT0FBaEQsSUFBQSxLQUFBLEtBQXdELE9BQXhELElBQUEsS0FBQSxLQUFnRSxTQUFoRSxJQUFBLEtBQUEsS0FBMEUsSUFBM0UsQ0FIQSxJQUlBLFVBQUMsQ0FBQyxDQUFDLEtBQUYsS0FBZSxNQUFmLElBQUEsS0FBQSxLQUFzQixXQUF0QixJQUFBLEtBQUEsS0FBa0MsVUFBbEMsSUFBQSxLQUFBLEtBQTZDLEtBQTdDLElBQUEsS0FBQSxLQUFtRCxNQUFuRCxJQUFBLEtBQUEsS0FBMEQsT0FBMUQsSUFBQSxLQUFBLEtBQWtFLEtBQWxFLElBQUEsS0FBQSxLQUF3RSxJQUF4RSxJQUFBLEtBQUEsS0FBNkUsSUFBN0UsSUFBQSxLQUFBLEtBQWtGLE1BQWxGLElBQUEsS0FBQSxLQUF5RixNQUF6RixJQUFBLEtBQUEsS0FBZ0csS0FBaEcsSUFBQSxLQUFBLEtBQXNHLE9BQXZHLENBSkEsSUFLQSxDQUFJLENBQUMsQ0FBQyxLQUxOLElBTUEsQ0FBSSxDQUFDLENBQUMsTUFOTixJQU9BLENBQUksQ0FBQyxDQUFDLE1BUE4sSUFRQSxDQUFJLENBQUMsQ0FBQyxTQVJOLElBU0EsQ0FBSSxDQUFDLENBQUMsTUFUTixJQVVBLENBQUksQ0FBQyxDQUFDLE1BVk4sSUFXQSwyRUFBYyxDQUFFLHVCQUFoQixLQUE2QixRQUE3QixJQUFBLEtBQUEsS0FBcUMsS0FBckMsSUFBQSxLQUFBLEtBQTBDLFFBQTFDLENBWEEsSUFZQSxhQUFjLElBQUMsQ0FBQSxLQUFmLEVBQUEsTUFBQSxLQWJIO2dCQWVELElBQUMsQ0FBQSxJQUFELENBQU0sZ0NBQU4sRUFBdUMsQ0FBdkMsRUFBMEMsSUFBQyxDQUFBLEtBQU0sVUFBRSxDQUFBLENBQUEsQ0FBbkQ7Z0JBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxrQ0FBTixFQUF5QyxHQUF6QztnQkFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGtCQUFOLEVBQXlCLEtBQXpCO2dCQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsSUFBRCxDQUFNLENBQU4sRUFBUyxNQUFUO0FBQ0osc0JBbkJDO2FBQUEsTUFxQkEsSUFBRyxVQUFBLEdBQUcsQ0FBQyxLQUFKLEtBQWEsR0FBYixJQUFBLEtBQUEsS0FBaUIsR0FBakIsQ0FBQSxJQUEwQixVQUFBLENBQUMsQ0FBQyxLQUFGLEtBQWUsR0FBZixJQUFBLEtBQUEsS0FBbUIsR0FBbkIsQ0FBN0I7Z0JBQ0QsSUFBRyxNQUFBLHdDQUFvQixDQUFFLGFBQVgsS0FBa0IsR0FBRyxDQUFDLEdBQUosR0FBUSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQWpEO29CQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sa0NBQU4sRUFBeUMsQ0FBekMsRUFBNEMsR0FBNUMsRUFBaUQsSUFBQyxDQUFBLEtBQWxEO0FBQ0EsMEJBRko7O2dCQUdBLElBQUMsQ0FBQSxJQUFELENBQU0scUJBQU4sRUFBNEIsQ0FBNUIsRUFBK0IsR0FBL0I7Z0JBQ0EsQ0FBQSxHQUFJLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWCxFQUFjLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FBZCxFQUE4QixNQUE5QixFQUxIO2FBQUEsTUFBQTtnQkFRRCxJQUFzRSxJQUFDLENBQUEsT0FBdkU7b0JBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxpQ0FBQSxHQUFrQyxJQUFDLENBQUEsS0FBbkMsR0FBeUMsT0FBdEQsRUFBNkQsQ0FBQyxHQUFELENBQTdELEVBQUE7O0FBQ0Esc0JBVEM7O1lBV0wsSUFBRyxTQUFBLEtBQWEsTUFBTSxDQUFDLE1BQXZCO2dCQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8sd0JBQVA7QUFDQyxzQkFGSjs7UUFuSEo7UUF1SEEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWLEVBQWdCLEtBQWhCO2VBQ0E7SUE1SEM7O29CQXNJTCxVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE1BQWI7QUFFUixZQUFBO1FBQUEsc0NBQVksQ0FBRSxjQUFYLEtBQW1CLElBQXRCO0FBQ0ksbUJBQU8sTUFBTSxDQUFDLEtBQVAsQ0FBQSxFQURYOztRQUdBLHNDQUFZLENBQUUsY0FBWCxLQUFtQixJQUFuQixzQ0FBcUMsQ0FBRSxjQUFYLEtBQW1CLElBQWxEO1lBQ0ksSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQW9CLE1BQXBCO0FBQ0EsbUJBQU8sTUFBTSxDQUFDLEtBQVAsQ0FBQSxFQUZYOztRQUlBLE9BQUEsQ0FBQSxLQUFBLENBQU0scUJBQUEsR0FBc0IsSUFBdEIsR0FBMkIsc0JBQTNCLEdBQWlELElBQWpELEdBQXNELEdBQTVEO2VBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSw0QkFBQSxHQUE2QixJQUE3QixHQUFrQyxHQUEvQyxFQUFrRCxNQUFsRDtJQVZROztvQkFzQlosWUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLE1BQVA7UUFFVixJQUFHLElBQUMsQ0FBQSxLQUFKO1lBQVEsT0FBQSxDQUFPLEdBQVAsQ0FBVyxFQUFBLENBQUcsRUFBQSxDQUFHLEtBQUEsR0FBSyxDQUFDLEVBQUEsQ0FBRyxJQUFILENBQUQsQ0FBUixDQUFILENBQVgsRUFBUjs7ZUFDQSxNQUFNLENBQUMsS0FBUCxDQUFBO0lBSFU7O29CQUtkLGVBQUEsR0FBaUIsU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLEdBQWYsRUFBb0IsSUFBcEI7QUFFYixZQUFBO1FBQUEsc0NBQVksQ0FBRSxjQUFYLEtBQW1CLElBQW5CLElBQTRCLElBQS9CO1lBQ0csc0NBQVksQ0FBRSxhQUFYLEtBQWtCLEdBQUcsQ0FBQyxHQUF6Qjt1QkFDSSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsRUFBb0IsTUFBcEIsRUFESjthQURIOztJQUZhOztvQkFjakIsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUVULFlBQUE7UUFBQSxvQkFBRyxLQUFLLENBQUUsZUFBVjtBQUNJLGlCQUFBLHVDQUFBOztnQkFDSSxJQUFHLElBQUEsK0RBQW9CLENBQUUsc0JBQXpCO29CQUNJLElBQUcsNERBQUg7d0JBQ0ksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQWxCLEdBQXlCOzRCQUFBLElBQUEsRUFBSyxNQUFMOzRCQUFZLElBQUEsRUFBSyxJQUFqQjswQkFEN0I7cUJBQUEsTUFBQTt3QkFHRyxPQUFBLENBQUMsR0FBRCxDQUFLLHlCQUFMLEVBQStCLElBQS9CLEVBQXFDLENBQXJDLEVBSEg7cUJBREo7O0FBREosYUFESjs7ZUFPQTtJQVRTOztvQkFvQmIsSUFBQSxHQUFNLFNBQUMsRUFBRCxFQUFLLE1BQUw7QUFFRixZQUFBO1FBQUEsc0NBQVksQ0FBRSxjQUFYLEtBQW1CLE1BQXRCO1lBRUksTUFBTSxDQUFDLEtBQVAsQ0FBQTtZQUNBLDZDQUFZLENBQUUsY0FBWCxLQUFvQixPQUFwQixJQUFBLElBQUEsS0FBNEIsSUFBL0I7Z0JBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBTSxhQUFOO2dCQUNBLEdBQUEsR0FBTSxHQUZWO2FBQUEsTUFBQTtnQkFJSSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU47Z0JBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBTixFQUFVLE1BQVYsRUFBa0IsSUFBbEI7Z0JBQ04sSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMLEVBTko7YUFISjtTQUFBLE1BV0ssc0NBQVksQ0FBRSxjQUFYLEtBQW1CLE9BQXRCO1lBRUQsS0FBQSxHQUFRLE1BQU0sQ0FBQyxLQUFQLENBQUE7WUFDUixJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU47WUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOLEVBQVUsS0FBSyxDQUFDLE1BQWhCO1lBQ04sSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMO1lBRUEsSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWhCO2dCQUNJLElBQXFELElBQUMsQ0FBQSxLQUF0RDtvQkFBQSxLQUFLLENBQUMsTUFBTixDQUFhLDZCQUFiLEVBQTJDLE1BQTNDLEVBQUE7O0FBQ0EsdUJBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFuQjtvQkFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFBZ0IsS0FBSyxDQUFDLE1BQU8sVUFBRSxDQUFBLENBQUEsQ0FBL0I7b0JBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQWIsQ0FBQSxDQUFmO2dCQUZKO2dCQUlBLEtBQUssQ0FBQyxNQUFOLENBQWEsNkNBQWIsRUFBMkQsTUFBM0QsRUFOSjthQVBDO1NBQUEsTUFBQTtZQWdCRCxJQUFDLENBQUEsSUFBRCxDQUFNLDZCQUFBLEdBQThCLEVBQTlCLEdBQWlDLEdBQXZDLEVBaEJDOztlQW1CTDtJQWhDRTs7b0JBaUROLEtBQUEsR0FBTyxTQUFDLEVBQUQsRUFBSyxNQUFMO0FBSUgsWUFBQTtRQUFBLHNDQUFZLENBQUUsY0FBWCxLQUFtQixPQUF0QjtZQUNJLFVBQUEsR0FBYTtZQUNiLEtBQUEsR0FBUSxNQUFNLENBQUMsS0FBUCxDQUFBO1lBQ1IsTUFBQSxHQUFTLEtBQUssQ0FBQztZQUNmLEVBQUEsR0FBSyxLQUpUO1NBQUEsTUFBQTtZQU1JLEVBQUEsR0FBSyxLQU5UOztRQVFBLElBQUMsQ0FBQSxJQUFELENBQU0sR0FBQSxHQUFJLEVBQVY7UUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOLEVBQVUsTUFBVixFQUFrQixFQUFsQjtRQUNQLElBQUMsQ0FBQSxHQUFELENBQUssR0FBQSxHQUFJLEVBQVQ7UUFFQSxJQUFHLEtBQUEsSUFBVSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQTFCO1lBQ0ksSUFBK0MsSUFBQyxDQUFBLEtBQWhEO2dCQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsdUJBQWIsRUFBcUMsTUFBckMsRUFBQTs7QUFDQSxtQkFBTSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQW5CO2dCQUNJLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFnQixLQUFLLENBQUMsTUFBTyxVQUFFLENBQUEsQ0FBQSxDQUEvQjtnQkFDQSxVQUFVLENBQUMsT0FBWCxDQUFtQixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQWIsQ0FBQSxDQUFuQjtZQUZKO1lBSUEsSUFBMEUsSUFBQyxDQUFBLEtBQTNFO2dCQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsOENBQWIsRUFBNEQsVUFBNUQsRUFBQTthQU5KOztlQVFBO0lBeEJHOztvQkFnQ1AsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUVQLFlBQUE7UUFBQSxLQUFBLEdBQVEsQ0FBQyxFQUFEO1FBRVIsSUFBRyxNQUFPLFVBQUUsQ0FBQSxDQUFBLENBQUMsQ0FBQyxJQUFYLEtBQW1CLE9BQW5CLElBQStCLE1BQU8sVUFBRSxDQUFBLENBQUEsQ0FBQyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFyQixLQUE2QixNQUEvRDtZQUNJLFNBQUEsR0FBWSxNQUFNLENBQUMsR0FBUCxDQUFBO1lBQ1osVUFBQSxHQUFhLFNBQVMsQ0FBQztZQUN2QixVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBZCxHQUFxQixPQUh6Qjs7UUFJQSxzQ0FBWSxDQUFFLGNBQVgsS0FBbUIsTUFBdEI7WUFDSSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVixHQUFpQjtBQUNqQixtQkFBTyxDQUFDLE1BQUQsRUFGWDs7QUFJQSxlQUFNLEtBQUEsQ0FBTSxNQUFOLENBQU47WUFDSSxDQUFBLEdBQUksTUFBTSxDQUFDLEtBQVAsQ0FBQTtZQUNKLElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxJQUFiO2dCQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWDtnQkFDQSxJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFWLEtBQWtCLE1BQXJCO29CQUNJLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFWLEdBQWlCLE9BRHJCO2lCQUZKO2FBQUEsTUFBQTtnQkFLSSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQUMsQ0FBQyxJQUFWLENBQWUsQ0FBZixFQUxKOztRQUZKO1FBU0EsSUFBeUIsVUFBekI7WUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLFVBQVgsRUFBQTs7ZUFFQTtJQXZCTzs7b0JBK0JYLFNBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxJQUFQO1FBRVAsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVk7WUFBQSxJQUFBLEVBQUssSUFBTDtZQUFXLElBQUEsRUFBSyxJQUFoQjtTQUFaO1FBQ0EsSUFBc0IsSUFBQyxDQUFBLEtBQXZCO21CQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBQTs7SUFITzs7b0JBS1gsUUFBQSxHQUFVLFNBQUMsQ0FBRCxFQUFJLENBQUo7QUFFTixZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBO1FBQ1QsSUFBRyxNQUFNLENBQUMsSUFBUCxLQUFlLENBQWYsSUFBcUIsTUFBTSxDQUFDLElBQVAsS0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxHQUFkLENBQXZDO1lBQXdELE9BQUEsQ0FBTyxLQUFQLENBQWEsWUFBYixFQUEwQixNQUFNLENBQUMsSUFBakMsRUFBdUMsQ0FBdkMsRUFBeEQ7O1FBQ0EsSUFBOEIsSUFBQyxDQUFBLEtBQS9CO21CQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsTUFBcEIsRUFBQTs7SUFKTTs7b0JBWVYsSUFBQSxHQUFNLFNBQUMsSUFBRDtRQUVGLElBQTRCLElBQUMsQ0FBQSxLQUE3QjtZQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsSUFBcEIsRUFBQTs7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO2VBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxPQUFYLEVBQW1CLElBQW5CO0lBSkU7O29CQU1OLEdBQUEsR0FBSyxTQUFDLENBQUQ7QUFDRCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBO1FBQ0osSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQWtCLENBQWxCO1FBQ0EsSUFBRyxDQUFBLEtBQUssQ0FBUjtZQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8saUJBQVAsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFESDs7UUFHQSxJQUFHLElBQUMsQ0FBQSxLQUFKO21CQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsQ0FBcEIsRUFBdUIsU0FBQyxDQUFEO3VCQUFPLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFOQzs7b0JBU0wsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIHZhbGlkLCBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBQYXJzZSAjIHRoZSBiYXNlIGNsYXNzIG9mIFBhcnNlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHZlcmJvc2UgID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgICA9IEBrb2RlLmFyZ3MucmF3XG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgcGFyc2U6IChibG9jaykgLT4gIyBjb252ZXJ0IGJsb2NrIHRyZWUgdG8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcblxuICAgICAgICBAc3RhY2sgPSBbXVxuICAgICAgICBAc2hlYXAgPSBbXVxuXG4gICAgICAgIGFzdCA9IFtdXG5cbiAgICAgICAgYXN0ID0gYXN0LmNvbmNhdCBAZXhwcyAndGwnIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICB2YXJzOltdIFxuICAgICAgICBleHBzOmFzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgbGlzdCBvZiBleHByZXNzaW9uc1xuICAgICNcbiAgICAjIHRoZSBlbnRyeSBwb2ludCBmb3IgLi4uXG4gICAgIyAgIC0gdGhlIHRsIHNjb3BlXG4gICAgIyAgIC0gY2xhc3MgYW5kIGZ1bmN0aW9uIGJvZGllc1xuICAgICMgICAtIGFyZ3VtZW50IGxpc3RzXG4gICAgIyAgIC0gYXJyYXlzIGFuZCBvYmplY3RzXG4gICAgIyAgIC0gcGFyZW5zXG4gICAgIyAgIC0gLi4uXG4gICAgIyBlc3NlbnRpYWxseSBldmVyeXRoaW5nIHRoYXQgcmVwcmVzZW50cyBhIGxpc3Qgb2Ygc29tZXRoaW5nXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwcycgcnVsZVxuXG4gICAgICAgIGVzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuICfilrhhcmcnICAgICAgICAgICAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAndGhlbicgJ+KWuGVsc2UnICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ1snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICddJyAgXG4gICAgICAgICAgICAgICAgd2hlbiAneycgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ30nXG4gICAgICAgICAgICAgICAgd2hlbiAnKCcgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJncycgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiBbJ10nICc7JyAnZWxzZScgJ3RoZW4nXVxuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuHJldHVybicgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ2lmJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICc7JyAjIGJhaWwgb3V0IGZvciBpbXBsaWNpdCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuIHJ1bGUgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgIGlmIGIgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdGFjayB0b3BcIiBAc3RhY2sgOyBicmVhayBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0b3AgYW5kIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdG9wXCIgc3RvcCA7IGJyZWFrIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICBcbiAgICAgICAgICAgICAgICBpZiBzdG9wIGluIFsnbmwnXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgc3RhcnQgd2l0aCBzdG9wICN7c3RvcH0gYnJlYWshXCJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0IHN0b3A6I3tzdG9wfSBibG9jazpcIiBibG9ja1xuXG4gICAgICAgICAgICAgICAgIyBwcmludC5hc3QgJ2V4cHMgYmxvY2sgc3RhcnQnIGVzIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgYmxvY2tFeHBzID0gQGV4cHMgJ2Jsb2NrJyBibG9jay50b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHByaW50LmFzdCAnZXhwcyBibG9jayBzdGFydCcgYmxvY2tFeHBzIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IGJsb2NrRXhwc1xuXG4gICAgICAgICAgICAgICAgaWYgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQgcmVtYWluaW5nIGJsb2NrIHRva2VuczonIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdiZWZvcmUgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnVuc2hpZnQgYmxvY2sudG9rZW5zLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnZXhwcyBhZnRlciB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgY29tbWEgLCBhbmQgY29udGludWUuLi5cIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIGJsb2NrIGVuZCBubCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQsIGJyZWFrISdcbiAgICAgICAgICAgICAgICAjIHByaW50LmFzdCAnZXhwcyBibG9jayBlbmQsIGJyZWFrIScgZXMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gYmxvY2snICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiApJyAgICAgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddICAgYW5kIHJ1bGUgPT0gJ2ZvciB2YWxzJyAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uIGlufG9mJyAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2V4cHMgbmwgXSBpbiBhcnJheScgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgd2l0aCBzdG9wJyBzdG9wXG4gICAgICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gaW4gWyfilrhhcmdzJyAn4pa4Ym9keScgJ+KWuHJldHVybicgJ3RoZW4nXSBvciBzdG9wICE9ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBubCB3aXRoIHN0b3AgJyN7c3RvcH0nIGluICN7QHN0YWNrWy0xXX0gKGJyZWFrLCBidXQgZG9uJ3Qgc2hpZnQgbmwpXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBcImV4cHMgbmwgd2l0aCBzdG9wICcje3N0b3B9J1wiIHRva2VucyBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBubCA9IEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIChubyBzdG9wKSAuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIGNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCBlXG5cbiAgICAgICAgICAgIHdoaWxlICAgKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0/LnRleHQgaW4gWydpZicgJ2ZvcicgJ3doaWxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICfilrhyZXR1cm4nXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgIyBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbGFzdC5saW5lID09IHRva2Vuc1swXS5saW5lXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgI3t0b2tlbnNbMF0udGV4dCB9VGFpbFwiIGUsIEBzdGFja1xuICAgICAgICAgICAgICAgICMgcHJpbnQudG9rZW5zICd0YWlsJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rZW5zWzBdLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICB0aGVuIGUgPSBAaWZUYWlsICAgIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgIHRoZW4gZSA9IEBmb3JUYWlsICAgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgdGhlbiBlID0gQHdoaWxlVGFpbCBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVzLnB1c2ggZVxuXG4gICAgICAgICAgICBpZiAgKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0/LnRleHQgaW4gWydpZicndGhlbicnZm9yJyd3aGlsZSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZXMubGVuZ3RoIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGJsb2NrZWQgYW5kXG4gICAgICAgICAgICAgICAgICAgIGxhc3QubGluZSA9PSB0b2tlbnNbMF0ubGluZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpZnx0aGVufGZvcnx3aGlsZScgOyBicmVhayBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICc7JyBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICd3aGVuJyAneyddXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIHNoaWZ0IGNvbG9uJyBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gY29sb24nIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5vIHRva2VuIGNvbnN1bWVkJyB0b2tlbnMgIyBoYXBwZW5zIGZvciB1bmJhbGFuY2VkIGNsb3NpbmcgXVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQHNoZWFwUG9wICdleHBzJyBydWxlXG4gICAgICAgIFxuICAgICAgICBlc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgc2luZ2xlIGV4cHJlc3Npb25cbiAgICAjXG4gICAgIyBleHByZXNzaW9uIGNhbiBiZSBhbnl0aGluZywgZnJvbSBzaW5nbGUgZGlnaXRzIHRvIHdob2xlIGNsYXNzZXMgXG4gICAgIyBidXQgaXQgaXMgYWx3YXlzIGEgc2luZ2xlIG9iamVjdFxuICAgICNcbiAgICAjIGFzc3VtZXMgdGhhdCB0aGUgaGFuZGxpbmcgb2YgbmV3bGluZXMgaXMgZG9uZSBzb21ld2hlcmUgZWxzZVxuICAgICMgc2tpcHMgb3ZlciBsZWFkaW5nIHNlbWljb2xvbnNcblxuICAgIGV4cDogKHRva2VucykgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgdG9rID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBsb2cgWTUgdzEgdG9rPy50ZXh0IGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHRvay50eXBlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIGJsb2NrIHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgd2hlbiAnbmwnICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgbmwgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICc7JyAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCA7IHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAna2V5d29yZCcgIyBkaXNwYXRjaCB0byBibG9jayBydWxlcyBpZGVudGlmaWVkIGJ5IGtleXdvcmRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgbm90IGluICc6JyAjIGFsbG93IGtleXdvcmRzIGFzIGtleXNcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgdGhlbiByZXR1cm4gQGNsYXNzICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICB0aGVuIHJldHVybiBAd2hlbiAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgdGhlbiByZXR1cm4gQHRyeSAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICfilrhyZXR1cm4nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnaWYnIEBzdGFjayBpZiBAc3RhY2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAaWYgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuXG4gICAgICAgICMgaGVyZSBzdGFydHMgdGhlIGhhaXJ5IHBhcnQgOi0pXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICBlID0gdG9rXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGggICAgICAgICAgICAgICAgICAjIHJlcGVhdGVkbHkgY2FsbCByaHMgYW5kIGxocyB1bnRpbCBhbGwgdG9rZW5zIGFyZSBzd2FsbG93ZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBlID0gQHJocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIGZpcnN0LCB0cnkgdG8gZWF0IGFzIG11Y2ggdG9rZW5zIGFzIHBvc3NpYmxlIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgXCJyaHNcIiBlIGlmIEB2ZXJib3NlICAgIFxuXG4gICAgICAgICAgICBlID0gQGxocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIHNlZSwgaWYgd2UgY2FuIHVzZSB0aGUgcmVzdWx0IGFzIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiBzb21ldGhpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZVxuXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgaW4gJzsnXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBicmVhayBvbiA7J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBubyB0b2tlbiBjb25zdW1lZDogYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICAjIHJlY3Vyc2l2ZWx5IGJ1aWxkIHVwIHN0dWZmIHRoYXQgY2FuIGJlIGlkZW50aWZpZWQgYnkgbG9va2luZyBhdCB0aGUgbmV4dCB0b2tlbiBvbmx5OlxuICAgICNcbiAgICAjIGFueXRoaW5nIHRoYXQgb3BlbnMgYW5kIGNsb3Nlc1xuICAgICMgICAtIG9iamVjdHNcbiAgICAjICAgLSBhcnJheXNcbiAgICAjICAgLSBwYXJlbnNcbiAgICAjXG4gICAgIyBidXQgYWxzbyBcbiAgICAjICAgLSBzaW5nbGUgb3BlcmFuZCBvcGVyYXRpb25zXG4gICAgXG4gICAgcmhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAncmhzJyAncmhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdW5zcGFjZWQgPSAobGxjID0gbGFzdExpbmVDb2woZSkpLmNvbCA9PSBueHQuY29sIGFuZCBsbGMubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGlmIG54dC50ZXh0IGluICcoeycgYW5kIGUudHlwZSBpbiBbJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ251bScgJ3JlZ2V4J11cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICfilrhhcmcnIGFuZCBueHQudHlwZSA9PSAnb3AnIHRoZW4gQHZlcmIgJ3JocyBicmVhayBmb3Ig4pa4YXJnJzsgYnJlYWtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6JyBhbmQgQHN0YWNrWy0xXSBpbiBbJ2NsYXNzJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ3JocyBpcyBjbGFzcyBtZXRob2QnIHRva2Vuc1suLjIwXSBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kICh1bnNwYWNlZCBvciAnPycgbm90IGluIEBzdGFjaylcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdyaHMgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBAdmVyYiAnaW5jb25kJyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0P1xuICAgICAgICAgICAgICAgIGlmICAgICAgZS50ZXh0ID09ICdbJyAgIHRoZW4gZSA9IEBhcnJheSAgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJygnICAgdGhlbiBlID0gQHBhcmVucyAgICAgICAgICBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAneycgICB0aGVuIGUgPSBAY3VybHkgICAgICAgICAgIGUsIHRva2VucyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAnbm90JyB0aGVuIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysnJy0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ251bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgKy0gbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZS50ZXh0ID09ICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0ID0gJy0nICsgbnh0LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQuY29sIC09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50eXBlIG5vdCBpbiBbJ3ZhciddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IgJ3dyb25nIHJocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSAjIGlmIGUgaXMgbm90IGEgdG9rZW4gYW55bW9yZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gICAgYW5kIHVuc3BhY2VkICAgICAgICB0aGVuIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpOyBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCcgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgY2FsbCBhcnJheSBlbmQnOyAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgICAgYW5kIG54dC50ZXh0ID09ICd9JyB0aGVuIEB2ZXJiICdyaHMgY3VybHkgZW5kJzsgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBhcnJheSBlbmQnOyAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBbIGFycmF5IGVuZCcgbnh0OyAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwicmhzIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAncmhzIG5vIHRva2VuIGNvbnN1bWVkLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgICMgaWYgbnh0ID0gdG9rZW5zWzBdXG4jICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBpZiBlbXB0eSBAc3RhY2tcbiMgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgQHZlcmIgJ3JocyBlbXB0eSBzdGFjayBueHQnIG54dFxuIyAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgICAgICAjIEB2ZXJiICdyaHMgaXMgbGFzdCBtaW51dGUgaW5kZXggb2YgbGhzJyBlXG4gICAgICAgICAgICAgICAgICAgICMgZSA9IEBpbmRleCBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ3JocycgJ3JocydcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyByZWN1cnNpdmVseSBidWlsZCB1cCBzdHVmZiB0aGF0IGNhbiBiZSBpZGVudGlmaWVkIGJ5IGxvb2tpbmcgYXQgdGhlIG5leHQgdG9rZW4gKmFuZCogd2hhdCB3YXMganVzdCBwYXJzZWRcbiAgICAjXG4gICAgIyBhbnl0aGluZyB0aGF0IGNhbiBiZSBjaGFpbmVkXG4gICAgIyAgIC0gb3BlcmF0aW9uc1xuICAgICMgICAtIHByb3BlcnRpZXNcbiAgICAjICAgLSBjYWxsc1xuICAgIFxuICAgIGxoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2xocycgJ2xocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxhc3QgID0gbGFzdExpbmVDb2wgIGVcbiAgICAgICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGVcbiAgICAgICAgICAgIHVuc3BhY2VkID0gbGFzdC5jb2wgPT0gbnh0LmNvbCBhbmQgbGFzdC5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgdGhlbiBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICB3aGVuICd7JyB0aGVuIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLnRleHQgPT0gJ0AnIFxuICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdibG9jaycgYW5kIEBzdGFja1stMV0gPT0gJ2lmJyBvciBueHQudGV4dCA9PSAndGhlbicgb3Igbnh0LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZSA9IEB0aGlzIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAgICAgIG54dC50ZXh0ID09ICcuJyAgICB0aGVuIGUgPSBAcHJvcCAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIG5vdCBAc3RhY2tbLTFdLnN0YXJ0c1dpdGgoJ29wJykgdGhlbiBlID0gQHNsaWNlICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ2VhY2gnIHRoZW4gZSA9IEBlYWNoICAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB1bnNwYWNlZCAjIGFuZCB0b2tlbnNbMV0/LnRleHQgaW4gJyhbLidcblxuICAgICAgICAgICAgICAgICAgICBlID0gQGFzc2VydCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBxbXJrb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kIGUucW1ya29wXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZSA9IEBxbXJrY29sb24gZS5xbXJrb3AsIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlID09ICdvcCcgYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nICdub3QnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdPy5zdGFydHNXaXRoICdvcCcgYW5kIEBzdGFja1stMV0gIT0gJ29wPSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBzdG9wIG9uIG9wZXJhdGlvbicgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdpbj8nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgc3RvcCBvbiBpbj8nIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2Ygb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPiBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy1cXHMnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZnVuYycgYW5kIGUucGFyZW5zXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBhcmdzIGZvciBmdW5jJyBlXG4gICAgICAgICAgICAgICAgZSA9IEBmdW5jIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB1bnNwYWNlZCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ25vdCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaW4nXG5cbiAgICAgICAgICAgICAgICBlID0gb3BlcmF0aW9uOlxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjp0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICByaHM6QGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VkIGFuZCAobnh0LmxpbmUgPT0gbGFzdC5saW5lIG9yIChueHQuY29sID4gZmlyc3QuY29sIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJ10pKSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnaWYnICd0aGVuJyAnZWxzZScgJ2JyZWFrJyAnY29udGludWUnICdpbicgJ29mJyAnZm9yJyAnd2hpbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIChlLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nICdpZicgJ3RoZW4nICdlbHNlJyAnZm9yJyAnd2hpbGUnXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5hcnJheSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub2JqZWN0IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5rZXl2YWwgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9wZXJhdGlvbiBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuaW5jb25kIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5xbXJrb3AgYW5kXG4gICAgICAgICAgICAgICAgICAgIGUuY2FsbD8uY2FsbGVlPy50ZXh0IG5vdCBpbiBbJ2RlbGV0ZScnbmV3Jyd0eXBlb2YnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgJ+KWuGFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgZmlyc3QnIGZpcnN0IFxuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICBpZiBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgb3AgaXMgdW5iYWxhbmNlZCArLSBicmVhay4uLicgZSwgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiArLSBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJsaHMgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnbGhzIG5vIHRva2VuIGNvbnN1bWVkPydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ2xocycgJ2xocycgICAgICAgXG4gICAgICAgIGVcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgICMgcnVsZXMgaW4gcGFyc2VyIHNob3VsZCB1c2UgdGhpcyBpbnN0ZWFkIG9mIGNhbGxpbmcgc2hpZnROZXdsaW5lIGRpcmVjdGx5XG4gICAgXG4gICAgc2hpZnRDbG9zZTogKHJ1bGUsIHRleHQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSB0ZXh0XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLnNoaWZ0KCkgXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSB0ZXh0XG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lIHJ1bGUsIHRva2Vuc1xuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgZXJyb3IgXCJwYXJzZS5zaGlmdENsb3NlOiAnI3tydWxlfScgZXhwZWN0ZWQgY2xvc2luZyAnI3t0ZXh0fSdcIlxuICAgICAgICBwcmludC50b2tlbnMgXCJzaGlmdENsb3NlIG1pc3NpbmcgY2xvc2UgJyN7dGV4dH0nXCIgdG9rZW5zXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICAjIHRoaXMgc2hvdWxkIGJlIHRoZSBvbmx5IG1ldGhvZCB0byByZW1vdmUgbmV3bGluZXMgZnJvbSB0aGUgdG9rZW5zXG4gICAgIyBpdCBpcyB2ZXJ5IGltcG9ydGFudCB0byBrZWVwIHRoZSBuZXdsaW5lcyBhcyBhIHJlY3Vyc2lvbiBicmVha2VyIHVudGlsIHRoZSBsYXN0IHBvc3NpYmxlIG1vbWVudFxuICAgICMgdXNpbmcgdGhpcyBtZXRob2QgbWFrZXMgaXQgbXVjaCBlYXNpZXIgdG8gZGV0ZXJtaW5lIHdoZW4gb25lIGdldHMgc3dhbGx3ZWQgdG9vIGVhcmx5XG4gICAgXG4gICAgc2hpZnROZXdsaW5lOiAocnVsZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGRlYnVnIHRoZW4gbG9nIE0zIHk1IFwiIOKXgiAje3cxIHJ1bGV9XCIgXG4gICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgIHNoaWZ0TmV3bGluZVRvazogKHJ1bGUsIHRva2VucywgdG9rLCBjb25kKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIGNvbmRcbiAgICAgICAgICAgaWYgdG9rZW5zWzFdPy5jb2wgPT0gdG9rLmNvbFxuICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBydWxlLCB0b2tlbnNcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG5cbiAgICAjIGFkZHMgbmFtZSB0b2tlbnMgdG8gZnVuY3Rpb25zIHRoYXQgYXJlIHZhbHVlcyBpbiBjbGFzcyBvYmplY3RzXG4gICAgXG4gICAgbmFtZU1ldGhvZHM6IChtdGhkcykgLT5cbiBcbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgICAgICBpZiBuYW1lID0gbS5rZXl2YWw/LmtleT8udGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmtleXZhbC52YWw/LmZ1bmM/XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lID0gdHlwZTonbmFtZScgdGV4dDpuYW1lXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAnbm8gZnVuY3Rpb24gZm9yIG1ldGhvZD8nIG5hbWUsIG1cbiAgICAgICAgbXRoZHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgIFxuICAgICMgZWF0cyBlaXRoZXIgdG9rZW5zIHRvIHRoZSByaWdodCBvZiAndGhlbicgdG9rZW5zXG4gICAgIyBvciBvZiB0aGUgbmV4dCBibG9ja1xuICAgIFxuICAgIHRoZW46IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlIGluIFsnYmxvY2snICdubCddXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2VtcHR5IHRoZW4hJ1xuICAgICAgICAgICAgICAgIHRobiA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHB1c2ggJ3RoZW4nXG4gICAgICAgICAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgICAgIEBwb3AgJ3RoZW4nXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBAcHVzaCAndGhlbidcbiAgICAgICAgICAgIHRobiA9IEBleHBzIGlkLCBibG9jay50b2tlbnNcbiAgICAgICAgICAgIEBwb3AgJ3RoZW4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ3RoZW46IGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3Vuc2hpZnQnIGJsb2NrLnRva2Vuc1stMV1cbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnVuc2hpZnQgYmxvY2sudG9rZW5zLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAndGhlbiBhZnRlciB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB2ZXJiIFwibm8gdGhlbiBhbmQgbm8gYmxvY2sgYWZ0ZXIgI3tpZH0hXCJcbiAgICAgICAgICAgICMgd2FybiBcIicje2lkfScgZXhwZWN0ZWQgdGhlbiBvciBibG9ja1wiXG4gICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgIyBlaXRoZXIgZWF0cyBibG9jayB0b2tlbnNcbiAgICAjIG9yIHVudGlsIG5leHQgbmV3bGluZVxuICAgICMgdXNlZCBmb3IgdGhpbmdzIHRoYXQgZG9lc24ndCBleHBlY3QgJ3RoZW4nIHdoZW4gY29udGludWVkIGluIHNhbWUgbGluZVxuICAgICMgICAtIGZ1bmN0aW9uIGJvZHlcbiAgICAjICAgLSBjYWxsIGFyZ3VtZW50c1xuICAgICMgICAtIHRyeSwgY2F0Y2gsIGZpbmFsbHlcbiAgICAjICAgLSBlbHNlXG4gICAgIyAgIC0gcmV0dXJuXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBAdmVyYiAnYmxvY2sgbmV4dCB0b2tlbiB0eXBlJyB0b2tlbnNbMF0/LnR5cGUgXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgb3JpZ1Rva2VucyA9IHRva2Vuc1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuXG4gICAgICAgIEBwdXNoICfilrgnK2lkXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBAcG9wICfilrgnK2lkXG5cbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3Vuc2hpZnQnIGJsb2NrLnRva2Vuc1stMV1cbiAgICAgICAgICAgICAgICBvcmlnVG9rZW5zLnVuc2hpZnQgYmxvY2sudG9rZW5zLnBvcCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Jsb2NrIGFmdGVyIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyBvcmlnVG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgc3ViQmxvY2tzOiAodG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgc3ViYnMgPSBbW11dXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbLTFdLnR5cGUgPT0gJ2Jsb2NrJyBhbmQgdG9rZW5zWy0xXS50b2tlbnNbMF0udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIGVsc2VCbG9jayA9IHRva2Vucy5wb3AoKVxuICAgICAgICAgICAgZWxzZVRva2VucyA9IGVsc2VCbG9jay50b2tlbnNcbiAgICAgICAgICAgIGVsc2VUb2tlbnNbMF0udGV4dCA9ICdlbHNlJ1xuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnNbMF0udGV4dCA9ICdlbHNlJ1xuICAgICAgICAgICAgcmV0dXJuIFt0b2tlbnNdXG4gICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdmFsaWQgdG9rZW5zXG4gICAgICAgICAgICB0ID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHQudHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgc3ViYnMucHVzaCBbXVxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0udGV4dCA9ICdlbHNlJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN1YmJzWy0xXS5wdXNoIHRcblxuICAgICAgICBzdWJicy5wdXNoIGVsc2VUb2tlbnMgaWYgZWxzZVRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBzdWJic1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgIFxuICAgIHNoZWFwUHVzaDogKHR5cGUsIHRleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXAucHVzaCB0eXBlOnR5cGUsIHRleHQ6dGV4dFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgIHNoZWFwUG9wOiAobSwgdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvcHBlZCA9IEBzaGVhcC5wb3AoKVxuICAgICAgICBpZiBwb3BwZWQudGV4dCAhPSB0IGFuZCBwb3BwZWQudGV4dCAhPSBrc3RyLnN0cmlwKHQsIFwiJ1wiKSB0aGVuIGVycm9yICd3cm9uZyBwb3A/JyBwb3BwZWQudGV4dCwgdFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAsIHBvcHBlZCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuICAgIHB1c2g6IChub2RlKSAtPlxuXG4gICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgbm9kZSBpZiBAZGVidWdcbiAgICAgICAgQHN0YWNrLnB1c2ggbm9kZVxuICAgICAgICBAc2hlYXBQdXNoICdzdGFjaycgbm9kZVxuXG4gICAgcG9wOiAobikgLT5cbiAgICAgICAgcCA9IEBzdGFjay5wb3AoKVxuICAgICAgICBAc2hlYXBQb3AgJ3N0YWNrJyBwXG4gICAgICAgIGlmIHAgIT0gblxuICAgICAgICAgICAgZXJyb3IgXCJ1bmV4cGVjdGVkIHBvcCFcIiBwLCBuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIHAsIChzKSAtPiBXMSB3MSBzXG5cbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee
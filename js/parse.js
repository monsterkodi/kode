// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */
var Parse, empty, firstLineCol, kstr, lastLineCol, print, ref,
    indexOf = [].indexOf;

kstr = require('kstr');

print = require('./print');

ref = require('./utils'), empty = ref.empty, firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol;

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
        var b, block, blocked, colon, e, es, nl, numTokens, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
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
                        return ref2 = tokens[0].text, indexOf.call('];', ref2) >= 0;
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
                es = es.concat(this.exps('block', block.tokens));
                if (block.tokens.length) {
                    this.verb('exps block end remaining block tokens:', block.tokens.length);
                    if (this.debug) {
                        print.tokens('before unshifting dangling block tokens', tokens);
                    }
                    while (block.tokens.length) {
                        tokens.unshift(block.tokens.pop());
                    }
                    if (this.debug) {
                        print.tokens('after unshifting dangling block tokens', tokens);
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
                    if (((ref6 = this.stack.slice(-1)[0]) === '▸args' || ref6 === '▸body') || stop !== 'nl') {
                        this.verb("exps nl with stop " + stop + " in " + this.stack.slice(-1)[0] + " (break, but don't shift nl)");
                    } else {
                        this.shiftNewline("exps nl with stop " + stop, tokens);
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
            while (((ref9 = (ref10 = tokens[0]) != null ? ref10.text : void 0) === 'if' || ref9 === 'for' || ref9 === 'while') && ((ref11 = this.stack.slice(-1)[0]) !== '▸args')) {
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
            if (((ref12 = (ref13 = tokens[0]) != null ? ref13.text : void 0) === 'if' || ref12 === 'then' || ref12 === 'for' || ref12 === 'while') && es.length && !blocked) {
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
                            if ((ref3 = this.stack.slice(-1)[0]) !== '▸args') {
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
                } else if (((ref3 = e.text) === '++' || ref3 === '--') && unspaced) {
                    this.verb('rhs increment');
                    e = this.operation(null, e, tokens);
                } else if (((ref4 = e.text) === '+' || ref4 === '-') && unspaced) {
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
                } else if (((ref5 = nxt.text) === '++' || ref5 === '--') && unspaced) {
                    if ((ref6 = e.type) !== 'var') {
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
                if (((ref7 = nxt.text) === '++' || ref7 === '--') && unspaced) {
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
        if (nxt = tokens[0]) {
            if (empty(this.stack)) {
                this.verb('rhs empty stack nxt', nxt);
                if (nxt.text === '[' && ((ref8 = tokens[1]) != null ? ref8.text : void 0) !== ']') {
                    this.verb('rhs is last minute lhs of index', e);
                    e = this.index(e, tokens);
                }
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
            } else if (nxt.type === 'dots') {
                e = this.slice(e, tokens);
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
            } else if (spaced && (nxt.line === last.line || (nxt.col > first.col && ((ref9 = this.stack.slice(-1)[0]) !== 'if'))) && ((ref10 = nxt.text) !== 'if' && ref10 !== 'then' && ref10 !== 'else' && ref10 !== 'break' && ref10 !== 'continue' && ref10 !== 'in' && ref10 !== 'of' && ref10 !== 'for' && ref10 !== 'while') && ((ref11 = nxt.type) !== 'nl') && ((ref12 = e.type) !== 'num' && ref12 !== 'single' && ref12 !== 'double' && ref12 !== 'triple' && ref12 !== 'regex' && ref12 !== 'punct' && ref12 !== 'comment' && ref12 !== 'op') && ((ref13 = e.text) !== 'null' && ref13 !== 'undefined' && ref13 !== 'Infinity' && ref13 !== 'NaN' && ref13 !== 'true' && ref13 !== 'false' && ref13 !== 'yes' && ref13 !== 'no' && ref13 !== 'if' && ref13 !== 'then' && ref13 !== 'else' && ref13 !== 'for' && ref13 !== 'while') && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && ((ref14 = (ref15 = e.call) != null ? (ref16 = ref15.callee) != null ? ref16.text : void 0 : void 0) !== 'delete' && ref14 !== 'new' && ref14 !== 'typeof') && indexOf.call(this.stack, '▸arg') < 0) {
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
        return console.error("parse.shiftClose: '" + rule + "' expected closing '" + text + "'");
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
            thn = this.exps(id, block.tokens);
            if (block.tokens.length) {
                if (this.debug) {
                    print.tokens('then: dangling block tokens', tokens);
                }
            }
        } else {
            this.verb('no then and no block after #{id}!');
        }
        return thn;
    };

    Parse.prototype.block = function(id, tokens) {
        var block, exps, nl, ref1;
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
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
        }
        return exps;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseURBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxlQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLE9BQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsR0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnhCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO1FBRU4sR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsS0FBSyxDQUFDLE1BQWpCLENBQVg7UUFFTixJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQWEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXFCLEdBQXJCLEVBQWI7O2VBRUE7WUFBQSxJQUFBLEVBQUssRUFBTDtZQUNBLElBQUEsRUFBSyxHQURMOztJQVhHOztvQkErQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLElBQUMs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RUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFILENBQUg7WUFBUCxDQUF2QixFQURKOztJQU5DOztvQkFTTCxJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxueyBlbXB0eSwgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEB2ZXJib3NlICA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAcmF3ICAgICAgPSBAa29kZS5hcmdzLnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cbiAgICAgICAgQHNoZWFwID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgdmFyczpbXSBcbiAgICAgICAgZXhwczphc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAgICAjXG4gICAgIyB0aGUgZW50cnkgcG9pbnQgZm9yIC4uLlxuICAgICMgICAtIHRoZSB0bCBzY29wZVxuICAgICMgICAtIGNsYXNzIGFuZCBmdW5jdGlvbiBib2RpZXNcbiAgICAjICAgLSBhcmd1bWVudCBsaXN0c1xuICAgICMgICAtIGFycmF5cyBhbmQgb2JqZWN0c1xuICAgICMgICAtIHBhcmVuc1xuICAgICMgICAtIC4uLlxuICAgICMgZXNzZW50aWFsbHkgZXZlcnl0aGluZyB0aGF0IHJlcHJlc2VudHMgYSBsaXN0IG9mIHNvbWV0aGluZ1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cHMnIHJ1bGVcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJnJyAgICAgICAgICAgICAgICAgdGhlbiBlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgJ3N3aXRjaCcgJ3RoZW4nICfilrhlbHNlJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnXScgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICd9J1xuICAgICAgICAgICAgICAgIHdoZW4gJygnICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZ3MnICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ107J1xuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICc7JyAjIGJhaWwgb3V0IGZvciBpbXBsaWNpdCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuIHJ1bGUgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgIGlmIGIgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdGFjayB0b3BcIiBAc3RhY2sgOyBicmVhayBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0b3AgYW5kIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdG9wXCIgc3RvcCA7IGJyZWFrIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICBcbiAgICAgICAgICAgICAgICBpZiBzdG9wIGluIFsnbmwnXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgc3RhcnQgd2l0aCBzdG9wICN7c3RvcH0gYnJlYWshXCJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0IHN0b3A6I3tzdG9wfSBibG9jazpcIiBibG9ja1xuXG4gICAgICAgICAgICAgICAgYmxvY2tlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBlcyA9IGVzLmNvbmNhdCBAZXhwcyAnYmxvY2snIGJsb2NrLnRva2VucyAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBpZiBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJsb2NrIGVuZCByZW1haW5pbmcgYmxvY2sgdG9rZW5zOicgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ2JlZm9yZSB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMudW5zaGlmdCBibG9jay50b2tlbnMucG9wKClcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdhZnRlciB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgY29tbWEgLCBhbmQgY29udGludWUuLi5cIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIGJsb2NrIGVuZCBubCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQsIGJyZWFrISdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaycgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKScgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uICknICAgICAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0IGluIFsnaW4nJ29mJ10gICBhbmQgcnVsZSA9PSAnZm9yIHZhbHMnICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gaW58b2YnICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnZXhwcyBubCBdIGluIGFycmF5JyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSBpbiBbJ+KWuGFyZ3MnICfilrhib2R5J10gb3Igc3RvcCAhPSAnbmwnXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgbmwgd2l0aCBzdG9wICN7c3RvcH0gaW4gI3tAc3RhY2tbLTFdfSAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCB3aXRoIHN0b3AgI3tzdG9wfVwiIHRva2VucyBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBubCA9IEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIChubyBzdG9wKSAuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIGNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0IGluIFsnaWYnICdmb3InICd3aGlsZSddIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzICN7dG9rZW5zWzBdLnRleHQgfVRhaWxcIiBlLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAjIHByaW50LnRva2VucyAndGFpbCcgdG9rZW5zXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRva2Vuc1swXS50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgdGhlbiBlID0gQGlmVGFpbCAgICBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICB0aGVuIGUgPSBAZm9yVGFpbCAgIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnIHRoZW4gZSA9IEB3aGlsZVRhaWwgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlcy5wdXNoIGVcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgdG9rZW5zWzBdPy50ZXh0IGluIFsnaWYnJ3RoZW4nJ2Zvcicnd2hpbGUnXSBhbmQgXG4gICAgICAgICAgICAgICBlcy5sZW5ndGggYW5kIFxuICAgICAgICAgICAgICAgbm90IGJsb2NrZWRcbiAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpZnx0aGVufGZvcnx3aGlsZScgOyBicmVhayBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICc7JyBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICd3aGVuJyAneyddICNcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgc2hpZnQgY29sb24nIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBjb2xvbicgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbm8gdG9rZW4gY29uc3VtZWQnIHRva2VucyAjIGhhcHBlbnMgZm9yIHVuYmFsYW5jZWQgY2xvc2luZyBdXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAc2hlYXBQb3AgJ2V4cHMnIHJ1bGVcbiAgICAgICAgXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuICAgICNcbiAgICAjIGV4cHJlc3Npb24gY2FuIGJlIGFueXRoaW5nLCBmcm9tIHNpbmdsZSBkaWdpdHMgdG8gd2hvbGUgY2xhc3NlcyBcbiAgICAjIGJ1dCBpdCBpcyBhbHdheXMgYSBzaW5nbGUgb2JqZWN0XG4gICAgI1xuICAgICMgYXNzdW1lcyB0aGF0IHRoZSBoYW5kbGluZyBvZiBuZXdsaW5lcyBpcyBkb25lIHNvbWV3aGVyZSBlbHNlXG4gICAgIyBza2lwcyBvdmVyIGxlYWRpbmcgc2VtaWNvbG9uc1xuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnYmxvY2snICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBubCB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIDsgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJyAjIGRpc3BhdGNoIHRvIGJsb2NrIHJ1bGVzIGlkZW50aWZpZWQgYnkga2V5d29yZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBub3QgaW4gJzonICMgYWxsb3cga2V5d29yZHMgYXMga2V5c1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgdGhlbiByZXR1cm4gQHJldHVybiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgIHRoZW4gcmV0dXJuIEBzd2l0Y2ggdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICB0aGVuIHJldHVybiBAY2xhc3MgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgdGhlbiByZXR1cm4gQHdoaWxlICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3RyeScgICAgICB0aGVuIHJldHVybiBAdHJ5ICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gbm90IGluIFsn4pa4YXJncyddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdpZicgQHN0YWNrIGlmIEBzdGFjay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBpZiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG5cbiAgICAgICAgIyBoZXJlIHN0YXJ0cyB0aGUgaGFpcnkgcGFydCA6LSlcblxuICAgICAgICBAc2hlYXBQdXNoICdleHAnIHRvay50ZXh0ID8gdG9rLnR5cGVcbiAgICAgICAgXG4gICAgICAgIGUgPSB0b2tcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aCAgICAgICAgICAgICAgICAgICMgcmVwZWF0ZWRseSBjYWxsIHJocyBhbmQgbGhzIHVudGlsIGFsbCB0b2tlbnMgYXJlIHN3YWxsb3dlZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGUgPSBAcmhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgZmlyc3QsIHRyeSB0byBlYXQgYXMgbXVjaCB0b2tlbnMgYXMgcG9zc2libGUgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCBcInJoc1wiIGUgaWYgQHZlcmJvc2UgICAgXG5cbiAgICAgICAgICAgIGUgPSBAbGhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgc2VlLCBpZiB3ZSBjYW4gdXNlIHRoZSByZXN1bHQgYXMgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHNvbWV0aGluZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgXCJsaHNcIiBlIGlmIEB2ZXJib3NlXG5cbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnOydcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGJyZWFrIG9uIDsnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGggICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0IGluICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIHNoaWZ0IGNvbW1hJ1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIG5vIHRva2VuIGNvbnN1bWVkOiBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWsgIyBiYWlsIG91dCBpZiBubyB0b2tlbiB3YXMgY29uc3VtZWRcbiAgICAgICAgICAgIFxuICAgICAgICBwcmludC5hc3QgXCJleHAgI3tpZiBlbXB0eShAc3RhY2spIHRoZW4gJ0RPTkUnIGVsc2UgJyd9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdleHAnIHRvay50ZXh0ID8gdG9rLnR5cGVcbiAgICAgICAgZSAgICAgICAgXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgcmVjdXJzaXZlbHkgYnVpbGQgdXAgc3R1ZmYgdGhhdCBjYW4gYmUgaWRlbnRpZmllZCBieSBsb29raW5nIGF0IHRoZSBuZXh0IHRva2VuIG9ubHk6XG4gICAgI1xuICAgICMgYW55dGhpbmcgdGhhdCBvcGVucyBhbmQgY2xvc2VzXG4gICAgIyAgIC0gb2JqZWN0c1xuICAgICMgICAtIGFycmF5c1xuICAgICMgICAtIHBhcmVuc1xuICAgICNcbiAgICAjIGJ1dCBhbHNvIFxuICAgICMgICAtIHNpbmdsZSBvcGVyYW5kIG9wZXJhdGlvbnNcbiAgICBcbiAgICByaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdyaHMnICdyaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1bnNwYWNlZCA9IChsbGMgPSBsYXN0TGluZUNvbChlKSkuY29sID09IG54dC5jb2wgYW5kIGxsYy5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gJyh7JyBhbmQgZS50eXBlIGluIFsnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAnbnVtJyAncmVnZXgnXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ+KWuGFyZycgYW5kIG54dC50eXBlID09ICdvcCcgdGhlbiBAdmVyYiAncmhzIGJyZWFrIGZvciDilrhhcmcnOyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kICh1bnNwYWNlZCBvciAnPycgbm90IGluIEBzdGFjaylcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdyaHMgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBAdmVyYiAnaW5jb25kJyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0P1xuICAgICAgICAgICAgICAgIGlmICAgICAgZS50ZXh0ID09ICdbJyAgIHRoZW4gZSA9IEBhcnJheSAgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJygnICAgdGhlbiBlID0gQHBhcmVucyAgICAgICAgICBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAneycgICB0aGVuIGUgPSBAY3VybHkgICAgICAgICAgIGUsIHRva2VucyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAnbm90JyB0aGVuIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysnJy0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ251bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgKy0gbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZS50ZXh0ID09ICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0ID0gJy0nICsgbnh0LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQuY29sIC09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50eXBlIG5vdCBpbiBbJ3ZhciddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IgJ3dyb25nIHJocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSAjIGlmIGUgaXMgbm90IGEgdG9rZW4gYW55bW9yZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gICAgYW5kIHVuc3BhY2VkICAgICAgICB0aGVuIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpOyBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCcgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgY2FsbCBhcnJheSBlbmQnOyAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgICAgYW5kIG54dC50ZXh0ID09ICd9JyB0aGVuIEB2ZXJiICdyaHMgY3VybHkgZW5kJzsgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBhcnJheSBlbmQnOyAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBbIGFycmF5IGVuZCcgbnh0OyAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwicmhzIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAncmhzIG5vIHRva2VuIGNvbnN1bWVkLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIGlmIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlbXB0eSBAc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGVtcHR5IHN0YWNrIG54dCcgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBsYXN0IG1pbnV0ZSBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ3JocycgJ3JocydcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyByZWN1cnNpdmVseSBidWlsZCB1cCBzdHVmZiB0aGF0IGNhbiBiZSBpZGVudGlmaWVkIGJ5IGxvb2tpbmcgYXQgdGhlIG5leHQgdG9rZW4gKmFuZCogd2hhdCB3YXMganVzdCBwYXJzZWRcbiAgICAjXG4gICAgIyBhbnl0aGluZyB0aGF0IGNhbiBiZSBjaGFpbmVkXG4gICAgIyAgIC0gb3BlcmF0aW9uc1xuICAgICMgICAtIHByb3BlcnRpZXNcbiAgICAjICAgLSBjYWxsc1xuICAgIFxuICAgIGxoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2xocycgJ2xocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxhc3QgID0gbGFzdExpbmVDb2wgIGVcbiAgICAgICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGVcbiAgICAgICAgICAgIHVuc3BhY2VkID0gbGFzdC5jb2wgPT0gbnh0LmNvbCBhbmQgbGFzdC5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgdGhlbiBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICB3aGVuICd7JyB0aGVuIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLnRleHQgPT0gJ0AnIFxuICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdibG9jaycgYW5kIEBzdGFja1stMV0gPT0gJ2lmJyBvciBueHQudGV4dCA9PSAndGhlbicgb3Igbnh0LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZSA9IEB0aGlzIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAgICAgIG54dC50ZXh0ID09ICcuJyAgICB0aGVuIGUgPSBAcHJvcCAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgdGhlbiBlID0gQHNsaWNlICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJz8nIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHVuc3BhY2VkICMgYW5kIHRva2Vuc1sxXT8udGV4dCBpbiAnKFsuJ1xuXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAYXNzZXJ0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBlID0gQHFtcmtvcCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6JyBhbmQgZS5xbXJrb3BcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlID0gQHFtcmtjb2xvbiBlLnFtcmtvcCwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgPT0gJ29wJyBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJysrJyAnLS0nICcrJyAnLScgJ25vdCddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0/LnN0YXJ0c1dpdGggJ29wJyBhbmQgQHN0YWNrWy0xXSAhPSAnb3A9J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIHN0b3Agb24gb3BlcmF0aW9uJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2luPydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBzdG9wIG9uIGluPycgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRleHQgbm90IGluIFsnWycgJygnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VkIGFuZCB0b2tlbnNbMV0/LmNvbCA+IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiArLVxccycgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdmdW5jJyBhbmQgZS5wYXJlbnNcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGFyZ3MgZm9yIGZ1bmMnIGVcbiAgICAgICAgICAgICAgICBlID0gQGZ1bmMgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnKCcgYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgY2FsbCdcbiAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnWycgYW5kIHVuc3BhY2VkIGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnbm90JyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpbidcblxuICAgICAgICAgICAgICAgIGUgPSBvcGVyYXRpb246XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yOnRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHJoczpAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIChueHQubGluZSA9PSBsYXN0LmxpbmUgb3IgKG54dC5jb2wgPiBmaXJzdC5jb2wgYW5kIEBzdGFja1stMV0gbm90IGluIFsnaWYnXSkpIGFuZFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWydpZicgJ3RoZW4nICdlbHNlJyAnYnJlYWsnICdjb250aW51ZScgJ2luJyAnb2YnICdmb3InICd3aGlsZSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgbm90IGluIFsnbmwnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgKGUudHlwZSBub3QgaW4gWydudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnICdyZWdleCcgJ3B1bmN0JyAnY29tbWVudCcgJ29wJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgKGUudGV4dCBub3QgaW4gWydudWxsJyAndW5kZWZpbmVkJyAnSW5maW5pdHknICdOYU4nICd0cnVlJyAnZmFsc2UnICd5ZXMnICdubycgJ2lmJyAndGhlbicgJ2Vsc2UnICdmb3InICd3aGlsZSddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmFycmF5IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vYmplY3QgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmtleXZhbCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub3BlcmF0aW9uIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5pbmNvbmQgYW5kXG4gICAgICAgICAgICAgICAgICAgIGUuY2FsbD8uY2FsbGVlPy50ZXh0IG5vdCBpbiBbJ2RlbGV0ZScnbmV3Jyd0eXBlb2YnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgJ+KWuGFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgZmlyc3QnIGZpcnN0IFxuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICBpZiBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgb3AgaXMgdW5iYWxhbmNlZCArLSBicmVhay4uLicgZSwgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiArLSBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJsaHMgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnbGhzIG5vIHRva2VuIGNvbnN1bWVkPydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ2xocycgJ2xocycgICAgICAgXG4gICAgICAgIGVcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgICMgcnVsZXMgaW4gcGFyc2VyIHNob3VsZCB1c2UgdGhpcyBpbnN0ZWFkIG9mIGNhbGxpbmcgc2hpZnROZXdsaW5lIGRpcmVjdGx5XG4gICAgXG4gICAgc2hpZnRDbG9zZTogKHJ1bGUsIHRleHQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSB0ZXh0XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLnNoaWZ0KCkgXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSB0ZXh0XG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lIHJ1bGUsIHRva2Vuc1xuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgZXJyb3IgXCJwYXJzZS5zaGlmdENsb3NlOiAnI3tydWxlfScgZXhwZWN0ZWQgY2xvc2luZyAnI3t0ZXh0fSdcIlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgIyB0aGlzIHNob3VsZCBiZSB0aGUgb25seSBtZXRob2QgdG8gcmVtb3ZlIG5ld2xpbmVzIGZyb20gdGhlIHRva2Vuc1xuICAgICMgaXQgaXMgdmVyeSBpbXBvcnRhbnQgdG8ga2VlcCB0aGUgbmV3bGluZXMgYXMgYSByZWN1cnNpb24gYnJlYWtlciB1bnRpbCB0aGUgbGFzdCBwb3NzaWJsZSBtb21lbnRcbiAgICAjIHVzaW5nIHRoaXMgbWV0aG9kIG1ha2VzIGl0IG11Y2ggZWFzaWVyIHRvIGRldGVybWluZSB3aGVuIG9uZSBnZXRzIHN3YWxsd2VkIHRvbyBlYXJseVxuICAgIFxuICAgIHNoaWZ0TmV3bGluZTogKHJ1bGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1ZyB0aGVuIGxvZyBNMyB5NSBcIiDil4IgI3t3MSBydWxlfVwiIFxuICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICBzaGlmdE5ld2xpbmVUb2s6IChydWxlLCB0b2tlbnMsIHRvaywgY29uZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCBjb25kXG4gICAgICAgICAgIGlmIHRva2Vuc1sxXT8uY29sID09IHRvay5jb2xcbiAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgcnVsZSwgdG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG4gICAgIyBhZGRzIG5hbWUgdG9rZW5zIHRvIGZ1bmN0aW9ucyB0aGF0IGFyZSB2YWx1ZXMgaW4gY2xhc3Mgb2JqZWN0c1xuICAgIFxuICAgIG5hbWVNZXRob2RzOiAobXRoZHMpIC0+XG4gXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgaWYgbmFtZSA9IG0ua2V5dmFsPy5rZXk/LnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5rZXl2YWwudmFsPy5mdW5jP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6bmFtZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIGZ1bmN0aW9uIGZvciBtZXRob2Q/JyBuYW1lLCBtXG4gICAgICAgIG10aGRzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICAjIGVhdHMgZWl0aGVyIHRva2VucyB0byB0aGUgcmlnaHQgb2YgJ3RoZW4nIHRva2Vuc1xuICAgICMgb3Igb2YgdGhlIG5leHQgYmxvY2tcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSBpbiBbJ2Jsb2NrJyAnbmwnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdlbXB0eSB0aGVuISdcbiAgICAgICAgICAgICAgICB0aG4gPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICd0aGVuJ1xuICAgICAgICAgICAgICAgIHRobiA9IEBleHBzIGlkLCB0b2tlbnMsICdubCdcbiAgICAgICAgICAgICAgICBAcG9wICd0aGVuJ1xuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdGhuID0gQGV4cHMgaWQsIGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuOiBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZlcmIgJ25vIHRoZW4gYW5kIG5vIGJsb2NrIGFmdGVyICN7aWR9ISdcbiAgICAgICAgICAgICMgd2FybiBcIicje2lkfScgZXhwZWN0ZWQgdGhlbiBvciBibG9ja1wiXG4gICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgIyBlaXRoZXIgZWF0cyBibG9jayB0b2tlbnNcbiAgICAjIG9yIHVudGlsIG5leHQgbmV3bGluZVxuICAgICMgdXNlZCBmb3IgdGhpbmdzIHRoYXQgZG9lc24ndCBleHBlY3QgJ3RoZW4nIHdoZW4gY29udGludWVkIGluIHNhbWUgbGluZVxuICAgICMgICAtIGZ1bmN0aW9uIGJvZHlcbiAgICAjICAgLSBjYWxsIGFyZ3VtZW50c1xuICAgICMgICAtIHRyeSwgY2F0Y2gsIGZpbmFsbHlcbiAgICAjICAgLSBlbHNlXG4gICAgIyAgIC0gcmV0dXJuXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBAdmVyYiAnYmxvY2sgbmV4dCB0b2tlbiB0eXBlJyB0b2tlbnNbMF0/LnR5cGUgXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuXG4gICAgICAgIEBwdXNoICfilrgnK2lkXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBAcG9wICfilrgnK2lkXG5cbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgIFxuICAgIHNoZWFwUHVzaDogKHR5cGUsIHRleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXAucHVzaCB0eXBlOnR5cGUsIHRleHQ6dGV4dFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgIHNoZWFwUG9wOiAobSwgdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvcHBlZCA9IEBzaGVhcC5wb3AoKVxuICAgICAgICBpZiBwb3BwZWQudGV4dCAhPSB0IGFuZCBwb3BwZWQudGV4dCAhPSBrc3RyLnN0cmlwKHQsIFwiJ1wiKSB0aGVuIGVycm9yICd3cm9uZyBwb3A/JyBwb3BwZWQudGV4dCwgdFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAsIHBvcHBlZCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuICAgIHB1c2g6IChub2RlKSAtPlxuXG4gICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgbm9kZSBpZiBAZGVidWdcbiAgICAgICAgQHN0YWNrLnB1c2ggbm9kZVxuICAgICAgICBAc2hlYXBQdXNoICdzdGFjaycgbm9kZVxuXG4gICAgcG9wOiAobikgLT5cbiAgICAgICAgcCA9IEBzdGFjay5wb3AoKVxuICAgICAgICBAc2hlYXBQb3AgJ3N0YWNrJyBwXG4gICAgICAgIGlmIHAgIT0gblxuICAgICAgICAgICAgZXJyb3IgXCJ1bmV4cGVjdGVkIHBvcCFcIiBwLCBuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIHAsIChzKSAtPiBXMSB3MSBzXG5cbiAgICB2ZXJiOiAtPiBpZiBAdmVyYm9zZSB0aGVuIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHMgXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee
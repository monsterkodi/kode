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
        var b, block, blocked, colon, e, es, last, nl, numTokens, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
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
            last = lastLineCol(e);
            while (((ref9 = (ref10 = tokens[0]) != null ? ref10.text : void 0) === 'if' || ref9 === 'for' || ref9 === 'while') && ((ref11 = this.stack.slice(-1)[0]) !== '▸args') && last.line === tokens[0].line) {
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
            } else if (nxt.type === 'dots') {
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
            thn = this.exps(id, block.tokens);
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
            this.verb('no then and no block after #{id}!');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0VBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsZUFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLEdBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztJQUp4Qjs7b0JBWUgsS0FBQSxHQUFPLFNBQUMsS0FBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULEdBQUEsR0FBTTtRQUVOLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFXLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFXLEtBQUssQ0FBQyxNQUFqQixDQUFYO1FBRU4sSUFBRyxJQUFDLENBQUEsR0FBSjtZQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFxQixHQUFyQixFQUFiOztlQUVBO1lBQUEsSUFBQSxFQUFLLEVBQUw7WUFDQSxJQUFBLEVBQUssR0FETDs7SUFYRzs7b0JBK0JQLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsSUFBZjtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxNQUFOLENBQVY7QUFBQSxtQkFB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MDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxueyBlbXB0eSwgdmFsaWQsIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSAgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQHJhdyAgICAgID0gQGtvZGUuYXJncy5yYXdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBwYXJzZTogKGJsb2NrKSAtPiAjIGNvbnZlcnQgYmxvY2sgdHJlZSB0byBhYnN0cmFjdCBzeW50YXggdHJlZVxuXG4gICAgICAgIEBzdGFjayA9IFtdXG4gICAgICAgIEBzaGVhcCA9IFtdXG5cbiAgICAgICAgYXN0ID0gW11cblxuICAgICAgICBhc3QgPSBhc3QuY29uY2F0IEBleHBzICd0bCcgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgaWYgQHJhdyB0aGVuIHByaW50Lm5vb24gJ3JhdyBhc3QnIGFzdFxuXG4gICAgICAgIHZhcnM6W10gXG4gICAgICAgIGV4cHM6YXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBsaXN0IG9mIGV4cHJlc3Npb25zXG4gICAgI1xuICAgICMgdGhlIGVudHJ5IHBvaW50IGZvciAuLi5cbiAgICAjICAgLSB0aGUgdGwgc2NvcGVcbiAgICAjICAgLSBjbGFzcyBhbmQgZnVuY3Rpb24gYm9kaWVzXG4gICAgIyAgIC0gYXJndW1lbnQgbGlzdHNcbiAgICAjICAgLSBhcnJheXMgYW5kIG9iamVjdHNcbiAgICAjICAgLSBwYXJlbnNcbiAgICAjICAgLSAuLi5cbiAgICAjIGVzc2VudGlhbGx5IGV2ZXJ5dGhpbmcgdGhhdCByZXByZXNlbnRzIGEgbGlzdCBvZiBzb21ldGhpbmdcblxuICAgIGV4cHM6IChydWxlLCB0b2tlbnMsIHN0b3ApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdleHBzJyBydWxlXG5cbiAgICAgICAgZXMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZycgICAgICAgICAgICAgICAgIHRoZW4gZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICdzd2l0Y2gnICd0aGVuJyAn4pa4ZWxzZScgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ10nICBcbiAgICAgICAgICAgICAgICB3aGVuICd7JyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnfSdcbiAgICAgICAgICAgICAgICB3aGVuICcoJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICB3aGVuICfilrhhcmdzJyAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICddOydcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnOycgIyBiYWlsIG91dCBmb3IgaW1wbGljaXQgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBydWxlICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gc3RvcCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgICBpZiBiIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RhY2sgdG9wXCIgQHN0YWNrIDsgYnJlYWsgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdG9wIGFuZCB0b2tlbnNbMF0udGV4dCA9PSBzdG9wIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RvcFwiIHN0b3AgOyBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcCBpbiBbJ25sJ11cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0IHdpdGggc3RvcCAje3N0b3B9IGJyZWFrIVwiXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydCBzdG9wOiN7c3RvcH0gYmxvY2s6XCIgYmxvY2tcblxuICAgICAgICAgICAgICAgIGJsb2NrZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgZXMgPSBlcy5jb25jYXQgQGV4cHMgJ2Jsb2NrJyBibG9jay50b2tlbnMgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgaWYgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQgcmVtYWluaW5nIGJsb2NrIHRva2VuczonIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdiZWZvcmUgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnVuc2hpZnQgYmxvY2sudG9rZW5zLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnZXhwcyBhZnRlciB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgY29tbWEgLCBhbmQgY29udGludWUuLi5cIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIGJsb2NrIGVuZCBubCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQsIGJyZWFrISdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaycgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKScgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uICknICAgICAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0IGluIFsnaW4nJ29mJ10gICBhbmQgcnVsZSA9PSAnZm9yIHZhbHMnICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gaW58b2YnICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnZXhwcyBubCBdIGluIGFycmF5JyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSBpbiBbJ+KWuGFyZ3MnICfilrhib2R5J10gb3Igc3RvcCAhPSAnbmwnXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgbmwgd2l0aCBzdG9wICN7c3RvcH0gaW4gI3tAc3RhY2tbLTFdfSAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCB3aXRoIHN0b3AgI3tzdG9wfVwiIHRva2VucyBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBubCA9IEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIChubyBzdG9wKSAuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIGNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCBlXG5cbiAgICAgICAgICAgIHdoaWxlICAgKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0/LnRleHQgaW4gWydpZicgJ2ZvcicgJ3doaWxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbGFzdC5saW5lID09IHRva2Vuc1swXS5saW5lXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgI3t0b2tlbnNbMF0udGV4dCB9VGFpbFwiIGUsIEBzdGFja1xuICAgICAgICAgICAgICAgICMgcHJpbnQudG9rZW5zICd0YWlsJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rZW5zWzBdLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICB0aGVuIGUgPSBAaWZUYWlsICAgIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgIHRoZW4gZSA9IEBmb3JUYWlsICAgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgdGhlbiBlID0gQHdoaWxlVGFpbCBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVzLnB1c2ggZVxuXG4gICAgICAgICAgICBpZiAgKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0/LnRleHQgaW4gWydpZicndGhlbicnZm9yJyd3aGlsZSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZXMubGVuZ3RoIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGJsb2NrZWQgYW5kXG4gICAgICAgICAgICAgICAgICAgIGxhc3QubGluZSA9PSB0b2tlbnNbMF0ubGluZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpZnx0aGVufGZvcnx3aGlsZScgOyBicmVhayBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICc7JyBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICd3aGVuJyAneyddXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIHNoaWZ0IGNvbG9uJyBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gY29sb24nIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5vIHRva2VuIGNvbnN1bWVkJyB0b2tlbnMgIyBoYXBwZW5zIGZvciB1bmJhbGFuY2VkIGNsb3NpbmcgXVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQHNoZWFwUG9wICdleHBzJyBydWxlXG4gICAgICAgIFxuICAgICAgICBlc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgc2luZ2xlIGV4cHJlc3Npb25cbiAgICAjXG4gICAgIyBleHByZXNzaW9uIGNhbiBiZSBhbnl0aGluZywgZnJvbSBzaW5nbGUgZGlnaXRzIHRvIHdob2xlIGNsYXNzZXMgXG4gICAgIyBidXQgaXQgaXMgYWx3YXlzIGEgc2luZ2xlIG9iamVjdFxuICAgICNcbiAgICAjIGFzc3VtZXMgdGhhdCB0aGUgaGFuZGxpbmcgb2YgbmV3bGluZXMgaXMgZG9uZSBzb21ld2hlcmUgZWxzZVxuICAgICMgc2tpcHMgb3ZlciBsZWFkaW5nIHNlbWljb2xvbnNcblxuICAgIGV4cDogKHRva2VucykgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgdG9rID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBsb2cgWTUgdzEgdG9rPy50ZXh0IGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHRvay50eXBlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIGJsb2NrIHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgd2hlbiAnbmwnICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgbmwgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICc7JyAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCA7IHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAna2V5d29yZCcgIyBkaXNwYXRjaCB0byBibG9jayBydWxlcyBpZGVudGlmaWVkIGJ5IGtleXdvcmRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgbm90IGluICc6JyAjIGFsbG93IGtleXdvcmRzIGFzIGtleXNcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgdGhlbiByZXR1cm4gQGNsYXNzICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICB0aGVuIHJldHVybiBAd2hlbiAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgdGhlbiByZXR1cm4gQHRyeSAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnaWYnIEBzdGFjayBpZiBAc3RhY2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAaWYgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuXG4gICAgICAgICMgaGVyZSBzdGFydHMgdGhlIGhhaXJ5IHBhcnQgOi0pXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICBlID0gdG9rXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGggICAgICAgICAgICAgICAgICAjIHJlcGVhdGVkbHkgY2FsbCByaHMgYW5kIGxocyB1bnRpbCBhbGwgdG9rZW5zIGFyZSBzd2FsbG93ZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBlID0gQHJocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIGZpcnN0LCB0cnkgdG8gZWF0IGFzIG11Y2ggdG9rZW5zIGFzIHBvc3NpYmxlIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgXCJyaHNcIiBlIGlmIEB2ZXJib3NlICAgIFxuXG4gICAgICAgICAgICBlID0gQGxocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIHNlZSwgaWYgd2UgY2FuIHVzZSB0aGUgcmVzdWx0IGFzIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiBzb21ldGhpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZVxuXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgaW4gJzsnXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBicmVhayBvbiA7J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBubyB0b2tlbiBjb25zdW1lZDogYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICAjIHJlY3Vyc2l2ZWx5IGJ1aWxkIHVwIHN0dWZmIHRoYXQgY2FuIGJlIGlkZW50aWZpZWQgYnkgbG9va2luZyBhdCB0aGUgbmV4dCB0b2tlbiBvbmx5OlxuICAgICNcbiAgICAjIGFueXRoaW5nIHRoYXQgb3BlbnMgYW5kIGNsb3Nlc1xuICAgICMgICAtIG9iamVjdHNcbiAgICAjICAgLSBhcnJheXNcbiAgICAjICAgLSBwYXJlbnNcbiAgICAjXG4gICAgIyBidXQgYWxzbyBcbiAgICAjICAgLSBzaW5nbGUgb3BlcmFuZCBvcGVyYXRpb25zXG4gICAgXG4gICAgcmhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAncmhzJyAncmhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdW5zcGFjZWQgPSAobGxjID0gbGFzdExpbmVDb2woZSkpLmNvbCA9PSBueHQuY29sIGFuZCBsbGMubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGlmIG54dC50ZXh0IGluICcoeycgYW5kIGUudHlwZSBpbiBbJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ251bScgJ3JlZ2V4J11cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICfilrhhcmcnIGFuZCBueHQudHlwZSA9PSAnb3AnIHRoZW4gQHZlcmIgJ3JocyBicmVhayBmb3Ig4pa4YXJnJzsgYnJlYWtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6JyBhbmQgQHN0YWNrWy0xXSBpbiBbJ2NsYXNzJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ3JocyBpcyBjbGFzcyBtZXRob2QnIHRva2Vuc1suLjIwXSBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kICh1bnNwYWNlZCBvciAnPycgbm90IGluIEBzdGFjaylcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdyaHMgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBAdmVyYiAnaW5jb25kJyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0P1xuICAgICAgICAgICAgICAgIGlmICAgICAgZS50ZXh0ID09ICdbJyAgIHRoZW4gZSA9IEBhcnJheSAgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJygnICAgdGhlbiBlID0gQHBhcmVucyAgICAgICAgICBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAneycgICB0aGVuIGUgPSBAY3VybHkgICAgICAgICAgIGUsIHRva2VucyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAnbm90JyB0aGVuIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysnJy0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ251bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgKy0gbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZS50ZXh0ID09ICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0ID0gJy0nICsgbnh0LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQuY29sIC09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50eXBlIG5vdCBpbiBbJ3ZhciddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IgJ3dyb25nIHJocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPyBicmVhayEgc3RhY2s6I3tAc3RhY2t9IG54dDpcIiBbbnh0XSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSAjIGlmIGUgaXMgbm90IGEgdG9rZW4gYW55bW9yZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gICAgYW5kIHVuc3BhY2VkICAgICAgICB0aGVuIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpOyBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCcgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgY2FsbCBhcnJheSBlbmQnOyAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgICAgYW5kIG54dC50ZXh0ID09ICd9JyB0aGVuIEB2ZXJiICdyaHMgY3VybHkgZW5kJzsgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBhcnJheSBlbmQnOyAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyAgICBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBbIGFycmF5IGVuZCcgbnh0OyAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwicmhzIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAncmhzIG5vIHRva2VuIGNvbnN1bWVkLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgICMgaWYgbnh0ID0gdG9rZW5zWzBdXG4jICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBpZiBlbXB0eSBAc3RhY2tcbiMgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgQHZlcmIgJ3JocyBlbXB0eSBzdGFjayBueHQnIG54dFxuIyAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgICAgICAjIEB2ZXJiICdyaHMgaXMgbGFzdCBtaW51dGUgaW5kZXggb2YgbGhzJyBlXG4gICAgICAgICAgICAgICAgICAgICMgZSA9IEBpbmRleCBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ3JocycgJ3JocydcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyByZWN1cnNpdmVseSBidWlsZCB1cCBzdHVmZiB0aGF0IGNhbiBiZSBpZGVudGlmaWVkIGJ5IGxvb2tpbmcgYXQgdGhlIG5leHQgdG9rZW4gKmFuZCogd2hhdCB3YXMganVzdCBwYXJzZWRcbiAgICAjXG4gICAgIyBhbnl0aGluZyB0aGF0IGNhbiBiZSBjaGFpbmVkXG4gICAgIyAgIC0gb3BlcmF0aW9uc1xuICAgICMgICAtIHByb3BlcnRpZXNcbiAgICAjICAgLSBjYWxsc1xuICAgIFxuICAgIGxoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2xocycgJ2xocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxhc3QgID0gbGFzdExpbmVDb2wgIGVcbiAgICAgICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGVcbiAgICAgICAgICAgIHVuc3BhY2VkID0gbGFzdC5jb2wgPT0gbnh0LmNvbCBhbmQgbGFzdC5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgdGhlbiBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICB3aGVuICd7JyB0aGVuIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLnRleHQgPT0gJ0AnIFxuICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdibG9jaycgYW5kIEBzdGFja1stMV0gPT0gJ2lmJyBvciBueHQudGV4dCA9PSAndGhlbicgb3Igbnh0LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZSA9IEB0aGlzIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAgICAgIG54dC50ZXh0ID09ICcuJyAgICB0aGVuIGUgPSBAcHJvcCAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgdGhlbiBlID0gQHNsaWNlICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ2VhY2gnIHRoZW4gZSA9IEBlYWNoICAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB1bnNwYWNlZCAjIGFuZCB0b2tlbnNbMV0/LnRleHQgaW4gJyhbLidcblxuICAgICAgICAgICAgICAgICAgICBlID0gQGFzc2VydCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBxbXJrb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kIGUucW1ya29wXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZSA9IEBxbXJrY29sb24gZS5xbXJrb3AsIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlID09ICdvcCcgYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nICdub3QnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdPy5zdGFydHNXaXRoICdvcCcgYW5kIEBzdGFja1stMV0gIT0gJ29wPSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBzdG9wIG9uIG9wZXJhdGlvbicgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdpbj8nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgc3RvcCBvbiBpbj8nIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2Ygb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPiBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy1cXHMnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZnVuYycgYW5kIGUucGFyZW5zXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBhcmdzIGZvciBmdW5jJyBlXG4gICAgICAgICAgICAgICAgZSA9IEBmdW5jIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB1bnNwYWNlZCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ25vdCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaW4nXG5cbiAgICAgICAgICAgICAgICBlID0gb3BlcmF0aW9uOlxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjp0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICByaHM6QGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VkIGFuZCAobnh0LmxpbmUgPT0gbGFzdC5saW5lIG9yIChueHQuY29sID4gZmlyc3QuY29sIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJ10pKSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnaWYnICd0aGVuJyAnZWxzZScgJ2JyZWFrJyAnY29udGludWUnICdpbicgJ29mJyAnZm9yJyAnd2hpbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIChlLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nICdpZicgJ3RoZW4nICdlbHNlJyAnZm9yJyAnd2hpbGUnXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5hcnJheSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub2JqZWN0IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5rZXl2YWwgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9wZXJhdGlvbiBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuaW5jb25kIGFuZFxuICAgICAgICAgICAgICAgICAgICBlLmNhbGw/LmNhbGxlZT8udGV4dCBub3QgaW4gWydkZWxldGUnJ25ldycndHlwZW9mJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIGUnIGUsIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIGZpcnN0JyBmaXJzdCBcbiAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIGUudGV4dCBub3QgaW4gWydbJyAnKCddXG4gICAgICAgICAgICAgICAgaWYgc3BhY2VkIGFuZCB0b2tlbnNbMV0/LmNvbCA9PSBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy0gb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwibGhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2xocyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdsaHMnICdsaHMnICAgICAgIFxuICAgICAgICBlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICAjIHJ1bGVzIGluIHBhcnNlciBzaG91bGQgdXNlIHRoaXMgaW5zdGVhZCBvZiBjYWxsaW5nIHNoaWZ0TmV3bGluZSBkaXJlY3RseVxuICAgIFxuICAgIHNoaWZ0Q2xvc2U6IChydWxlLCB0ZXh0LCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5zaGlmdCgpIFxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBydWxlLCB0b2tlbnNcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgICAgIGVycm9yIFwicGFyc2Uuc2hpZnRDbG9zZTogJyN7cnVsZX0nIGV4cGVjdGVkIGNsb3NpbmcgJyN7dGV4dH0nXCJcbiAgICAgICAgcHJpbnQudG9rZW5zIFwic2hpZnRDbG9zZSBtaXNzaW5nIGNsb3NlICcje3RleHR9J1wiIHRva2Vuc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgIyB0aGlzIHNob3VsZCBiZSB0aGUgb25seSBtZXRob2QgdG8gcmVtb3ZlIG5ld2xpbmVzIGZyb20gdGhlIHRva2Vuc1xuICAgICMgaXQgaXMgdmVyeSBpbXBvcnRhbnQgdG8ga2VlcCB0aGUgbmV3bGluZXMgYXMgYSByZWN1cnNpb24gYnJlYWtlciB1bnRpbCB0aGUgbGFzdCBwb3NzaWJsZSBtb21lbnRcbiAgICAjIHVzaW5nIHRoaXMgbWV0aG9kIG1ha2VzIGl0IG11Y2ggZWFzaWVyIHRvIGRldGVybWluZSB3aGVuIG9uZSBnZXRzIHN3YWxsd2VkIHRvbyBlYXJseVxuICAgIFxuICAgIHNoaWZ0TmV3bGluZTogKHJ1bGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1ZyB0aGVuIGxvZyBNMyB5NSBcIiDil4IgI3t3MSBydWxlfVwiIFxuICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICBzaGlmdE5ld2xpbmVUb2s6IChydWxlLCB0b2tlbnMsIHRvaywgY29uZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCBjb25kXG4gICAgICAgICAgIGlmIHRva2Vuc1sxXT8uY29sID09IHRvay5jb2xcbiAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgcnVsZSwgdG9rZW5zXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG4gICAgIyBhZGRzIG5hbWUgdG9rZW5zIHRvIGZ1bmN0aW9ucyB0aGF0IGFyZSB2YWx1ZXMgaW4gY2xhc3Mgb2JqZWN0c1xuICAgIFxuICAgIG5hbWVNZXRob2RzOiAobXRoZHMpIC0+XG4gXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgaWYgbmFtZSA9IG0ua2V5dmFsPy5rZXk/LnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5rZXl2YWwudmFsPy5mdW5jP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6bmFtZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIGZ1bmN0aW9uIGZvciBtZXRob2Q/JyBuYW1lLCBtXG4gICAgICAgIG10aGRzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICAjIGVhdHMgZWl0aGVyIHRva2VucyB0byB0aGUgcmlnaHQgb2YgJ3RoZW4nIHRva2Vuc1xuICAgICMgb3Igb2YgdGhlIG5leHQgYmxvY2tcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSBpbiBbJ2Jsb2NrJyAnbmwnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdlbXB0eSB0aGVuISdcbiAgICAgICAgICAgICAgICB0aG4gPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICd0aGVuJ1xuICAgICAgICAgICAgICAgIHRobiA9IEBleHBzIGlkLCB0b2tlbnMsICdubCdcbiAgICAgICAgICAgICAgICBAcG9wICd0aGVuJ1xuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdGhuID0gQGV4cHMgaWQsIGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuOiBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICd1bnNoaWZ0JyBibG9jay50b2tlbnNbLTFdXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ3RoZW4gYWZ0ZXIgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdmVyYiAnbm8gdGhlbiBhbmQgbm8gYmxvY2sgYWZ0ZXIgI3tpZH0hJ1xuICAgICAgICAgICAgIyB3YXJuIFwiJyN7aWR9JyBleHBlY3RlZCB0aGVuIG9yIGJsb2NrXCJcbiAgICAgICAgXG4gICAgICAgIHRoblxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICAjIGVpdGhlciBlYXRzIGJsb2NrIHRva2Vuc1xuICAgICMgb3IgdW50aWwgbmV4dCBuZXdsaW5lXG4gICAgIyB1c2VkIGZvciB0aGluZ3MgdGhhdCBkb2Vzbid0IGV4cGVjdCAndGhlbicgd2hlbiBjb250aW51ZWQgaW4gc2FtZSBsaW5lXG4gICAgIyAgIC0gZnVuY3Rpb24gYm9keVxuICAgICMgICAtIGNhbGwgYXJndW1lbnRzXG4gICAgIyAgIC0gdHJ5LCBjYXRjaCwgZmluYWxseVxuICAgICMgICAtIGVsc2VcbiAgICAjICAgLSByZXR1cm5cbiAgICBcbiAgICBibG9jazogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICAjIEB2ZXJiICdibG9jayBuZXh0IHRva2VuIHR5cGUnIHRva2Vuc1swXT8udHlwZSBcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBvcmlnVG9rZW5zID0gdG9rZW5zXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbmwgPSAnbmwnXG5cbiAgICAgICAgQHB1c2ggJ+KWuCcraWRcbiAgICAgICAgZXhwcyA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG4gICAgICAgIEBwb3AgJ+KWuCcraWRcblxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAndW5zaGlmdCcgYmxvY2sudG9rZW5zWy0xXVxuICAgICAgICAgICAgICAgIG9yaWdUb2tlbnMudW5zaGlmdCBibG9jay50b2tlbnMucG9wKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnYmxvY2sgYWZ0ZXIgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIG9yaWdUb2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzdWJCbG9ja3M6ICh0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBzdWJicyA9IFtbXV1cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1stMV0udHlwZSA9PSAnYmxvY2snIGFuZCB0b2tlbnNbLTFdLnRva2Vuc1swXS50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgZWxzZUJsb2NrID0gdG9rZW5zLnBvcCgpXG4gICAgICAgICAgICBlbHNlVG9rZW5zID0gZWxzZUJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgZWxzZVRva2Vuc1swXS50ZXh0ID0gJ2Vsc2UnXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vuc1swXS50ZXh0ID0gJ2Vsc2UnXG4gICAgICAgICAgICByZXR1cm4gW3Rva2Vuc11cbiAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB2YWxpZCB0b2tlbnNcbiAgICAgICAgICAgIHQgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdC50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICBzdWJicy5wdXNoIFtdXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1swXS50ZXh0ID0gJ2Vsc2UnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3ViYnNbLTFdLnB1c2ggdFxuXG4gICAgICAgIHN1YmJzLnB1c2ggZWxzZVRva2VucyBpZiBlbHNlVG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN1YmJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgXG4gICAgc2hlYXBQdXNoOiAodHlwZSwgdGV4dCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcC5wdXNoIHR5cGU6dHlwZSwgdGV4dDp0ZXh0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgc2hlYXBQb3A6IChtLCB0KSAtPlxuICAgICAgICBcbiAgICAgICAgcG9wcGVkID0gQHNoZWFwLnBvcCgpXG4gICAgICAgIGlmIHBvcHBlZC50ZXh0ICE9IHQgYW5kIHBvcHBlZC50ZXh0ICE9IGtzdHIuc3RyaXAodCwgXCInXCIpIHRoZW4gZXJyb3IgJ3dyb25nIHBvcD8nIHBvcHBlZC50ZXh0LCB0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCwgcG9wcGVkIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEBkZWJ1Z1xuICAgICAgICBAc3RhY2sucHVzaCBub2RlXG4gICAgICAgIEBzaGVhcFB1c2ggJ3N0YWNrJyBub2RlXG5cbiAgICBwb3A6IChuKSAtPlxuICAgICAgICBwID0gQHN0YWNrLnBvcCgpXG4gICAgICAgIEBzaGVhcFBvcCAnc3RhY2snIHBcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VcbiJdfQ==
//# sourceURL=../coffee/parse.coffee
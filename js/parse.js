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

    Parse.prototype.subBlocks = function(block) {
        var elseBlock, elseTokens, subbs, t, tokens;
        subbs = [[]];
        tokens = block.tokens;
        if (tokens.slice(-1)[0].type === 'block' && tokens.slice(-1)[0].tokens[0].text === 'then') {
            elseBlock = tokens.pop();
            elseTokens = elseBlock.tokens;
            elseTokens[0].text = 'else';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0VBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQThDLE9BQUEsQ0FBUSxTQUFSLENBQTlDLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQiwrQkFBaEIsRUFBOEI7O0FBRXhCO0lBRUMsZUFBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLEdBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztJQUp4Qjs7b0JBWUgsS0FBQSxHQUFPLFNBQUMsS0FBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULEdBQUEsR0FBTTtRQUVOLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFXLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFXLEtBQUssQ0FBQyxNQUFqQixDQUFYO1FBRU4sSUFBRyxJQUFDLENBQUEsR0FBSjtZQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFxQixHQUFyQixFQUFiOztlQUVBO1lBQUEsSUFBQSxFQUFLLEVBQUw7WUFDQSxJQUFBLEVBQUssR0FETDs7SUFYRzs7b0JBK0JQLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsSUFBZjtBQUVGLFlBQUE7UUFBQSxJQUFVLEtBQUEsQ0FBTSxNQUFOLENBQVY7QUFBQSxtQkFB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Q0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsTUFBcEIsRUFBQTs7SUFKTTs7b0JBWVYsSUFBQSxHQUFNLFNBQUMsSUFBRDtRQUVGLElBQTRCLElBQUMsQ0FBQSxLQUE3QjtZQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsSUFBcEIsRUFBQTs7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO2VBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxPQUFYLEVBQW1CLElBQW5CO0lBSkU7O29CQU1OLEdBQUEsR0FBSyxTQUFDLENBQUQ7QUFDRCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBO1FBQ0osSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQWtCLENBQWxCO1FBQ0EsSUFBRyxDQUFBLEtBQUssQ0FBUjtZQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8saUJBQVAsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFESDs7UUFHQSxJQUFHLElBQUMsQ0FBQSxLQUFKO21CQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsQ0FBcEIsRUFBdUIsU0FBQyxDQUFEO3VCQUFPLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFOQzs7b0JBU0wsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIHZhbGlkLCBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sIH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBQYXJzZSAjIHRoZSBiYXNlIGNsYXNzIG9mIFBhcnNlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgICA9IEBrb2RlLmFyZ3MuZGVidWdcbiAgICAgICAgQHZlcmJvc2UgID0gQGtvZGUuYXJncy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgICA9IEBrb2RlLmFyZ3MucmF3XG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgcGFyc2U6IChibG9jaykgLT4gIyBjb252ZXJ0IGJsb2NrIHRyZWUgdG8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcblxuICAgICAgICBAc3RhY2sgPSBbXVxuICAgICAgICBAc2hlYXAgPSBbXVxuXG4gICAgICAgIGFzdCA9IFtdXG5cbiAgICAgICAgYXN0ID0gYXN0LmNvbmNhdCBAZXhwcyAndGwnIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICB2YXJzOltdIFxuICAgICAgICBleHBzOmFzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgbGlzdCBvZiBleHByZXNzaW9uc1xuICAgICNcbiAgICAjIHRoZSBlbnRyeSBwb2ludCBmb3IgLi4uXG4gICAgIyAgIC0gdGhlIHRsIHNjb3BlXG4gICAgIyAgIC0gY2xhc3MgYW5kIGZ1bmN0aW9uIGJvZGllc1xuICAgICMgICAtIGFyZ3VtZW50IGxpc3RzXG4gICAgIyAgIC0gYXJyYXlzIGFuZCBvYmplY3RzXG4gICAgIyAgIC0gcGFyZW5zXG4gICAgIyAgIC0gLi4uXG4gICAgIyBlc3NlbnRpYWxseSBldmVyeXRoaW5nIHRoYXQgcmVwcmVzZW50cyBhIGxpc3Qgb2Ygc29tZXRoaW5nXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwcycgcnVsZVxuXG4gICAgICAgIGVzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuICfilrhhcmcnICAgICAgICAgICAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAndGhlbicgJ+KWuGVsc2UnICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ1snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICddJyAgXG4gICAgICAgICAgICAgICAgd2hlbiAneycgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ30nXG4gICAgICAgICAgICAgICAgd2hlbiAnKCcgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJncycgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnXTsnXG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJzsnICMgYmFpbCBvdXQgZm9yIGltcGxpY2l0IGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gcnVsZSAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgZmFsc2VcblxuICAgICAgICAgICAgaWYgYiB0aGVuIEB2ZXJiIFwiZXhwcyBicmVhayBmb3IgI3t0b2tlbnNbMF0udGV4dH0gYW5kIHN0YWNrIHRvcFwiIEBzdGFjayA7IGJyZWFrIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RvcCBhbmQgdG9rZW5zWzBdLnRleHQgPT0gc3RvcCB0aGVuIEB2ZXJiIFwiZXhwcyBicmVhayBmb3IgI3t0b2tlbnNbMF0udGV4dH0gYW5kIHN0b3BcIiBzdG9wIDsgYnJlYWsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJ1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3AgaW4gWydubCddXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydCB3aXRoIHN0b3AgI3tzdG9wfSBicmVhayFcIlxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgc3RhcnQgc3RvcDoje3N0b3B9IGJsb2NrOlwiIGJsb2NrXG5cbiAgICAgICAgICAgICAgICBibG9ja2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IEBleHBzICdibG9jaycgYmxvY2sudG9rZW5zICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGlmIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kIHJlbWFpbmluZyBibG9jayB0b2tlbnM6JyBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnYmVmb3JlIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ2V4cHMgYWZ0ZXIgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgZW5kIHNoaWZ0IGNvbW1hICwgYW5kIGNvbnRpbnVlLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBibG9jayBlbmQgbmwgY29tbWEgLCBhbmQgY29udGludWUuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gYmxvY2snICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiApJyAgICAgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddICAgYW5kIHJ1bGUgPT0gJ2ZvciB2YWxzJyAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uIGlufG9mJyAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2V4cHMgbmwgXSBpbiBhcnJheScgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgd2l0aCBzdG9wJyBzdG9wXG4gICAgICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gaW4gWyfilrhhcmdzJyAn4pa4Ym9keSddIG9yIHN0b3AgIT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIG5sIHdpdGggc3RvcCAje3N0b3B9IGluICN7QHN0YWNrWy0xXX0gKGJyZWFrLCBidXQgZG9uJ3Qgc2hpZnQgbmwpXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBcImV4cHMgbmwgd2l0aCBzdG9wICN7c3RvcH1cIiB0b2tlbnMgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIFxuXG4gICAgICAgICAgICAgICAgbmwgPSBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCAobm8gc3RvcCkgLi4uXCIgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcuJyBhbmQgdG9rZW5zWzFdPy50eXBlID09ICd2YXInXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnZXhwcyBubCBuZXh0IGxpbmUgc3RhcnRzIHdpdGggLnZhciEnXG4gICAgICAgICAgICAgICAgICAgIGVzLnB1c2ggQHByb3AgZXMucG9wKCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBjb250aW51ZS4uLidcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZSA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBsYXN0ID0gbGFzdExpbmVDb2wgZVxuXG4gICAgICAgICAgICB3aGlsZSAgIChcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zWzBdPy50ZXh0IGluIFsnaWYnICdmb3InICd3aGlsZSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgQHN0YWNrWy0xXSBub3QgaW4gWyfilrhhcmdzJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIGxhc3QubGluZSA9PSB0b2tlbnNbMF0ubGluZVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzICN7dG9rZW5zWzBdLnRleHQgfVRhaWxcIiBlLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAjIHByaW50LnRva2VucyAndGFpbCcgdG9rZW5zXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRva2Vuc1swXS50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgdGhlbiBlID0gQGlmVGFpbCAgICBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICB0aGVuIGUgPSBAZm9yVGFpbCAgIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnIHRoZW4gZSA9IEB3aGlsZVRhaWwgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlcy5wdXNoIGVcblxuICAgICAgICAgICAgaWYgIChcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zWzBdPy50ZXh0IGluIFsnaWYnJ3RoZW4nJ2Zvcicnd2hpbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGVzLmxlbmd0aCBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG5vdCBibG9ja2VkIGFuZFxuICAgICAgICAgICAgICAgICAgICBsYXN0LmxpbmUgPT0gdG9rZW5zWzBdLmxpbmVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gaWZ8dGhlbnxmb3J8d2hpbGUnIDsgYnJlYWsgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnOycgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSBub3QgaW4gWyfilrhhcmdzJyAnd2hlbicgJ3snXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBzaGlmdCBjb2xvbicgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIGNvbG9uJyBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubyB0b2tlbiBjb25zdW1lZCcgdG9rZW5zICMgaGFwcGVucyBmb3IgdW5iYWxhbmNlZCBjbG9zaW5nIF1cbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwcycgcnVsZVxuICAgICAgICBcbiAgICAgICAgZXNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIHNpbmdsZSBleHByZXNzaW9uXG4gICAgI1xuICAgICMgZXhwcmVzc2lvbiBjYW4gYmUgYW55dGhpbmcsIGZyb20gc2luZ2xlIGRpZ2l0cyB0byB3aG9sZSBjbGFzc2VzIFxuICAgICMgYnV0IGl0IGlzIGFsd2F5cyBhIHNpbmdsZSBvYmplY3RcbiAgICAjXG4gICAgIyBhc3N1bWVzIHRoYXQgdGhlIGhhbmRsaW5nIG9mIG5ld2xpbmVzIGlzIGRvbmUgc29tZXdoZXJlIGVsc2VcbiAgICAjIHNraXBzIG92ZXIgbGVhZGluZyBzZW1pY29sb25zXG5cbiAgICBleHA6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIHRvayA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgbG9nIFk1IHcxIHRvaz8udGV4dCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0b2sudHlwZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdibG9jaycgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIG5sIHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgd2hlbiAnOycgICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgOyB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2tleXdvcmQnICMgZGlzcGF0Y2ggdG8gYmxvY2sgcnVsZXMgaWRlbnRpZmllZCBieSBrZXl3b3JkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0IG5vdCBpbiAnOicgIyBhbGxvdyBrZXl3b3JkcyBhcyBrZXlzXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICB0aGVuIHJldHVybiBAcmV0dXJuIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgIHRoZW4gcmV0dXJuIEBjbGFzcyAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICB0aGVuIHJldHVybiBAd2hpbGUgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgdGhlbiByZXR1cm4gQHdoZW4gICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAndHJ5JyAgICAgIHRoZW4gcmV0dXJuIEB0cnkgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICB0aGVuIHJldHVybiBAZm9yICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdpZicgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSBub3QgaW4gWyfilrhhcmdzJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2lmJyBAc3RhY2sgaWYgQHN0YWNrLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGlmIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICctPicgJz0+JyAgdGhlbiByZXR1cm4gQGZ1bmMgbnVsbCwgdG9rLCB0b2tlbnNcblxuICAgICAgICAjIGhlcmUgc3RhcnRzIHRoZSBoYWlyeSBwYXJ0IDotKVxuXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuICAgICAgICBcbiAgICAgICAgZSA9IHRva1xuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoICAgICAgICAgICAgICAgICAgIyByZXBlYXRlZGx5IGNhbGwgcmhzIGFuZCBsaHMgdW50aWwgYWxsIHRva2VucyBhcmUgc3dhbGxvd2VkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgZSA9IEByaHMgZSwgdG9rZW5zICAgICAgICAgICAgICAgIyBmaXJzdCwgdHJ5IHRvIGVhdCBhcyBtdWNoIHRva2VucyBhcyBwb3NzaWJsZSB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0IFwicmhzXCIgZSBpZiBAdmVyYm9zZSAgICBcblxuICAgICAgICAgICAgZSA9IEBsaHMgZSwgdG9rZW5zICAgICAgICAgICAgICAgIyBzZWUsIGlmIHdlIGNhbiB1c2UgdGhlIHJlc3VsdCBhcyB0aGUgbGVmdCBoYW5kIHNpZGUgb2Ygc29tZXRoaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCBcImxoc1wiIGUgaWYgQHZlcmJvc2VcblxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0IGluICc7J1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgYnJlYWsgb24gOydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aCAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgaW4gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgc2hpZnQgY29tbWEnXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgbm8gdG9rZW4gY29uc3VtZWQ6IGJyZWFrISdcbiAgICAgICAgICAgICAgICBicmVhayAjIGJhaWwgb3V0IGlmIG5vIHRva2VuIHdhcyBjb25zdW1lZFxuICAgICAgICAgICAgXG4gICAgICAgIHByaW50LmFzdCBcImV4cCAje2lmIGVtcHR5KEBzdGFjaykgdGhlbiAnRE9ORScgZWxzZSAnJ31cIiBlIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuICAgICAgICBlICAgICAgICBcblxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyByZWN1cnNpdmVseSBidWlsZCB1cCBzdHVmZiB0aGF0IGNhbiBiZSBpZGVudGlmaWVkIGJ5IGxvb2tpbmcgYXQgdGhlIG5leHQgdG9rZW4gb25seTpcbiAgICAjXG4gICAgIyBhbnl0aGluZyB0aGF0IG9wZW5zIGFuZCBjbG9zZXNcbiAgICAjICAgLSBvYmplY3RzXG4gICAgIyAgIC0gYXJyYXlzXG4gICAgIyAgIC0gcGFyZW5zXG4gICAgI1xuICAgICMgYnV0IGFsc28gXG4gICAgIyAgIC0gc2luZ2xlIG9wZXJhbmQgb3BlcmF0aW9uc1xuICAgIFxuICAgIHJoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ3JocycgJ3JocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHVuc3BhY2VkID0gKGxsYyA9IGxhc3RMaW5lQ29sKGUpKS5jb2wgPT0gbnh0LmNvbCBhbmQgbGxjLmxpbmUgPT0gbnh0LmxpbmVcbiAgICAgICAgICAgIHNwYWNlZCA9IG5vdCB1bnNwYWNlZFxuXG4gICAgICAgICAgICBpZiBueHQudGV4dCBpbiAnKHsnIGFuZCBlLnR5cGUgaW4gWydzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnICdudW0nICdyZWdleCddXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAn4pa4YXJnJyBhbmQgbnh0LnR5cGUgPT0gJ29wJyB0aGVuIEB2ZXJiICdyaHMgYnJlYWsgZm9yIOKWuGFyZyc7IGJyZWFrXG4gICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kIEBzdGFja1stMV0gaW4gWydjbGFzcyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdyaHMgaXMgY2xhc3MgbWV0aG9kJyB0b2tlbnNbLi4yMF0gaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonIGFuZCAodW5zcGFjZWQgb3IgJz8nIG5vdCBpbiBAc3RhY2spXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBlID0gQG9iamVjdCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMga2V5IG9mIChpbXBsaWNpdCkgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAa2V5dmFsIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnaW4nIGFuZCBAc3RhY2tbLTFdICE9ICdmb3InXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2luY29uZCcgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZSA9IEBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIGUudGV4dD9cbiAgICAgICAgICAgICAgICBpZiAgICAgIGUudGV4dCA9PSAnWycgICB0aGVuIGUgPSBAYXJyYXkgICAgICAgICAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICcoJyAgIHRoZW4gZSA9IEBwYXJlbnMgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ3snICAgdGhlbiBlID0gQGN1cmx5ICAgICAgICAgICBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ25vdCcgdGhlbiBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgaW4gWycrJyctJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCA9ICctJyArIG54dC50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnh0LmNvbCAtPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyArLSBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddICAgIGFuZCB1bnNwYWNlZCAgICAgICAgdGhlbiBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKTsgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIGNhbGwgYXJyYXkgZW5kJzsgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ3snICAgIGFuZCBueHQudGV4dCA9PSAnfScgdGhlbiBAdmVyYiAncmhzIGN1cmx5IGVuZCc7ICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgYXJyYXkgZW5kJzsgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgWyBhcnJheSBlbmQnIG54dDsgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LmFzdCBcInJocyBubyBueHQgbWF0Y2g/PyBzdGFjazoje0BzdGFja30gZTpcIiBlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPz8gbnh0OlwiIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBubyB0b2tlbiBjb25zdW1lZCwgYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICAjIGlmIG54dCA9IHRva2Vuc1swXVxuIyAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgaWYgZW1wdHkgQHN0YWNrXG4jICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEB2ZXJiICdyaHMgZW1wdHkgc3RhY2sgbnh0JyBueHRcbiMgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBpZiBueHQudGV4dCA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICAgICAgIyBAdmVyYiAncmhzIGlzIGxhc3QgbWludXRlIGluZGV4IG9mIGxocycgZVxuICAgICAgICAgICAgICAgICAgICAjIGUgPSBAaW5kZXggZSwgdG9rZW5zICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdyaHMnICdyaHMnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgcmVjdXJzaXZlbHkgYnVpbGQgdXAgc3R1ZmYgdGhhdCBjYW4gYmUgaWRlbnRpZmllZCBieSBsb29raW5nIGF0IHRoZSBuZXh0IHRva2VuICphbmQqIHdoYXQgd2FzIGp1c3QgcGFyc2VkXG4gICAgI1xuICAgICMgYW55dGhpbmcgdGhhdCBjYW4gYmUgY2hhaW5lZFxuICAgICMgICAtIG9wZXJhdGlvbnNcbiAgICAjICAgLSBwcm9wZXJ0aWVzXG4gICAgIyAgIC0gY2FsbHNcbiAgICBcbiAgICBsaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdsaHMnICdsaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sICBlXG4gICAgICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBlXG4gICAgICAgICAgICB1bnNwYWNlZCA9IGxhc3QuY29sID09IG54dC5jb2wgYW5kIGxhc3QubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIHdoZW4gJ1snIHRoZW4gbnh0LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgd2hlbiAneycgdGhlbiBueHQudGV4dCA9PSAnfSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIGlmIGJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS50ZXh0ID09ICdAJyBcbiAgICAgICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnYmxvY2snIGFuZCBAc3RhY2tbLTFdID09ICdpZicgb3Igbnh0LnRleHQgPT0gJ3RoZW4nIG9yIG54dC50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAdGhpcyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgICAgICBueHQudGV4dCA9PSAnLicgICAgdGhlbiBlID0gQHByb3AgICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIHRoZW4gZSA9IEBzbGljZSAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdlYWNoJyB0aGVuIGUgPSBAZWFjaCAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnPycgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdW5zcGFjZWQgIyBhbmQgdG9rZW5zWzFdPy50ZXh0IGluICcoWy4nXG5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBhc3NlcnQgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcW1ya29wIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonIGFuZCBlLnFtcmtvcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGUgPSBAcW1ya2NvbG9uIGUucW1ya29wLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBueHQudHlwZSA9PSAnb3AnIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnKysnICctLScgJysnICctJyAnbm90J10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRleHQgbm90IGluIFsnWycgJygnXSBhbmQgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJ+KWuGFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXT8uc3RhcnRzV2l0aCAnb3AnIGFuZCBAc3RhY2tbLTFdICE9ICdvcD0nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgc3RvcCBvbiBvcGVyYXRpb24nIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnaW4/J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIHN0b3Agb24gaW4/JyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCBlLnBhcmVuc1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgYXJncyBmb3IgZnVuYycgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJyBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdW5zcGFjZWQgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdub3QnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2luJ1xuXG4gICAgICAgICAgICAgICAgZSA9IG9wZXJhdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3I6dG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgcmhzOkBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgKG54dC5saW5lID09IGxhc3QubGluZSBvciAobnh0LmNvbCA+IGZpcnN0LmNvbCBhbmQgQHN0YWNrWy0xXSBub3QgaW4gWydpZiddKSkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJ2lmJyAndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZicgJ2ZvcicgJ3doaWxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudHlwZSBub3QgaW4gWydubCddIGFuZFxuICAgICAgICAgICAgICAgICAgICAoZS50eXBlIG5vdCBpbiBbJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ3JlZ2V4JyAncHVuY3QnICdjb21tZW50JyAnb3AnXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICAoZS50ZXh0IG5vdCBpbiBbJ251bGwnICd1bmRlZmluZWQnICdJbmZpbml0eScgJ05hTicgJ3RydWUnICdmYWxzZScgJ3llcycgJ25vJyAnaWYnICd0aGVuJyAnZWxzZScgJ2ZvcicgJ3doaWxlJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuYXJyYXkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9iamVjdCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUua2V5dmFsIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vcGVyYXRpb24gYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmluY29uZCBhbmRcbiAgICAgICAgICAgICAgICAgICAgZS5jYWxsPy5jYWxsZWU/LnRleHQgbm90IGluIFsnZGVsZXRlJyduZXcnJ3R5cGVvZiddIGFuZFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBlJyBlLCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgbnh0JyBueHRcbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBmaXJzdCcgZmlyc3QgXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBlLnRleHQgbm90IGluIFsnWycgJygnXVxuICAgICAgICAgICAgICAgIGlmIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPT0gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBvcCBpcyB1bmJhbGFuY2VkICstIGJyZWFrLi4uJyBlLCBueHQsIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImxocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdsaHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnbGhzJyAnbGhzJyAgICAgICBcbiAgICAgICAgZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgIyBydWxlcyBpbiBwYXJzZXIgc2hvdWxkIHVzZSB0aGlzIGluc3RlYWQgb2YgY2FsbGluZyBzaGlmdE5ld2xpbmUgZGlyZWN0bHlcbiAgICBcbiAgICBzaGlmdENsb3NlOiAocnVsZSwgdGV4dCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09IHRleHRcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuc2hpZnQoKSBcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09IHRleHRcbiAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgcnVsZSwgdG9rZW5zXG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICAgICBlcnJvciBcInBhcnNlLnNoaWZ0Q2xvc2U6ICcje3J1bGV9JyBleHBlY3RlZCBjbG9zaW5nICcje3RleHR9J1wiXG4gICAgICAgIHByaW50LnRva2VucyBcInNoaWZ0Q2xvc2UgbWlzc2luZyBjbG9zZSAnI3t0ZXh0fSdcIiB0b2tlbnNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgICMgdGhpcyBzaG91bGQgYmUgdGhlIG9ubHkgbWV0aG9kIHRvIHJlbW92ZSBuZXdsaW5lcyBmcm9tIHRoZSB0b2tlbnNcbiAgICAjIGl0IGlzIHZlcnkgaW1wb3J0YW50IHRvIGtlZXAgdGhlIG5ld2xpbmVzIGFzIGEgcmVjdXJzaW9uIGJyZWFrZXIgdW50aWwgdGhlIGxhc3QgcG9zc2libGUgbW9tZW50XG4gICAgIyB1c2luZyB0aGlzIG1ldGhvZCBtYWtlcyBpdCBtdWNoIGVhc2llciB0byBkZXRlcm1pbmUgd2hlbiBvbmUgZ2V0cyBzd2FsbHdlZCB0b28gZWFybHlcbiAgICBcbiAgICBzaGlmdE5ld2xpbmU6IChydWxlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAZGVidWcgdGhlbiBsb2cgTTMgeTUgXCIg4peCICN7dzEgcnVsZX1cIiBcbiAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgc2hpZnROZXdsaW5lVG9rOiAocnVsZSwgdG9rZW5zLCB0b2ssIGNvbmQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgY29uZFxuICAgICAgICAgICBpZiB0b2tlbnNbMV0/LmNvbCA9PSB0b2suY29sXG4gICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIHJ1bGUsIHRva2Vuc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuICAgICMgYWRkcyBuYW1lIHRva2VucyB0byBmdW5jdGlvbnMgdGhhdCBhcmUgdmFsdWVzIGluIGNsYXNzIG9iamVjdHNcbiAgICBcbiAgICBuYW1lTWV0aG9kczogKG10aGRzKSAtPlxuIFxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgICAgIGlmIG5hbWUgPSBtLmtleXZhbD8ua2V5Py50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIG0ua2V5dmFsLnZhbD8uZnVuYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUgPSB0eXBlOiduYW1lJyB0ZXh0Om5hbWVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nICdubyBmdW5jdGlvbiBmb3IgbWV0aG9kPycgbmFtZSwgbVxuICAgICAgICBtdGhkc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgXG4gICAgIyBlYXRzIGVpdGhlciB0b2tlbnMgdG8gdGhlIHJpZ2h0IG9mICd0aGVuJyB0b2tlbnNcbiAgICAjIG9yIG9mIHRoZSBuZXh0IGJsb2NrXG4gICAgXG4gICAgdGhlbjogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgaW4gWydibG9jaycgJ25sJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZW1wdHkgdGhlbiEnXG4gICAgICAgICAgICAgICAgdGhuID0gW11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcHVzaCAndGhlbidcbiAgICAgICAgICAgICAgICB0aG4gPSBAZXhwcyBpZCwgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICAgICAgQHBvcCAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRobiA9IEBleHBzIGlkLCBibG9jay50b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAndGhlbjogZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAndW5zaGlmdCcgYmxvY2sudG9rZW5zWy0xXVxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMudW5zaGlmdCBibG9jay50b2tlbnMucG9wKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuIGFmdGVyIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZlcmIgJ25vIHRoZW4gYW5kIG5vIGJsb2NrIGFmdGVyICN7aWR9ISdcbiAgICAgICAgICAgICMgd2FybiBcIicje2lkfScgZXhwZWN0ZWQgdGhlbiBvciBibG9ja1wiXG4gICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgIyBlaXRoZXIgZWF0cyBibG9jayB0b2tlbnNcbiAgICAjIG9yIHVudGlsIG5leHQgbmV3bGluZVxuICAgICMgdXNlZCBmb3IgdGhpbmdzIHRoYXQgZG9lc24ndCBleHBlY3QgJ3RoZW4nIHdoZW4gY29udGludWVkIGluIHNhbWUgbGluZVxuICAgICMgICAtIGZ1bmN0aW9uIGJvZHlcbiAgICAjICAgLSBjYWxsIGFyZ3VtZW50c1xuICAgICMgICAtIHRyeSwgY2F0Y2gsIGZpbmFsbHlcbiAgICAjICAgLSBlbHNlXG4gICAgIyAgIC0gcmV0dXJuXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBAdmVyYiAnYmxvY2sgbmV4dCB0b2tlbiB0eXBlJyB0b2tlbnNbMF0/LnR5cGUgXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgb3JpZ1Rva2VucyA9IHRva2Vuc1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuXG4gICAgICAgIEBwdXNoICfilrgnK2lkXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBAcG9wICfilrgnK2lkXG5cbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3Vuc2hpZnQnIGJsb2NrLnRva2Vuc1stMV1cbiAgICAgICAgICAgICAgICBvcmlnVG9rZW5zLnVuc2hpZnQgYmxvY2sudG9rZW5zLnBvcCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Jsb2NrIGFmdGVyIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyBvcmlnVG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgc3ViQmxvY2tzOiAoYmxvY2spIC0+XG4gICAgICAgIFxuICAgICAgICBzdWJicyA9IFtbXV1cbiAgICAgICAgXG4gICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWy0xXS50eXBlID09ICdibG9jaycgYW5kIHRva2Vuc1stMV0udG9rZW5zWzBdLnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICBlbHNlQmxvY2sgPSB0b2tlbnMucG9wKClcbiAgICAgICAgICAgIGVsc2VUb2tlbnMgPSBlbHNlQmxvY2sudG9rZW5zXG4gICAgICAgICAgICBlbHNlVG9rZW5zWzBdLnRleHQgPSAnZWxzZSdcbiAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB2YWxpZCB0b2tlbnNcbiAgICAgICAgICAgIHQgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdC50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICBzdWJicy5wdXNoIFtdXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1swXS50ZXh0ID0gJ2Vsc2UnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3ViYnNbLTFdLnB1c2ggdFxuXG4gICAgICAgIHN1YmJzLnB1c2ggZWxzZVRva2VucyBpZiBlbHNlVG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN1YmJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgXG4gICAgc2hlYXBQdXNoOiAodHlwZSwgdGV4dCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcC5wdXNoIHR5cGU6dHlwZSwgdGV4dDp0ZXh0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgc2hlYXBQb3A6IChtLCB0KSAtPlxuICAgICAgICBcbiAgICAgICAgcG9wcGVkID0gQHNoZWFwLnBvcCgpXG4gICAgICAgIGlmIHBvcHBlZC50ZXh0ICE9IHQgYW5kIHBvcHBlZC50ZXh0ICE9IGtzdHIuc3RyaXAodCwgXCInXCIpIHRoZW4gZXJyb3IgJ3dyb25nIHBvcD8nIHBvcHBlZC50ZXh0LCB0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCwgcG9wcGVkIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEBkZWJ1Z1xuICAgICAgICBAc3RhY2sucHVzaCBub2RlXG4gICAgICAgIEBzaGVhcFB1c2ggJ3N0YWNrJyBub2RlXG5cbiAgICBwb3A6IChuKSAtPlxuICAgICAgICBwID0gQHN0YWNrLnBvcCgpXG4gICAgICAgIEBzaGVhcFBvcCAnc3RhY2snIHBcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VcbiJdfQ==
//# sourceURL=../coffee/parse.coffee
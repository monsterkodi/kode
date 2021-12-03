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
        var llc, numTokens, nxt, ref1, ref2, ref3, ref4, ref5, ref6, ref7, spaced, unspaced;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseURBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxlQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLE9BQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsR0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnhCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO1FBRU4sR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsS0FBSyxDQUFDLE1BQWpCLENBQVg7UUFFTixJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQWEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXFCLEdBQXJCLEVBQWI7O2VBRUE7WUFBQSxJQUFBLEVBQUssRUFBTDtZQUNBLElBQUEsRUFBSyxHQURMOztJQVhHOztvQkErQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLElBQUMs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L0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxueyBlbXB0eSwgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEB2ZXJib3NlICA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAcmF3ICAgICAgPSBAa29kZS5hcmdzLnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cbiAgICAgICAgQHNoZWFwID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgdmFyczpbXSBcbiAgICAgICAgZXhwczphc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIGxpc3Qgb2YgZXhwcmVzc2lvbnNcbiAgICAjXG4gICAgIyB0aGUgZW50cnkgcG9pbnQgZm9yIC4uLlxuICAgICMgICAtIHRoZSB0bCBzY29wZVxuICAgICMgICAtIGNsYXNzIGFuZCBmdW5jdGlvbiBib2RpZXNcbiAgICAjICAgLSBhcmd1bWVudCBsaXN0c1xuICAgICMgICAtIGFycmF5cyBhbmQgb2JqZWN0c1xuICAgICMgICAtIHBhcmVuc1xuICAgICMgICAtIC4uLlxuICAgICMgZXNzZW50aWFsbHkgZXZlcnl0aGluZyB0aGF0IHJlcHJlc2VudHMgYSBsaXN0IG9mIHNvbWV0aGluZ1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cHMnIHJ1bGVcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJnJyAgICAgICAgICAgICAgICAgdGhlbiBlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgJ3N3aXRjaCcgJ3RoZW4nICfilrhlbHNlJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnXScgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICd9J1xuICAgICAgICAgICAgICAgIHdoZW4gJygnICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZ3MnICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ107J1xuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICc7JyAjIGJhaWwgb3V0IGZvciBpbXBsaWNpdCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuIHJ1bGUgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgIGlmIGIgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdGFjayB0b3BcIiBAc3RhY2sgOyBicmVhayBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0b3AgYW5kIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdG9wXCIgc3RvcCA7IGJyZWFrIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICBcbiAgICAgICAgICAgICAgICBpZiBzdG9wIGluIFsnbmwnXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgc3RhcnQgd2l0aCBzdG9wICN7c3RvcH0gYnJlYWshXCJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0IHN0b3A6I3tzdG9wfSBibG9jazpcIiBibG9ja1xuXG4gICAgICAgICAgICAgICAgYmxvY2tlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBlcyA9IGVzLmNvbmNhdCBAZXhwcyAnYmxvY2snIGJsb2NrLnRva2VucyAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBpZiBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJsb2NrIGVuZCByZW1haW5pbmcgYmxvY2sgdG9rZW5zOicgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ2JlZm9yZSB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMudW5zaGlmdCBibG9jay50b2tlbnMucG9wKClcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdhZnRlciB1bnNoaWZ0aW5nIGRhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgY29tbWEgLCBhbmQgY29udGludWUuLi5cIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIGJsb2NrIGVuZCBubCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQsIGJyZWFrISdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaycgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKScgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uICknICAgICAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0IGluIFsnaW4nJ29mJ10gICBhbmQgcnVsZSA9PSAnZm9yIHZhbHMnICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gaW58b2YnICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnZXhwcyBubCBdIGluIGFycmF5JyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSBpbiBbJ+KWuGFyZ3MnICfilrhib2R5J10gb3Igc3RvcCAhPSAnbmwnXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgbmwgd2l0aCBzdG9wICN7c3RvcH0gaW4gI3tAc3RhY2tbLTFdfSAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCB3aXRoIHN0b3AgI3tzdG9wfVwiIHRva2VucyBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBubCA9IEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIChubyBzdG9wKSAuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIGNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCBlXG5cbiAgICAgICAgICAgIHdoaWxlICAgKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0/LnRleHQgaW4gWydpZicgJ2ZvcicgJ3doaWxlJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbGFzdC5saW5lID09IHRva2Vuc1swXS5saW5lXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgI3t0b2tlbnNbMF0udGV4dCB9VGFpbFwiIGUsIEBzdGFja1xuICAgICAgICAgICAgICAgICMgcHJpbnQudG9rZW5zICd0YWlsJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rZW5zWzBdLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICB0aGVuIGUgPSBAaWZUYWlsICAgIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgIHRoZW4gZSA9IEBmb3JUYWlsICAgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgdGhlbiBlID0gQHdoaWxlVGFpbCBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVzLnB1c2ggZVxuXG4gICAgICAgICAgICBpZiAgKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnNbMF0/LnRleHQgaW4gWydpZicndGhlbicnZm9yJyd3aGlsZSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZXMubGVuZ3RoIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGJsb2NrZWQgYW5kXG4gICAgICAgICAgICAgICAgICAgIGxhc3QubGluZSA9PSB0b2tlbnNbMF0ubGluZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpZnx0aGVufGZvcnx3aGlsZScgOyBicmVhayBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICc7JyBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICd3aGVuJyAneyddXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIHNoaWZ0IGNvbG9uJyBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gY29sb24nIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5vIHRva2VuIGNvbnN1bWVkJyB0b2tlbnMgIyBoYXBwZW5zIGZvciB1bmJhbGFuY2VkIGNsb3NpbmcgXVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQHNoZWFwUG9wICdleHBzJyBydWxlXG4gICAgICAgIFxuICAgICAgICBlc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgc2luZ2xlIGV4cHJlc3Npb25cbiAgICAjXG4gICAgIyBleHByZXNzaW9uIGNhbiBiZSBhbnl0aGluZywgZnJvbSBzaW5nbGUgZGlnaXRzIHRvIHdob2xlIGNsYXNzZXMgXG4gICAgIyBidXQgaXQgaXMgYWx3YXlzIGEgc2luZ2xlIG9iamVjdFxuICAgICNcbiAgICAjIGFzc3VtZXMgdGhhdCB0aGUgaGFuZGxpbmcgb2YgbmV3bGluZXMgaXMgZG9uZSBzb21ld2hlcmUgZWxzZVxuICAgICMgc2tpcHMgb3ZlciBsZWFkaW5nIHNlbWljb2xvbnNcblxuICAgIGV4cDogKHRva2VucykgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgdG9rID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBsb2cgWTUgdzEgdG9rPy50ZXh0IGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHRvay50eXBlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIGJsb2NrIHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgd2hlbiAnbmwnICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgbmwgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICc7JyAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCA7IHRva2VuIGluIGV4cCFcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAna2V5d29yZCcgIyBkaXNwYXRjaCB0byBibG9jayBydWxlcyBpZGVudGlmaWVkIGJ5IGtleXdvcmRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgbm90IGluICc6JyAjIGFsbG93IGtleXdvcmRzIGFzIGtleXNcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgdGhlbiByZXR1cm4gQGNsYXNzICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICB0aGVuIHJldHVybiBAd2hlbiAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgdGhlbiByZXR1cm4gQHRyeSAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnaWYnIEBzdGFjayBpZiBAc3RhY2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAaWYgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuXG4gICAgICAgICMgaGVyZSBzdGFydHMgdGhlIGhhaXJ5IHBhcnQgOi0pXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICBlID0gdG9rXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGggICAgICAgICAgICAgICAgICAjIHJlcGVhdGVkbHkgY2FsbCByaHMgYW5kIGxocyB1bnRpbCBhbGwgdG9rZW5zIGFyZSBzd2FsbG93ZWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBlID0gQHJocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIGZpcnN0LCB0cnkgdG8gZWF0IGFzIG11Y2ggdG9rZW5zIGFzIHBvc3NpYmxlIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgXCJyaHNcIiBlIGlmIEB2ZXJib3NlICAgIFxuXG4gICAgICAgICAgICBlID0gQGxocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIHNlZSwgaWYgd2UgY2FuIHVzZSB0aGUgcmVzdWx0IGFzIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiBzb21ldGhpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZVxuXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgaW4gJzsnXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBicmVhayBvbiA7J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBubyB0b2tlbiBjb25zdW1lZDogYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICAjIHJlY3Vyc2l2ZWx5IGJ1aWxkIHVwIHN0dWZmIHRoYXQgY2FuIGJlIGlkZW50aWZpZWQgYnkgbG9va2luZyBhdCB0aGUgbmV4dCB0b2tlbiBvbmx5OlxuICAgICNcbiAgICAjIGFueXRoaW5nIHRoYXQgb3BlbnMgYW5kIGNsb3Nlc1xuICAgICMgICAtIG9iamVjdHNcbiAgICAjICAgLSBhcnJheXNcbiAgICAjICAgLSBwYXJlbnNcbiAgICAjXG4gICAgIyBidXQgYWxzbyBcbiAgICAjICAgLSBzaW5nbGUgb3BlcmFuZCBvcGVyYXRpb25zXG4gICAgXG4gICAgcmhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAncmhzJyAncmhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdW5zcGFjZWQgPSAobGxjID0gbGFzdExpbmVDb2woZSkpLmNvbCA9PSBueHQuY29sIGFuZCBsbGMubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGlmIG54dC50ZXh0IGluICcoeycgYW5kIGUudHlwZSBpbiBbJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ251bScgJ3JlZ2V4J11cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICfilrhhcmcnIGFuZCBueHQudHlwZSA9PSAnb3AnIHRoZW4gQHZlcmIgJ3JocyBicmVhayBmb3Ig4pa4YXJnJzsgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonIGFuZCAodW5zcGFjZWQgb3IgJz8nIG5vdCBpbiBAc3RhY2spXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBlID0gQG9iamVjdCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMga2V5IG9mIChpbXBsaWNpdCkgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAa2V5dmFsIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnaW4nIGFuZCBAc3RhY2tbLTFdICE9ICdmb3InXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2luY29uZCcgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZSA9IEBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIGUudGV4dD9cbiAgICAgICAgICAgICAgICBpZiAgICAgIGUudGV4dCA9PSAnWycgICB0aGVuIGUgPSBAYXJyYXkgICAgICAgICAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICcoJyAgIHRoZW4gZSA9IEBwYXJlbnMgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ3snICAgdGhlbiBlID0gQGN1cmx5ICAgICAgICAgICBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ25vdCcgdGhlbiBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgaW4gWycrJyctJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCA9ICctJyArIG54dC50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnh0LmNvbCAtPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyArLSBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddICAgIGFuZCB1bnNwYWNlZCAgICAgICAgdGhlbiBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKTsgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIGNhbGwgYXJyYXkgZW5kJzsgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ3snICAgIGFuZCBueHQudGV4dCA9PSAnfScgdGhlbiBAdmVyYiAncmhzIGN1cmx5IGVuZCc7ICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgYXJyYXkgZW5kJzsgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgWyBhcnJheSBlbmQnIG54dDsgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LmFzdCBcInJocyBubyBueHQgbWF0Y2g/PyBzdGFjazoje0BzdGFja30gZTpcIiBlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPz8gbnh0OlwiIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBubyB0b2tlbiBjb25zdW1lZCwgYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICAjIGlmIG54dCA9IHRva2Vuc1swXVxuIyAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgaWYgZW1wdHkgQHN0YWNrXG4jICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIEB2ZXJiICdyaHMgZW1wdHkgc3RhY2sgbnh0JyBueHRcbiMgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBpZiBueHQudGV4dCA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICAgICAgIyBAdmVyYiAncmhzIGlzIGxhc3QgbWludXRlIGluZGV4IG9mIGxocycgZVxuICAgICAgICAgICAgICAgICAgICAjIGUgPSBAaW5kZXggZSwgdG9rZW5zICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdyaHMnICdyaHMnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgcmVjdXJzaXZlbHkgYnVpbGQgdXAgc3R1ZmYgdGhhdCBjYW4gYmUgaWRlbnRpZmllZCBieSBsb29raW5nIGF0IHRoZSBuZXh0IHRva2VuICphbmQqIHdoYXQgd2FzIGp1c3QgcGFyc2VkXG4gICAgI1xuICAgICMgYW55dGhpbmcgdGhhdCBjYW4gYmUgY2hhaW5lZFxuICAgICMgICAtIG9wZXJhdGlvbnNcbiAgICAjICAgLSBwcm9wZXJ0aWVzXG4gICAgIyAgIC0gY2FsbHNcbiAgICBcbiAgICBsaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdsaHMnICdsaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sICBlXG4gICAgICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBlXG4gICAgICAgICAgICB1bnNwYWNlZCA9IGxhc3QuY29sID09IG54dC5jb2wgYW5kIGxhc3QubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIHdoZW4gJ1snIHRoZW4gbnh0LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgd2hlbiAneycgdGhlbiBueHQudGV4dCA9PSAnfSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIGlmIGJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS50ZXh0ID09ICdAJyBcbiAgICAgICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnYmxvY2snIGFuZCBAc3RhY2tbLTFdID09ICdpZicgb3Igbnh0LnRleHQgPT0gJ3RoZW4nIG9yIG54dC50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAdGhpcyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgICAgICBueHQudGV4dCA9PSAnLicgICAgdGhlbiBlID0gQHByb3AgICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIHRoZW4gZSA9IEBzbGljZSAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB1bnNwYWNlZCAjIGFuZCB0b2tlbnNbMV0/LnRleHQgaW4gJyhbLidcblxuICAgICAgICAgICAgICAgICAgICBlID0gQGFzc2VydCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBxbXJrb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kIGUucW1ya29wXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZSA9IEBxbXJrY29sb24gZS5xbXJrb3AsIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlID09ICdvcCcgYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nICdub3QnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdPy5zdGFydHNXaXRoICdvcCcgYW5kIEBzdGFja1stMV0gIT0gJ29wPSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBzdG9wIG9uIG9wZXJhdGlvbicgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdpbj8nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgc3RvcCBvbiBpbj8nIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2Ygb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPiBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy1cXHMnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZnVuYycgYW5kIGUucGFyZW5zXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBhcmdzIGZvciBmdW5jJyBlXG4gICAgICAgICAgICAgICAgZSA9IEBmdW5jIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB1bnNwYWNlZCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ25vdCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaW4nXG5cbiAgICAgICAgICAgICAgICBlID0gb3BlcmF0aW9uOlxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjp0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICByaHM6QGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VkIGFuZCAobnh0LmxpbmUgPT0gbGFzdC5saW5lIG9yIChueHQuY29sID4gZmlyc3QuY29sIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJ10pKSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnaWYnICd0aGVuJyAnZWxzZScgJ2JyZWFrJyAnY29udGludWUnICdpbicgJ29mJyAnZm9yJyAnd2hpbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIChlLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nICdpZicgJ3RoZW4nICdlbHNlJyAnZm9yJyAnd2hpbGUnXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5hcnJheSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub2JqZWN0IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5rZXl2YWwgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9wZXJhdGlvbiBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuaW5jb25kIGFuZFxuICAgICAgICAgICAgICAgICAgICBlLmNhbGw/LmNhbGxlZT8udGV4dCBub3QgaW4gWydkZWxldGUnJ25ldycndHlwZW9mJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIGUnIGUsIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIGZpcnN0JyBmaXJzdCBcbiAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIGUudGV4dCBub3QgaW4gWydbJyAnKCddXG4gICAgICAgICAgICAgICAgaWYgc3BhY2VkIGFuZCB0b2tlbnNbMV0/LmNvbCA9PSBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy0gb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwibGhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2xocyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdsaHMnICdsaHMnICAgICAgIFxuICAgICAgICBlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICAjIHJ1bGVzIGluIHBhcnNlciBzaG91bGQgdXNlIHRoaXMgaW5zdGVhZCBvZiBjYWxsaW5nIHNoaWZ0TmV3bGluZSBkaXJlY3RseVxuICAgIFxuICAgIHNoaWZ0Q2xvc2U6IChydWxlLCB0ZXh0LCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5zaGlmdCgpIFxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gdGV4dFxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBydWxlLCB0b2tlbnNcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgICAgIGVycm9yIFwicGFyc2Uuc2hpZnRDbG9zZTogJyN7cnVsZX0nIGV4cGVjdGVkIGNsb3NpbmcgJyN7dGV4dH0nXCJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgICMgdGhpcyBzaG91bGQgYmUgdGhlIG9ubHkgbWV0aG9kIHRvIHJlbW92ZSBuZXdsaW5lcyBmcm9tIHRoZSB0b2tlbnNcbiAgICAjIGl0IGlzIHZlcnkgaW1wb3J0YW50IHRvIGtlZXAgdGhlIG5ld2xpbmVzIGFzIGEgcmVjdXJzaW9uIGJyZWFrZXIgdW50aWwgdGhlIGxhc3QgcG9zc2libGUgbW9tZW50XG4gICAgIyB1c2luZyB0aGlzIG1ldGhvZCBtYWtlcyBpdCBtdWNoIGVhc2llciB0byBkZXRlcm1pbmUgd2hlbiBvbmUgZ2V0cyBzd2FsbHdlZCB0b28gZWFybHlcbiAgICBcbiAgICBzaGlmdE5ld2xpbmU6IChydWxlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAZGVidWcgdGhlbiBsb2cgTTMgeTUgXCIg4peCICN7dzEgcnVsZX1cIiBcbiAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgc2hpZnROZXdsaW5lVG9rOiAocnVsZSwgdG9rZW5zLCB0b2ssIGNvbmQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgY29uZFxuICAgICAgICAgICBpZiB0b2tlbnNbMV0/LmNvbCA9PSB0b2suY29sXG4gICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIHJ1bGUsIHRva2Vuc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuICAgICMgYWRkcyBuYW1lIHRva2VucyB0byBmdW5jdGlvbnMgdGhhdCBhcmUgdmFsdWVzIGluIGNsYXNzIG9iamVjdHNcbiAgICBcbiAgICBuYW1lTWV0aG9kczogKG10aGRzKSAtPlxuIFxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgICAgIGlmIG5hbWUgPSBtLmtleXZhbD8ua2V5Py50ZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIG0ua2V5dmFsLnZhbD8uZnVuYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0ua2V5dmFsLnZhbC5mdW5jLm5hbWUgPSB0eXBlOiduYW1lJyB0ZXh0Om5hbWVcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nICdubyBmdW5jdGlvbiBmb3IgbWV0aG9kPycgbmFtZSwgbVxuICAgICAgICBtdGhkc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgXG4gICAgIyBlYXRzIGVpdGhlciB0b2tlbnMgdG8gdGhlIHJpZ2h0IG9mICd0aGVuJyB0b2tlbnNcbiAgICAjIG9yIG9mIHRoZSBuZXh0IGJsb2NrXG4gICAgXG4gICAgdGhlbjogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgaW4gWydibG9jaycgJ25sJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZW1wdHkgdGhlbiEnXG4gICAgICAgICAgICAgICAgdGhuID0gW11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcHVzaCAndGhlbidcbiAgICAgICAgICAgICAgICB0aG4gPSBAZXhwcyBpZCwgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICAgICAgQHBvcCAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRobiA9IEBleHBzIGlkLCBibG9jay50b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAndGhlbjogZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB2ZXJiICdubyB0aGVuIGFuZCBubyBibG9jayBhZnRlciAje2lkfSEnXG4gICAgICAgICAgICAjIHdhcm4gXCInI3tpZH0nIGV4cGVjdGVkIHRoZW4gb3IgYmxvY2tcIlxuICAgICAgICBcbiAgICAgICAgdGhuXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgICMgZWl0aGVyIGVhdHMgYmxvY2sgdG9rZW5zXG4gICAgIyBvciB1bnRpbCBuZXh0IG5ld2xpbmVcbiAgICAjIHVzZWQgZm9yIHRoaW5ncyB0aGF0IGRvZXNuJ3QgZXhwZWN0ICd0aGVuJyB3aGVuIGNvbnRpbnVlZCBpbiBzYW1lIGxpbmVcbiAgICAjICAgLSBmdW5jdGlvbiBib2R5XG4gICAgIyAgIC0gY2FsbCBhcmd1bWVudHNcbiAgICAjICAgLSB0cnksIGNhdGNoLCBmaW5hbGx5XG4gICAgIyAgIC0gZWxzZVxuICAgICMgICAtIHJldHVyblxuICAgIFxuICAgIGJsb2NrOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgICMgQHZlcmIgJ2Jsb2NrIG5leHQgdG9rZW4gdHlwZScgdG9rZW5zWzBdPy50eXBlIFxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBubCA9ICdubCdcblxuICAgICAgICBAcHVzaCAn4pa4JytpZFxuICAgICAgICBleHBzID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgQHBvcCAn4pa4JytpZFxuXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICBcbiAgICBzaGVhcFB1c2g6ICh0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICBzaGVhcFBvcDogKG0sIHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3BwZWQgPSBAc2hlYXAucG9wKClcbiAgICAgICAgaWYgcG9wcGVkLnRleHQgIT0gdCBhbmQgcG9wcGVkLnRleHQgIT0ga3N0ci5zdHJpcCh0LCBcIidcIikgdGhlbiBlcnJvciAnd3JvbmcgcG9wPycgcG9wcGVkLnRleHQsIHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwLCBwb3BwZWQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQGRlYnVnXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcbiAgICAgICAgQHNoZWFwUHVzaCAnc3RhY2snIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgQHNoZWFwUG9wICdzdGFjaycgcFxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZVxuIl19
//# sourceURL=../coffee/parse.coffee
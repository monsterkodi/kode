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
        var b, block, blocked, colon, e, es, nl, numTokens, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
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
            while (((ref9 = tokens[0]) != null ? ref9.text : void 0) === 'if' && ((ref10 = this.stack.slice(-1)[0]) !== '▸args')) {
                this.verb('ifTail', e, this.stack);
                e = this.ifTail(e, tokens.shift(), tokens);
            }
            es.push(e);
            if (((ref11 = (ref12 = tokens[0]) != null ? ref12.text : void 0) === 'if' || ref11 === 'then') && es.length && !blocked) {
                this.verb('exps break on if|then');
                break;
            }
            if (((ref13 = tokens[0]) != null ? ref13.text : void 0) === ';') {
                if ((ref14 = this.stack.slice(-1)[0]) !== '▸args' && ref14 !== 'when' && ref14 !== '{') {
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
                        case 'for':
                            return this["for"](tok, tokens);
                        case 'while':
                            return this["while"](tok, tokens);
                        case 'return':
                            return this["return"](tok, tokens);
                        case 'switch':
                            return this["switch"](tok, tokens);
                        case 'when':
                            return this.when(tok, tokens);
                        case 'class':
                            return this["class"](tok, tokens);
                        case 'try':
                            return this["try"](tok, tokens);
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
                    e = this.object(e, tokens);
                } else {
                    this.verb('rhs is key of (implicit) object', e);
                    e = this.keyval(e, tokens);
                }
            } else if (nxt.type === 'keyword' && nxt.text === 'in' && this.stack.slice(-1)[0] !== 'for') {
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
        var b, first, last, numTokens, nxt, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, spaced, unspaced;
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
            } else if (spaced && (nxt.line === last.line || (nxt.col > first.col && ((ref9 = this.stack.slice(-1)[0]) !== 'if'))) && ((ref10 = nxt.text) !== 'if' && ref10 !== 'then' && ref10 !== 'else' && ref10 !== 'break' && ref10 !== 'continue' && ref10 !== 'in' && ref10 !== 'of') && ((ref11 = e.type) !== 'num' && ref11 !== 'single' && ref11 !== 'double' && ref11 !== 'triple' && ref11 !== 'regex' && ref11 !== 'punct' && ref11 !== 'comment' && ref11 !== 'op') && ((ref12 = e.text) !== 'null' && ref12 !== 'undefined' && ref12 !== 'Infinity' && ref12 !== 'NaN' && ref12 !== 'true' && ref12 !== 'false' && ref12 !== 'yes' && ref12 !== 'no' && ref12 !== 'if' && ref12 !== 'then' && ref12 !== 'else') && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && ((ref13 = (ref14 = e.call) != null ? (ref15 = ref14.callee) != null ? ref15.text : void 0 : void 0) !== 'delete' && ref13 !== 'new' && ref13 !== 'typeof') && indexOf.call(this.stack, '▸arg') < 0) {
                this.verb('lhs is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                this.verb('    is lhs of implicit call! nxt', nxt);
                this.verb('    is lhs first', first);
                e = this.call(e, tokens);
                break;
            } else if (((ref16 = nxt.text) === '+' || ref16 === '-') && ((ref17 = e.text) !== '[' && ref17 !== '(')) {
                if (spaced && ((ref18 = tokens[1]) != null ? ref18.col : void 0) === nxt.col + nxt.text.length) {
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
        var block, ref1, ref2, ref3, thn;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'then') {
            tokens.shift();
            this.push('then');
            thn = this.exps(id, tokens, 'nl');
            this.pop('then');
        } else if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref3 = tokens[0]) != null ? ref3.type : void 0) === 'nl') {
                tokens.shift();
            }
            tokens = block.tokens;
            thn = this.exps(id, tokens);
        } else {
            console.error('INTERNAL ERROR then or block expected');
        }
        if (block && block.tokens.length) {
            print.tokens('dangling then tokens', tokens);
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
            print.tokens('dangling block tokens', tokens);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseURBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxlQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLE9BQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsR0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnhCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO1FBRU4sR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsS0FBSyxDQUFDLE1BQWpCLENBQVg7UUFFTixJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQWEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXFCLEdBQXJCLEVBQWI7O2VBRUE7WUFBQSxJQUFBLEVBQUssRUFBTDtZQUNBLElBQUEsRUFBSyxHQURMOztJQVhHOztvQkErQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLElBQUMs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QiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSAgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQHJhdyAgICAgID0gQGtvZGUuYXJncy5yYXdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBwYXJzZTogKGJsb2NrKSAtPiAjIGNvbnZlcnQgYmxvY2sgdHJlZSB0byBhYnN0cmFjdCBzeW50YXggdHJlZVxuXG4gICAgICAgIEBzdGFjayA9IFtdXG4gICAgICAgIEBzaGVhcCA9IFtdXG5cbiAgICAgICAgYXN0ID0gW11cblxuICAgICAgICBhc3QgPSBhc3QuY29uY2F0IEBleHBzICd0bCcgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgaWYgQHJhdyB0aGVuIHByaW50Lm5vb24gJ3JhdyBhc3QnIGFzdFxuXG4gICAgICAgIHZhcnM6W10gXG4gICAgICAgIGV4cHM6YXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBsaXN0IG9mIGV4cHJlc3Npb25zXG4gICAgI1xuICAgICMgdGhlIGVudHJ5IHBvaW50IGZvciAuLi5cbiAgICAjICAgLSB0aGUgdGwgc2NvcGVcbiAgICAjICAgLSBjbGFzcyBhbmQgZnVuY3Rpb24gYm9kaWVzXG4gICAgIyAgIC0gYXJndW1lbnQgbGlzdHNcbiAgICAjICAgLSBhcnJheXMgYW5kIG9iamVjdHNcbiAgICAjICAgLSBwYXJlbnNcbiAgICAjICAgLSAuLi5cbiAgICAjIGVzc2VudGlhbGx5IGV2ZXJ5dGhpbmcgdGhhdCByZXByZXNlbnRzIGEgbGlzdCBvZiBzb21ldGhpbmdcblxuICAgIGV4cHM6IChydWxlLCB0b2tlbnMsIHN0b3ApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdleHBzJyBydWxlXG5cbiAgICAgICAgZXMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZycgICAgICAgICAgICAgICAgIHRoZW4gZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICdzd2l0Y2gnICd0aGVuJyAn4pa4ZWxzZScgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ10nICBcbiAgICAgICAgICAgICAgICB3aGVuICd7JyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnfSdcbiAgICAgICAgICAgICAgICB3aGVuICcoJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICB3aGVuICfilrhhcmdzJyAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICddOydcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnOycgIyBiYWlsIG91dCBmb3IgaW1wbGljaXQgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBydWxlICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gc3RvcCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgICBpZiBiIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RhY2sgdG9wXCIgQHN0YWNrIDsgYnJlYWsgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdG9wIGFuZCB0b2tlbnNbMF0udGV4dCA9PSBzdG9wIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RvcFwiIHN0b3AgOyBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcCBpbiBbJ25sJ11cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0IHdpdGggc3RvcCAje3N0b3B9IGJyZWFrIVwiXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydCBzdG9wOiN7c3RvcH0gYmxvY2s6XCIgYmxvY2tcblxuICAgICAgICAgICAgICAgIGJsb2NrZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgZXMgPSBlcy5jb25jYXQgQGV4cHMgJ2Jsb2NrJyBibG9jay50b2tlbnMgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgaWYgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQgcmVtYWluaW5nIGJsb2NrIHRva2VuczonIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdiZWZvcmUgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnVuc2hpZnQgYmxvY2sudG9rZW5zLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnYWZ0ZXIgdW5zaGlmdGluZyBkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgZW5kIHNoaWZ0IGNvbW1hICwgYW5kIGNvbnRpbnVlLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBibG9jayBlbmQgbmwgY29tbWEgLCBhbmQgY29udGludWUuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gQHZlcmIgJ2V4cHMgYnJlYWsgb24gYmxvY2snICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiApJyAgICAgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddICAgYW5kIHJ1bGUgPT0gJ2ZvciB2YWxzJyAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uIGlufG9mJyAgIDsgYnJlYWtcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2V4cHMgbmwgXSBpbiBhcnJheScgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgd2l0aCBzdG9wJyBzdG9wXG4gICAgICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gaW4gWyfilrhhcmdzJyAn4pa4Ym9keSddIG9yIHN0b3AgIT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIG5sIHdpdGggc3RvcCAje3N0b3B9IGluICN7QHN0YWNrWy0xXX0gKGJyZWFrLCBidXQgZG9uJ3Qgc2hpZnQgbmwpXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSBcImV4cHMgbmwgd2l0aCBzdG9wICN7c3RvcH1cIiB0b2tlbnMgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIFxuXG4gICAgICAgICAgICAgICAgbmwgPSBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCAobm8gc3RvcCkgLi4uXCIgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcuJyBhbmQgdG9rZW5zWzFdPy50eXBlID09ICd2YXInXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnZXhwcyBubCBuZXh0IGxpbmUgc3RhcnRzIHdpdGggLnZhciEnXG4gICAgICAgICAgICAgICAgICAgIGVzLnB1c2ggQHByb3AgZXMucG9wKCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBjb250aW51ZS4uLidcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZSA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnaWYnIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdpZlRhaWwnIGUsIEBzdGFja1xuICAgICAgICAgICAgICAgIGUgPSBAaWZUYWlsIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXMucHVzaCBlXG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgIHRva2Vuc1swXT8udGV4dCBpbiBbJ2lmJyd0aGVuJ10gYW5kIFxuICAgICAgICAgICAgICAgZXMubGVuZ3RoIGFuZCBcbiAgICAgICAgICAgICAgIG5vdCBibG9ja2VkXG4gICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gaWZ8dGhlbicgOyBicmVhayBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICc7JyBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIG5vdCBpbiBbJ+KWuGFyZ3MnICd3aGVuJyAneyddICNcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgc2hpZnQgY29sb24nIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBjb2xvbicgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbm8gdG9rZW4gY29uc3VtZWQnIHRva2VucyAjIGhhcHBlbnMgZm9yIHVuYmFsYW5jZWQgY2xvc2luZyBdXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAc2hlYXBQb3AgJ2V4cHMnIHJ1bGVcbiAgICAgICAgXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuICAgICNcbiAgICAjIGV4cHJlc3Npb24gY2FuIGJlIGFueXRoaW5nLCBmcm9tIHNpbmdsZSBkaWdpdHMgdG8gd2hvbGUgY2xhc3NlcyBcbiAgICAjIGJ1dCBpdCBpcyBhbHdheXMgYSBzaW5nbGUgb2JqZWN0XG4gICAgI1xuICAgICMgYXNzdW1lcyB0aGF0IHRoZSBoYW5kbGluZyBvZiBuZXdsaW5lcyBpcyBkb25lIHNvbWV3aGVyZSBlbHNlXG4gICAgIyBza2lwcyBvdmVyIGxlYWRpbmcgc2VtaWNvbG9uc1xuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnYmxvY2snICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBubCB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICB0aGVuIHJldHVybiBlcnJvciBcIklOVEVSTkFMIEVSUk9SOiB1bmV4cGVjdGVkIDsgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJyAjIGRpc3BhdGNoIHRvIGJsb2NrIHJ1bGVzIGlkZW50aWZpZWQgYnkga2V5d29yZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBub3QgaW4gJzonICMgYWxsb3cga2V5d29yZHMgYXMga2V5c1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICB0aGVuIHJldHVybiBAcmV0dXJuIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICB0aGVuIHJldHVybiBAY2xhc3MgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgdGhlbiByZXR1cm4gQHRyeSAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gbm90IGluIFsn4pa4YXJncyddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdpZicgQHN0YWNrIGlmIEBzdGFjay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBpZiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG5cbiAgICAgICAgIyBoZXJlIHN0YXJ0cyB0aGUgaGFpcnkgcGFydCA6LSlcblxuICAgICAgICBAc2hlYXBQdXNoICdleHAnIHRvay50ZXh0ID8gdG9rLnR5cGVcbiAgICAgICAgXG4gICAgICAgIGUgPSB0b2tcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aCAgICAgICAgICAgICAgICAgICMgcmVwZWF0ZWRseSBjYWxsIHJocyBhbmQgbGhzIHVudGlsIGFsbCB0b2tlbnMgYXJlIHN3YWxsb3dlZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGUgPSBAcmhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgZmlyc3QsIHRyeSB0byBlYXQgYXMgbXVjaCB0b2tlbnMgYXMgcG9zc2libGUgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCBcInJoc1wiIGUgaWYgQHZlcmJvc2UgICAgXG5cbiAgICAgICAgICAgIGUgPSBAbGhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgc2VlLCBpZiB3ZSBjYW4gdXNlIHRoZSByZXN1bHQgYXMgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHNvbWV0aGluZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgXCJsaHNcIiBlIGlmIEB2ZXJib3NlXG5cbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnOydcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGJyZWFrIG9uIDsnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGggICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0IGluICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIHNoaWZ0IGNvbW1hJ1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIG5vIHRva2VuIGNvbnN1bWVkOiBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWsgIyBiYWlsIG91dCBpZiBubyB0b2tlbiB3YXMgY29uc3VtZWRcbiAgICAgICAgICAgIFxuICAgICAgICBwcmludC5hc3QgXCJleHAgI3tpZiBlbXB0eShAc3RhY2spIHRoZW4gJ0RPTkUnIGVsc2UgJyd9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdleHAnIHRvay50ZXh0ID8gdG9rLnR5cGVcbiAgICAgICAgZSAgICAgICAgXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgcmVjdXJzaXZlbHkgYnVpbGQgdXAgc3R1ZmYgdGhhdCBjYW4gYmUgaWRlbnRpZmllZCBieSBsb29raW5nIGF0IHRoZSBuZXh0IHRva2VuIG9ubHk6XG4gICAgI1xuICAgICMgYW55dGhpbmcgdGhhdCBvcGVucyBhbmQgY2xvc2VzXG4gICAgIyAgIC0gb2JqZWN0c1xuICAgICMgICAtIGFycmF5c1xuICAgICMgICAtIHBhcmVuc1xuICAgICNcbiAgICAjIGJ1dCBhbHNvIFxuICAgICMgICAtIHNpbmdsZSBvcGVyYW5kIG9wZXJhdGlvbnNcbiAgICBcbiAgICByaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdyaHMnICdyaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1bnNwYWNlZCA9IChsbGMgPSBsYXN0TGluZUNvbChlKSkuY29sID09IG54dC5jb2wgYW5kIGxsYy5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gJyh7JyBhbmQgZS50eXBlIGluIFsnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAnbnVtJyAncmVnZXgnXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ+KWuGFyZycgYW5kIG54dC50eXBlID09ICdvcCcgdGhlbiBAdmVyYiAncmhzIGJyZWFrIGZvciDilrhhcmcnOyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kICh1bnNwYWNlZCBvciAnPycgbm90IGluIEBzdGFjaylcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvYmplY3QgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGtleSBvZiAoaW1wbGljaXQpIG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2tleXdvcmQnIGFuZCBueHQudGV4dCA9PSAnaW4nIGFuZCBAc3RhY2tbLTFdICE9ICdmb3InXG4gICAgICAgICAgICAgICAgZSA9IEBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIGUudGV4dD9cbiAgICAgICAgICAgICAgICBpZiAgICAgIGUudGV4dCA9PSAnWycgICB0aGVuIGUgPSBAYXJyYXkgICAgICAgICAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICcoJyAgIHRoZW4gZSA9IEBwYXJlbnMgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ3snICAgdGhlbiBlID0gQGN1cmx5ICAgICAgICAgICBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ25vdCcgdGhlbiBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgaW4gWycrJyctJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCA9ICctJyArIG54dC50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnh0LmNvbCAtPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyArLSBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddICAgIGFuZCB1bnNwYWNlZCAgICAgICAgdGhlbiBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKTsgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIGNhbGwgYXJyYXkgZW5kJzsgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ3snICAgIGFuZCBueHQudGV4dCA9PSAnfScgdGhlbiBAdmVyYiAncmhzIGN1cmx5IGVuZCc7ICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgYXJyYXkgZW5kJzsgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgWyBhcnJheSBlbmQnIG54dDsgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LmFzdCBcInJocyBubyBueHQgbWF0Y2g/PyBzdGFjazoje0BzdGFja30gZTpcIiBlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPz8gbnh0OlwiIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBubyB0b2tlbiBjb25zdW1lZCwgYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZW1wdHkgQHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBlbXB0eSBzdGFjayBueHQnIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMgbGFzdCBtaW51dGUgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdyaHMnICdyaHMnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgcmVjdXJzaXZlbHkgYnVpbGQgdXAgc3R1ZmYgdGhhdCBjYW4gYmUgaWRlbnRpZmllZCBieSBsb29raW5nIGF0IHRoZSBuZXh0IHRva2VuICphbmQqIHdoYXQgd2FzIGp1c3QgcGFyc2VkXG4gICAgI1xuICAgICMgYW55dGhpbmcgdGhhdCBjYW4gYmUgY2hhaW5lZFxuICAgICMgICAtIG9wZXJhdGlvbnNcbiAgICAjICAgLSBwcm9wZXJ0aWVzXG4gICAgIyAgIC0gY2FsbHNcbiAgICBcbiAgICBsaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdsaHMnICdsaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsYXN0ICA9IGxhc3RMaW5lQ29sICBlXG4gICAgICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBlXG4gICAgICAgICAgICB1bnNwYWNlZCA9IGxhc3QuY29sID09IG54dC5jb2wgYW5kIGxhc3QubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIHdoZW4gJ1snIHRoZW4gbnh0LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgd2hlbiAneycgdGhlbiBueHQudGV4dCA9PSAnfSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGJyZWFrIGlmIGJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZS50ZXh0ID09ICdAJyBcbiAgICAgICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnYmxvY2snIGFuZCBAc3RhY2tbLTFdID09ICdpZicgb3Igbnh0LnRleHQgPT0gJ3RoZW4nIG9yIG54dC50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAdGhpcyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgICAgICBueHQudGV4dCA9PSAnLicgICAgdGhlbiBlID0gQHByb3AgICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIHRoZW4gZSA9IEBzbGljZSAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB1bnNwYWNlZCAjIGFuZCB0b2tlbnNbMV0/LnRleHQgaW4gJyhbLidcblxuICAgICAgICAgICAgICAgICAgICBlID0gQGFzc2VydCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBxbXJrb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kIGUucW1ya29wXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZSA9IEBxbXJrY29sb24gZS5xbXJrb3AsIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50eXBlID09ICdvcCcgYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nICdub3QnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdPy5zdGFydHNXaXRoICdvcCcgYW5kIEBzdGFja1stMV0gIT0gJ29wPSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBzdG9wIG9uIG9wZXJhdGlvbicgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRleHQgbm90IGluIFsnWycgJygnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VkIGFuZCB0b2tlbnNbMV0/LmNvbCA+IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiArLVxccycgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdmdW5jJyBhbmQgZS5wYXJlbnNcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGFyZ3MgZm9yIGZ1bmMnIGVcbiAgICAgICAgICAgICAgICBlID0gQGZ1bmMgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnKCcgYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgY2FsbCdcbiAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnWycgYW5kIHVuc3BhY2VkIGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnbm90JyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpbidcblxuICAgICAgICAgICAgICAgIGUgPSBvcGVyYXRpb246XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yOnRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIHJoczpAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIChueHQubGluZSA9PSBsYXN0LmxpbmUgb3IgKG54dC5jb2wgPiBmaXJzdC5jb2wgYW5kIEBzdGFja1stMV0gbm90IGluIFsnaWYnXSkpIGFuZFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWydpZicgJ3RoZW4nICdlbHNlJyAnYnJlYWsnICdjb250aW51ZScgJ2luJyAnb2YnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nICdpZicgJ3RoZW4nICdlbHNlJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuYXJyYXkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9iamVjdCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUua2V5dmFsIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vcGVyYXRpb24gYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmluY29uZCBhbmRcbiAgICAgICAgICAgICAgICAgICAgZS5jYWxsPy5jYWxsZWU/LnRleHQgbm90IGluIFsnZGVsZXRlJyduZXcnJ3R5cGVvZiddIGFuZFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBlJyBlLCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgbnh0JyBueHRcbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBmaXJzdCcgZmlyc3QgXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBlLnRleHQgbm90IGluIFsnWycgJygnXVxuICAgICAgICAgICAgICAgIGlmIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPT0gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBvcCBpcyB1bmJhbGFuY2VkICstIGJyZWFrLi4uJyBlLCBueHQsIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImxocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdsaHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnbGhzJyAnbGhzJyAgICAgICBcbiAgICAgICAgZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgIyBydWxlcyBpbiBwYXJzZXIgc2hvdWxkIHVzZSB0aGlzIGluc3RlYWQgb2YgY2FsbGluZyBzaGlmdE5ld2xpbmUgZGlyZWN0bHlcbiAgICBcbiAgICBzaGlmdENsb3NlOiAocnVsZSwgdGV4dCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09IHRleHRcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuc2hpZnQoKSBcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09IHRleHRcbiAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgcnVsZSwgdG9rZW5zXG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICAgICBlcnJvciBcInBhcnNlLnNoaWZ0Q2xvc2U6ICcje3J1bGV9JyBleHBlY3RlZCBjbG9zaW5nICcje3RleHR9J1wiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICAjIHRoaXMgc2hvdWxkIGJlIHRoZSBvbmx5IG1ldGhvZCB0byByZW1vdmUgbmV3bGluZXMgZnJvbSB0aGUgdG9rZW5zXG4gICAgIyBpdCBpcyB2ZXJ5IGltcG9ydGFudCB0byBrZWVwIHRoZSBuZXdsaW5lcyBhcyBhIHJlY3Vyc2lvbiBicmVha2VyIHVudGlsIHRoZSBsYXN0IHBvc3NpYmxlIG1vbWVudFxuICAgICMgdXNpbmcgdGhpcyBtZXRob2QgbWFrZXMgaXQgbXVjaCBlYXNpZXIgdG8gZGV0ZXJtaW5lIHdoZW4gb25lIGdldHMgc3dhbGx3ZWQgdG9vIGVhcmx5XG4gICAgXG4gICAgc2hpZnROZXdsaW5lOiAocnVsZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGRlYnVnIHRoZW4gbG9nIE0zIHk1IFwiIOKXgiAje3cxIHJ1bGV9XCIgXG4gICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG4gICAgIyBhZGRzIG5hbWUgdG9rZW5zIHRvIGZ1bmN0aW9ucyB0aGF0IGFyZSB2YWx1ZXMgaW4gY2xhc3Mgb2JqZWN0c1xuICAgIFxuICAgIG5hbWVNZXRob2RzOiAobXRoZHMpIC0+XG4gXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgaWYgbmFtZSA9IG0ua2V5dmFsPy5rZXk/LnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5rZXl2YWwudmFsPy5mdW5jP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6bmFtZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIGZ1bmN0aW9uIGZvciBtZXRob2Q/JyBuYW1lLCBtXG4gICAgICAgIG10aGRzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICAjIGVhdHMgZWl0aGVyIHRva2VucyB0byB0aGUgcmlnaHQgb2YgJ3RoZW4nIHRva2Vuc1xuICAgICMgb3Igb2YgdGhlIG5leHQgYmxvY2tcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIEBwdXNoICd0aGVuJ1xuICAgICAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgQHBvcCAndGhlbidcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICdJTlRFUk5BTCBFUlJPUiB0aGVuIG9yIGJsb2NrIGV4cGVjdGVkJ1xuICAgICAgICBcbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgdGhlbiB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIHRoblxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICAjIGVpdGhlciBlYXRzIGJsb2NrIHRva2Vuc1xuICAgICMgb3IgdW50aWwgbmV4dCBuZXdsaW5lXG4gICAgIyB1c2VkIGZvciB0aGluZ3MgdGhhdCBkb2Vzbid0IGV4cGVjdCAndGhlbicgd2hlbiBjb250aW51ZWQgaW4gc2FtZSBsaW5lXG4gICAgIyAgIC0gZnVuY3Rpb24gYm9keVxuICAgICMgICAtIGNhbGwgYXJndW1lbnRzXG4gICAgIyAgIC0gdHJ5LCBjYXRjaCwgZmluYWxseVxuICAgICMgICAtIGVsc2VcbiAgICBcbiAgICBibG9jazogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICAjIEB2ZXJiICdibG9jayBuZXh0IHRva2VuIHR5cGUnIHRva2Vuc1swXT8udHlwZSBcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbmwgPSAnbmwnXG5cbiAgICAgICAgQHB1c2ggJ+KWuCcraWRcbiAgICAgICAgZXhwcyA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG4gICAgICAgIEBwb3AgJ+KWuCcraWRcblxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICBcbiAgICBzaGVhcFB1c2g6ICh0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICBzaGVhcFBvcDogKG0sIHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3BwZWQgPSBAc2hlYXAucG9wKClcbiAgICAgICAgaWYgcG9wcGVkLnRleHQgIT0gdCBhbmQgcG9wcGVkLnRleHQgIT0ga3N0ci5zdHJpcCh0LCBcIidcIikgdGhlbiBlcnJvciAnd3JvbmcgcG9wPycgcG9wcGVkLnRleHQsIHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwLCBwb3BwZWQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQGRlYnVnXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcbiAgICAgICAgQHNoZWFwUHVzaCAnc3RhY2snIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgQHNoZWFwUG9wICdzdGFjaycgcFxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZVxuIl19
//# sourceURL=../coffee/parse.coffee
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
        var b, block, es, ex, nl, numTokens, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
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
            if (tokens[0].text === 'then') {
                this.verb('exps break on then');
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
                    if (((ref6 = this.stack.slice(-1)[0]) === 'func' || ref6 === '▸args' || ref6 === '▸body') || stop !== 'nl') {
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
            ex = this.exp(tokens);
            es.push(ex);
            if (numTokens === tokens.length) {
                console.error('exps no token consumed?');
                break;
            }
        }
        this.sheapPop('exps', rule);
        return es;
    };

    Parse.prototype.exp = function(tokens) {
        var e, numTokens, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, tok;
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
                this.verb('exp start shift nl!');
                return this.exp(tokens);
            case 'keyword':
                if (ref1 = (ref2 = tokens[0]) != null ? ref2.text : void 0, indexOf.call(':', ref1) < 0) {
                    switch (tok.text) {
                        case 'if':
                            return this["if"](tok, tokens);
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
                    }
                }
                break;
            default:
                switch (tok.text) {
                    case '->':
                    case '=>':
                        return this.func(null, tok, tokens);
                    case ';':
                        if (((ref3 = tokens[0]) != null ? ref3.text : void 0) !== ':') {
                            return this.exp(tokens);
                        }
                }
        }

        /*
        here comes the hairy part :-)
        
        combine information about the rule stack, current and future tokens
        to figure out when the expression ends
         */
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
            if (numTokens === tokens.length) {
                if (ref5 = (ref6 = tokens[0]) != null ? ref6.text : void 0, indexOf.call(',', ref5) >= 0) {
                    this.verb('exp shift comma');
                    tokens.shift();
                }
                if (((ref7 = tokens[0]) != null ? ref7.text : void 0) === 'if') {
                    if (empty(this.stack) || !this.stack.slice(-1)[0].startsWith('op')) {
                        e = this.ifTail(e, tokens.shift(), tokens);
                        continue;
                    }
                }
                this.verb('exp no token consumed: break!');
                break;
            }
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
        this.sheapPop('exp', (ref8 = tok.text) != null ? ref8 : tok.type);
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
            } else if (spaced && (nxt.line === last.line || (nxt.col > first.col && ((ref9 = this.stack.slice(-1)[0]) !== 'if'))) && ((ref10 = nxt.text) !== 'if' && ref10 !== 'then' && ref10 !== 'else' && ref10 !== 'break' && ref10 !== 'continue' && ref10 !== 'in' && ref10 !== 'of') && ((ref11 = e.type) !== 'num' && ref11 !== 'single' && ref11 !== 'double' && ref11 !== 'triple' && ref11 !== 'regex' && ref11 !== 'punct' && ref11 !== 'comment' && ref11 !== 'op') && ((ref12 = e.text) !== 'null' && ref12 !== 'undefined' && ref12 !== 'Infinity' && ref12 !== 'NaN' && ref12 !== 'true' && ref12 !== 'false' && ref12 !== 'yes' && ref12 !== 'no') && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && ((ref13 = (ref14 = e.call) != null ? (ref15 = ref14.callee) != null ? ref15.text : void 0 : void 0) !== 'delete' && ref13 !== 'new' && ref13 !== 'typeof') && indexOf.call(this.stack, '▸arg') < 0) {
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
        var block, nl, ref1, ref2, ref3, thn;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'then') {
            tokens.shift();
            nl = 'nl';
        } else if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref3 = tokens[0]) != null ? ref3.type : void 0) === 'nl') {
                tokens.shift();
            }
            tokens = block.tokens;
            nl = null;
        }
        thn = this.exps(id, tokens, nl);
        if (block && block.tokens.length) {
            print.tokens('dangling then tokens', tokens);
        }
        return thn;
    };

    Parse.prototype.block = function(id, tokens) {
        var block, exps, nl, ref1, ref2;
        this.verb('block next token type', (ref1 = tokens[0]) != null ? ref1.type : void 0);
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseURBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsaUJBQUYsRUFBUywrQkFBVCxFQUF1Qjs7QUFFakI7SUFFQyxlQUFDLElBQUQ7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBQyxDQUFBLE9BQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsR0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSnhCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO1FBRU4sR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsS0FBSyxDQUFDLE1BQWpCLENBQVg7UUFFTixJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQWEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXFCLEdBQXJCLEVBQWI7O2VBRUE7WUFBQSxJQUFBLEVBQUssRUFBTDtZQUNBLElBQUEsRUFBSyxHQURMOztJQVhHOztvQkFzQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLElBQUMs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Q0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFOQzs7b0JBU0wsSUFBQSxHQUFNLFNBQUE7UUFBRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBQWpCOztJQUFIOzs7Ozs7QUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZW1wdHksIGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSAgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQHJhdyAgICAgID0gQGtvZGUuYXJncy5yYXdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBwYXJzZTogKGJsb2NrKSAtPiAjIGNvbnZlcnQgYmxvY2sgdHJlZSB0byBhYnN0cmFjdCBzeW50YXggdHJlZVxuXG4gICAgICAgIEBzdGFjayA9IFtdXG4gICAgICAgIEBzaGVhcCA9IFtdXG5cbiAgICAgICAgYXN0ID0gW11cblxuICAgICAgICBhc3QgPSBhc3QuY29uY2F0IEBleHBzICd0bCcgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgaWYgQHJhdyB0aGVuIHByaW50Lm5vb24gJ3JhdyBhc3QnIGFzdFxuXG4gICAgICAgIHZhcnM6W10gXG4gICAgICAgIGV4cHM6YXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgbGlzdCBvZiBleHByZXNzaW9uc1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cHMnIHJ1bGVcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJnJyAgICAgICAgICAgICAgICAgdGhlbiBlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgJ3N3aXRjaCcgJ+KWuGVsc2UnICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ1snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICddJyAgXG4gICAgICAgICAgICAgICAgd2hlbiAneycgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ30nXG4gICAgICAgICAgICAgICAgd2hlbiAnKCcgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgd2hlbiAn4pa4YXJncycgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnXTsnXG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJzsnICMgYmFpbCBvdXQgZm9yIGltcGxpY2l0IGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gcnVsZSAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgZmFsc2VcblxuICAgICAgICAgICAgaWYgYiB0aGVuIEB2ZXJiIFwiZXhwcyBicmVhayBmb3IgI3t0b2tlbnNbMF0udGV4dH0gYW5kIHN0YWNrIHRvcFwiIEBzdGFjayA7IGJyZWFrIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RvcCBhbmQgdG9rZW5zWzBdLnRleHQgPT0gc3RvcCB0aGVuIEB2ZXJiIFwiZXhwcyBicmVhayBmb3IgI3t0b2tlbnNbMF0udGV4dH0gYW5kIHN0b3BcIiBzdG9wIDsgYnJlYWsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJ1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3AgaW4gWydubCddXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydCB3aXRoIHN0b3AgI3tzdG9wfSBicmVhayFcIlxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgc3RhcnQgc3RvcDoje3N0b3B9IGJsb2NrOlwiIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IEBleHBzICdibG9jaycgYmxvY2sudG9rZW5zICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGlmIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kIHJlbWFpbmluZyBibG9jayB0b2tlbnM6JyBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnYmVmb3JlIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ2FmdGVyIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIGVuZCBzaGlmdCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBibG9jayBlbmQgbmwgY29tbWEgLCBhbmQgY29udGludWUuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaycgICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJ3RoZW4nICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uIHRoZW4nICAgICA7IGJyZWFrIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uICknICAgICAgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddIGFuZCBydWxlID09ICdmb3IgdmFscycgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZicgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnZXhwcyBubCBdIGluIGFycmF5JyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgIyBpZiBAc3RhY2tbLTFdIGluIFsnY2FsbCcgJzonICdmdW5jJyAn4pa4YXJncyddIG9yIHN0b3AgIT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIGluIFsnZnVuYycgJ+KWuGFyZ3MnICfilrhib2R5J10gb3Igc3RvcCAhPSAnbmwnXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgbmwgd2l0aCBzdG9wICN7c3RvcH0gaW4gI3tAc3RhY2tbLTFdfSAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBubCB3aXRoIHN0b3AgI3tzdG9wfVwiIHRva2VucyBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgICAgICAgICBubCA9IEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIChubyBzdG9wKSAuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIG5sIGNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBleCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBlcy5wdXNoIGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2V4cHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQHNoZWFwUG9wICdleHBzJyBydWxlXG4gICAgICAgIFxuICAgICAgICBlc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgc2luZ2xlIGV4cHJlc3Npb25cblxuICAgIGV4cDogKHRva2VucykgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgdG9rID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBsb2cgWTUgdzEgdG9rPy50ZXh0IGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgIyB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgaGFuZGxpbmcgb2YgbGlzdHMgb2YgZXhwcmVzc2lvbnMgaXMgZG9uZSBpbiBleHBzIGFuZFxuICAgICAgICAjIHNpbGVudGx5IHNraXBzIG92ZXIgbGVhZGluZyBzZXBhcmF0aW5nIHRva2VucyBsaWtlIGNvbW1hdGFzLCBzZW1pY29sb25zIGFuZCBubC5cblxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICAgICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIHN0YXJ0IHNoaWZ0IG5sISdcbiAgICAgICAgICAgICAgICByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIG5sXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJ1xuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBub3QgaW4gJzonXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICB0aGVuIHJldHVybiBAaWYgICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICB0aGVuIHJldHVybiBAcmV0dXJuIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICB0aGVuIHJldHVybiBAY2xhc3MgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd0cnknICAgICAgdGhlbiByZXR1cm4gQHRyeSAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICB0aGVuIGlmIHRva2Vuc1swXT8udGV4dCAhPSAnOicgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIDtcblxuICAgICAgICAjIyNcbiAgICAgICAgaGVyZSBjb21lcyB0aGUgaGFpcnkgcGFydCA6LSlcbiAgICAgICAgXG4gICAgICAgIGNvbWJpbmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJ1bGUgc3RhY2ssIGN1cnJlbnQgYW5kIGZ1dHVyZSB0b2tlbnNcbiAgICAgICAgdG8gZmlndXJlIG91dCB3aGVuIHRoZSBleHByZXNzaW9uIGVuZHNcbiAgICAgICAgIyMjXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICBlID0gdG9rXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgZSA9IEByaHMgZSwgdG9rZW5zICAgICAgICAgICAgICAgIyBmaXJzdCwgdHJ5IHRvIGVhdCBhcyBtdWNoIHRva2VucyBhcyBwb3NzaWJsZSB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgIHByaW50LmFzdCBcInJoc1wiIGUgaWYgQHZlcmJvc2UgICAgXG5cbiAgICAgICAgICAgIGUgPSBAbGhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgc2VlLCBpZiB3ZSBjYW4gdXNlIHRoZSByZXN1bHQgYXMgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHNvbWV0aGluZ1xuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZSAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnaWYnXG4gICAgICAgICAgICAgICAgICAgIGlmIGVtcHR5KEBzdGFjaykgb3Igbm90IEBzdGFja1stMV0uc3RhcnRzV2l0aCgnb3AnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZSA9IEBpZlRhaWwgZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIG5vIHRva2VuIGNvbnN1bWVkOiBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICByaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdyaHMnICdyaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1bnNwYWNlZCA9IChsbGMgPSBsYXN0TGluZUNvbChlKSkuY29sID09IG54dC5jb2wgYW5kIGxsYy5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gJyh7JyBhbmQgZS50eXBlIGluIFsnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAnbnVtJyAncmVnZXgnXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ+KWuGFyZycgYW5kIG54dC50eXBlID09ICdvcCcgdGhlbiBAdmVyYiAncmhzIGJyZWFrIGZvciDilrhhcmcnOyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOicgYW5kICh1bnNwYWNlZCBvciAnPycgbm90IGluIEBzdGFjaylcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvYmplY3QgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGtleSBvZiAoaW1wbGljaXQpIG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2tleXdvcmQnIGFuZCBueHQudGV4dCA9PSAnaW4nIGFuZCBAc3RhY2tbLTFdICE9ICdmb3InXG4gICAgICAgICAgICAgICAgZSA9IEBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIGUudGV4dD9cbiAgICAgICAgICAgICAgICBpZiAgICAgIGUudGV4dCA9PSAnWycgICB0aGVuIGUgPSBAYXJyYXkgICAgICAgICAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICcoJyAgIHRoZW4gZSA9IEBwYXJlbnMgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ3snICAgdGhlbiBlID0gQGN1cmx5ICAgICAgICAgICBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ25vdCcgdGhlbiBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgaW4gWycrJyctJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzICstIG51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCA9ICctJyArIG54dC50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnh0LmNvbCAtPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyArLSBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIHVuc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddICAgIGFuZCB1bnNwYWNlZCAgICAgICAgdGhlbiBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKTsgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIGNhbGwgYXJyYXkgZW5kJzsgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ3snICAgIGFuZCBueHQudGV4dCA9PSAnfScgdGhlbiBAdmVyYiAncmhzIGN1cmx5IGVuZCc7ICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgYXJyYXkgZW5kJzsgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgICAgYW5kIG54dC50ZXh0ID09ICddJyB0aGVuIEB2ZXJiICdyaHMgWyBhcnJheSBlbmQnIG54dDsgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LmFzdCBcInJocyBubyBueHQgbWF0Y2g/PyBzdGFjazoje0BzdGFja30gZTpcIiBlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgXCJyaHMgbm8gbnh0IG1hdGNoPz8gbnh0OlwiIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBubyB0b2tlbiBjb25zdW1lZCwgYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZW1wdHkgQHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBlbXB0eSBzdGFjayBueHQnIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMgbGFzdCBtaW51dGUgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGltcGxlbWVudCBudWxsIGNoZWNrcyBoZXJlP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ3JocycgJ3JocydcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgbGhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAnbGhzJyAnbGhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGFzdCAgPSBsYXN0TGluZUNvbCAgZVxuICAgICAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgZVxuICAgICAgICAgICAgdW5zcGFjZWQgPSBsYXN0LmNvbCA9PSBueHQuY29sIGFuZCBsYXN0LmxpbmUgPT0gbnh0LmxpbmVcbiAgICAgICAgICAgIHNwYWNlZCA9IG5vdCB1bnNwYWNlZFxuXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICB3aGVuICdbJyB0aGVuIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ3snIHRoZW4gbnh0LnRleHQgPT0gJ30nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhayBpZiBiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnQCcgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ2Jsb2NrJyBhbmQgQHN0YWNrWy0xXSA9PSAnaWYnIG9yIG54dC50ZXh0ID09ICd0aGVuJyBvciBueHQudHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBlID0gQHRoaXMgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICAgICAgbnh0LnRleHQgPT0gJy4nICAgIHRoZW4gZSA9IEBwcm9wICAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyB0aGVuIGUgPSBAc2xpY2UgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnPycgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdW5zcGFjZWQgIyBhbmQgdG9rZW5zWzFdPy50ZXh0IGluICcoWy4nXG5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBhc3NlcnQgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcW1ya29wIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonIGFuZCBlLnFtcmtvcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGUgPSBAcW1ya2NvbG9uIGUucW1ya29wLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBueHQudHlwZSA9PSAnb3AnIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnKysnICctLScgJysnICctJyAnbm90J10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBlLnRleHQgbm90IGluIFsnWycgJygnXSBhbmQgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJ+KWuGFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXT8uc3RhcnRzV2l0aCAnb3AnIGFuZCBAc3RhY2tbLTFdICE9ICdvcD0nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgc3RvcCBvbiBvcGVyYXRpb24nIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2Ygb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPiBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy1cXHMnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZnVuYycgYW5kIGUucGFyZW5zXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBhcmdzIGZvciBmdW5jJyBlXG4gICAgICAgICAgICAgICAgZSA9IEBmdW5jIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB1bnNwYWNlZCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ25vdCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaW4nXG5cbiAgICAgICAgICAgICAgICBlID0gb3BlcmF0aW9uOlxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjp0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICByaHM6QGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIChueHQubGluZSA9PSBsYXN0LmxpbmUgb3IgKG54dC5jb2wgPiBmaXJzdC5jb2wgYW5kIEBzdGFja1stMV0gbm90IGluIFsnaWYnXSkpIGFuZFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWydpZicgJ3RoZW4nICdlbHNlJyAnYnJlYWsnICdjb250aW51ZScgJ2luJyAnb2YnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5hcnJheSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub2JqZWN0IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5rZXl2YWwgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9wZXJhdGlvbiBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuaW5jb25kIGFuZFxuICAgICAgICAgICAgICAgICAgICBlLmNhbGw/LmNhbGxlZT8udGV4dCBub3QgaW4gWydkZWxldGUnJ25ldycndHlwZW9mJ10gYW5kXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIGUnIGUsIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIGZpcnN0JyBmaXJzdCBcbiAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysnICctJ10gYW5kIGUudGV4dCBub3QgaW4gWydbJyAnKCddXG4gICAgICAgICAgICAgICAgaWYgc3BhY2VkIGFuZCB0b2tlbnNbMV0/LmNvbCA9PSBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgKy0gb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwibGhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2xocyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdsaHMnICdsaHMnICAgICAgIFxuICAgICAgICBlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzaGlmdENsb3NlOiAocnVsZSwgdGV4dCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09IHRleHRcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuc2hpZnQoKSBcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09IHRleHRcbiAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgcnVsZSwgdG9rZW5zXG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICAgICBlcnJvciBcInBhcnNlLnNoaWZ0Q2xvc2U6ICcje3J1bGV9JyBleHBlY3RlZCBjbG9zaW5nICcje3RleHR9J1wiXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzaGlmdE5ld2xpbmU6IChydWxlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAZGVidWcgdGhlbiBsb2cgTTMgeTUgXCIg4peCICN7dzEgcnVsZX1cIiBcbiAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgbmFtZU1ldGhvZHM6IChtdGhkcykgLT5cbiBcbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgICAgICBpZiBuYW1lID0gbS5rZXl2YWw/LmtleT8udGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmtleXZhbC52YWw/LmZ1bmM/XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmtleXZhbC52YWwuZnVuYy5uYW1lID0gdHlwZTonbmFtZScgdGV4dDpuYW1lXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAnbm8gZnVuY3Rpb24gZm9yIG1ldGhvZD8nIG5hbWUsIG1cbiAgICAgICAgbXRoZHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgIFxuICAgIHRoZW46IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuXG4gICAgICAgIHRobiA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG4gICAgICAgIFxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyB0aGVuIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgdGhuXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGJsb2NrOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICdibG9jayBuZXh0IHRva2VuIHR5cGUnIHRva2Vuc1swXT8udHlwZSBcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbmwgPSAnbmwnXG5cbiAgICAgICAgQHB1c2ggJ+KWuCcraWRcbiAgICAgICAgZXhwcyA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG4gICAgICAgIEBwb3AgJ+KWuCcraWRcblxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICBcbiAgICBzaGVhcFB1c2g6ICh0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICBzaGVhcFBvcDogKG0sIHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3BwZWQgPSBAc2hlYXAucG9wKClcbiAgICAgICAgaWYgcG9wcGVkLnRleHQgIT0gdCBhbmQgcG9wcGVkLnRleHQgIT0ga3N0ci5zdHJpcCh0LCBcIidcIikgdGhlbiBlcnJvciAnd3JvbmcgcG9wPycgcG9wcGVkLnRleHQsIHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwLCBwb3BwZWQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQGRlYnVnXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcbiAgICAgICAgQHNoZWFwUHVzaCAnc3RhY2snIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgQHNoZWFwUG9wICdzdGFjaycgcFxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT4gaWYgQHZlcmJvc2UgdGhlbiBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzIFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZVxuIl19
//# sourceURL=../coffee/parse.coffee
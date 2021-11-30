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

ref = require('./utils'), firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol, empty = ref.empty;

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
            if (tokens[0].text === stop) {
                this.verb("exps break for " + tokens[0].text + " and stop", stop);
                break;
            }
            if (tokens[0].type === 'block') {
                block = tokens.shift();
                this.verb("exps block start", block);
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
                    if (((ref6 = this.stack.slice(-1)[0]) === 'func' || ref6 === '▸args') || stop !== 'nl') {
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
            } else if (nxt.text === ':') {
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
                if (nxt.type === 'block' && this.stack.slice(-1)[0] === 'if' || nxt.text === 'then') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseURBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsK0JBQUYsRUFBZ0IsNkJBQWhCLEVBQTZCOztBQUV2QjtJQUVDLGVBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsT0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxHQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKeEI7O29CQVlILEtBQUEsR0FBTyxTQUFDLEtBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUNULElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07UUFFTixHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBVyxLQUFLLENBQUMsTUFBakIsQ0FBWDtRQUVOLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtZQUFBLElBQUEsRUFBSyxFQUFMO1lBQ0EsSUFBQSxFQUFLLEdBREw7O0lBWEc7O29CQXNCUCxJQUFBLEdBQU0sU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLElBQWY7QUFFRixZQUFBO1FBQUEsSUFBVSxLQUFBLENBQU0sTUFBTixDQUFWO0FBQUEsbUJBQUE7O1FBRUEsSUFB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TU4sR0FBQSxHQUFLLFNBQUMsQ0FBRDtBQUNELFlBQUE7UUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQUE7UUFDSixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBa0IsQ0FBbEI7UUFDQSxJQUFHLENBQUEsS0FBSyxDQUFSO1lBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxpQkFBUCxFQUF5QixDQUF6QixFQUE0QixDQUE1QixFQURIOztRQUdBLElBQUcsSUFBQyxDQUFBLEtBQUo7bUJBQ0ksS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFDLENBQUEsS0FBYixFQUFvQixDQUFwQixFQUF1QixTQUFDLENBQUQ7dUJBQU8sRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFILENBQUg7WUFBUCxDQUF2QixFQURKOztJQU5DOztvQkFTTCxJQUFBLEdBQU0sU0FBQTtRQUFHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFBakI7O0lBQUg7Ozs7OztBQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbmtzdHIgID0gcmVxdWlyZSAna3N0cidcbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblxueyBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sLCBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChAa29kZSkgLT5cblxuICAgICAgICBAZGVidWcgICAgPSBAa29kZS5hcmdzLmRlYnVnXG4gICAgICAgIEB2ZXJib3NlICA9IEBrb2RlLmFyZ3MudmVyYm9zZVxuICAgICAgICBAcmF3ICAgICAgPSBAa29kZS5hcmdzLnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cbiAgICAgICAgQHNoZWFwID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgdmFyczpbXSBcbiAgICAgICAgZXhwczphc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBsaXN0IG9mIGV4cHJlc3Npb25zXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwcycgcnVsZVxuXG4gICAgICAgIGVzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuICfilrhhcmcnICAgICAgICAgICAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAn4pa4ZWxzZScgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ10nICBcbiAgICAgICAgICAgICAgICB3aGVuICd7JyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnfSdcbiAgICAgICAgICAgICAgICB3aGVuICcoJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICB3aGVuICfilrhhcmdzJyAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICddOydcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnOycgIyBiYWlsIG91dCBmb3IgaW1wbGljaXQgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiBydWxlICAgICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gc3RvcCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgICBpZiBiIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RhY2sgdG9wXCIgQHN0YWNrIDsgYnJlYWsgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wIHRoZW4gQHZlcmIgXCJleHBzIGJyZWFrIGZvciAje3Rva2Vuc1swXS50ZXh0fSBhbmQgc3RvcFwiIHN0b3AgOyBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydFwiIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IEBleHBzICdibG9jaycgYmxvY2sudG9rZW5zICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGlmIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kIHJlbWFpbmluZyBibG9jayB0b2tlbnM6JyBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyAnYmVmb3JlIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy51bnNoaWZ0IGJsb2NrLnRva2Vucy5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBwcmludC50b2tlbnMgJ2FmdGVyIHVuc2hpZnRpbmcgZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIGVuZCBzaGlmdCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lIFwiZXhwcyBibG9jayBlbmQgbmwgY29tbWEgLCBhbmQgY29udGludWUuLi5cIiB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2sgZW5kLCBicmVhayEnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaycgICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uICknICAgICAgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddIGFuZCBydWxlID09ICdmb3IgdmFscycgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZicgOyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnZXhwcyBubCBdIGluIGFycmF5JyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgIyBpZiBAc3RhY2tbLTFdIGluIFsnY2FsbCcgJzonICdmdW5jJyAn4pa4YXJncyddIG9yIHN0b3AgIT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIGluIFsnZnVuYycgJ+KWuGFyZ3MnXSBvciBzdG9wICE9ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBubCB3aXRoIHN0b3AgI3tzdG9wfSBpbiAje0BzdGFja1stMV19IChicmVhaywgYnV0IGRvbid0IHNoaWZ0IG5sKVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIHdpdGggc3RvcCAje3N0b3B9XCIgdG9rZW5zIFxuICAgICAgICAgICAgICAgICAgICBicmVhayBcblxuICAgICAgICAgICAgICAgIG5sID0gQHNoaWZ0TmV3bGluZSBcImV4cHMgbmwgKG5vIHN0b3ApIC4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLicgYW5kIHRva2Vuc1sxXT8udHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ2V4cHMgbmwgbmV4dCBsaW5lIHN0YXJ0cyB3aXRoIC52YXIhJ1xuICAgICAgICAgICAgICAgICAgICBlcy5wdXNoIEBwcm9wIGVzLnBvcCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgY29udGludWUuLi4nXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGV4ID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGVzLnB1c2ggZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnZXhwcyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAc2hlYXBQb3AgJ2V4cHMnIHJ1bGVcbiAgICAgICAgXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICAjIHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBoYW5kbGluZyBvZiBsaXN0cyBvZiBleHByZXNzaW9ucyBpcyBkb25lIGluIGV4cHMgYW5kXG4gICAgICAgICMgc2lsZW50bHkgc2tpcHMgb3ZlciBsZWFkaW5nIHNlcGFyYXRpbmcgdG9rZW5zIGxpa2UgY29tbWF0YXMsIHNlbWljb2xvbnMgYW5kIG5sLlxuXG4gICAgICAgIHN3aXRjaCB0b2sudHlwZVxuICAgICAgICAgICAgd2hlbiAnYmxvY2snICAgICAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgc3RhcnQgc2hpZnQgbmwhJ1xuICAgICAgICAgICAgICAgIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgbmxcbiAgICAgICAgICAgIHdoZW4gJ2tleXdvcmQnXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0IG5vdCBpbiAnOidcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgIHRoZW4gcmV0dXJuIEBpZiAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICB0aGVuIHJldHVybiBAZm9yICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgdGhlbiByZXR1cm4gQHdoaWxlICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgdGhlbiByZXR1cm4gQHdoZW4gICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgIHRoZW4gcmV0dXJuIEBjbGFzcyAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICc7JyAgICAgICAgdGhlbiBpZiB0b2tlbnNbMF0/LnRleHQgIT0gJzonIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCA7XG5cbiAgICAgICAgIyMjXG4gICAgICAgIGhlcmUgY29tZXMgdGhlIGhhaXJ5IHBhcnQgOi0pXG4gICAgICAgIFxuICAgICAgICBjb21iaW5lIGluZm9ybWF0aW9uIGFib3V0IHRoZSBydWxlIHN0YWNrLCBjdXJyZW50IGFuZCBmdXR1cmUgdG9rZW5zXG4gICAgICAgIHRvIGZpZ3VyZSBvdXQgd2hlbiB0aGUgZXhwcmVzc2lvbiBlbmRzXG4gICAgICAgICMjI1xuXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuICAgICAgICBcbiAgICAgICAgZSA9IHRva1xuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGUgPSBAcmhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgZmlyc3QsIHRyeSB0byBlYXQgYXMgbXVjaCB0b2tlbnMgYXMgcG9zc2libGUgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICBwcmludC5hc3QgXCJyaHNcIiBlIGlmIEB2ZXJib3NlICAgIFxuXG4gICAgICAgICAgICBlID0gQGxocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIHNlZSwgaWYgd2UgY2FuIHVzZSB0aGUgcmVzdWx0IGFzIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiBzb21ldGhpbmdcbiAgICAgICAgICAgIHByaW50LmFzdCBcImxoc1wiIGUgaWYgQHZlcmJvc2UgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgaW4gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgc2hpZnQgY29tbWEnXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2lmJ1xuICAgICAgICAgICAgICAgICAgICBpZiBlbXB0eShAc3RhY2spIG9yIG5vdCBAc3RhY2tbLTFdLnN0YXJ0c1dpdGgoJ29wJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGUgPSBAaWZUYWlsIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBubyB0b2tlbiBjb25zdW1lZDogYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICAjIGJhaWwgb3V0IGlmIG5vIHRva2VuIHdhcyBjb25zdW1lZFxuICAgICAgICAgICAgXG4gICAgICAgIHByaW50LmFzdCBcImV4cCAje2lmIGVtcHR5KEBzdGFjaykgdGhlbiAnRE9ORScgZWxzZSAnJ31cIiBlIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuICAgICAgICBlICAgICAgICBcblxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgcmhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAncmhzJyAncmhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdW5zcGFjZWQgPSAobGxjID0gbGFzdExpbmVDb2woZSkpLmNvbCA9PSBueHQuY29sIGFuZCBsbGMubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGlmIG54dC50ZXh0IGluICcoeycgYW5kIGUudHlwZSBpbiBbJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ251bScgJ3JlZ2V4J11cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICfilrhhcmcnIGFuZCBueHQudHlwZSA9PSAnb3AnIHRoZW4gQHZlcmIgJ3JocyBicmVhayBmb3Ig4pa4YXJnJzsgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdrZXl3b3JkJyBhbmQgbnh0LnRleHQgPT0gJ2luJyBhbmQgQHN0YWNrWy0xXSAhPSAnZm9yJ1xuICAgICAgICAgICAgICAgIGUgPSBAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQ/XG4gICAgICAgICAgICAgICAgaWYgICAgICBlLnRleHQgPT0gJ1snICAgdGhlbiBlID0gQGFycmF5ICAgICAgICAgICBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCA9PSAnKCcgICB0aGVuIGUgPSBAcGFyZW5zICAgICAgICAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICd7JyAgIHRoZW4gZSA9IEBjdXJseSAgICAgICAgICAgZSwgdG9rZW5zICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICdub3QnIHRoZW4gZSA9IEBvcGVyYXRpb24gbnVsbCwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgaW4gWycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0IGluIFsnKycnLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyArLSBudW0nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBlLnRleHQgPT0gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgPSAnLScgKyBueHQudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC5jb2wgLT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgKy0gb3BlcmF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBpZiBlLnR5cGUgbm90IGluIFsndmFyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvciAnd3JvbmcgcmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlICMgaWYgZSBpcyBub3QgYSB0b2tlbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSAgICBhbmQgdW5zcGFjZWQgICAgICAgIHRoZW4gZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCk7IGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdjYWxsJyBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBjYWxsIGFycmF5IGVuZCc7ICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICd7JyAgICBhbmQgbnh0LnRleHQgPT0gJ30nIHRoZW4gQHZlcmIgJ3JocyBjdXJseSBlbmQnOyAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snICAgIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIGFycmF5IGVuZCc7ICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snICAgIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIFsgYXJyYXkgZW5kJyBueHQ7ICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgXCJyaHMgbm8gbnh0IG1hdGNoPz8gc3RhY2s6I3tAc3RhY2t9IGU6XCIgZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8/IG54dDpcIiBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgbm8gdG9rZW4gY29uc3VtZWQsIGJyZWFrISdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgaWYgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IEBzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgZW1wdHkgc3RhY2sgbnh0JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGxhc3QgbWludXRlIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2VucyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBpbXBsZW1lbnQgbnVsbCBjaGVja3MgaGVyZT9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdyaHMnICdyaHMnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGxoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2xocycgJ2xocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxhc3QgID0gbGFzdExpbmVDb2wgIGVcbiAgICAgICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGVcbiAgICAgICAgICAgIHVuc3BhY2VkID0gbGFzdC5jb2wgPT0gbnh0LmNvbCBhbmQgbGFzdC5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgYiA9IHN3aXRjaCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgd2hlbiAnWycgdGhlbiBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICB3aGVuICd7JyB0aGVuIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBlLnRleHQgPT0gJ0AnIFxuICAgICAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdibG9jaycgYW5kIEBzdGFja1stMV0gPT0gJ2lmJyBvciBueHQudGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAdGhpcyBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgICAgICBueHQudGV4dCA9PSAnLicgICAgdGhlbiBlID0gQHByb3AgICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIHRoZW4gZSA9IEBzbGljZSAgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB1bnNwYWNlZCAjIGFuZCB0b2tlbnNbMV0/LnRleHQgaW4gJyhbLidcblxuICAgICAgICAgICAgICAgICAgICBlID0gQGFzc2VydCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBxbXJrb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgPT0gJ29wJyBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJysrJyAnLS0nICcrJyAnLScgJ25vdCddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0/LnN0YXJ0c1dpdGggJ29wJyBhbmQgQHN0YWNrWy0xXSAhPSAnb3A9J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIHN0b3Agb24gb3BlcmF0aW9uJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCBlLnBhcmVuc1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgYXJncyBmb3IgZnVuYycgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJyBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdW5zcGFjZWQgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdub3QnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2luJ1xuXG4gICAgICAgICAgICAgICAgZSA9IG9wZXJhdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3I6dG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgcmhzOkBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VkIGFuZCAobnh0LmxpbmUgPT0gbGFzdC5saW5lIG9yIChueHQuY29sID4gZmlyc3QuY29sIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJ10pKSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsnaWYnICd0aGVuJyAnZWxzZScgJ2JyZWFrJyAnY29udGludWUnICdpbicgJ29mJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICAoZS50eXBlIG5vdCBpbiBbJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ3JlZ2V4JyAncHVuY3QnICdjb21tZW50JyAnb3AnXSkgYW5kIFxuICAgICAgICAgICAgICAgICAgICAoZS50ZXh0IG5vdCBpbiBbJ251bGwnICd1bmRlZmluZWQnICdJbmZpbml0eScgJ05hTicgJ3RydWUnICdmYWxzZScgJ3llcycgJ25vJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgbm90IGUuYXJyYXkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLm9iamVjdCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUua2V5dmFsIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vcGVyYXRpb24gYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmluY29uZCBhbmRcbiAgICAgICAgICAgICAgICAgICAgZS5jYWxsPy5jYWxsZWU/LnRleHQgbm90IGluIFsnZGVsZXRlJyduZXcnJ3R5cGVvZiddIGFuZFxuICAgICAgICAgICAgICAgICAgICAn4pa4YXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBlJyBlLCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgbnh0JyBueHRcbiAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBmaXJzdCcgZmlyc3QgXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBlLnRleHQgbm90IGluIFsnWycgJygnXVxuICAgICAgICAgICAgICAgIGlmIHNwYWNlZCBhbmQgdG9rZW5zWzFdPy5jb2wgPT0gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBvcCBpcyB1bmJhbGFuY2VkICstIGJyZWFrLi4uJyBlLCBueHQsIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImxocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdsaHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnbGhzJyAnbGhzJyAgICAgICBcbiAgICAgICAgZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2hpZnRDbG9zZTogKHJ1bGUsIHRleHQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSB0ZXh0XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLnNoaWZ0KCkgXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSB0ZXh0XG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lIHJ1bGUsIHRva2Vuc1xuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgZXJyb3IgXCJwYXJzZS5zaGlmdENsb3NlOiAnI3tydWxlfScgZXhwZWN0ZWQgY2xvc2luZyAnI3t0ZXh0fSdcIlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2hpZnROZXdsaW5lOiAocnVsZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGRlYnVnIHRoZW4gbG9nIE0zIHk1IFwiIOKXgiAje3cxIHJ1bGV9XCIgXG4gICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG5hbWVNZXRob2RzOiAobXRoZHMpIC0+XG4gXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgaWYgbmFtZSA9IG0ua2V5dmFsPy5rZXk/LnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5rZXl2YWwudmFsPy5mdW5jP1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6bmFtZVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ25vIGZ1bmN0aW9uIGZvciBtZXRob2Q/JyBuYW1lLCBtXG4gICAgICAgIG10aGRzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcblxuICAgICAgICB0aG4gPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBcbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgdGhlbiB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIHRoblxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBibG9jazogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuXG4gICAgICAgIEBwdXNoICfilrgnK2lkXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBAcG9wICfilrgnK2lkXG5cbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgXG4gICAgXG4gICAgc2hlYXBQdXNoOiAodHlwZSwgdGV4dCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcC5wdXNoIHR5cGU6dHlwZSwgdGV4dDp0ZXh0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgc2hlYXBQb3A6IChtLCB0KSAtPlxuICAgICAgICBcbiAgICAgICAgcG9wcGVkID0gQHNoZWFwLnBvcCgpXG4gICAgICAgIGlmIHBvcHBlZC50ZXh0ICE9IHQgYW5kIHBvcHBlZC50ZXh0ICE9IGtzdHIuc3RyaXAodCwgXCInXCIpIHRoZW4gZXJyb3IgJ3dyb25nIHBvcD8nIHBvcHBlZC50ZXh0LCB0XG4gICAgICAgIHByaW50LnNoZWFwIEBzaGVhcCwgcG9wcGVkIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEBkZWJ1Z1xuICAgICAgICBAc3RhY2sucHVzaCBub2RlXG4gICAgICAgIEBzaGVhcFB1c2ggJ3N0YWNrJyBub2RlXG5cbiAgICBwb3A6IChuKSAtPlxuICAgICAgICBwID0gQHN0YWNrLnBvcCgpXG4gICAgICAgIEBzaGVhcFBvcCAnc3RhY2snIHBcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VcbiJdfQ==
//# sourceURL=../coffee/parse.coffee
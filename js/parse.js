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
                if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ',') {
                    this.verb("exps block end shift comma , and continue...");
                    tokens.shift();
                    continue;
                } else if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'nl' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) === ',') {
                    this.shiftNewline("exps block end nl comma , and continue...", tokens);
                    tokens.shift();
                    continue;
                }
                this.verb('exps block end break!', block.tokens.length);
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
        var e, numTokens, ref1, ref2, ref3, ref4, ref5, tok;
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
                break;
            default:
                switch (tok.text) {
                    case '->':
                    case '=>':
                        return this.func(null, tok, tokens);
                    case ';':
                        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) !== ':') {
                            return this.exp(tokens);
                        }
                }
        }

        /*
        here comes the hairy part :-)
        
        combine information about the rule stack, current and future tokens
        to figure out when the expression ends
         */
        this.sheapPush('exp', (ref2 = tok.text) != null ? ref2 : tok.type);
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
                if (ref3 = (ref4 = tokens[0]) != null ? ref4.text : void 0, indexOf.call(',', ref3) >= 0) {
                    this.verb('exp shift comma');
                    tokens.shift();
                    break;
                } else {
                    this.verb('exp no token consumed: break!');
                    break;
                }
            }
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
        this.sheapPop('exp', (ref5 = tok.text) != null ? ref5 : tok.type);
        return e;
    };

    Parse.prototype.rhs = function(e, tokens) {
        var llc, numTokens, nxt, ref1, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, spaced, unspaced;
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
                } else if (((ref3 = e.text) === '+' || ref3 === '-' || ref3 === '++' || ref3 === '--') && unspaced) {
                    if (((ref4 = nxt.type) !== 'var' && ref4 !== 'paren') && ((ref5 = e.text) === '++' || ref5 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    this.verb('rhs null operation');
                    e = this.operation(null, e, tokens);
                    if ((ref6 = (ref7 = e.operation.rhs) != null ? (ref8 = ref7.operation) != null ? (ref9 = ref8.operator) != null ? ref9.text : void 0 : void 0 : void 0) === '++' || ref6 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref10 = nxt.text) === '++' || ref10 === '--') && unspaced) {
                    if ((ref11 = e.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else {
                    if (this.verbose) {
                        print.tokens("rhs no nxt match? break! stack:" + this.stack + " nxt:", [nxt]);
                    }
                    break;
                }
            } else {
                if (((ref12 = nxt.text) === '++' || ref12 === '--') && unspaced) {
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
                console.error('rhs no token consumed?');
                break;
            }
        }
        if (nxt = tokens[0]) {
            if (empty(this.stack)) {
                this.verb('rhs empty stack nxt', nxt);
                if (nxt.text === '[' && ((ref13 = tokens[1]) != null ? ref13.text : void 0) !== ']') {
                    this.verb('rhs is last minute lhs of index', e);
                    e = this.index(e, tokens);
                }
            }
        }
        this.sheapPop('rhs', 'rhs');
        return e;
    };

    Parse.prototype.lhs = function(e, tokens) {
        var b, first, last, numTokens, nxt, qmark, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, spaced, unspaced;
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
            } else if (nxt.text === '?' && unspaced && ((ref1 = tokens[1]) != null ? ref1.text : void 0) === '.') {
                qmark = tokens.shift();
                e = this.prop(e, tokens, qmark);
            } else if (nxt.type === 'op' && ((ref2 = nxt.text) !== '++' && ref2 !== '--' && ref2 !== '+' && ref2 !== '-' && ref2 !== 'not') && ((ref3 = e.text) !== '[' && ref3 !== '(') && indexOf.call(this.stack, '▸arg') < 0) {
                if ((ref4 = this.stack.slice(-1)[0]) != null ? ref4.startsWith('op' && this.stack.slice(-1)[0] !== 'op=') : void 0) {
                    this.verb('lhs stop on operation', e, nxt);
                    break;
                } else {
                    this.verb('lhs is lhs of op', e, nxt);
                    e = this.operation(e, tokens.shift(), tokens);
                }
            } else if (((ref5 = nxt.text) === '+' || ref5 === '-') && ((ref6 = e.text) !== '[' && ref6 !== '(') && spaced && ((ref7 = tokens[1]) != null ? ref7.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('lhs is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && e.parens) {
                this.verb('lhs is args for func', e);
                e = this.func(e, tokens.shift(), tokens);
            } else if (nxt.text === '(' && unspaced) {
                this.verb('lhs is lhs of call');
                e = this.call(e, tokens);
            } else if (nxt.text === '[' && unspaced && ((ref8 = tokens[1]) != null ? ref8.text : void 0) !== ']') {
                this.verb('lhs is lhs of index', e);
                e = this.index(e, tokens);
            } else if (spaced && (nxt.line === last.line || nxt.col > first.col) && ((ref9 = nxt.text) !== 'then' && ref9 !== 'else' && ref9 !== 'break' && ref9 !== 'continue' && ref9 !== 'in' && ref9 !== 'of') && ((ref10 = e.type) !== 'num' && ref10 !== 'single' && ref10 !== 'double' && ref10 !== 'triple' && ref10 !== 'regex' && ref10 !== 'punct' && ref10 !== 'comment' && ref10 !== 'op') && ((ref11 = e.text) !== 'null' && ref11 !== 'undefined' && ref11 !== 'Infinity' && ref11 !== 'NaN' && ref11 !== 'true' && ref11 !== 'false' && ref11 !== 'yes' && ref11 !== 'no') && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && ((ref12 = (ref13 = e.call) != null ? (ref14 = ref13.callee) != null ? ref14.text : void 0 : void 0) !== 'delete' && ref12 !== 'new' && ref12 !== 'typeof') && indexOf.call(this.stack, '▸arg') < 0) {
                this.verb('lhs is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                this.verb('    is lhs of implicit call! nxt', nxt);
                this.verb('    is lhs first', first);
                e = this.call(e, tokens);
                break;
            } else if (nxt.type === 'op' && ((ref15 = nxt.text) === '+' || ref15 === '-') && ((ref16 = e.text) !== '[' && ref16 !== '(')) {
                if (spaced && ((ref17 = tokens[1]) != null ? ref17.col : void 0) === nxt.col + nxt.text.length) {
                    this.verb('lhs op is unbalanced +- break...', e, nxt, this.stack);
                    break;
                }
                this.verb('lhs is lhs of op', e, nxt);
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

    Parse.prototype.shiftNewline = function(rule, tokens) {
        if (this.debug) {
            console.log(M3(y5(" ◂ " + (w1(rule)))));
        }
        return tokens.shift();
    };

    Parse.prototype.nameMethods = function(mthds) {
        var i, len, m, name, ref1;
        if (mthds != null ? mthds.length : void 0) {
            for (i = 0, len = mthds.length; i < len; i++) {
                m = mthds[i];
                if (name = (ref1 = m.keyval.key) != null ? ref1.text : void 0) {
                    m.keyval.val.func.name = {
                        type: 'name',
                        text: name
                    };
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
        return this.stack.push(node);
    };

    Parse.prototype.pop = function(n) {
        var p;
        p = this.stack.pop();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseURBQUE7SUFBQTs7QUFRQSxJQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLE1BQXVDLE9BQUEsQ0FBUSxTQUFSLENBQXZDLEVBQUUsK0JBQUYsRUFBZ0IsNkJBQWhCLEVBQTZCOztBQUV2QjtJQUVDLGVBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFDLENBQUEsT0FBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUMsQ0FBQSxHQUFELEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFJLENBQUM7SUFKeEI7O29CQVlILEtBQUEsR0FBTyxTQUFDLEtBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUNULElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07UUFHTixHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBVyxLQUFLLENBQUMsTUFBakIsQ0FBWDtRQUVOLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtZQUFBLElBQUEsRUFBSyxFQUFMO1lBQ0EsSUFBQSxFQUFLLEdBREw7O0lBWkc7O29CQXVCUCxJQUFBLEdBQU0sU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLElBQWY7QUFFRixZQUFBO1FBQUEsSUFBVSxLQUFBLENBQU0sTUFBTixDQUFWO0FBQUEsbUJBQUE7O1FBRUEsSUFB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MDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5cbnsgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCwgZW1wdHkgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgID0gQGtvZGUuYXJncy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSAgPSBAa29kZS5hcmdzLnZlcmJvc2VcbiAgICAgICAgQHJhdyAgICAgID0gQGtvZGUuYXJncy5yYXdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBwYXJzZTogKGJsb2NrKSAtPiAjIGNvbnZlcnQgYmxvY2sgdHJlZSB0byBhYnN0cmFjdCBzeW50YXggdHJlZVxuXG4gICAgICAgIEBzdGFjayA9IFtdXG4gICAgICAgIEBzaGVhcCA9IFtdXG5cbiAgICAgICAgYXN0ID0gW11cblxuICAgICAgICAjIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgYXN0ID0gYXN0LmNvbmNhdCBAZXhwcyAndGwnIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICB2YXJzOltdIFxuICAgICAgICBleHBzOmFzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGxpc3Qgb2YgZXhwcmVzc2lvbnNcblxuICAgIGV4cHM6IChydWxlLCB0b2tlbnMsIHN0b3ApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdleHBzJyBydWxlXG5cbiAgICAgICAgZXMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZycgICAgICAgICAgICAgICAgIHRoZW4gZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICdzd2l0Y2gnICfilrhlbHNlJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnXScgIFxuICAgICAgICAgICAgICAgIHdoZW4gJ3snICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICd9J1xuICAgICAgICAgICAgICAgIHdoZW4gJygnICAgICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ+KWuGFyZ3MnICAgICAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ107J1xuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICc7JyAjIGJhaWwgb3V0IGZvciBpbXBsaWNpdCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVuIHJ1bGUgICAgICAgICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgIGlmIGIgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdGFjayB0b3BcIiBAc3RhY2sgOyBicmVhayBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09IHN0b3AgdGhlbiBAdmVyYiBcImV4cHMgYnJlYWsgZm9yICN7dG9rZW5zWzBdLnRleHR9IGFuZCBzdG9wXCIgc3RvcCA7IGJyZWFrIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrIHN0YXJ0XCIgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXMgPSBlcy5jb25jYXQgQGV4cHMgJ2Jsb2NrJyBibG9jay50b2tlbnMgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgZW5kIHNoaWZ0IGNvbW1hICwgYW5kIGNvbnRpbnVlLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIGJsb2NrIGVuZCBubCBjb21tYSAsIGFuZCBjb250aW51ZS4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQgYnJlYWshJyBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgICAgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaycgICAgOyBicmVha1xuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknICAgICAgICB0aGVuIEB2ZXJiICdleHBzIGJyZWFrIG9uICknICAgICAgICA7IGJyZWFrXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddIGFuZCBydWxlID09ICdmb3IgdmFscycgdGhlbiBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZicgOyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnZXhwcyBubCBdIGluIGFycmF5JyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AnIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgIyBpZiBAc3RhY2tbLTFdIGluIFsnY2FsbCcgJzonICdmdW5jJyAn4pa4YXJncyddIG9yIHN0b3AgIT0gJ25sJ1xuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdIGluIFsnZnVuYycgJ+KWuGFyZ3MnXSBvciBzdG9wICE9ICdubCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBubCB3aXRoIHN0b3AgI3tzdG9wfSBpbiAje0BzdGFja1stMV19IChicmVhaywgYnV0IGRvbid0IHNoaWZ0IG5sKVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgXCJleHBzIG5sIHdpdGggc3RvcCAje3N0b3B9XCIgdG9rZW5zIFxuICAgICAgICAgICAgICAgICAgICBicmVhayBcblxuICAgICAgICAgICAgICAgIG5sID0gQHNoaWZ0TmV3bGluZSBcImV4cHMgbmwgKG5vIHN0b3ApIC4uLlwiIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLicgYW5kIHRva2Vuc1sxXT8udHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ2V4cHMgbmwgbmV4dCBsaW5lIHN0YXJ0cyB3aXRoIC52YXIhJ1xuICAgICAgICAgICAgICAgICAgICBlcy5wdXNoIEBwcm9wIGVzLnBvcCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgY29udGludWUuLi4nXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGV4ID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIGVzLnB1c2ggZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnZXhwcyBubyB0b2tlbiBjb25zdW1lZD8nXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAc2hlYXBQb3AgJ2V4cHMnIHJ1bGVcbiAgICAgICAgXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICAjIHRoaXMgYXNzdW1lcyB0aGF0IHRoZSBoYW5kbGluZyBvZiBsaXN0cyBvZiBleHByZXNzaW9ucyBpcyBkb25lIGluIGV4cHMgYW5kXG4gICAgICAgICMgc2lsZW50bHkgc2tpcHMgb3ZlciBsZWFkaW5nIHNlcGFyYXRpbmcgdG9rZW5zIGxpa2UgY29tbWF0YXMsIHNlbWljb2xvbnMgYW5kIG5sLlxuXG4gICAgICAgIHN3aXRjaCB0b2sudHlwZVxuICAgICAgICAgICAgd2hlbiAnYmxvY2snICAgICAgICAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgc3RhcnQgc2hpZnQgbmwhJ1xuICAgICAgICAgICAgICAgIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgbmxcbiAgICAgICAgICAgIHdoZW4gJ2tleXdvcmQnXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgdGhlbiByZXR1cm4gQGlmICAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgdGhlbiByZXR1cm4gQHdoaWxlICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgdGhlbiByZXR1cm4gQHJldHVybiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgdGhlbiByZXR1cm4gQHdoZW4gICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgdGhlbiByZXR1cm4gQGNsYXNzICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICB0aGVuIGlmIHRva2Vuc1swXT8udGV4dCAhPSAnOicgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIDtcblxuICAgICAgICAjIyNcbiAgICAgICAgaGVyZSBjb21lcyB0aGUgaGFpcnkgcGFydCA6LSlcbiAgICAgICAgXG4gICAgICAgIGNvbWJpbmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJ1bGUgc3RhY2ssIGN1cnJlbnQgYW5kIGZ1dHVyZSB0b2tlbnNcbiAgICAgICAgdG8gZmlndXJlIG91dCB3aGVuIHRoZSBleHByZXNzaW9uIGVuZHNcbiAgICAgICAgIyMjXG5cbiAgICAgICAgQHNoZWFwUHVzaCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIFxuICAgICAgICBlID0gdG9rXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgZSA9IEByaHMgZSwgdG9rZW5zICAgICAgICAgICAgICAgIyBmaXJzdCwgdHJ5IHRvIGVhdCBhcyBtdWNoIHRva2VucyBhcyBwb3NzaWJsZSB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgIHByaW50LmFzdCBcInJoc1wiIGUgaWYgQHZlcmJvc2UgICAgXG5cbiAgICAgICAgICAgIGUgPSBAbGhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgc2VlLCBpZiB3ZSBjYW4gdXNlIHRoZSByZXN1bHQgYXMgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHNvbWV0aGluZ1xuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZSAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgbm8gdG9rZW4gY29uc3VtZWQ6IGJyZWFrISdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICByaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdyaHMnICdyaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1bnNwYWNlZCA9IChsbGMgPSBsYXN0TGluZUNvbChlKSkuY29sID09IG54dC5jb2wgYW5kIGxsYy5saW5lID09IG54dC5saW5lXG4gICAgICAgICAgICBzcGFjZWQgPSBub3QgdW5zcGFjZWRcblxuICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gJyh7JyBhbmQgZS50eXBlIGluIFsnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAnbnVtJyAncmVnZXgnXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ+KWuGFyZycgYW5kIG54dC50eXBlID09ICdvcCcgdGhlbiBAdmVyYiAncmhzIGJyZWFrIGZvciDilrhhcmcnOyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOidcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvYmplY3QgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGtleSBvZiAoaW1wbGljaXQpIG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2tleXdvcmQnIGFuZCBueHQudGV4dCA9PSAnaW4nIGFuZCBAc3RhY2tbLTFdICE9ICdmb3InXG4gICAgICAgICAgICAgICAgZSA9IEBpbmNvbmQgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIGUudGV4dD9cbiAgICAgICAgICAgICAgICBpZiAgICAgIGUudGV4dCA9PSAnWycgICB0aGVuIGUgPSBAYXJyYXkgICAgICAgICAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgZS50ZXh0ID09ICcoJyAgIHRoZW4gZSA9IEBwYXJlbnMgICAgICAgICAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ3snICAgdGhlbiBlID0gQGN1cmx5ICAgICAgICAgICBlLCB0b2tlbnMgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ25vdCcgdGhlbiBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudGV4dCBpbiBbJysnJy0nJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBpZiBueHQudHlwZSBub3QgaW4gWyd2YXInJ3BhcmVuJ10gYW5kIGUudGV4dCBpbiBbJysrJyctLSddXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ3dyb25nIGxocyBpbmNyZW1lbnQnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgbnVsbCBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIG51bGwsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBpZiBlLm9wZXJhdGlvbi5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3I/LnRleHQgaW4gWycrKycnLS0nXVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ2xlZnQgYW5kIHJpZ2h0IHNpZGUgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBpZiBlLnR5cGUgbm90IGluIFsndmFyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgcmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlICMgaWYgZSBpcyBub3QgYSB0b2tlbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSAgICBhbmQgdW5zcGFjZWQgICAgICAgIHRoZW4gZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCk7IGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdjYWxsJyBhbmQgbnh0LnRleHQgPT0gJ10nIHRoZW4gQHZlcmIgJ3JocyBjYWxsIGFycmF5IGVuZCc7ICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICd7JyAgICBhbmQgbnh0LnRleHQgPT0gJ30nIHRoZW4gQHZlcmIgJ3JocyBjdXJseSBlbmQnOyAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snICAgIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIGFycmF5IGVuZCc7ICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snICAgIGFuZCBueHQudGV4dCA9PSAnXScgdGhlbiBAdmVyYiAncmhzIFsgYXJyYXkgZW5kJyBueHQ7ICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgXCJyaHMgbm8gbnh0IG1hdGNoPz8gc3RhY2s6I3tAc3RhY2t9IGU6XCIgZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8/IG54dDpcIiBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdyaHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZW1wdHkgQHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBlbXB0eSBzdGFjayBueHQnIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMgbGFzdCBtaW51dGUgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGltcGxlbWVudCBudWxsIGNoZWNrcyBoZXJlP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hlYXBQb3AgJ3JocycgJ3JocydcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgbGhzOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwUHVzaCAnbGhzJyAnbGhzJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGFzdCAgPSBsYXN0TGluZUNvbCAgZVxuICAgICAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wgZVxuICAgICAgICAgICAgdW5zcGFjZWQgPSBsYXN0LmNvbCA9PSBueHQuY29sIGFuZCBsYXN0LmxpbmUgPT0gbnh0LmxpbmVcbiAgICAgICAgICAgIHNwYWNlZCA9IG5vdCB1bnNwYWNlZFxuXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICB3aGVuICdbJyB0aGVuIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ3snIHRoZW4gbnh0LnRleHQgPT0gJ30nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhayBpZiBiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnQCcgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ2Jsb2NrJyBhbmQgQHN0YWNrWy0xXSA9PSAnaWYnIG9yIG54dC50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZSA9IEB0aGlzIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAgICAgIG54dC50ZXh0ID09ICcuJyAgICB0aGVuIGUgPSBAcHJvcCAgIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgdGhlbiBlID0gQHNsaWNlICBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJz8nIGFuZCB1bnNwYWNlZCBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcuJ1xuICAgICAgICAgICAgICAgIHFtYXJrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlID0gQHByb3AgZSwgdG9rZW5zLCBxbWFyayAjIHRoaXMgc2hvdWxkIGJlIGRvbmUgZGlmZmVyZW50bHkhXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgPT0gJ29wJyBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJysrJyAnLS0nICcrJyAnLScgJ25vdCddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICfilrhhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0/LnN0YXJ0c1dpdGggJ29wJyBhbmQgQHN0YWNrWy0xXSAhPSAnb3A9J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIHN0b3Agb24gb3BlcmF0aW9uJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCBlLnBhcmVuc1xuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgYXJncyBmb3IgZnVuYycgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJyBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdW5zcGFjZWQgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlZCBhbmQgKG54dC5saW5lID09IGxhc3QubGluZSBvciBueHQuY29sID4gZmlyc3QuY29sKSBhbmRcbiAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZiddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgKGUudHlwZSBub3QgaW4gWydudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnICdyZWdleCcgJ3B1bmN0JyAnY29tbWVudCcgJ29wJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgKGUudGV4dCBub3QgaW4gWydudWxsJyAndW5kZWZpbmVkJyAnSW5maW5pdHknICdOYU4nICd0cnVlJyAnZmFsc2UnICd5ZXMnICdubyddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmFycmF5IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vYmplY3QgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmtleXZhbCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub3BlcmF0aW9uIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5pbmNvbmQgYW5kXG4gICAgICAgICAgICAgICAgICAgIGUuY2FsbD8uY2FsbGVlPy50ZXh0IG5vdCBpbiBbJ2RlbGV0ZScnbmV3Jyd0eXBlb2YnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgJ+KWuGFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgZmlyc3QnIGZpcnN0IFxuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICBpZiBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgb3AgaXMgdW5iYWxhbmNlZCArLSBicmVhay4uLicgZSwgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImxocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdsaHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnbGhzJyAnbGhzJyAgICAgICBcbiAgICAgICAgZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNoaWZ0TmV3bGluZTogKHJ1bGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1ZyB0aGVuIGxvZyBNMyB5NSBcIiDil4IgI3t3MSBydWxlfVwiIFxuICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBuYW1lTWV0aG9kczogKG10aGRzKSAtPlxuIFxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgICAgIGlmIG5hbWUgPSBtLmtleXZhbC5rZXk/LnRleHRcbiAgICAgICAgICAgICAgICAgICAgbS5rZXl2YWwudmFsLmZ1bmMubmFtZSA9IHR5cGU6J25hbWUnIHRleHQ6bmFtZVxuICAgICAgICBtdGhkc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgXG4gICAgdGhlbjogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG5cbiAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIHRoZW4gdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBubCA9ICdubCdcblxuICAgICAgICBAcHVzaCAn4pa4JytpZFxuICAgICAgICBleHBzID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgQHBvcCAn4pa4JytpZFxuXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgIFxuICAgIHNoZWFwUHVzaDogKHR5cGUsIHRleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXAucHVzaCB0eXBlOnR5cGUsIHRleHQ6dGV4dFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgIHNoZWFwUG9wOiAobSwgdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvcHBlZCA9IEBzaGVhcC5wb3AoKVxuICAgICAgICBpZiBwb3BwZWQudGV4dCAhPSB0IGFuZCBwb3BwZWQudGV4dCAhPSBrc3RyLnN0cmlwKHQsIFwiJ1wiKSB0aGVuIGVycm9yICd3cm9uZyBwb3A/JyBwb3BwZWQudGV4dCwgdFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAsIHBvcHBlZCBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuICAgIHB1c2g6IChub2RlKSAtPlxuXG4gICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgbm9kZSBpZiBAZGVidWdcbiAgICAgICAgQHN0YWNrLnB1c2ggbm9kZVxuXG4gICAgcG9wOiAobikgLT5cbiAgICAgICAgcCA9IEBzdGFjay5wb3AoKVxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+IGlmIEB2ZXJib3NlIHRoZW4gY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50cyBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VcbiJdfQ==
//# sourceURL=../coffee/parse.coffee
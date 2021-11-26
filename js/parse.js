// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */
var Parse, Renderer, empty, kstr, print,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

kstr = require('kstr');

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

Renderer = require('./renderer');

Parse = (function() {
    function Parse(args) {
        this.firstLineCol = bind(this.firstLineCol, this);
        this.lastLineCol = bind(this.lastLineCol, this);
        this.renderer = new Renderer(args);
        this.debug = args != null ? args.debug : void 0;
        this.verbose = args != null ? args.verbose : void 0;
        this.raw = args != null ? args.raw : void 0;
    }

    Parse.prototype.parse = function(block) {
        var ast;
        this.stack = [];
        this.sheap = [];
        ast = [];
        while (block.tokens.length) {
            ast = ast.concat(this.exps('tl', block.tokens));
        }
        if (this.raw) {
            print.noon('raw ast', ast);
        }
        return ast;
    };

    Parse.prototype.exps = function(rule, tokens, stop) {
        var b, block, es, ex, nl, numTokens, ref, ref1, ref2, ref3, ref4, ref5;
        if (empty(tokens)) {
            return;
        }
        this.sheapPush('exps', rule);
        es = [];
        while (tokens.length) {
            numTokens = tokens.length;
            b = (function() {
                var ref, ref1;
                switch (this.stack.slice(-1)[0]) {
                    case 'onearg':
                        return es.length;
                    case 'if':
                    case 'switch':
                        return tokens[0].text === 'else';
                    case '[':
                        return tokens[0].text === ']';
                    case 'call':
                        return ref = tokens[0].text, indexOf.call(')}];', ref) >= 0;
                    case '{':
                        return ref1 = tokens[0].text, indexOf.call(')}];', ref1) >= 0;
                    case rule:
                        return tokens[0].text === stop;
                    default:
                        return false;
                }
            }).call(this);
            if (b) {
                this.verb('exps break for stack top', this.stack);
                break;
            }
            if (tokens[0].type === 'block') {
                block = tokens.shift();
                this.verb("exps block start", block);
                es = es.concat(this.exps('exps block', block.tokens));
                if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
                    this.verb("exps block end shift nl");
                    nl = tokens.shift();
                }
                if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ',') {
                    this.verb("exps block end shift , and continue...");
                    tokens.shift();
                    continue;
                }
                this.verb('exps block end break!');
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
            if (rule === 'for vals' && ((ref2 = tokens[0].text) === 'in' || ref2 === 'of')) {
                this.verb('exps break on in|of');
                break;
            }
            if (tokens[0].type === 'nl') {
                this.verb('exps nl stop:', stop, tokens[0], this.stack);
                if (this.stack.slice(-1)[0] === '[' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) === ']') {
                    this.verb('exps nl in array (shift and break)');
                    tokens.shift();
                    break;
                }
                if (stop) {
                    this.verb('exps nl with stop');
                    if (this.stack.slice(-1)[0] === 'call') {
                        this.verb("exps nl with stop in call (break, but don't shift nl)");
                    } else {
                        this.verb('exps nl with stop (shift and break)');
                        tokens.shift();
                    }
                    break;
                }
                this.verb('exps nl shift and ...');
                nl = tokens.shift();
                if (((ref4 = tokens[0]) != null ? ref4.text : void 0) === '.' && ((ref5 = tokens[1]) != null ? ref5.type : void 0) === 'var') {
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
        var e, numTokens, ref, ref1, ref2, ref3, ref4, tok;
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
                        if (((ref = tokens[0]) != null ? ref.text : void 0) !== ':') {
                            return this.exp(tokens);
                        }
                }
        }

        /*
        here comes the hairy part :-)
        
        combine information about the rule stack, current and future tokens
        to figure out when the expression ends
         */
        this.sheapPush('exp', (ref1 = tok.text) != null ? ref1 : tok.type);
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
                if (ref2 = (ref3 = tokens[0]) != null ? ref3.text : void 0, indexOf.call(',', ref2) >= 0) {
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
        this.sheapPop('exp', (ref4 = tok.text) != null ? ref4 : tok.type);
        return e;
    };

    Parse.prototype.rhs = function(e, tokens) {
        var llc, numTokens, nxt, ref, ref1, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, spaced, unspaced;
        this.sheapPush('rhs', 'rhs');
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            unspaced = (llc = this.lastLineCol(e)).col === nxt.col && llc.line === nxt.line;
            spaced = !unspaced;
            if (this.stack.slice(-1)[0] === 'onearg' && ((ref = nxt.type) === 'op')) {
                this.verb('rhs break for onearg');
                break;
            }
            if (spaced && nxt.text === '(') {
                this.verb('rhs is open paren');
                e = this.parens(e, tokens);
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
                if (e.text === '(') {
                    e = this.parens(e, tokens);
                } else if (e.text === '[') {
                    e = this.array(e, tokens);
                } else if (e.text === '{') {
                    e = this.curly(e, tokens);
                } else if (((ref1 = e.text) === '+' || ref1 === '-' || ref1 === '++' || ref1 === '--') && unspaced) {
                    if (((ref2 = nxt.type) !== 'var' && ref2 !== 'paren') && ((ref3 = e.text) === '++' || ref3 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    this.verb('lhs null operation');
                    e = this.operation(null, e, tokens);
                    if ((ref4 = (ref5 = e.operation.rhs) != null ? (ref6 = ref5.operation) != null ? (ref7 = ref6.operator) != null ? ref7.text : void 0 : void 0 : void 0) === '++' || ref4 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref8 = nxt.text) === '++' || ref8 === '--') && unspaced) {
                    if ((ref9 = e.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref10 = e.type) === 'var' || ref10 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('rhs array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('rhs curly end');
                    break;
                } else {
                    if (this.verbose) {
                        print.tokens("rhs no nxt match? break! stack:" + this.stack + " nxt:", [nxt]);
                    }
                    break;
                }
            } else {
                if (((ref11 = nxt.text) === '++' || ref11 === '--') && unspaced) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref12 = this.stack.slice(-1)[0], indexOf.call('.', ref12) < 0)) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === 'call' && nxt.text === ']') {
                    this.verb('rhs call array end');
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
        var b, f, first, last, numTokens, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, spaced, unspaced;
        this.sheapPush('lhs', 'lhs');
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            last = this.lastLineCol(e);
            first = this.firstLineCol(e);
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
                this.verb('lhs prop');
                e = this.prop(e, tokens);
            } else if (nxt.text === '?' && unspaced && ((ref = tokens[1]) != null ? ref.text : void 0) === '.') {
                qmark = tokens.shift();
                e = this.prop(e, tokens, qmark);
            } else if (nxt.type === 'op' && ((ref1 = nxt.text) !== '++' && ref1 !== '--' && ref1 !== '+' && ref1 !== '-') && ((ref2 = e.text) !== '[' && ref2 !== '(') && indexOf.call(this.stack, 'onearg') < 0) {
                this.verb('lhs is lhs of op', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (((ref3 = nxt.text) === '+' || ref3 === '-') && ((ref4 = e.text) !== '[' && ref4 !== '(') && spaced && ((ref5 = tokens[1]) != null ? ref5.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('lhs is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && e.parens) {
                f = tokens.shift();
                this.verb('rhs func for e', e);
                e = this.func(e, f, tokens);
            } else if (nxt.text === '(' && unspaced) {
                this.verb('lhs is lhs of call');
                e = this.call(e, tokens);
            } else if (nxt.text === '[' && unspaced && ((ref6 = tokens[1]) != null ? ref6.text : void 0) !== ']') {
                this.verb('rhs is lhs of index', e);
                e = this.index(e, tokens);
            } else if (spaced && (nxt.line === last.line || nxt.col > first.col) && (ref7 = nxt.text, indexOf.call(')]},;:.', ref7) < 0) && ((ref8 = nxt.text) !== 'then' && ref8 !== 'else' && ref8 !== 'break' && ref8 !== 'continue' && ref8 !== 'in' && ref8 !== 'of') && ((ref9 = nxt.type) !== 'nl') && ((ref10 = e.type) !== 'num' && ref10 !== 'single' && ref10 !== 'double' && ref10 !== 'triple' && ref10 !== 'regex' && ref10 !== 'punct' && ref10 !== 'comment' && ref10 !== 'op') && ((ref11 = e.text) !== 'null' && ref11 !== 'undefined' && ref11 !== 'Infinity' && ref11 !== 'NaN' && ref11 !== 'true' && ref11 !== 'false' && ref11 !== 'yes' && ref11 !== 'no') && (e.type !== 'keyword' || ((ref12 = e.text) === 'new' || ref12 === 'require' || ref12 === 'typeof' || ref12 === 'delete')) && !e.array && !e.object && !e.keyval && !e.operation && !e.incond && ((ref13 = (ref14 = e.call) != null ? (ref15 = ref14.callee) != null ? ref15.text : void 0 : void 0) !== 'delete' && ref13 !== 'new' && ref13 !== 'typeof') && indexOf.call(this.stack, 'onearg') < 0) {
                this.verb('lhs is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                this.verb('    is lhs of implicit call! nxt', nxt);
                this.verb('    is lhs first', first);
                e = this.call(e, tokens);
                break;
            } else if (nxt.type === 'op' && ((ref16 = nxt.text) === '+' || ref16 === '-') && ((ref17 = e.text) !== '[' && ref17 !== '(')) {
                if (spaced && ((ref18 = tokens[1]) != null ? ref18.col : void 0) === nxt.col + nxt.text.length) {
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

    Parse.prototype.then = function(id, tokens) {
        var block, nl, ref, ref1, ref2, thn;
        if (((ref = tokens[0]) != null ? ref.text : void 0) === 'then') {
            tokens.shift();
            nl = 'nl';
        } else if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'nl') {
                tokens.shift();
            }
            tokens = block.tokens;
            nl = null;
        } else {
            console.error(id + ": then or block expected!");
        }
        thn = this.exps(id, tokens, nl);
        if (block && block.tokens.length) {
            print.tokens('dangling then tokens', tokens);
        }
        return thn;
    };

    Parse.prototype.block = function(id, tokens) {
        var block, exps, nl, ref, ref1;
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl') {
                tokens.shift();
            }
            tokens = block.tokens;
            nl = null;
        } else {
            nl = 'nl';
        }
        exps = this.exps(id, tokens, nl);
        if (block && block.tokens.length) {
            print.tokens('dangling block tokens', tokens);
        }
        return exps;
    };

    Parse.prototype.blockExp = function(id, tokens) {
        var block, ref;
        this.verb("blockExp " + id);
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'block') {
            block = tokens.shift();
            return this.exp(block.tokens);
        } else {
            return this.exp(tokens);
        }
    };

    Parse.prototype.lastLineCol = function(e) {
        var cols, ref;
        if ((e != null ? e.col : void 0) != null) {
            return {
                line: e.line,
                col: e.col + ((ref = e.text) != null ? ref.length : void 0)
            };
        } else if ((e != null) && e instanceof Object) {
            cols = Object.values(e).map(this.lastLineCol);
            if (!empty(cols)) {
                return cols.reduce(function(a, b) {
                    if (a.line > b.line) {
                        return a;
                    } else if (a.line === b.line) {
                        if (a.col > b.col) {
                            return a;
                        } else {
                            return b;
                        }
                    } else {
                        return b;
                    }
                });
            }
        }
        return {
            line: 1,
            col: 0
        };
    };

    Parse.prototype.firstLineCol = function(e) {
        var cols;
        if ((e != null ? e.col : void 0) != null) {
            return {
                line: e.line,
                col: e.col
            };
        } else if ((e != null) && e instanceof Object) {
            cols = Object.values(e).map(this.firstLineCol);
            if (!empty(cols)) {
                return cols.reduce(function(a, b) {
                    if (a.line < b.line) {
                        return a;
                    } else if (a.line === b.line) {
                        if (a.col < b.col) {
                            return a;
                        } else {
                            return b;
                        }
                    } else {
                        return b;
                    }
                });
            }
        }
        return {
            line: 2e308,
            col: 2e308
        };
    };

    Parse.prototype.sheapPush = function(type, text) {
        this.sheap.push({
            type: type,
            text: text
        });
        if (this.verbose) {
            return print.sheap(this.sheap);
        }
    };

    Parse.prototype.sheapPop = function(m, t) {
        var popped;
        popped = this.sheap.pop();
        if (popped.text !== t && popped.text !== kstr.strip(t, "'")) {
            console.error('wrong pop?', popped.text, t);
        }
        if (this.verbose) {
            return print.sheap(this.sheap, popped);
        }
    };

    Parse.prototype.push = function(node) {
        if (this.verbose) {
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
        if (this.verbose) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUNBQUE7SUFBQTs7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVSLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7QUFFTDtJQUVDLGVBQUMsSUFBRDs7O1FBRUMsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLFFBQUosQ0FBYSxJQUFiO1FBQ1osSUFBQyxDQUFBLEtBQUQsa0JBQVksSUFBSSxDQUFFO1FBQ2xCLElBQUMsQ0FBQSxPQUFELGtCQUFZLElBQUksQ0FBRTtRQUNsQixJQUFDLENBQUEsR0FBRCxrQkFBWSxJQUFJLENBQUU7SUFMbkI7O29CQWFILEtBQUEsR0FBTyxTQUFDLEtBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUNULElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07QUFFTixlQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBbkI7WUFDSSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBVyxLQUFLLENBQUMsTUFBakIsQ0FBWDtRQURWO1FBR0EsSUFBRyxJQUFDLENBQUEsR0FBSjtZQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFxQixH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QUMsS0FBTCxDQUFXLENBQVgsRUFBYyxHQUFkLENBQXZDO1lBQXdELE9BQUEsQ0FBTyxLQUFQLENBQWEsWUFBYixFQUEwQixNQUFNLENBQUMsSUFBakMsRUFBdUMsQ0FBdkMsRUFBeEQ7O1FBQ0EsSUFBOEIsSUFBQyxDQUFBLE9BQS9CO21CQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsTUFBcEIsRUFBQTs7SUFKTTs7b0JBWVYsSUFBQSxHQUFNLFNBQUMsSUFBRDtRQUVGLElBQTRCLElBQUMsQ0FBQSxPQUE3QjtZQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsSUFBcEIsRUFBQTs7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO0lBSEU7O29CQUtOLEdBQUEsR0FBSyxTQUFDLENBQUQ7QUFDRCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBO1FBQ0osSUFBRyxDQUFBLEtBQUssQ0FBUjtZQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8saUJBQVAsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFESDs7UUFFQSxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsQ0FBcEIsRUFBdUIsU0FBQyxDQUFEO3VCQUFPLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFKQzs7b0JBT0wsSUFBQSxHQUFNLFNBQUE7UUFFRixJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFESjs7SUFGRTs7Ozs7O0FBS1YsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5SZW5kZXJlciA9IHJlcXVpcmUgJy4vcmVuZGVyZXInXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoYXJncykgLT5cblxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgYXJnc1xuICAgICAgICBAZGVidWcgICAgPSBhcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSAgPSBhcmdzPy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgICA9IGFyZ3M/LnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cbiAgICAgICAgQHNoZWFwID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgYXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgbGlzdCBvZiBleHByZXNzaW9uc1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cHMnIHJ1bGVcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnb25lYXJnJyAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ10nICBcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJyl9XTsnICMgYmFpbCBvdXQgZm9yIGltcGxpY2l0IGNhbGxzXG4gICAgICAgICAgICAgICAgd2hlbiAneycgICAgICAgICAgICB0aGVuIHRva2Vuc1swXS50ZXh0IGluICcpfV07JyAjIGJhaWwgb3V0IGZvciBpbXBsaWNpdCBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoZW4gcnVsZSAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGZhbHNlXG5cbiAgICAgICAgICAgIGlmIGJcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBmb3Igc3RhY2sgdG9wJyBAc3RhY2tcbiAgICAgICAgICAgICAgICBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBzdGFydFwiIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IEBleHBzICdleHBzIGJsb2NrJyBibG9jay50b2tlbnMgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgbmxcIiBcbiAgICAgICAgICAgICAgICAgICAgbmwgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgLCBhbmQgY29udGludWUuLi5cIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQgYnJlYWshJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIGJsb2NrJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiApJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBydWxlID09ICdmb3IgdmFscycgYW5kIHRva2Vuc1swXS50ZXh0IGluIFsnaW4nJ29mJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZidcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgaW4gYXJyYXkgKHNoaWZ0IGFuZCBicmVhayknXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgd2l0aCBzdG9wJyBcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBubCB3aXRoIHN0b3AgaW4gY2FsbCAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AgKHNoaWZ0IGFuZCBicmVhayknIFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KCkgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIFxuXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc2hpZnQgYW5kIC4uLicgICAgIFxuICAgICAgICAgICAgICAgIG5sID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgbG9nICd0b2tlbnNbMF0uY29sJyB0b2tlbnNbMF0uY29sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgY29udGludWUuLi4nIFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBleCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBlcy5wdXNoIGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2V4cHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQHNoZWFwUG9wICdleHBzJyBydWxlXG4gICAgICAgIFxuICAgICAgICBlc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgc2luZ2xlIGV4cHJlc3Npb25cblxuICAgIGV4cDogKHRva2VucykgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgdG9rID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBsb2cgWTUgdzEgdG9rPy50ZXh0IGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgIyB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgaGFuZGxpbmcgb2YgbGlzdHMgb2YgZXhwcmVzc2lvbnMgaXMgZG9uZSBpbiBleHBzIGFuZFxuICAgICAgICAjIHNpbGVudGx5IHNraXBzIG92ZXIgbGVhZGluZyBzZXBhcmF0aW5nIHRva2VucyBsaWtlIGNvbW1hdGFzLCBzZW1pY29sb25zIGFuZCBubC5cblxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICAgICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIHN0YXJ0IHNoaWZ0IG5sISdcbiAgICAgICAgICAgICAgICByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIG5sXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJ1xuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgIHRoZW4gcmV0dXJuIEBpZiAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgIHRoZW4gcmV0dXJuIEBzd2l0Y2ggdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgIHRoZW4gcmV0dXJuIEBjbGFzcyAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICc7JyAgICAgICAgdGhlbiBpZiB0b2tlbnNbMF0/LnRleHQgIT0gJzonIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCA7XG5cbiAgICAgICAgIyMjXG4gICAgICAgIGhlcmUgY29tZXMgdGhlIGhhaXJ5IHBhcnQgOi0pXG4gICAgICAgIFxuICAgICAgICBjb21iaW5lIGluZm9ybWF0aW9uIGFib3V0IHRoZSBydWxlIHN0YWNrLCBjdXJyZW50IGFuZCBmdXR1cmUgdG9rZW5zXG4gICAgICAgIHRvIGZpZ3VyZSBvdXQgd2hlbiB0aGUgZXhwcmVzc2lvbiBlbmRzXG4gICAgICAgICMjI1xuXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuICAgICAgICBcbiAgICAgICAgZSA9IHRva1xuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGUgPSBAcmhzIGUsIHRva2VucyAgICAgICAgICAgICAgICMgZmlyc3QsIHRyeSB0byBlYXQgYXMgbXVjaCB0b2tlbnMgYXMgcG9zc2libGUgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICBwcmludC5hc3QgXCJyaHNcIiBlIGlmIEB2ZXJib3NlICAgIFxuXG4gICAgICAgICAgICBlID0gQGxocyBlLCB0b2tlbnMgICAgICAgICAgICAgICAjIHNlZSwgaWYgd2UgY2FuIHRoZSByZXN1bHQgYXMgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHNvbWV0aGluZ1xuICAgICAgICAgICAgcHJpbnQuYXN0IFwibGhzXCIgZSBpZiBAdmVyYm9zZSAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCBpbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBzaGlmdCBjb21tYSdcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgbm8gdG9rZW4gY29uc3VtZWQ6IGJyZWFrISdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgICMgYmFpbCBvdXQgaWYgbm8gdG9rZW4gd2FzIGNvbnN1bWVkXG4gICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG4gICAgICAgIGUgICAgICAgIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICByaHM6IChlLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXBQdXNoICdyaHMnICdyaHMnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aFxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB1bnNwYWNlZCA9IChsbGMgPSBAbGFzdExpbmVDb2woZSkpLmNvbCA9PSBueHQuY29sIGFuZCBsbGMubGluZSA9PSBueHQubGluZVxuICAgICAgICAgICAgc3BhY2VkID0gbm90IHVuc3BhY2VkXG5cbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ29uZWFyZycgYW5kIG54dC50eXBlIGluIFsnb3AnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgYnJlYWsgZm9yIG9uZWFyZydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3BhY2VkIGFuZCBueHQudGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIG9wZW4gcGFyZW4nXG4gICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgZSwgdG9rZW5zXG5cbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdrZXl3b3JkJyBhbmQgbnh0LnRleHQgPT0gJ2luJyBhbmQgQHN0YWNrWy0xXSAhPSAnZm9yJ1xuICAgICAgICAgICAgICAgIGUgPSBAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQ/XG4gICAgICAgICAgICAgICAgaWYgICAgICBlLnRleHQgPT0gJygnIHRoZW4gZSA9IEBwYXJlbnMgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ1snIHRoZW4gZSA9IEBhcnJheSAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgPT0gJ3snIHRoZW4gZSA9IEBjdXJseSAgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRleHQgaW4gWycrJyctJycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgbm90IGluIFsndmFyJydwYXJlbiddIGFuZCBlLnRleHQgaW4gWycrKycnLS0nXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyBsaHMgaW5jcmVtZW50JyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG51bGwgb3BlcmF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yPy50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdsZWZ0IGFuZCByaWdodCBzaWRlIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgdW5zcGFjZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50eXBlIG5vdCBpbiBbJ3ZhciddXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ3dyb25nIHJocyBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIGUudHlwZSBpbiBbJ3ZhcicgJ251bSddXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAc2xpY2UgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgbnh0LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgYXJyYXkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgYW5kIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGN1cmx5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwicmhzIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSAjIG1pc3NpbmcgYnJlYWsgaGVyZT9cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgQHN0YWNrWy0xXSBub3QgaW4gJy4nICMgaSB0aGluayB0aGlzIHNob3VsZCBiZSByZW1vdmVkIVxuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2VucyAjIG1pc3NpbmcgYnJlYWsgaGVyZT9cbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBjYWxsIGFycmF5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBbIGFycmF5IGVuZCcgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwicmhzIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcInJocyBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAncmhzIG5vIHRva2VuIGNvbnN1bWVkPydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgaWYgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGVtcHR5IEBzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgZW1wdHkgc3RhY2sgbnh0JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAncmhzIGlzIGxhc3QgbWludXRlIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2VucyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBpbXBsZW1lbnQgbnVsbCBjaGVja3MgaGVyZT9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoZWFwUG9wICdyaHMnICdyaHMnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGxoczogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2xocycgJ2xocydcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxhc3QgID0gQGxhc3RMaW5lQ29sICBlXG4gICAgICAgICAgICBmaXJzdCA9IEBmaXJzdExpbmVDb2wgZVxuICAgICAgICAgICAgdW5zcGFjZWQgPSBsYXN0LmNvbCA9PSBueHQuY29sIGFuZCBsYXN0LmxpbmUgPT0gbnh0LmxpbmVcbiAgICAgICAgICAgIHNwYWNlZCA9IG5vdCB1bnNwYWNlZFxuXG4gICAgICAgICAgICBiID0gc3dpdGNoIEBzdGFja1stMV1cbiAgICAgICAgICAgICAgICB3aGVuICdbJyB0aGVuIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ3snIHRoZW4gbnh0LnRleHQgPT0gJ30nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhayBpZiBiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUudGV4dCA9PSAnQCcgXG4gICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ2Jsb2NrJyBhbmQgQHN0YWNrWy0xXSA9PSAnaWYnIG9yIG54dC50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZSA9IEB0aGlzIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBueHQudGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIHByb3AnXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2Vuc1xuXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc/JyBhbmQgdW5zcGFjZWQgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBxbWFyayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2VucywgcW1hcmsgIyB0aGlzIHNob3VsZCBiZSBkb25lIGRpZmZlcmVudGx5IVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnb3AnIGFuZCBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kICdvbmVhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudGV4dCBub3QgaW4gWydbJyAnKCddIGFuZFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID4gbnh0LmNvbCtueHQudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCBlLnBhcmVuc1xuICAgICAgICAgICAgICAgIGYgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgZnVuYyBmb3IgZScgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCBmLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnIGFuZCB1bnNwYWNlZFxuICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCB1bnNwYWNlZCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJyAjIGFuZCBlLnRleHQgIT0gJ1snXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3JocyBpcyBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBzcGFjZWQgYW5kIChueHQubGluZSA9PSBsYXN0LmxpbmUgb3Igbnh0LmNvbCA+IGZpcnN0LmNvbCkgYW5kXG4gICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiAnKV19LDs6LicgYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWyd0aGVuJyAnZWxzZScgJ2JyZWFrJyAnY29udGludWUnICdpbicgJ29mJ10gYW5kIFxuICAgICAgICAgICAgICAgICAgICBueHQudHlwZSBub3QgaW4gWydubCddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgKGUudHlwZSBub3QgaW4gWydudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnICdyZWdleCcgJ3B1bmN0JyAnY29tbWVudCcgJ29wJ10pIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgKGUudGV4dCBub3QgaW4gWydudWxsJyAndW5kZWZpbmVkJyAnSW5maW5pdHknICdOYU4nICd0cnVlJyAnZmFsc2UnICd5ZXMnICdubyddKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIChlLnR5cGUgIT0gJ2tleXdvcmQnIG9yIChlLnRleHQgaW4gWyduZXcnICdyZXF1aXJlJyAndHlwZW9mJyAnZGVsZXRlJ10pKSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmFycmF5IGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5vYmplY3QgYW5kXG4gICAgICAgICAgICAgICAgICAgIG5vdCBlLmtleXZhbCBhbmRcbiAgICAgICAgICAgICAgICAgICAgbm90IGUub3BlcmF0aW9uIGFuZFxuICAgICAgICAgICAgICAgICAgICBub3QgZS5pbmNvbmQgYW5kXG4gICAgICAgICAgICAgICAgICAgIGUuY2FsbD8uY2FsbGVlPy50ZXh0IG5vdCBpbiBbJ2RlbGV0ZScnbmV3Jyd0eXBlb2YnXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgJ29uZWFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgQHZlcmIgJyAgICBpcyBsaHMgZmlyc3QnIGZpcnN0IFxuICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICBpZiBzcGFjZWQgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdsaHMgb3AgaXMgdW5iYWxhbmNlZCArLSBicmVhay4uLicgZSwgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImxocyBubyBueHQgbWF0Y2g/IGJyZWFrISBzdGFjazoje0BzdGFja30gbnh0OlwiIFtueHRdIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBudW1Ub2tlbnMgPT0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGVycm9yICdsaHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnbGhzJyAnbGhzJyAgICAgICBcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgXG4gICAgdGhlbjogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBlcnJvciBcIiN7aWR9OiB0aGVuIG9yIGJsb2NrIGV4cGVjdGVkIVwiXG5cbiAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIHRoZW4gdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzID0gQGV4cHMgaWQsIHRva2VucywgbmxcblxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGJsb2NrRXhwOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEB2ZXJiIFwiYmxvY2tFeHAgI3tpZH1cIlxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgIyBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyB0aGVuIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBAZXhwIGJsb2NrLnRva2Vuc1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGxhc3RMaW5lQ29sOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGU/LmNvbD9cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGxpbmU6IGUubGluZVxuICAgICAgICAgICAgICAgIGNvbDogIGUuY29sK2UudGV4dD8ubGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgZT8gYW5kIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIGNvbHMgPSBPYmplY3QudmFsdWVzKGUpLm1hcCBAbGFzdExpbmVDb2xcbiAgICAgICAgICAgIGlmIG5vdCBlbXB0eSBjb2xzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHMucmVkdWNlIChhLGIpIC0+IFxuICAgICAgICAgICAgICAgICAgICBpZiBhLmxpbmUgPiBiLmxpbmUgdGhlbiBhIFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGEubGluZSA9PSBiLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGEuY29sID4gYi5jb2wgdGhlbiBhIGVsc2UgYlxuICAgICAgICAgICAgICAgICAgICBlbHNlIGJcbiAgICAgICAgbGluZToxXG4gICAgICAgIGNvbDogMFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZmlyc3RMaW5lQ29sOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGU/LmNvbD9cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGxpbmU6IGUubGluZVxuICAgICAgICAgICAgICAgIGNvbDogIGUuY29sXG4gICAgICAgIGVsc2UgaWYgZT8gYW5kIGUgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgIGNvbHMgPSBPYmplY3QudmFsdWVzKGUpLm1hcCBAZmlyc3RMaW5lQ29sXG4gICAgICAgICAgICBpZiBub3QgZW1wdHkgY29sc1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2xzLnJlZHVjZSAoYSxiKSAtPiBcbiAgICAgICAgICAgICAgICAgICAgaWYgYS5saW5lIDwgYi5saW5lIHRoZW4gYSBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBhLmxpbmUgPT0gYi5saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBhLmNvbCA8IGIuY29sIHRoZW4gYSBlbHNlIGJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBiXG4gICAgICAgIGxpbmU6SW5maW5pdHlcbiAgICAgICAgY29sOiBJbmZpbml0eVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICBcbiAgICBcbiAgICBzaGVhcFB1c2g6ICh0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgQHNoZWFwLnB1c2ggdHlwZTp0eXBlLCB0ZXh0OnRleHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgIHNoZWFwUG9wOiAobSwgdCkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvcHBlZCA9IEBzaGVhcC5wb3AoKVxuICAgICAgICBpZiBwb3BwZWQudGV4dCAhPSB0IGFuZCBwb3BwZWQudGV4dCAhPSBrc3RyLnN0cmlwKHQsIFwiJ1wiKSB0aGVuIGVycm9yICd3cm9uZyBwb3A/JyBwb3BwZWQudGV4dCwgdFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAsIHBvcHBlZCBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEB2ZXJib3NlXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+XG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee
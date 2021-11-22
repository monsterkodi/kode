// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000  00000000
000   000  000   000  000   000  000       000       000   000
00000000   000000000  0000000    0000000   0000000   0000000
000        000   000  000   000       000  000       000   000
000        000   000  000   000  0000000   00000000  000   000
 */
var Parser, empty, print,
    indexOf = [].indexOf;

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

Parser = (function() {
    function Parser(args) {
        this.debug = args != null ? args.debug : void 0;
        this.verbose = args != null ? args.verbose : void 0;
        this.raw = args != null ? args.raw : void 0;
    }

    Parser.prototype.parse = function(block) {
        var ast;
        this.stack = [];
        ast = this.exps('tl block', block.tokens);
        if (this.raw) {
            print.noon('raw ast', ast);
        }
        if (block.tokens.length) {
            print.tokens(block.tokens.length + " remaining tokens:", block.tokens);
        }
        return ast;
    };

    Parser.prototype.exps = function(rule, tokens, stop) {
        var block, es, ex, ref, ref1, ref2, ref3;
        if (empty(tokens)) {
            return;
        }
        if (tokens[0].type === 'block') {
            block = tokens.shift();
            if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
                if (this.debug) {
                    print.tokens('swallow nl', tokens);
                }
                tokens.shift();
            }
            return this.exps('exps block', block.tokens);
        }
        es = [];
        while (tokens.length) {
            if (this.stack.slice(-1)[0] === rule && tokens[0].text === stop) {
                this.verb("stack.end " + this.stack.slice(-1)[0] + " " + tokens[0].text);
                break;
            } else if (((ref1 = this.stack.slice(-1)[0]) === 'if' || ref1 === 'switch') && (tokens[0].text === 'else')) {
                this.verb('exps else break');
                break;
            }
            if (tokens[0].type === 'nl') {
                this.verb('exps nl stop:', stop, tokens[0], this.stack);
                if (this.stack.slice(-1)[0] === 'if' && ((ref2 = tokens[1]) != null ? ref2.text : void 0) !== 'else') {
                    this.verb('exps ifbreak (shift nl ; and break)');
                    tokens.shift();
                    break;
                }
                if (stop) {
                    if (this.stack.slice(-1)[0] === 'call') {
                        this.verb('exps call.end (dont shift nl)');
                    } else {
                        tokens.shift();
                    }
                    this.verb('exps break on nl ;');
                    break;
                }
                tokens.shift();
                this.verb('exps continue...');
                continue;
            }
            if (tokens[0].text === ';') {
                if ((ref3 = this.stack.slice(-1)[0]) === 'call' || ref3 === '{') {
                    this.verb('exps call break on ;');
                    tokens.shift();
                    break;
                }
            }
            if (tokens[0].type === 'block') {
                this.verb('exps break on block');
                break;
            }
            if (tokens[0].text === ')') {
                this.verb('exps break on )');
                break;
            }
            ex = this.exp(tokens);
            es.push(ex);
        }
        return es;
    };

    Parser.prototype.exp = function(tokens) {
        var e, f, last, nxt, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref4, ref5, ref6, ref7, ref8, ref9, tok;
        if (empty(tokens)) {
            return;
        }
        tok = tokens.shift();
        if (this.debug) {
            console.log(Y5(w1(tok != null ? tok.text : void 0)));
        }
        if (tok.type === 'block') {
            console.log("DAGFUK! CLEAN UP YOUR MESSS!");
            if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
                tokens.shift();
            }
            return this.exps('exp block', tok.tokens);
        } else if (tok.text === 'if') {
            return this["if"](tok, tokens);
        } else if (tok.text === 'for') {
            return this["for"](tok, tokens);
        } else if (tok.text === 'while') {
            return this["while"](tok, tokens);
        } else if (tok.text === 'switch') {
            return this["switch"](tok, tokens);
        } else if (tok.text === 'when') {
            return this.when(tok, tokens);
        } else if (tok.text === 'class') {
            return this["class"](tok, tokens);
        } else if (tok.text === 'return') {
            return this["return"](tok, tokens);
        } else if ((ref1 = tok.text) === '->' || ref1 === '=>') {
            return this.func(null, tok, tokens);
        } else if ((ref2 = tok.text) === ',' || ref2 === ';') {
            return this.exp(tokens);
        } else if (tok.type === 'nl') {
            return this.exp(tokens);
        }
        e = {
            token: tok
        };
        while (nxt = tokens[0]) {
            if (!e) {
                return console.error('no e?', nxt);
            }
            if (e.col != null) {
                last = e.col + ((ref3 = e.text) != null ? ref3.length : void 0);
            } else if (((ref4 = e.close) != null ? ref4.col : void 0) != null) {
                last = e.close.col + ((ref5 = e.close.text) != null ? ref5.length : void 0);
            } else if (((ref6 = Object.values(e)[0]) != null ? ref6.col : void 0) != null) {
                last = Object.values(e)[0].col + ((ref7 = Object.values(e)[0].text) != null ? ref7.length : void 0);
            } else if (((ref8 = Object.values(e)[0]) != null ? (ref9 = ref8.close) != null ? ref9.col : void 0 : void 0) != null) {
                last = Object.values(e)[0].close.col + ((ref10 = Object.values(e)[0].close.text) != null ? ref10.length : void 0);
            } else {
                last = -1;
                this.verb('parser no last? e:', e);
            }
            this.verb('parser last next', last, nxt.col);
            if (nxt.type === 'op' && ((ref11 = nxt.text) !== '++' && ref11 !== '--')) {
                this.verb('exp is lhs of op', e);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func') {
                f = tokens.shift();
                e = this.func(e, f, tokens);
            } else if (nxt.text === '(') {
                if (nxt.col === last) {
                    this.verb('exp is lhs of call');
                    e = this.call(e, tokens);
                } else {
                    this.verb('exp is open paren');
                    e = this.parens(tok, tokens);
                }
            } else if (nxt.text === '[' && nxt.col === last && ((ref12 = tokens[1]) != null ? ref12.text : void 0) !== ']' && ((ref13 = e.token) != null ? ref13.text : void 0) !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '.') {
                e = this.prop(e, tokens);
                break;
            } else if (nxt.text === ':') {
                if (this.stack.slice(-1)[0] !== '{') {
                    this.verb('exp is first key of implicit object', e);
                    e = this.object(e, tokens);
                } else {
                    this.verb('exp is key of (implicit) object', e);
                    e = this.keyval(e, tokens);
                }
            } else if (e.token) {
                if (e.token.text === '(') {
                    e = this.parens(e.token, tokens);
                } else if (e.token.text === '[') {
                    e = this.array(e.token, tokens);
                } else if (e.token.text === '{') {
                    e = this.curly(e.token, tokens);
                } else if (((ref14 = e.token.text) === '+' || ref14 === '-' || ref14 === '++' || ref14 === '--') && last === nxt.col) {
                    if (((ref15 = nxt.type) !== 'var' && ref15 !== 'paren') && ((ref16 = e.token.text) === '++' || ref16 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    e = this.operation(null, e.token, tokens);
                    if ((ref17 = (ref18 = e.operation.rhs) != null ? (ref19 = ref18.operation) != null ? (ref20 = ref19.operator) != null ? ref20.text : void 0 : void 0 : void 0) === '++' || ref17 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref21 = nxt.text) === '++' || ref21 === '--') && last === nxt.col) {
                    if ((ref22 = e.token.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref23 = e.token.type) === 'var' || ref23 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (last < nxt.col && (ref24 = nxt.text, indexOf.call(')]},;:.', ref24) < 0) && ((ref25 = nxt.text) !== 'then' && ref25 !== 'else' && ref25 !== 'break' && ref25 !== 'continue' && ref25 !== 'in' && ref25 !== 'of') && ((ref26 = nxt.type) !== 'nl') && (nxt.type !== 'op' || last < nxt.col) && ((ref27 = e.token.type) !== 'num' && ref27 !== 'single' && ref27 !== 'double' && ref27 !== 'triple' && ref27 !== 'regex' && ref27 !== 'punct' && ref27 !== 'comment' && ref27 !== 'op') && ((ref28 = e.token.text) !== 'null' && ref28 !== 'undefined' && ref28 !== 'Infinity' && ref28 !== 'NaN' && ref28 !== 'true' && ref28 !== 'false' && ref28 !== 'yes' && ref28 !== 'no') && (e.token.type !== 'keyword' || ((ref29 = e.token.text) === 'new' || ref29 === 'require')) && (((ref30 = this.stack.slice(-1)[0]) !== 'if' && ref30 !== 'for') || nxt.line === e.token.line)) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('exp is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else {
                    this.verb('no nxt match?', nxt, this.stack);
                    break;
                }
            } else {
                if (((ref31 = nxt.text) === '++' || ref31 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref32 = this.stack.slice(-1)[0], indexOf.call('.', ref32) < 0)) {
                    e = this.slice(e, tokens);
                } else {
                    if (this.verbose) {
                        print.ast("no nxt match?? " + this.stack, e);
                    }
                    this.verb('no nxt match?? e:', e);
                    this.verb('no nxt match?? nxt:', nxt);
                }
                break;
            }
        }
        if (this.verbose) {
            print.ast('exp', e);
            console.log(blue('exp'), e);
        }
        return e;
    };


    /*
    000  00000000
    000  000
    000  000000
    000  000
    000  000
     */

    Parser.prototype["if"] = function(tok, tokens) {
        var base, e, exp, ref, ref1, ref2, ref3, ref4, ref5, ref6, thn;
        this.push('if');
        if (this.debug) {
            print.tokens('if', tokens);
        }
        exp = this.exp(tokens);
        if (this.debug) {
            print.tokens('then', tokens);
        }
        if (((ref = tokens[0]) != null ? ref.text : void 0) === 'then') {
            tokens.shift();
        } else if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
        } else {
            console.error('parser.if: then or block expected!');
        }
        thn = this.exps('if then', tokens);
        e = {
            "if": {
                exp: exp,
                then: thn
            }
        };
        while (((ref4 = tokens[0]) != null ? ref4.text : void 0) === 'else' && ((ref5 = tokens[1]) != null ? ref5.text : void 0) === 'if') {
            if (this.debug) {
                print.tokens('else if', tokens);
            }
            tokens.shift();
            tokens.shift();
            if ((base = e["if"]).elifs != null) {
                base.elifs;
            } else {
                base.elifs = [];
            }
            exp = this.exp(tokens);
            if (this.debug) {
                print.tokens('else if then', tokens);
            }
            if (((ref2 = tokens[0]) != null ? ref2.text : void 0) === 'then') {
                tokens.shift();
            } else if (((ref3 = tokens[0]) != null ? ref3.type : void 0) === 'block') {
                tokens = tokens.shift().tokens;
            } else {
                console.error('parser.if: then or block expected!');
            }
            thn = this.exps('elif then', tokens);
            e["if"].elifs.push({
                elif: {
                    exp: exp,
                    then: thn
                }
            });
        }
        this.pop('if');
        if (((ref6 = tokens[0]) != null ? ref6.text : void 0) === 'else') {
            if (this.debug) {
                print.tokens('else', tokens);
            }
            tokens.shift();
            e["if"]["else"] = this.exps('else', tokens, 'nl');
        }
        if (tokens.length && this.debug) {
            print.tokens('if leftover', tokens);
        }
        return e;
    };


    /*
    00000000   0000000   00000000   
    000       000   000  000   000  
    000000    000   000  0000000    
    000       000   000  000   000  
    000        0000000   000   000
     */

    Parser.prototype["for"] = function(tok, tokens) {
        var inof, list, ref, ref1, thn, vals;
        this.push('for');
        if (this.debug) {
            print.tokens('for', tokens);
        }
        vals = this.exp(tokens);
        if (this.debug) {
            print.tokens('inof', tokens);
        }
        inof = tokens.shift();
        if (this.debug) {
            print.tokens('list', tokens);
        }
        list = this.exp(tokens);
        if (((ref = tokens[0]) != null ? ref.text : void 0) === 'then') {
            tokens.shift();
        } else if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
        } else {
            console.error('parser.for: then or block expected!');
        }
        this.pop('for');
        thn = this.exps('for then', tokens, 'nl');
        return {
            "for": {
                vals: vals,
                inof: inof,
                list: list,
                then: thn
            }
        };
    };


    /*
    000   000  000   000  000  000      00000000  
    000 0 000  000   000  000  000      000       
    000000000  000000000  000  000      0000000   
    000   000  000   000  000  000      000       
    00     00  000   000  000  0000000  00000000
     */

    Parser.prototype["while"] = function(tok, tokens) {
        var cond, nl, ref, ref1, thn;
        this.push('while');
        cond = this.exp(tokens);
        if (this.verbose) {
            print.tokens('while then|block', tokens);
        }
        if (((ref = tokens[0]) != null ? ref.text : void 0) === 'then') {
            nl = 'nl';
            tokens.shift();
        } else if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            nl = null;
            tokens = tokens.shift().tokens;
        } else {
            console.error('parser.while: then or block expected!');
        }
        if (this.verbose) {
            print.tokens('while thens', tokens);
        }
        thn = this.exps('while then', tokens, nl);
        this.pop('while');
        return {
            "while": {
                cond: cond,
                then: thn
            }
        };
    };


    /*
     0000000  000   000  000  000000000   0000000  000   000
    000       000 0 000  000     000     000       000   000
    0000000   000000000  000     000     000       000000000
         000  000   000  000     000     000       000   000
    0000000   00     00  000     000      0000000  000   000
     */

    Parser.prototype["switch"] = function(tok, tokens) {
        var e, match, ref, ref1, ref2, ref3, whens;
        this.push('switch');
        match = this.exp(tokens);
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
        } else {
            this.pop('switch');
            return console.error('parser.switch: block expected!');
        }
        if (this.debug) {
            print.tokens('switch whens', tokens);
        }
        whens = [];
        while (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'when') {
            if (this.debug) {
                print.tokens('switch when', tokens);
            }
            whens.push(this.exp(tokens));
        }
        e = {
            "switch": {
                match: match,
                whens: whens
            }
        };
        if (this.debug) {
            print.tokens('switch else?', tokens);
        }
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'nl') {
            tokens.shift();
        }
        if (((ref3 = tokens[0]) != null ? ref3.text : void 0) === 'else') {
            if (this.debug) {
                print.tokens('switch else', tokens);
            }
            tokens.shift();
            e["switch"]["else"] = this.exps('else', tokens, 'nl');
        }
        this.pop('switch');
        return e;
    };

    Parser.prototype.when = function(tok, tokens) {
        var ref, ref1, ref2, thn, vals;
        this.push('when');
        if (this.debug) {
            print.tokens('when vals', tokens);
        }
        vals = [];
        this.verb('when.vals tokens[0]', tokens[0]);
        while ((tokens[0] != null) && ((ref = tokens[0].type) !== 'block' && ref !== 'nl') && tokens[0].text !== 'then') {
            if (this.debug) {
                print.tokens('when val', tokens);
            }
            vals.push(this.exp(tokens));
        }
        if (this.debug) {
            print.tokens('when then', tokens);
        }
        this.verb('when.then tokens[0]', tokens[0]);
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'then') {
            tokens.shift();
        } else if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
        } else {
            this.pop('when');
            return console.error('parser.when: then or block expected!');
        }
        thn = this.exps('when then', tokens);
        this.pop('when');
        return {
            when: {
                vals: vals,
                then: thn
            }
        };
    };


    /*
     0000000  000       0000000    0000000   0000000
    000       000      000   000  000       000
    000       000      000000000  0000000   0000000
    000       000      000   000       000       000
     0000000  0000000  000   000  0000000   0000000
     */

    Parser.prototype["class"] = function(tok, tokens) {
        var e, name, ref, ref1;
        this.push('class');
        if (this.debug) {
            print.tokens('class', tokens);
        }
        name = tokens.shift();
        e = {
            "class": {
                name: name
            }
        };
        if (this.debug) {
            print.tokens('class extends', tokens);
        }
        if (((ref = tokens[0]) != null ? ref.text : void 0) === 'extends') {
            tokens.shift();
            e["class"]["extends"] = this.exps('class extends', tokens, 'nl');
        }
        if (this.debug) {
            print.tokens('class body', tokens);
        }
        if (this.debug) {
            print.noon('before class body', tokens);
        }
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
            e["class"].body = this.exps('class body', tokens);
        } else {
            this.verb('no class body!');
        }
        if (this.debug) {
            print.ast('e.class.body', e["class"].body);
            print.tokens('class pop', tokens);
        }
        this.pop('class');
        return e;
    };

    Parser.prototype.func = function(args, arrow, tokens) {
        var body;
        body = this.exps('func body', tokens, 'nl');
        return {
            func: {
                args: args,
                arrow: arrow,
                body: body
            }
        };
    };

    Parser.prototype["return"] = function(tok, tokens) {
        return {
            "return": {
                ret: tok,
                val: this.exp(tokens)
            }
        };
    };

    Parser.prototype.call = function(tok, tokens) {
        var args, close, open, ref, ref1;
        this.push('call');
        if (this.debug) {
            print.tokens('call.open', tokens);
        }
        if (tokens[0].text === '(') {
            open = tokens.shift();
            if (((ref = tokens[0]) != null ? ref.text : void 0) === ')') {
                args = [];
            } else {
                args = this.exps('call', tokens, ')');
            }
        } else {
            args = this.exps('call', tokens, 'nl');
        }
        if (open && ((ref1 = tokens[0]) != null ? ref1.text : void 0) === ')') {
            close = tokens.shift();
        }
        if (open && !close) {
            console.error('expected )');
        }
        if (tok.token) {
            tok = tok.token;
        }
        if (this.debug) {
            print.tokens('call.close', tokens);
        }
        this.pop('call');
        return {
            call: {
                callee: tok,
                open: open,
                args: args,
                close: close
            }
        };
    };

    Parser.prototype.operation = function(lhs, op, tokens) {
        var ref, rhs;
        if ((tokens != null ? (ref = tokens[0]) != null ? ref.type : void 0 : void 0) === 'block') {
            tokens = tokens.shift().tokens;
        }
        if (tokens) {
            rhs = this.exp(tokens);
        }
        if (lhs != null ? lhs.token : void 0) {
            lhs = lhs.token;
        }
        if (rhs != null ? rhs.token : void 0) {
            rhs = rhs.token;
        }
        return {
            operation: {
                lhs: lhs,
                operator: op,
                rhs: rhs
            }
        };
    };

    Parser.prototype.slice = function(from, tokens) {
        var dots, upto;
        dots = tokens.shift();
        upto = this.exp(tokens);
        if (!upto) {
            return console.error("no slice end!");
        }
        if (from.token) {
            from = from.token;
        }
        if (upto.token) {
            upto = upto.token;
        }
        return {
            slice: {
                from: from,
                dots: dots,
                upto: upto
            }
        };
    };

    Parser.prototype.array = function(open, tokens) {
        var close, exps, ref, ref1;
        if (((ref = tokens[0]) != null ? ref.text : void 0) === ']') {
            return {
                array: {
                    open: open,
                    exps: [],
                    close: tokens.shift()
                }
            };
        }
        this.push('[');
        exps = this.exps('[', tokens, ']');
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ']') {
            close = tokens.shift();
        } else {
            console.error('next token not a ]');
        }
        this.pop('[');
        return {
            array: {
                open: open,
                exps: exps,
                close: close
            }
        };
    };

    Parser.prototype.index = function(tok, tokens) {
        var close, open, ref, slice;
        this.push('idx');
        open = tokens.shift();
        slice = this.exp(tokens);
        if (this.debug) {
            print.tokens('index.close', tokens);
        }
        if (((ref = tokens[0]) != null ? ref.text : void 0) === ']') {
            close = tokens.shift();
        } else {
            console.error('expected ]');
        }
        this.pop('idx');
        return {
            index: {
                idxee: tok,
                open: open,
                slidx: slice,
                close: close
            }
        };
    };

    Parser.prototype.parens = function(open, tokens) {
        var close, exps, ref;
        this.push('(');
        exps = this.exps('(', tokens, ')');
        if (((ref = tokens[0]) != null ? ref.text : void 0) === ')') {
            close = tokens.shift();
        } else {
            console.error('next token not a )');
        }
        this.pop('(');
        return {
            parens: {
                open: open,
                exps: exps,
                close: close
            }
        };
    };

    Parser.prototype.curly = function(open, tokens) {
        var close, exps, ref, ref1;
        if (((ref = tokens[0]) != null ? ref.text : void 0) === '}') {
            return {
                object: {
                    open: open,
                    keyvals: [],
                    close: tokens.shift()
                }
            };
        }
        this.push('{');
        exps = this.exps('{', tokens, '}');
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === '}') {
            close = tokens.shift();
        } else {
            console.error('next token not a }');
        }
        this.pop('{');
        return {
            object: {
                open: open,
                keyvals: exps,
                close: close
            }
        };
    };

    Parser.prototype.object = function(key, tokens) {
        var exps, keyCol, stop;
        this.push('{');
        keyCol = key.token.col;
        exps = [this.keyval(key, tokens)];
        if ((tokens[0] != null) && (tokens[0].col === keyCol || tokens[0].type !== 'nl')) {
            if (tokens[0].line === key.token.line) {
                stop = 'nl';
            } else {
                stop = null;
            }
            exps = exps.concat(this.exps('object', tokens, stop));
        }
        this.pop('{');
        return {
            object: {
                keyvals: exps
            }
        };
    };

    Parser.prototype.keyval = function(key, tokens) {
        var colon, value;
        colon = tokens.shift();
        this.push(':');
        value = this.exp(tokens);
        this.pop(':');
        return {
            keyval: {
                key: key,
                colon: colon,
                val: value
            }
        };
    };

    Parser.prototype.prop = function(obj, tokens) {
        var dot, prop;
        dot = tokens.shift();
        this.push('.');
        prop = this.exp(tokens);
        this.pop('.');
        return {
            prop: {
                obj: obj,
                dot: dot,
                prop: prop
            }
        };
    };

    Parser.prototype.push = function(node) {
        if (this.verbose) {
            print.stack(this.stack, node);
        }
        return this.stack.push(node);
    };

    Parser.prototype.pop = function(n) {
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

    Parser.prototype.verb = function() {
        if (this.verbose) {
            return console.log.apply(console.log, arguments);
        }
    };

    return Parser;

})();

module.exports = Parser;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxvQkFBQTtJQUFBOztBQVFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVGO0lBRUMsZ0JBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztxQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLEVBQWlCLEtBQUssQ0FBQyxNQUF2QjtRQUVOLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7UUFFQSxJQUF3RSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQXJGO1lBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBZ0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFkLEdBQXFCLG9CQUFwQyxFQUF3RCxLQUFLLENBQUMsTUFBOUQsRUFBQTs7ZUFFQTtJQVZHOztxQkFvQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFB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cEIsRUFBdUIsU0FBQyxDQUFEO3VCQUFPLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFKQzs7cUJBT0wsSUFBQSxHQUFNLFNBQUE7UUFFRixJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFESjs7SUFGRTs7Ozs7O0FBS1YsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuY2xhc3MgUGFyc2VyXG5cbiAgICBAOiAoYXJncykgLT5cblxuICAgICAgICBAZGVidWcgICA9IGFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gYXJncz8udmVyYm9zZVxuICAgICAgICBAcmF3ICAgICA9IGFyZ3M/LnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cblxuICAgICAgICBhc3QgPSBAZXhwcyAndGwgYmxvY2snIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICBwcmludC50b2tlbnMgXCIje2Jsb2NrLnRva2Vucy5sZW5ndGh9IHJlbWFpbmluZyB0b2tlbnM6XCIgYmxvY2sudG9rZW5zIGlmIGJsb2NrLnRva2Vucy5sZW5ndGhcblxuICAgICAgICBhc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBsaXN0IG9mIGV4cHJlc3Npb25zXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcblxuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2FsbG93IG5sJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgcmV0dXJuIEBleHBzICdleHBzIGJsb2NrJyBibG9jay50b2tlbnNcblxuICAgICAgICBlcyA9IFtdXG5cbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09IHJ1bGUgYW5kIHRva2Vuc1swXS50ZXh0ID09IHN0b3BcbiAgICAgICAgICAgICAgICBAdmVyYiBcInN0YWNrLmVuZCAje0BzdGFja1stMV19ICN7dG9rZW5zWzBdLnRleHR9XCJcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZSBpZiAoQHN0YWNrWy0xXSBpbiBbJ2lmJydzd2l0Y2gnXSkgYW5kICh0b2tlbnNbMF0udGV4dCA9PSAnZWxzZScpXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgZWxzZSBicmVhaydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyAjb3IgdG9rZW5zWzBdLnRleHQgPT0gJzsnXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG5cbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdpZicgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnZWxzZSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgaWZicmVhayAoc2hpZnQgbmwgOyBhbmQgYnJlYWspJyBcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBpZiBzdG9wXG4gICAgICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBjYWxsLmVuZCAoZG9udCBzaGlmdCBubCknXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpIFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBubCA7JyBcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBjb250aW51ZS4uLicgXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICc7J1xuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gaW4gWydjYWxsJyd7J11cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY2FsbCBicmVhayBvbiA7J1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gKSdcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBleCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBlcy5wdXNoIGV4XG5cbiAgICAgICAgZXNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIHNpbmdsZSBleHByZXNzaW9uXG5cbiAgICBleHA6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIHRvayA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgbG9nIFk1IHcxIHRvaz8udGV4dCBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAnYmxvY2snIFxuICAgICAgICAgICAgbG9nIFwiREFHRlVLISBDTEVBTiBVUCBZT1VSIE1FU1NTIVwiXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyB0aGVuIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICByZXR1cm4gQGV4cHMgJ2V4cCBibG9jaycgdG9rLnRva2Vuc1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0ID09ICdpZicgICAgICAgIHRoZW4gcmV0dXJuIEBpZiAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dCA9PSAnZm9yJyAgICAgICB0aGVuIHJldHVybiBAZm9yICAgIHRvaywgdG9rZW5zXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQgPT0gJ3doaWxlJyAgICAgdGhlbiByZXR1cm4gQHdoaWxlICB0b2ssIHRva2Vuc1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0ID09ICdzd2l0Y2gnICAgIHRoZW4gcmV0dXJuIEBzd2l0Y2ggdG9rLCB0b2tlbnNcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dCA9PSAnd2hlbicgICAgICB0aGVuIHJldHVybiBAd2hlbiAgIHRvaywgdG9rZW5zXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQgPT0gJ2NsYXNzJyAgICAgdGhlbiByZXR1cm4gQGNsYXNzICB0b2ssIHRva2Vuc1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0ID09ICdyZXR1cm4nICAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dCBpbiBbJy0+JyAnPT4nXSB0aGVuIHJldHVybiBAZnVuYyAgIG51bGwsIHRvaywgdG9rZW5zXG4gICAgICAgIGVsc2UgaWYgdG9rLnRleHQgaW4gWycsJyAnOyddICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwICwgb3IgO1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdubCcgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCBubFxuXG4gICAgICAgIGUgPSB0b2tlbjp0b2tcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGUuY29sP1xuICAgICAgICAgICAgICAgIGxhc3QgPSBlLmNvbCtlLnRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgZWxzZSBpZiBlLmNsb3NlPy5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IGUuY2xvc2UuY29sK2UuY2xvc2UudGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlIGlmIE9iamVjdC52YWx1ZXMoZSlbMF0/LmNvbD9cbiAgICAgICAgICAgICAgICBsYXN0ID0gT2JqZWN0LnZhbHVlcyhlKVswXS5jb2wrT2JqZWN0LnZhbHVlcyhlKVswXS50ZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIGVsc2UgaWYgT2JqZWN0LnZhbHVlcyhlKVswXT8uY2xvc2U/LmNvbD9cbiAgICAgICAgICAgICAgICBsYXN0ID0gT2JqZWN0LnZhbHVlcyhlKVswXS5jbG9zZS5jb2wrT2JqZWN0LnZhbHVlcyhlKVswXS5jbG9zZS50ZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsYXN0ID0gLTFcbiAgICAgICAgICAgICAgICBAdmVyYiAncGFyc2VyIG5vIGxhc3Q/IGU6JyBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAdmVyYiAncGFyc2VyIGxhc3QgbmV4dCcgbGFzdCwgbnh0LmNvbFxuXG4gICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnb3AnIGFuZCBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBvcCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnXG4gICAgICAgICAgICAgICAgZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZSA9IEBmdW5jIGUsIGYsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICBpZiBueHQuY29sID09IGxhc3RcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgY2FsbCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBjYWxsIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBvcGVuIHBhcmVuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHBhcmVucyB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnWycgYW5kIG54dC5jb2wgPT0gbGFzdCBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICddJyBhbmQgZS50b2tlbj8udGV4dCAhPSAnWydcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbmRleCcgZVxuICAgICAgICAgICAgICAgIGUgPSBAaW5kZXggZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcuJ1xuICAgICAgICAgICAgICAgIGUgPSBAcHJvcCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnOidcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdICE9ICd7J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGZpcnN0IGtleSBvZiBpbXBsaWNpdCBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvYmplY3QgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGtleSBvZiAoaW1wbGljaXQpIG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQGtleXZhbCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlblxuICAgICAgICAgICAgICAgIGlmIGUudG9rZW4udGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ1snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAYXJyYXkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY3VybHkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgaW4gWycrJyctJycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlIG5vdCBpbiBbJ3ZhcicncGFyZW4nXSBhbmQgZS50b2tlbi50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgbGhzIGluY3JlbWVudCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvcj8udGV4dCBpbiBbJysrJyctLSddXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbGVmdCBhbmQgcmlnaHQgc2lkZSBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBpZiBlLnRva2VuLnR5cGUgbm90IGluIFsndmFyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgcmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgZS50b2tlbi50eXBlIGluIFsndmFyJyAnbnVtJ11cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBzbGljZSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxhc3QgPCBueHQuY29sIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluICcpXX0sOzouJyBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJ3RoZW4nICdlbHNlJyAnYnJlYWsnICdjb250aW51ZScgJ2luJyAnb2YnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAobnh0LnR5cGUgIT0gJ29wJyBvciBsYXN0IDwgbnh0LmNvbCkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50eXBlIG5vdCBpbiBbJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ3JlZ2V4JyAncHVuY3QnICdjb21tZW50JyAnb3AnXSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50ZXh0IG5vdCBpbiBbJ251bGwnICd1bmRlZmluZWQnICdJbmZpbml0eScgJ05hTicgJ3RydWUnICdmYWxzZScgJ3llcycgJ25vJ10pIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudG9rZW4udHlwZSAhPSAna2V5d29yZCcgb3IgKGUudG9rZW4udGV4dCBpbiBbJ25ldycgJ3JlcXVpcmUnXSkpIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKChAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJyAnZm9yJ10pIG9yIG54dC5saW5lID09IGUudG9rZW4ubGluZSlcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPycgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIEBzdGFja1stMV0gbm90IGluICcuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwibm8gbnh0IG1hdGNoPz8gI3tAc3RhY2t9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPz8gZTonIGVcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ25vIG54dCBtYXRjaD8/IG54dDonIG54dFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICBwcmludC5hc3QgJ2V4cCcgZVxuICAgICAgICAgICAgbG9nIGJsdWUoJ2V4cCcpLCBlXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyMjXG4gICAgMDAwICAwMDAwMDAwMFxuICAgIDAwMCAgMDAwXG4gICAgMDAwICAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwXG4gICAgIyMjXG5cbiAgICBpZjogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lmJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgZXhwID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ3RoZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGVycm9yICdwYXJzZXIuaWY6IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhJ1xuXG4gICAgICAgIHRobiA9IEBleHBzICdpZiB0aGVuJyB0b2tlbnNcblxuICAgICAgICBlID0gaWY6XG4gICAgICAgICAgICAgICAgZXhwOiAgICBleHBcbiAgICAgICAgICAgICAgICB0aGVuOiAgIHRoblxuXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZScgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaWYnXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZSBpZicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbGlmcyA/PSBbXVxuXG4gICAgICAgICAgICBleHAgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Vsc2UgaWYgdGhlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgZXJyb3IgJ3BhcnNlci5pZjogdGhlbiBvciBibG9jayBleHBlY3RlZCEnXG5cbiAgICAgICAgICAgIHRobiA9IEBleHBzICdlbGlmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBleHA6ICBleHBcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAgICAgQHBvcCAnaWYnICMgc2hvdWxkbid0IHRoaXMgYmUgcG9wcGVkIGFmdGVyIHRoZSBlbHNlIGJsb2NrP1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxzZSA9IEBleHBzICdlbHNlJyB0b2tlbnMsICdubCdcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lmIGxlZnRvdmVyJyB0b2tlbnMgaWYgdG9rZW5zLmxlbmd0aCBhbmQgQGRlYnVnXG5cbiAgICAgICAgZVxuXG4gICAgIyMjXG4gICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMjI1xuICAgIFxuICAgIGZvcjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2ZvcicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHZhbHMgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5vZicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ2xpc3QnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgZXJyb3IgJ3BhcnNlci5mb3I6IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhJ1xuXG4gICAgICAgIEBwb3AgJ2ZvcicgIyBzaG91bGRuJ3QgdGhpcyBiZSBwb3BwZWQgYWZ0ZXIgdGhlIHRoZW4gYmxvY2s/XG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAZXhwcyAnZm9yIHRoZW4nIHRva2VucywgJ25sJ1xuXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICAgdmFsc1xuICAgICAgICAgICAgaW5vZjogICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgIGxpc3RcbiAgICAgICAgICAgIHRoZW46ICAgdGhuXG4gICAgICAgICAgICBcbiAgICAjIyNcbiAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMjI1xuICAgIFxuICAgIHdoaWxlOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ3doaWxlIHRoZW58YmxvY2snIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgZXJyb3IgJ3BhcnNlci53aGlsZTogdGhlbiBvciBibG9jayBleHBlY3RlZCEnXG4gICAgICAgIFxuXG4gICAgICAgIHByaW50LnRva2VucyAnd2hpbGUgdGhlbnMnIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgdGhuID0gQGV4cHMgJ3doaWxlIHRoZW4nIHRva2VucywgbmxcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiB0aG5cbiAgICAgICAgXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4gICAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMjI1xuXG4gICAgc3dpdGNoOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIG1hdGNoID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBvcCAnc3dpdGNoJ1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yICdwYXJzZXIuc3dpdGNoOiBibG9jayBleHBlY3RlZCEnXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCB3aGVucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgd2hlbnMgPSBbXVxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ3doZW4nXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCB3aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZSA9IHN3aXRjaDpcbiAgICAgICAgICAgICAgICBtYXRjaDogIG1hdGNoXG4gICAgICAgICAgICAgICAgd2hlbnM6ICB3aGVuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggZWxzZT8nIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCBlbHNlJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuc3dpdGNoLmVsc2UgPSBAZXhwcyAnZWxzZScgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgZVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICd3aGVuIHZhbHMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgQHZlcmIgJ3doZW4udmFscyB0b2tlbnNbMF0nIHRva2Vuc1swXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgKHRva2Vuc1swXT8gYW5kICh0b2tlbnNbMF0udHlwZSBub3QgaW4gWydibG9jaycnbmwnXSkgYW5kIHRva2Vuc1swXS50ZXh0ICE9ICd0aGVuJylcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWwnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIHZhbHMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICd3aGVuIHRoZW4nIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICd3aGVuLnRoZW4gdG9rZW5zWzBdJyB0b2tlbnNbMF1cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcG9wICd3aGVuJ1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yICdwYXJzZXIud2hlbjogdGhlbiBvciBibG9jayBleHBlY3RlZCEnXG5cbiAgICAgICAgdGhuID0gQGV4cHMgJ3doZW4gdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgd2hlbjpcbiAgICAgICAgICAgIHZhbHM6IHZhbHNcbiAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIyNcblxuICAgIGNsYXNzOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NsYXNzJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBuYW1lID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBlID0gY2xhc3M6XG4gICAgICAgICAgICBuYW1lOm5hbWVcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2V4dGVuZHMnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZS5jbGFzcy5leHRlbmRzID0gQGV4cHMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgYm9keScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHByaW50Lm5vb24gJ2JlZm9yZSBjbGFzcyBib2R5JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgICAgICBlLmNsYXNzLmJvZHkgPSBAZXhwcyAnY2xhc3MgYm9keScgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB2ZXJiICdubyBjbGFzcyBib2R5ISdcblxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LmFzdCAnZS5jbGFzcy5ib2R5JyBlLmNsYXNzLmJvZHlcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgcG9wJyB0b2tlbnMgXG5cbiAgICAgICAgQHBvcCAnY2xhc3MnXG5cbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAoYXJncywgYXJyb3csIHRva2VucykgLT5cblxuICAgICAgICBib2R5ID0gQGV4cHMgJ2Z1bmMgYm9keScgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgZnVuYzpcbiAgICAgICAgICAgIGFyZ3M6ICBhcmdzXG4gICAgICAgICAgICBhcnJvdzogYXJyb3dcbiAgICAgICAgICAgIGJvZHk6ICBib2R5XG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuOlxuICAgICAgICAgICAgcmV0OiB0b2tcbiAgICAgICAgICAgIHZhbDogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjYWxsLm9wZW4nIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgYXJncyA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IEBleHBzICdjYWxsJyB0b2tlbnMsICcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcmdzID0gQGV4cHMgJ2NhbGwnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIGlmIG9wZW4gYW5kIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBpZiBvcGVuIGFuZCBub3QgY2xvc2VcbiAgICAgICAgICAgIGVycm9yICdleHBlY3RlZCApJ1xuXG4gICAgICAgIHRvayA9IHRvay50b2tlbiBpZiB0b2sudG9rZW5cblxuICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwuY2xvc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBAcG9wICdjYWxsJ1xuICAgICAgICBcbiAgICAgICAgY2FsbDpcbiAgICAgICAgICAgIGNhbGxlZTogdG9rXG4gICAgICAgICAgICBvcGVuOiAgIG9wZW5cbiAgICAgICAgICAgIGFyZ3M6ICAgYXJnc1xuICAgICAgICAgICAgY2xvc2U6ICBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAobGhzLCBvcCwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vucz9bMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIFxuICAgICAgICByaHMgPSBAZXhwIHRva2VucyBpZiB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBsaHM/LnRva2VuIHRoZW4gbGhzID0gbGhzLnRva2VuXG4gICAgICAgIGlmIHJocz8udG9rZW4gdGhlbiByaHMgPSByaHMudG9rZW5cblxuICAgICAgICBvcGVyYXRpb246XG4gICAgICAgICAgICBsaHM6ICAgICAgICBsaHNcbiAgICAgICAgICAgIG9wZXJhdG9yOiAgIG9wXG4gICAgICAgICAgICByaHM6ICAgICAgICByaHNcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6IChmcm9tLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90cyA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgdXB0byA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgaWYgbm90IHVwdG8gdGhlbiByZXR1cm4gZXJyb3IgXCJubyBzbGljZSBlbmQhXCJcbiAgICAgICAgXG4gICAgICAgIGlmIGZyb20udG9rZW4gdGhlbiBmcm9tID0gZnJvbS50b2tlblxuICAgICAgICBpZiB1cHRvLnRva2VuIHRoZW4gdXB0byA9IHVwdG8udG9rZW5cblxuICAgICAgICBzbGljZTpcbiAgICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgICAgIGRvdHM6IGRvdHNcbiAgICAgICAgICAgIHVwdG86IHVwdG9cblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBleHBzOiAgW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnWydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ1snIHRva2VucywgJ10nIFxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ25leHQgdG9rZW4gbm90IGEgXSdcblxuICAgICAgICBAcG9wICdbJ1xuXG4gICAgICAgIGFycmF5OlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGV4cHM6ICBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZHgnXG5cbiAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgc2xpY2UgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5kZXguY2xvc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICdleHBlY3RlZCBdJ1xuXG4gICAgICAgIEBwb3AgJ2lkeCdcblxuICAgICAgICBpbmRleDpcbiAgICAgICAgICAgIGlkeGVlOiB0b2tcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBzbGlkeDogc2xpY2VcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICcoJ1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICduZXh0IHRva2VuIG5vdCBhICknXG5cbiAgICAgICAgQHBvcCAnKCdcblxuICAgICAgICBwYXJlbnM6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgZXhwczogIGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDBcblxuICAgIGN1cmx5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfSdcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q6XG4gICAgICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAgICAgIGtleXZhbHM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ3snIHRva2VucywgJ30nXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciAnbmV4dCB0b2tlbiBub3QgYSB9J1xuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBrZXlDb2wgPSBrZXkudG9rZW4uY29sXG4gICAgICAgIFxuICAgICAgICBleHBzID0gW0BrZXl2YWwga2V5LCB0b2tlbnNdXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLmNvbCA9PSBrZXlDb2wgb3IgdG9rZW5zWzBdLnR5cGUgIT0gJ25sJylcbiAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0ubGluZSA9PSBrZXkudG9rZW4ubGluZSB0aGVuIHN0b3A9J25sJyBlbHNlIHN0b3A9bnVsbFxuICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2Vucywgc3RvcFxuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnOidcblxuICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBrZXl2YWw6XG4gICAgICAgICAgICBrZXk6ICAga2V5XG4gICAgICAgICAgICBjb2xvbjogY29sb25cbiAgICAgICAgICAgIHZhbDogICB2YWx1ZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIHByb3A6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBkb3QgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBAcHVzaCAnLidcblxuICAgICAgICBwcm9wID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBAcG9wICcuJ1xuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIGRvdFxuICAgICAgICAgICAgcHJvcDogcHJvcFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIHB1c2g6IChub2RlKSAtPlxuXG4gICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgbm9kZSBpZiBAdmVyYm9zZVxuICAgICAgICBAc3RhY2sucHVzaCBub2RlXG5cbiAgICBwb3A6IChuKSAtPlxuICAgICAgICBwID0gQHN0YWNrLnBvcCgpXG4gICAgICAgIGlmIHAgIT0gblxuICAgICAgICAgICAgZXJyb3IgXCJ1bmV4cGVjdGVkIHBvcCFcIiBwLCBuXG4gICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIHAsIChzKSAtPiBXMSB3MSBzXG5cbiAgICB2ZXJiOiAtPlxuXG4gICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyXG4iXX0=
//# sourceURL=../coffee/parser.coffee
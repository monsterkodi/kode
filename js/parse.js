// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */
var Parse, empty, print,
    indexOf = [].indexOf;

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

Parse = (function() {
    function Parse(args) {
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
                        return (ref = tokens[0].text, indexOf.call('];', ref) >= 0) && tokens.shift();
                    case '{':
                        return (ref1 = tokens[0].text, indexOf.call('};', ref1) >= 0) && tokens.shift();
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
                    tokens.shift();
                }
                if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ',') {
                    this.verb("exps block end shift ,");
                    tokens.shift();
                }
                this.verb('exps block end ...continue...');
                continue;
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
        var e, f, last, numTokens, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref5, ref6, ref7, ref8, ref9, tok;
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
                    case 'switch':
                        return this["switch"](tok, tokens);
                    case 'when':
                        return this.when(tok, tokens);
                    case 'class':
                        return this["class"](tok, tokens);
                    case 'return':
                        return this["return"](tok, tokens);
                }
                break;
            default:
                switch (tok.text) {
                    case '->':
                    case '=>':
                        return this.func(null, tok, tokens);
                    case ';':
                        return this.exp(tokens);
                    case ',':
                        return this.exp(tokens);
                }
        }

        /*
        here comes the hairy part :-)
        
        combine information about the rule stack, current and future tokens
        to figure out when the expression ends
         */
        this.sheapPush('exp', (ref = tok.text) != null ? ref : tok.type);
        e = {
            token: tok
        };
        while (nxt = tokens[0]) {
            numTokens = tokens.length;
            if (!e) {
                return console.error('no e?', nxt);
            }
            if (((ref1 = Object.values(e)[0]) != null ? ref1.col : void 0) != null) {
                last = Object.values(e)[0].col + ((ref2 = Object.values(e)[0].text) != null ? ref2.length : void 0);
            } else if (((ref3 = Object.values(e)[0]) != null ? (ref4 = ref3.close) != null ? ref4.col : void 0 : void 0) != null) {
                last = Object.values(e)[0].close.col + ((ref5 = Object.values(e)[0].close.text) != null ? ref5.length : void 0);
            } else {
                last = -1;
            }
            if (this.stack.slice(-1)[0] === 'onearg' && ((ref6 = nxt.type) === 'op')) {
                this.verb('exp break for onearg');
                break;
            }
            if (nxt.type === 'op' && ((ref7 = nxt.text) !== '++' && ref7 !== '--' && ref7 !== '+' && ref7 !== '-') && ((ref8 = (ref9 = e.token) != null ? ref9.text : void 0) !== '[' && ref8 !== '(') && indexOf.call(this.stack, 'onearg') < 0) {
                this.verb('exp is lhs of op', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'op' && ((ref10 = nxt.text) === '+' || ref10 === '-') && ((ref11 = (ref12 = e.token) != null ? ref12.text : void 0) !== '[' && ref11 !== '(') && last < nxt.col && ((ref13 = tokens[1]) != null ? ref13.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('exp is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && (e.parens || e.token && ((ref14 = e.token.type) !== 'num' && ref14 !== 'single' && ref14 !== 'double' && ref14 !== 'triple') && (ref15 = e.token.text, indexOf.call('}]', ref15) < 0))) {
                f = tokens.shift();
                this.verb('exp func for e', e);
                e = this.func(e, f, tokens);
            } else if (nxt.text === '(') {
                if (nxt.col === last) {
                    this.verb('exp is lhs of call');
                    e = this.call(e, tokens);
                } else {
                    this.verb('exp is open paren');
                    e = this.parens(tok, tokens);
                }
            } else if (nxt.text === '[' && nxt.col === last && ((ref16 = tokens[1]) != null ? ref16.text : void 0) !== ']' && ((ref17 = e.token) != null ? ref17.text : void 0) !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '?' && last === nxt.col && ((ref18 = tokens[1]) != null ? ref18.text : void 0) === '.') {
                qmark = tokens.shift();
                e = this.prop(e, tokens, qmark);
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
            } else if (nxt.type === 'keyword' && nxt.text === 'in' && this.stack.slice(-1)[0] !== 'for') {
                e = this.incond(e, tokens);
            } else if (e.token) {
                if (e.token.text === '(') {
                    e = this.parens(e.token, tokens);
                } else if (e.token.text === '[') {
                    e = this.array(e.token, tokens);
                } else if (e.token.text === '{') {
                    e = this.curly(e.token, tokens);
                } else if (((ref19 = e.token.text) === '+' || ref19 === '-' || ref19 === '++' || ref19 === '--') && last === nxt.col) {
                    if (((ref20 = nxt.type) !== 'var' && ref20 !== 'paren') && ((ref21 = e.token.text) === '++' || ref21 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    this.verb('lhs null operation');
                    e = this.operation(null, e.token, tokens);
                    if ((ref22 = (ref23 = e.operation.rhs) != null ? (ref24 = ref23.operation) != null ? (ref25 = ref24.operator) != null ? ref25.text : void 0 : void 0 : void 0) === '++' || ref22 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref26 = nxt.text) === '++' || ref26 === '--') && last === nxt.col) {
                    if ((ref27 = e.token.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref28 = e.token.type) === 'var' || ref28 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('exp curly end');
                    break;
                } else if (last < nxt.col && (ref29 = nxt.text, indexOf.call(')]},;:.', ref29) < 0) && ((ref30 = nxt.text) !== 'then' && ref30 !== 'else' && ref30 !== 'break' && ref30 !== 'continue' && ref30 !== 'in' && ref30 !== 'of') && ((ref31 = nxt.type) !== 'nl') && ((ref32 = e.token.type) !== 'num' && ref32 !== 'single' && ref32 !== 'double' && ref32 !== 'triple' && ref32 !== 'regex' && ref32 !== 'punct' && ref32 !== 'comment' && ref32 !== 'op') && ((ref33 = e.token.text) !== 'null' && ref33 !== 'undefined' && ref33 !== 'Infinity' && ref33 !== 'NaN' && ref33 !== 'true' && ref33 !== 'false' && ref33 !== 'yes' && ref33 !== 'no') && (e.token.type !== 'keyword' || ((ref34 = e.token.text) === 'new' || ref34 === 'require' || ref34 === 'typeof' || ref34 === 'delete')) && (((ref35 = this.stack.slice(-1)[0]) !== 'if' && ref35 !== 'for') || nxt.line === e.token.line) && indexOf.call(this.stack, 'onearg') < 0) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('    is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else if (nxt.type === 'op' && ((ref36 = nxt.text) === '+' || ref36 === '-') && ((ref37 = (ref38 = e.token) != null ? ref38.text : void 0) !== '[' && ref37 !== '(')) {
                    if (last < nxt.col && ((ref39 = tokens[1]) != null ? ref39.col : void 0) === nxt.col + nxt.text.length) {
                        this.verb('exp op is unbalanced +- break...', e, nxt, this.stack);
                        break;
                    }
                    this.verb('exp is lhs of op', e, nxt);
                    e = this.operation(e, tokens.shift(), tokens);
                } else {
                    if (this.verbose) {
                        print.tokens("exp no nxt match? break! stack:" + this.stack + " nxt:", [nxt]);
                    }
                    break;
                }
            } else {
                if (((ref40 = nxt.text) === '++' || ref40 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref41 = this.stack.slice(-1)[0], indexOf.call('.', ref41) < 0)) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === 'call' && nxt.text === ']') {
                    this.verb('exp call array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp [ array end', nxt);
                    break;
                } else {
                    if (this.verbose) {
                        print.ast("exp no nxt match?? stack:" + this.stack + " e:", e);
                        print.tokens("exp no nxt match?? nxt:", nxt);
                    }
                    break;
                }
            }
            if (numTokens === tokens.length) {
                console.error('exp no token consumed?');
                break;
            }
        }
        if (empty(this.stack)) {
            if (nxt = tokens[0]) {
                this.verb('exp empty stack nxt', nxt);
                if (nxt.text === '[' && ((ref42 = tokens[1]) != null ? ref42.text : void 0) !== ']') {
                    this.verb('exp is last minute lhs of index', e);
                    e = this.index(e, tokens);
                }
            }
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
        this.sheapPop('exp', (ref43 = tok.text) != null ? ref43 : tok.type);
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
        if (popped.text !== t) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTO1FBRVQsR0FBQSxHQUFNO0FBRU4sZUFBTSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQW5CO1lBQ0ksR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsS0FBSyxDQUFDLE1BQWpCLENBQVg7UUFEVjtRQUdBLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtJQVpHOztvQkFzQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtB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MDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoYXJncykgLT5cblxuICAgICAgICBAZGVidWcgICA9IGFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gYXJncz8udmVyYm9zZVxuICAgICAgICBAcmF3ICAgICA9IGFyZ3M/LnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cbiAgICAgICAgQHNoZWFwID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgYXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgbGlzdCBvZiBleHByZXNzaW9uc1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cHMnIHJ1bGVcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnb25lYXJnJyAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ10nICAjIGFuZCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnXTsnIGFuZCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ3snICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCBpbiAnfTsnIGFuZCB0b2tlbnMuc2hpZnQoKSAjIGkga25vdywgaXQncyBhIHBhaW4sIGJ1dCB3ZSBzaG91bGRuJ3Qgc2hpZnQgfSBoZXJlIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHdoeSBicmVhayBvbiA7IGluc3RlYWQgb2YgYmFpbGluZyBvdXQgd2l0aCBhbiBlcnJvcj9cbiAgICAgICAgICAgICAgICB3aGVuIHJ1bGUgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gc3RvcCAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgICBpZiBiXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgZm9yIHN0YWNrIHRvcCcgQHN0YWNrXG4gICAgICAgICAgICAgICAgYnJlYWsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJ1xuICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgc3RhcnRcIiBibG9ja1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgIyBlcyA9IGVzLmNvbmNhdCBAZXhwcyAnZXhwcyBibG9jaycgYmxvY2sudG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IEBleHBzICdleHBzIGJsb2NrJyBibG9jay50b2tlbnMgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jayBlbmQgc2hpZnQgbmxcIiBcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2sgZW5kIHNoaWZ0ICxcIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayBlbmQgLi4uY29udGludWUuLi4nXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIGJsb2NrJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiApJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBydWxlID09ICdmb3IgdmFscycgYW5kIHRva2Vuc1swXS50ZXh0IGluIFsnaW4nJ29mJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZidcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgaW4gYXJyYXkgKHNoaWZ0IGFuZCBicmVhayknXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgd2l0aCBzdG9wJyBcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBubCB3aXRoIHN0b3AgaW4gY2FsbCAoYnJlYWssIGJ1dCBkb24ndCBzaGlmdCBubClcIlxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCB3aXRoIHN0b3AgKHNoaWZ0IGFuZCBicmVhayknIFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KCkgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIFxuXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc2hpZnQgYW5kIC4uLicgICAgIFxuICAgICAgICAgICAgICAgIG5sID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICdleHBzIG5sIG5leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgbG9nICd0b2tlbnNbMF0uY29sJyB0b2tlbnNbMF0uY29sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgY29udGludWUuLi4nIFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBleCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBlcy5wdXNoIGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG51bVRva2VucyA9PSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgZXJyb3IgJ2V4cHMgbm8gdG9rZW4gY29uc3VtZWQ/J1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQHNoZWFwUG9wICdleHBzJyBydWxlXG4gICAgICAgIFxuICAgICAgICBlc1xuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGEgc2luZ2xlIGV4cHJlc3Npb25cblxuICAgIGV4cDogKHRva2VucykgLT5cblxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgdG9rID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBsb2cgWTUgdzEgdG9rPy50ZXh0IGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgIyB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgaGFuZGxpbmcgb2YgbGlzdHMgb2YgZXhwcmVzc2lvbnMgaXMgZG9uZSBpbiBleHBzIGFuZFxuICAgICAgICAjIHNpbGVudGx5IHNraXBzIG92ZXIgbGVhZGluZyBzZXBhcmF0aW5nIHRva2VucyBsaWtlIGNvbW1hdGFzLCBzZW1pY29sb25zIGFuZCBubC5cblxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICAgICAgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIHN0YXJ0IHNoaWZ0IG5sISdcbiAgICAgICAgICAgICAgICByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIG5sXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJ1xuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgIHRoZW4gcmV0dXJuIEBpZiAgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgIHRoZW4gcmV0dXJuIEBzd2l0Y2ggdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgIHRoZW4gcmV0dXJuIEBjbGFzcyAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgIHRoZW4gcmV0dXJuIEByZXR1cm4gdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0+JyAnPT4nICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICc7JyAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIDtcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLCcgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCAsXG5cbiAgICAgICAgIyMjXG4gICAgICAgIGhlcmUgY29tZXMgdGhlIGhhaXJ5IHBhcnQgOi0pXG4gICAgICAgIFxuICAgICAgICBjb21iaW5lIGluZm9ybWF0aW9uIGFib3V0IHRoZSBydWxlIHN0YWNrLCBjdXJyZW50IGFuZCBmdXR1cmUgdG9rZW5zXG4gICAgICAgIHRvIGZpZ3VyZSBvdXQgd2hlbiB0aGUgZXhwcmVzc2lvbiBlbmRzXG4gICAgICAgICMjI1xuXG4gICAgICAgIEBzaGVhcFB1c2ggJ2V4cCcgdG9rLnRleHQgPyB0b2sudHlwZVxuICAgICAgICBcbiAgICAgICAgZSA9IHRva2VuOnRva1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGhcblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgT2JqZWN0LnZhbHVlcyhlKVswXT8uY29sP1xuICAgICAgICAgICAgICAgIGxhc3QgPSBPYmplY3QudmFsdWVzKGUpWzBdLmNvbCtPYmplY3QudmFsdWVzKGUpWzBdLnRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgZWxzZSBpZiBPYmplY3QudmFsdWVzKGUpWzBdPy5jbG9zZT8uY29sP1xuICAgICAgICAgICAgICAgIGxhc3QgPSBPYmplY3QudmFsdWVzKGUpWzBdLmNsb3NlLmNvbCtPYmplY3QudmFsdWVzKGUpWzBdLmNsb3NlLnRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxhc3QgPSAtMVxuICAgICAgICAgICAgICAgICMgQHZlcmIgJ2V4cCBubyBsYXN0PyBlOicgZVxuICAgICAgICAgICAgIyBAdmVyYiAnZXhwIGxhc3QgbmV4dCcgbGFzdCwgbnh0LmNvbFxuXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdvbmVhcmcnIGFuZCBueHQudHlwZSBpbiBbJ29wJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGJyZWFrIGZvciBvbmVhcmcnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ29wJyBhbmQgbnh0LnRleHQgbm90IGluIFsnKysnICctLScgJysnICctJ10gYW5kIGUudG9rZW4/LnRleHQgbm90IGluIFsnWycgJygnXSBhbmQgJ29uZWFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50b2tlbj8udGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICBsYXN0IDwgbnh0LmNvbCBhbmQgdG9rZW5zWzFdPy5jb2wgPiBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCAoZS5wYXJlbnMgb3IgZS50b2tlbiBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudG9rZW4udHlwZSBub3QgaW4gWydudW0nJ3NpbmdsZScnZG91YmxlJyd0cmlwbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudG9rZW4udGV4dCBub3QgaW4gJ31dJylcbiAgICAgICAgICAgICAgICBmID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGZ1bmMgZm9yIGUnIGVcbiAgICAgICAgICAgICAgICBlID0gQGZ1bmMgZSwgZiwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgICAgIGlmIG54dC5jb2wgPT0gbGFzdFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIG9wZW4gcGFyZW4nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcGFyZW5zIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgbnh0LmNvbCA9PSBsYXN0IGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nIGFuZCBlLnRva2VuPy50ZXh0ICE9ICdbJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJz8nIGFuZCBsYXN0ID09IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBxbWFyayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2VucywgcW1hcmtcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJy4nXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6J1xuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gIT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQG9iamVjdCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMga2V5IG9mIChpbXBsaWNpdCkgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAa2V5dmFsIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAna2V5d29yZCcgYW5kIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlblxuICAgICAgICAgICAgICAgIGlmIGUudG9rZW4udGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ1snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAYXJyYXkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY3VybHkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgaW4gWycrJyctJycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlIG5vdCBpbiBbJ3ZhcicncGFyZW4nXSBhbmQgZS50b2tlbi50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgbGhzIGluY3JlbWVudCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBudWxsIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvcj8udGV4dCBpbiBbJysrJyctLSddXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbGVmdCBhbmQgcmlnaHQgc2lkZSBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBpZiBlLnRva2VuLnR5cGUgbm90IGluIFsndmFyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgcmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgZS50b2tlbi50eXBlIGluIFsndmFyJyAnbnVtJ11cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBzbGljZSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBhcnJheSBlbmQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICd7JyBhbmQgbnh0LnRleHQgPT0gJ30nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgY3VybHkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbGFzdCA8IG54dC5jb2wgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gJyldfSw7Oi4nIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZiddIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgbm90IGluIFsnbmwnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nXSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50eXBlICE9ICdrZXl3b3JkJyBvciAoZS50b2tlbi50ZXh0IGluIFsnbmV3JyAncmVxdWlyZScgJ3R5cGVvZicgJ2RlbGV0ZSddKSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoKEBzdGFja1stMV0gbm90IGluIFsnaWYnICdmb3InXSkgb3Igbnh0LmxpbmUgPT0gZS50b2tlbi5saW5lKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbmVhcmcnIG5vdCBpbiBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnICAgIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50b2tlbj8udGV4dCBub3QgaW4gWydbJyAnKCddXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3QgPCBueHQuY29sIGFuZCB0b2tlbnNbMV0/LmNvbCA9PSBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBvcCBpcyB1bmJhbGFuY2VkICstIGJyZWFrLi4uJyBlLCBueHQsIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2Ygb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQudG9rZW5zIFwiZXhwIG5vIG54dCBtYXRjaD8gYnJlYWshIHN0YWNrOiN7QHN0YWNrfSBueHQ6XCIgW254dF0gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgIyBtaXNzaW5nIGJyZWFrIGhlcmU/XG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIEBzdGFja1stMV0gbm90IGluICcuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2VucyAjIG1pc3NpbmcgYnJlYWsgaGVyZT9cbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBjYWxsIGFycmF5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBbIGFycmF5IGVuZCcgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwiZXhwIG5vIG54dCBtYXRjaD8/IHN0YWNrOiN7QHN0YWNrfSBlOlwiIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50LnRva2VucyBcImV4cCBubyBueHQgbWF0Y2g/PyBueHQ6XCIgbnh0XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnVtVG9rZW5zID09IHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICBlcnJvciAnZXhwIG5vIHRva2VuIGNvbnN1bWVkPydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHN0YWNrXG4gICAgICAgICAgICAjIEB2ZXJiICdleHAgZW1wdHkgc3RhY2snXG4gICAgICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGVtcHR5IHN0YWNrIG54dCcgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsYXN0IG1pbnV0ZSBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBpbXBsZW1lbnQgbnVsbCBjaGVja3MgaGVyZSFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIEBzaGVhcFBvcCAnZXhwJyB0b2sudGV4dCA/IHRvay50eXBlXG5cbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgXG4gICAgdGhlbjogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBlcnJvciBcIiN7aWR9OiB0aGVuIG9yIGJsb2NrIGV4cGVjdGVkIVwiXG5cbiAgICAgICAgdGhuID0gQGV4cHMgaWQsIHRva2VucywgbmxcbiAgICAgICAgXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIHRoZW4gdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICB0aG5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgYmxvY2s6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzID0gQGV4cHMgaWQsIHRva2VucywgbmxcblxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBibG9jayB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHNcbiAgICAgICAgXG4gICAgYmxvY2tFeHA6IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBAdmVyYiBcImJsb2NrRXhwICN7aWR9XCJcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICMgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgdGhlbiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgQGV4cCBibG9jay50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIFxuICAgIFxuICAgIHNoZWFwUHVzaDogKHR5cGUsIHRleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2hlYXAucHVzaCB0eXBlOnR5cGUsIHRleHQ6dGV4dFxuICAgICAgICBwcmludC5zaGVhcCBAc2hlYXAgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgc2hlYXBQb3A6IChtLCB0KSAtPlxuICAgICAgICBcbiAgICAgICAgcG9wcGVkID0gQHNoZWFwLnBvcCgpXG4gICAgICAgIGlmIHBvcHBlZC50ZXh0ICE9IHQgdGhlbiBlcnJvciAnd3JvbmcgcG9wPycgcG9wcGVkLnRleHQsIHRcbiAgICAgICAgcHJpbnQuc2hlYXAgQHNoZWFwLCBwb3BwZWQgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuICAgIHB1c2g6IChub2RlKSAtPlxuXG4gICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgbm9kZSBpZiBAdmVyYm9zZVxuICAgICAgICBAc3RhY2sucHVzaCBub2RlXG5cbiAgICBwb3A6IChuKSAtPlxuICAgICAgICBwID0gQHN0YWNrLnBvcCgpXG4gICAgICAgIGlmIHAgIT0gblxuICAgICAgICAgICAgZXJyb3IgXCJ1bmV4cGVjdGVkIHBvcCFcIiBwLCBuXG4gICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIHAsIChzKSAtPiBXMSB3MSBzXG5cbiAgICB2ZXJiOiAtPlxuXG4gICAgICAgIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLmxvZywgYXJndW1lbnRzXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZVxuIl19
//# sourceURL=../coffee/parse.coffee
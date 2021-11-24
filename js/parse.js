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
        ast = [];
        while (block.tokens.length) {
            ast = ast.concat(this.exps('tl block', block.tokens));
        }
        if (this.raw) {
            print.noon('raw ast', ast);
        }
        return ast;
    };

    Parse.prototype.exps = function(rule, tokens, stop) {
        var b, block, es, ex, ref, ref1, ref2, ref3, ref4, ref5, ref6;
        if (empty(tokens)) {
            return;
        }
        es = [];
        while (tokens.length) {
            b = (function() {
                switch (this.stack.slice(-1)[0]) {
                    case 'typeof':
                        return es.length;
                    case 'if':
                    case 'switch':
                        return tokens[0].text === 'else';
                    case 'call':
                        return tokens[0].text === ';' && tokens.shift();
                    case rule:
                        return tokens[0].text === stop;
                    default:
                        return false;
                }
            }).call(this);
            if (b) {
                break;
            }
            if (this.stack.slice(-1)[0] === '[' && tokens[0].text === ']') {
                tokens.shift();
                break;
            }
            if (this.stack.slice(-1)[0] === '{' && tokens[0].text === '}') {
                tokens.shift();
                break;
            }
            if (this.stack.slice(-1)[0] === '{' && tokens[0].text === ';') {
                tokens.shift();
                break;
            }
            if (tokens[0].type === 'block') {
                block = tokens.shift();
                this.verb("exps block:", block);
                while (block.tokens.length) {
                    es = es.concat(this.exps('exps block', block.tokens));
                }
                if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
                    this.verb("exps shift nl");
                    tokens.shift();
                }
                if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ',') {
                    this.verb("exps shift ,");
                    tokens.shift();
                }
                this.verb('exps block! continue...');
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
                if (this.stack.slice(-1)[0] === 'if' && ((ref3 = tokens[1]) != null ? ref3.text : void 0) !== 'else') {
                    this.verb('exps ifbreak (shift nl ; and break)');
                    tokens.shift();
                    break;
                }
                if (this.stack.slice(-1)[0] === '[' && ((ref4 = tokens[1]) != null ? ref4.text : void 0) === ']') {
                    this.verb('exps nl + array ends in current block');
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
                if (((ref5 = tokens[0]) != null ? ref5.text : void 0) === '.' && ((ref6 = tokens[1]) != null ? ref6.type : void 0) === 'var') {
                    console.log('next line starts with .var!');
                    es.push(this.prop(es.pop(), tokens));
                }
                this.verb('exps continue...');
                continue;
            }
            ex = this.exp(tokens);
            es.push(ex);
        }
        return es;
    };

    Parse.prototype.exp = function(tokens) {
        var e, f, last, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref5, ref6, ref7, ref8, ref9, tok;
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
        e = {
            token: tok
        };
        while (nxt = tokens[0]) {
            if (!e) {
                return console.error('no e?', nxt);
            }
            if (((ref = Object.values(e)[0]) != null ? ref.col : void 0) != null) {
                last = Object.values(e)[0].col + ((ref1 = Object.values(e)[0].text) != null ? ref1.length : void 0);
            } else if (((ref2 = Object.values(e)[0]) != null ? (ref3 = ref2.close) != null ? ref3.col : void 0 : void 0) != null) {
                last = Object.values(e)[0].close.col + ((ref4 = Object.values(e)[0].close.text) != null ? ref4.length : void 0);
            } else {
                last = -1;
                this.verb('parser no last? e:', e);
            }
            if (this.stack.slice(-1)[0] === 'typeof' && ((ref5 = nxt.type) === 'op')) {
                this.verb('exp break for typeof');
                break;
            }
            if (nxt.type === 'op' && ((ref6 = nxt.text) !== '++' && ref6 !== '--' && ref6 !== '+' && ref6 !== '-') && ((ref7 = (ref8 = e.token) != null ? ref8.text : void 0) !== '[' && ref7 !== '(')) {
                this.verb('exp is lhs of op', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'op' && ((ref9 = nxt.text) === '+' || ref9 === '-') && ((ref10 = (ref11 = e.token) != null ? ref11.text : void 0) !== '[' && ref10 !== '(') && last < nxt.col && ((ref12 = tokens[1]) != null ? ref12.col : void 0) > nxt.col + nxt.text.length) {
                this.verb('exp is lhs of +-\s', e, nxt);
                e = this.operation(e, tokens.shift(), tokens);
            } else if (nxt.type === 'func' && (e.parens || e.token && ((ref13 = e.token.type) !== 'num' && ref13 !== 'single' && ref13 !== 'double' && ref13 !== 'triple') && (ref14 = e.token.text, indexOf.call('}]', ref14) < 0))) {
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
            } else if (nxt.text === '[' && nxt.col === last && ((ref15 = tokens[1]) != null ? ref15.text : void 0) !== ']' && ((ref16 = e.token) != null ? ref16.text : void 0) !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '?' && last === nxt.col && ((ref17 = tokens[1]) != null ? ref17.text : void 0) === '.') {
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
                } else if (((ref18 = e.token.text) === '+' || ref18 === '-' || ref18 === '++' || ref18 === '--') && last === nxt.col) {
                    if (((ref19 = nxt.type) !== 'var' && ref19 !== 'paren') && ((ref20 = e.token.text) === '++' || ref20 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    this.verb('lhs null operation');
                    e = this.operation(null, e.token, tokens);
                    if ((ref21 = (ref22 = e.operation.rhs) != null ? (ref23 = ref22.operation) != null ? (ref24 = ref23.operator) != null ? ref24.text : void 0 : void 0 : void 0) === '++' || ref21 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref25 = nxt.text) === '++' || ref25 === '--') && last === nxt.col) {
                    if ((ref26 = e.token.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref27 = e.token.type) === 'var' || ref27 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('exp curly end');
                    break;
                } else if (last < nxt.col && (ref28 = nxt.text, indexOf.call(')]},;:.', ref28) < 0) && ((ref29 = nxt.text) !== 'then' && ref29 !== 'else' && ref29 !== 'break' && ref29 !== 'continue' && ref29 !== 'in' && ref29 !== 'of') && ((ref30 = nxt.type) !== 'nl') && ((ref31 = e.token.type) !== 'num' && ref31 !== 'single' && ref31 !== 'double' && ref31 !== 'triple' && ref31 !== 'regex' && ref31 !== 'punct' && ref31 !== 'comment' && ref31 !== 'op') && ((ref32 = e.token.text) !== 'null' && ref32 !== 'undefined' && ref32 !== 'Infinity' && ref32 !== 'NaN' && ref32 !== 'true' && ref32 !== 'false' && ref32 !== 'yes' && ref32 !== 'no') && (e.token.type !== 'keyword' || ((ref33 = e.token.text) === 'new' || ref33 === 'require' || ref33 === 'typeof')) && (((ref34 = this.stack.slice(-1)[0]) !== 'if' && ref34 !== 'for') || nxt.line === e.token.line)) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('exp is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else if (nxt.type === 'op' && ((ref35 = nxt.text) === '+' || ref35 === '-') && ((ref36 = (ref37 = e.token) != null ? ref37.text : void 0) !== '[' && ref36 !== '(')) {
                    if (last < nxt.col && ((ref38 = tokens[1]) != null ? ref38.col : void 0) === nxt.col + nxt.text.length) {
                        this.verb('exp op is unbalanced +- break...', e, nxt, this.stack);
                        break;
                    }
                    this.verb('exp is lhs of op', e, nxt);
                    e = this.operation(e, tokens.shift(), tokens);
                } else {
                    this.verb('no nxt match?', nxt, this.stack);
                    break;
                }
            } else {
                if (((ref39 = nxt.text) === '++' || ref39 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref40 = this.stack.slice(-1)[0], indexOf.call('.', ref40) < 0)) {
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
        if (empty(this.stack)) {
            true;
        }
        if (this.verbose) {
            print.ast("exp " + (empty(this.stack) ? 'DONE' : ''), e);
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07QUFFTixlQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBbkI7WUFDSSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sRUFBaUIsS0FBSyxDQUFDLE1BQXZCLENBQVg7UUFEVjtRQUdBLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtJQVhHOztvQkFxQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLEVBQUEsR0FB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TyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUgsQ0FBSDtZQUFQLENBQXZCLEVBREo7O0lBSkM7O29CQU9MLElBQUEsR0FBTSxTQUFBO1FBRUYsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBREo7O0lBRkU7Ozs7OztBQUtWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChhcmdzKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBhcmdzPy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgID0gYXJncz8ucmF3XG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgcGFyc2U6IChibG9jaykgLT4gIyBjb252ZXJ0IGJsb2NrIHRyZWUgdG8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcblxuICAgICAgICBAc3RhY2sgPSBbXVxuXG4gICAgICAgIGFzdCA9IFtdXG5cbiAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgYXN0ID0gYXN0LmNvbmNhdCBAZXhwcyAndGwgYmxvY2snIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICBhc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBsaXN0IG9mIGV4cHJlc3Npb25zXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIGVzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAndHlwZW9mJyAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICAjIHdoZW4gJ1snICAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnXScgYW5kIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgIyB3aGVuICd7JyAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ307JyBhbmQgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJzsnIGFuZCB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIHdoZW4gcnVsZSAgICAgICAgICAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSBzdG9wXG4gICAgICAgICAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAjIEB2ZXJiICdleHBzIGJyZWFrIGZvciB0eXBlb2YnXG4gICAgICAgICAgICAgICAgICAgICMgYnJlYWtcblxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCB0b2tlbnNbMF0udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ3snIGFuZCB0b2tlbnNbMF0udGV4dCA9PSAnfSdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICd7JyBhbmQgdG9rZW5zWzBdLnRleHQgPT0gJzsnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjIGlmIEBzdGFja1stMV0gPT0gJ2NhbGwnIGFuZCB0b2tlbnNbMF0udGV4dCA9PSAnOydcbiAgICAgICAgICAgICAgICAjIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgIyBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJ1xuICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2s6XCIgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBlcyA9IGVzLmNvbmNhdCBAZXhwcyAnZXhwcyBibG9jaycgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIHNoaWZ0IG5sXCIgXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLCdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIHNoaWZ0ICxcIlxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBibG9jayEgY29udGludWUuLi4nXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIGJsb2NrJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiApJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBydWxlID09ICdmb3IgdmFscycgYW5kIHRva2Vuc1swXS50ZXh0IGluIFsnaW4nJ29mJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBpbnxvZidcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcblxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ2lmJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICdlbHNlJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBpZmJyZWFrIChzaGlmdCBubCA7IGFuZCBicmVhayknIFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCArIGFycmF5IGVuZHMgaW4gY3VycmVudCBibG9jaydcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdjYWxsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY2FsbC5lbmQgKGRvbnQgc2hpZnQgbmwpJ1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gbmwgOycgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnLicgYW5kIHRva2Vuc1sxXT8udHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ25leHQgbGluZSBzdGFydHMgd2l0aCAudmFyISdcbiAgICAgICAgICAgICAgICAgICAgZXMucHVzaCBAcHJvcCBlcy5wb3AoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY29udGludWUuLi4nIFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBleCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBlcy5wdXNoIGV4XG5cbiAgICAgICAgZXNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIHNpbmdsZSBleHByZXNzaW9uXG5cbiAgICBleHA6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIHRvayA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgbG9nIFk1IHcxIHRvaz8udGV4dCBpZiBAZGVidWdcblxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIG5sXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJ1xuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgICB0aGVuIHJldHVybiBAaWYgICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICAgdGhlbiByZXR1cm4gQHdoZW4gICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gcmV0dXJuIEBjbGFzcyAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIHJldHVybiBAcmV0dXJuIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICctPicgJz0+JyAgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIDtcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLCcgICAgICAgICB0aGVuIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgLFxuXG4gICAgICAgIGUgPSB0b2tlbjp0b2tcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBPYmplY3QudmFsdWVzKGUpWzBdPy5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IE9iamVjdC52YWx1ZXMoZSlbMF0uY29sK09iamVjdC52YWx1ZXMoZSlbMF0udGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlIGlmIE9iamVjdC52YWx1ZXMoZSlbMF0/LmNsb3NlPy5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IE9iamVjdC52YWx1ZXMoZSlbMF0uY2xvc2UuY29sK09iamVjdC52YWx1ZXMoZSlbMF0uY2xvc2UudGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGFzdCA9IC0xXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3BhcnNlciBubyBsYXN0PyBlOicgZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBAdmVyYiAnZXhwIGxhc3QgbmV4dCcgbGFzdCwgbnh0LmNvbFxuXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICd0eXBlb2YnIGFuZCBueHQudHlwZSBpbiBbJ29wJ11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGJyZWFrIGZvciB0eXBlb2YnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ29wJyBhbmQgbnh0LnRleHQgbm90IGluIFsnKysnICctLScgJysnICctJ10gYW5kIGUudG9rZW4/LnRleHQgbm90IGluIFsnWycgJygnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIG9wJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IGluIFsnKycgJy0nXSBhbmQgZS50b2tlbj8udGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICBsYXN0IDwgbnh0LmNvbCBhbmQgdG9rZW5zWzFdPy5jb2wgPiBueHQuY29sK254dC50ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mICstXFxzJyBlLCBueHRcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2Z1bmMnIGFuZCAoZS5wYXJlbnMgb3IgZS50b2tlbiBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudG9rZW4udHlwZSBub3QgaW4gWydudW0nJ3NpbmdsZScnZG91YmxlJyd0cmlwbGUnXSBhbmQgXG4gICAgICAgICAgICAgICAgICAgIGUudG9rZW4udGV4dCBub3QgaW4gJ31dJylcbiAgICAgICAgICAgICAgICBmID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGZ1bmMgZm9yIGUnIGVcbiAgICAgICAgICAgICAgICBlID0gQGZ1bmMgZSwgZiwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgICAgIGlmIG54dC5jb2wgPT0gbGFzdFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIG9wZW4gcGFyZW4nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcGFyZW5zIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgbnh0LmNvbCA9PSBsYXN0IGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nIGFuZCBlLnRva2VuPy50ZXh0ICE9ICdbJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJz8nIGFuZCBsYXN0ID09IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBxbWFyayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2VucywgcW1hcmtcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJy4nXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6J1xuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gIT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQG9iamVjdCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMga2V5IG9mIChpbXBsaWNpdCkgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAa2V5dmFsIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAna2V5d29yZCcgYW5kIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlblxuICAgICAgICAgICAgICAgIGlmIGUudG9rZW4udGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ1snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAYXJyYXkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY3VybHkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgaW4gWycrJyctJycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlIG5vdCBpbiBbJ3ZhcicncGFyZW4nXSBhbmQgZS50b2tlbi50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgbGhzIGluY3JlbWVudCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2xocyBudWxsIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvcj8udGV4dCBpbiBbJysrJyctLSddXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbGVmdCBhbmQgcmlnaHQgc2lkZSBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBpZiBlLnRva2VuLnR5cGUgbm90IGluIFsndmFyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgcmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgZS50b2tlbi50eXBlIGluIFsndmFyJyAnbnVtJ11cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBzbGljZSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBhcnJheSBlbmQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICd7JyBhbmQgbnh0LnRleHQgPT0gJ30nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgY3VybHkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbGFzdCA8IG54dC5jb2wgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gJyldfSw7Oi4nIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZiddIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgbm90IGluIFsnbmwnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nXSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50eXBlICE9ICdrZXl3b3JkJyBvciAoZS50b2tlbi50ZXh0IGluIFsnbmV3JyAncmVxdWlyZScgJ3R5cGVvZiddKSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoKEBzdGFja1stMV0gbm90IGluIFsnaWYnICdmb3InXSkgb3Igbnh0LmxpbmUgPT0gZS50b2tlbi5saW5lKVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBlJyBlLCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ29wJyBhbmQgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBlLnRva2VuPy50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdCA8IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPycgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIEBzdGFja1stMV0gbm90IGluICcuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwibm8gbnh0IG1hdGNoPz8gI3tAc3RhY2t9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPz8gZTonIGVcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ25vIG54dCBtYXRjaD8/IG54dDonIG54dFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAc3RhY2tcbiAgICAgICAgICAgICMgZml4IG51bGwgY2hlY2tzXG4gICAgICAgICAgICB5ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIFxuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGVycm9yIFwiI3tpZH06IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhXCJcblxuICAgICAgICB0aG4gPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBcbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgdGhlbiB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIHRoblxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBibG9jazogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEB2ZXJib3NlXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+XG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee
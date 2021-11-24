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
                var ref, ref1;
                switch (this.stack.slice(-1)[0]) {
                    case 'onearg':
                        return es.length;
                    case 'if':
                    case 'switch':
                        return tokens[0].text === 'else';
                    case '[':
                        return tokens[0].text === ']' && tokens.shift();
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
        var e, f, last, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref5, ref6, ref7, ref8, ref9, tok;
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
            if (this.stack.slice(-1)[0] === 'onearg' && ((ref5 = nxt.type) === 'op')) {
                this.verb('exp break for onearg');
                break;
            }
            if (nxt.type === 'op' && ((ref6 = nxt.text) !== '++' && ref6 !== '--' && ref6 !== '+' && ref6 !== '-') && ((ref7 = (ref8 = e.token) != null ? ref8.text : void 0) !== '[' && ref7 !== '(') && indexOf.call(this.stack, 'onearg') < 0) {
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
                } else if (last < nxt.col && (ref28 = nxt.text, indexOf.call(')]},;:.', ref28) < 0) && ((ref29 = nxt.text) !== 'then' && ref29 !== 'else' && ref29 !== 'break' && ref29 !== 'continue' && ref29 !== 'in' && ref29 !== 'of') && ((ref30 = nxt.type) !== 'nl') && ((ref31 = e.token.type) !== 'num' && ref31 !== 'single' && ref31 !== 'double' && ref31 !== 'triple' && ref31 !== 'regex' && ref31 !== 'punct' && ref31 !== 'comment' && ref31 !== 'op') && ((ref32 = e.token.text) !== 'null' && ref32 !== 'undefined' && ref32 !== 'Infinity' && ref32 !== 'NaN' && ref32 !== 'true' && ref32 !== 'false' && ref32 !== 'yes' && ref32 !== 'no') && (e.token.type !== 'keyword' || ((ref33 = e.token.text) === 'new' || ref33 === 'require' || ref33 === 'typeof' || ref33 === 'delete')) && (((ref34 = this.stack.slice(-1)[0]) !== 'if' && ref34 !== 'for') || nxt.line === e.token.line) && indexOf.call(this.stack, 'onearg') < 0) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('    is lhs of implicit call! nxt', nxt);
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
                } else if (this.stack.slice(-1)[0] === 'call' && nxt.text === ']') {
                    this.verb('exp call array end');
                    break;
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
            this.verb('exp empty stack');
            if (nxt = tokens[0]) {
                this.verb('exp empty stack nxt', nxt);
                if (nxt.text === '[' && ((ref41 = tokens[1]) != null ? ref41.text : void 0) !== ']') {
                    this.verb('exp is last minute lhs of index', e);
                    e = this.index(e, tokens);
                }
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07QUFFTixlQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBbkI7WUFDSSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sRUFBaUIsS0FBSyxDQUFDLE1BQXZCLENBQVg7UUFEVjtRQUdBLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtJQVhHOztvQkFxQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLEVBQUEsR0FB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QUFZLElBQUMsQ0FBQSxLQUFiLEVBQW9CLElBQXBCLEVBQUE7O2VBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtJQUhFOztvQkFLTixHQUFBLEdBQUssU0FBQyxDQUFEO0FBQ0QsWUFBQTtRQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBQTtRQUNKLElBQUcsQ0FBQSxLQUFLLENBQVI7WUFDRyxPQUFBLENBQUMsS0FBRCxDQUFPLGlCQUFQLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBREg7O1FBRUEsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFDSSxLQUFLLENBQUMsS0FBTixDQUFZLElBQUMsQ0FBQSxLQUFiLEVBQW9CLENBQXBCLEVBQXVCLFNBQUMsQ0FBRDt1QkFBTyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUgsQ0FBSDtZQUFQLENBQXZCLEVBREo7O0lBSkM7O29CQU9MLElBQUEsR0FBTSxTQUFBO1FBRUYsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBTyxDQUFDLEdBQTFCLEVBQStCLFNBQS9CLEVBREo7O0lBRkU7Ozs7OztBQUtWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuY2xhc3MgUGFyc2UgIyB0aGUgYmFzZSBjbGFzcyBvZiBQYXJzZXJcblxuICAgIEA6IChhcmdzKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBhcmdzPy52ZXJib3NlXG4gICAgICAgIEByYXcgICAgID0gYXJncz8ucmF3XG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuXG4gICAgcGFyc2U6IChibG9jaykgLT4gIyBjb252ZXJ0IGJsb2NrIHRyZWUgdG8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcblxuICAgICAgICBAc3RhY2sgPSBbXVxuXG4gICAgICAgIGFzdCA9IFtdXG5cbiAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgYXN0ID0gYXN0LmNvbmNhdCBAZXhwcyAndGwgYmxvY2snIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgIGlmIEByYXcgdGhlbiBwcmludC5ub29uICdyYXcgYXN0JyBhc3RcblxuICAgICAgICBhc3RcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBsaXN0IG9mIGV4cHJlc3Npb25zXG5cbiAgICBleHBzOiAocnVsZSwgdG9rZW5zLCBzdG9wKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIGVzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGIgPSBzd2l0Y2ggQHN0YWNrWy0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbiAnb25lYXJnJyAgICAgICB0aGVuIGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAnc3dpdGNoJyAgdGhlbiB0b2tlbnNbMF0udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB3aGVuICdbJyAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gJ10nICBhbmQgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ107JyBhbmQgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB3aGVuICd7JyAgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgaW4gJ307JyBhbmQgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB3aGVuIHJ1bGUgICAgICAgICAgIHRoZW4gdG9rZW5zWzBdLnRleHQgPT0gc3RvcFxuICAgICAgICAgICAgICAgIGVsc2UgZmFsc2VcblxuICAgICAgICAgICAgYnJlYWsgaWYgYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIGJsb2NrOlwiIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZXMgPSBlcy5jb25jYXQgQGV4cHMgJ2V4cHMgYmxvY2snIGJsb2NrLnRva2Vuc1xuXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBzaGlmdCBubFwiIFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBzaGlmdCAsXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2shIGNvbnRpbnVlLi4uJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gKSdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcnVsZSA9PSAnZm9yIHZhbHMnIGFuZCB0b2tlbnNbMF0udGV4dCBpbiBbJ2luJydvZiddXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gaW58b2YnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG5cbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdpZicgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnZWxzZSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgaWZicmVhayAoc2hpZnQgbmwgOyBhbmQgYnJlYWspJyBcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgKyBhcnJheSBlbmRzIGluIGN1cnJlbnQgYmxvY2snXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGNhbGwuZW5kIChkb250IHNoaWZ0IG5sKSdcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KCkgXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIG5sIDsnIFxuICAgICAgICAgICAgICAgICAgICBicmVhayBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJy4nIGFuZCB0b2tlbnNbMV0/LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgICAgICAgICAgbG9nICduZXh0IGxpbmUgc3RhcnRzIHdpdGggLnZhciEnXG4gICAgICAgICAgICAgICAgICAgIGVzLnB1c2ggQHByb3AgZXMucG9wKCksIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGNvbnRpbnVlLi4uJyBcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZXggPSBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgZXMucHVzaCBleFxuXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG5cbiAgICAgICAgc3dpdGNoIHRvay50eXBlXG4gICAgICAgICAgICB3aGVuICdibG9jaycgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCBubFxuICAgICAgICAgICAgd2hlbiAna2V5d29yZCdcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiByZXR1cm4gQGlmICAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIHJldHVybiBAd2hpbGUgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgICB0aGVuIHJldHVybiBAY2xhc3MgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiByZXR1cm4gQHJldHVybiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICc7JyAgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCA7XG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJywnICAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZSA9IHRva2VuOnRva1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgbnh0ID0gdG9rZW5zWzBdXG5cbiAgICAgICAgICAgIGlmIG5vdCBlIHRoZW4gcmV0dXJuIGVycm9yICdubyBlPycgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIE9iamVjdC52YWx1ZXMoZSlbMF0/LmNvbD9cbiAgICAgICAgICAgICAgICBsYXN0ID0gT2JqZWN0LnZhbHVlcyhlKVswXS5jb2wrT2JqZWN0LnZhbHVlcyhlKVswXS50ZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIGVsc2UgaWYgT2JqZWN0LnZhbHVlcyhlKVswXT8uY2xvc2U/LmNvbD9cbiAgICAgICAgICAgICAgICBsYXN0ID0gT2JqZWN0LnZhbHVlcyhlKVswXS5jbG9zZS5jb2wrT2JqZWN0LnZhbHVlcyhlKVswXS5jbG9zZS50ZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsYXN0ID0gLTFcbiAgICAgICAgICAgICAgICBAdmVyYiAncGFyc2VyIG5vIGxhc3Q/IGU6JyBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEB2ZXJiICdleHAgbGFzdCBuZXh0JyBsYXN0LCBueHQuY29sXG5cbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ29uZWFyZycgYW5kIG54dC50eXBlIGluIFsnb3AnXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgYnJlYWsgZm9yIG9uZWFyZydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBueHQudHlwZSA9PSAnb3AnIGFuZCBueHQudGV4dCBub3QgaW4gWycrKycgJy0tJyAnKycgJy0nXSBhbmQgZS50b2tlbj8udGV4dCBub3QgaW4gWydbJyAnKCddIGFuZCAnb25lYXJnJyBub3QgaW4gQHN0YWNrXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2Ygb3AnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ29wJyBhbmQgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBlLnRva2VuPy50ZXh0IG5vdCBpbiBbJ1snICcoJ10gYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPCBueHQuY29sIGFuZCB0b2tlbnNbMV0/LmNvbCA+IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgKy1cXHMnIGUsIG54dFxuICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZnVuYycgYW5kIChlLnBhcmVucyBvciBlLnRva2VuIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50b2tlbi50eXBlIG5vdCBpbiBbJ251bScnc2luZ2xlJydkb3VibGUnJ3RyaXBsZSddIGFuZCBcbiAgICAgICAgICAgICAgICAgICAgZS50b2tlbi50ZXh0IG5vdCBpbiAnfV0nKVxuICAgICAgICAgICAgICAgIGYgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgZnVuYyBmb3IgZScgZVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCBmLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnXG4gICAgICAgICAgICAgICAgaWYgbnh0LmNvbCA9PSBsYXN0XG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgb3BlbiBwYXJlbidcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCBueHQuY29sID09IGxhc3QgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXScgYW5kIGUudG9rZW4/LnRleHQgIT0gJ1snXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnPycgYW5kIGxhc3QgPT0gbnh0LmNvbCBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcuJ1xuICAgICAgICAgICAgICAgIHFtYXJrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlID0gQHByb3AgZSwgdG9rZW5zLCBxbWFya1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBlID0gQHByb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdrZXl3b3JkJyBhbmQgbnh0LnRleHQgPT0gJ2luJyBhbmQgQHN0YWNrWy0xXSAhPSAnZm9yJ1xuICAgICAgICAgICAgICAgIGUgPSBAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuXG4gICAgICAgICAgICAgICAgaWYgZS50b2tlbi50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHBhcmVucyBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudG9rZW4udGV4dCA9PSAnWydcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBhcnJheSBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudG9rZW4udGV4dCA9PSAneydcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBjdXJseSBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudG9rZW4udGV4dCBpbiBbJysnJy0nJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgbm90IGluIFsndmFyJydwYXJlbiddIGFuZCBlLnRva2VuLnRleHQgaW4gWycrKycnLS0nXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyBsaHMgaW5jcmVtZW50JyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbGhzIG51bGwgb3BlcmF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yPy50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdsZWZ0IGFuZCByaWdodCBzaWRlIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudG9rZW4udHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIGFuZCBlLnRva2VuLnR5cGUgaW4gWyd2YXInICdudW0nXVxuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGFycmF5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ3snIGFuZCBueHQudGV4dCA9PSAnfSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBjdXJseSBlbmQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsYXN0IDwgbnh0LmNvbCBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiAnKV19LDs6LicgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gWyd0aGVuJyAnZWxzZScgJ2JyZWFrJyAnY29udGludWUnICdpbicgJ29mJ10gYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICBueHQudHlwZSBub3QgaW4gWydubCddIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudG9rZW4udHlwZSBub3QgaW4gWydudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnICdyZWdleCcgJ3B1bmN0JyAnY29tbWVudCcgJ29wJ10pIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudG9rZW4udGV4dCBub3QgaW4gWydudWxsJyAndW5kZWZpbmVkJyAnSW5maW5pdHknICdOYU4nICd0cnVlJyAnZmFsc2UnICd5ZXMnICdubyddKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnR5cGUgIT0gJ2tleXdvcmQnIG9yIChlLnRva2VuLnRleHQgaW4gWyduZXcnICdyZXF1aXJlJyAndHlwZW9mJyAnZGVsZXRlJ10pKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICgoQHN0YWNrWy0xXSBub3QgaW4gWydpZicgJ2ZvciddKSBvciBueHQubGluZSA9PSBlLnRva2VuLmxpbmUpIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29uZWFyZycgbm90IGluIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBlJyBlLCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICcgICAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ29wJyBhbmQgbnh0LnRleHQgaW4gWycrJyAnLSddIGFuZCBlLnRva2VuPy50ZXh0IG5vdCBpbiBbJ1snICcoJ11cbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdCA8IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8uY29sID09IG54dC5jb2wrbnh0LnRleHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIG9wIGlzIHVuYmFsYW5jZWQgKy0gYnJlYWsuLi4nIGUsIG54dCwgQHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBvcCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPycgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIEBzdGFja1stMV0gbm90IGluICcuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCcgYW5kIG54dC50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGNhbGwgYXJyYXkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwibm8gbnh0IG1hdGNoPz8gI3tAc3RhY2t9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPz8gZTonIGVcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ25vIG54dCBtYXRjaD8/IG54dDonIG54dFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAc3RhY2tcbiAgICAgICAgICAgIEB2ZXJiICdleHAgZW1wdHkgc3RhY2snXG4gICAgICAgICAgICBpZiBueHQgPSB0b2tlbnNbMF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGVtcHR5IHN0YWNrIG54dCcgbnh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsYXN0IG1pbnV0ZSBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBmaXggbnVsbCBjaGVja3NcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIFxuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGVycm9yIFwiI3tpZH06IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhXCJcblxuICAgICAgICB0aG4gPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBcbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgdGhlbiB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIHRoblxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBibG9jazogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEB2ZXJib3NlXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+XG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee
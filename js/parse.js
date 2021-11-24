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
        var block, es, ex, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
        if (empty(tokens)) {
            return;
        }
        es = [];
        while (tokens.length) {
            if (tokens[0].type === 'block') {
                block = tokens.shift();
                this.verb("exps block:", block);
                while (block.tokens.length) {
                    es = es.concat(this.exps('exps block', block.tokens));
                }
                if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
                    this.verb("exps shift nl");
                    tokens.shift();
                    if (((ref1 = tokens[0]) != null ? ref1.col : void 0) < block.col - 4 || ((ref2 = tokens[0]) != null ? ref2.col : void 0) === 0) {
                        this.verb('dedent!', block.col, (ref3 = tokens[0]) != null ? ref3.col : void 0);
                        break;
                    }
                }
                if (((ref4 = tokens[0]) != null ? ref4.text : void 0) === ',') {
                    this.verb("exps shift ,");
                    tokens.shift();
                }
                this.verb('exps block!');
                continue;
            }
            if (this.stack.slice(-1)[0] === rule && tokens[0].text === stop) {
                this.verb("stack.end " + this.stack.slice(-1)[0] + " " + tokens[0].text);
                break;
            }
            if (((ref5 = this.stack.slice(-1)[0]) === 'if' || ref5 === 'switch') && (tokens[0].text === 'else')) {
                this.verb('exps else break');
                break;
            }
            if (this.stack.slice(-1)[0] === '[' && tokens[0].text === ']') {
                this.verb('exps array ends in current block');
                tokens.shift();
                break;
            }
            if (tokens[0].type === 'nl') {
                this.verb('exps nl stop:', stop, tokens[0], this.stack);
                if (this.stack.slice(-1)[0] === 'if' && ((ref6 = tokens[1]) != null ? ref6.text : void 0) !== 'else') {
                    this.verb('exps ifbreak (shift nl ; and break)');
                    tokens.shift();
                    break;
                }
                if (this.stack.slice(-1)[0] === '[' && ((ref7 = tokens[1]) != null ? ref7.text : void 0) === ']') {
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
                this.verb('exps continue...');
                continue;
            }
            if (tokens[0].text === ';' && ((ref8 = this.stack.slice(-1)[0]) === 'call' || ref8 === '{')) {
                this.verb('exps call break on ;');
                tokens.shift();
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
            ex = this.exp(tokens);
            es.push(ex);
        }
        return es;
    };

    Parse.prototype.exp = function(tokens) {
        var e, f, last, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref3, ref4, ref5, ref6, ref7, ref8, ref9, tok;
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
            this.verb('exp last next', last, nxt.col);
            if (nxt.type === 'op' && ((ref5 = nxt.text) !== '++' && ref5 !== '--')) {
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
            } else if (nxt.text === '[' && nxt.col === last && ((ref6 = tokens[1]) != null ? ref6.text : void 0) !== ']' && ((ref7 = e.token) != null ? ref7.text : void 0) !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '?' && last === nxt.col && ((ref8 = tokens[1]) != null ? ref8.text : void 0) === '.') {
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
                } else if (((ref9 = e.token.text) === '+' || ref9 === '-' || ref9 === '++' || ref9 === '--') && last === nxt.col) {
                    if (((ref10 = nxt.type) !== 'var' && ref10 !== 'paren') && ((ref11 = e.token.text) === '++' || ref11 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    e = this.operation(null, e.token, tokens);
                    if ((ref12 = (ref13 = e.operation.rhs) != null ? (ref14 = ref13.operation) != null ? (ref15 = ref14.operator) != null ? ref15.text : void 0 : void 0 : void 0) === '++' || ref12 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref16 = nxt.text) === '++' || ref16 === '--') && last === nxt.col) {
                    if ((ref17 = e.token.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref18 = e.token.type) === 'var' || ref18 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (last < nxt.col && (ref19 = nxt.text, indexOf.call(')]},;:.', ref19) < 0) && ((ref20 = nxt.text) !== 'then' && ref20 !== 'else' && ref20 !== 'break' && ref20 !== 'continue' && ref20 !== 'in' && ref20 !== 'of') && ((ref21 = nxt.type) !== 'nl') && (nxt.type !== 'op' || last < nxt.col) && ((ref22 = e.token.type) !== 'num' && ref22 !== 'single' && ref22 !== 'double' && ref22 !== 'triple' && ref22 !== 'regex' && ref22 !== 'punct' && ref22 !== 'comment' && ref22 !== 'op') && ((ref23 = e.token.text) !== 'null' && ref23 !== 'undefined' && ref23 !== 'Infinity' && ref23 !== 'NaN' && ref23 !== 'true' && ref23 !== 'false' && ref23 !== 'yes' && ref23 !== 'no') && (e.token.type !== 'keyword' || ((ref24 = e.token.text) === 'new' || ref24 === 'require')) && (((ref25 = this.stack.slice(-1)[0]) !== 'if' && ref25 !== 'for') || nxt.line === e.token.line)) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('exp is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp array end');
                    break;
                } else {
                    this.verb('no nxt match?', nxt, this.stack);
                    break;
                }
            } else {
                if (((ref26 = nxt.text) === '++' || ref26 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref27 = this.stack.slice(-1)[0], indexOf.call('.', ref27) < 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07QUFFTixlQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBbkI7WUFDSSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sRUFBaUIsS0FBSyxDQUFDLE1BQXZCLENBQVg7UUFEVjtRQUdBLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtJQVhHOztvQkFxQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLEVBQUEsR0FB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RUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFESDs7UUFFQSxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBQyxDQUFBLEtBQWIsRUFBb0IsQ0FBcEIsRUFBdUIsU0FBQyxDQUFEO3VCQUFPLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBSCxDQUFIO1lBQVAsQ0FBdkIsRUFESjs7SUFKQzs7b0JBT0wsSUFBQSxHQUFNLFNBQUE7UUFFRixJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFPLENBQUMsR0FBMUIsRUFBK0IsU0FBL0IsRUFESjs7SUFGRTs7Ozs7O0FBS1YsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIyNcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5jbGFzcyBQYXJzZSAjIHRoZSBiYXNlIGNsYXNzIG9mIFBhcnNlclxuXG4gICAgQDogKGFyZ3MpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgPSBhcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSA9IGFyZ3M/LnZlcmJvc2VcbiAgICAgICAgQHJhdyAgICAgPSBhcmdzPy5yYXdcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG5cbiAgICBwYXJzZTogKGJsb2NrKSAtPiAjIGNvbnZlcnQgYmxvY2sgdHJlZSB0byBhYnN0cmFjdCBzeW50YXggdHJlZVxuXG4gICAgICAgIEBzdGFjayA9IFtdXG5cbiAgICAgICAgYXN0ID0gW11cblxuICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBhc3QgPSBhc3QuY29uY2F0IEBleHBzICd0bCBibG9jaycgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgaWYgQHJhdyB0aGVuIHByaW50Lm5vb24gJ3JhdyBhc3QnIGFzdFxuXG4gICAgICAgIGFzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDBcblxuICAgICMgY29uc3VtZXMgdG9rZW5zIGFuZCByZXR1cm5zIGxpc3Qgb2YgZXhwcmVzc2lvbnNcblxuICAgIGV4cHM6IChydWxlLCB0b2tlbnMsIHN0b3ApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgdG9rZW5zXG5cbiAgICAgICAgZXMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJ1xuICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgYmxvY2s6XCIgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hpbGUgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBlcyA9IGVzLmNvbmNhdCBAZXhwcyAnZXhwcyBibG9jaycgYmxvY2sudG9rZW5zXG5cbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgXCJleHBzIHNoaWZ0IG5sXCIgXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpIyBXQVJOSU5HISB3ZSBoYXZlICstLS0tLS0tIGFuIGluZGVudGF0aW9uIGNvbnN0YW50IGhlcmUhIHRoYXQgc2hvdWxkIGJlIGRvbmUgZGlmZmVyZW50bHlcbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy5jb2wgPCBibG9jay5jb2wgLSA0IG9yIHRva2Vuc1swXT8uY29sID09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdkZWRlbnQhJyBibG9jay5jb2wsIHRva2Vuc1swXT8uY29sXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJywnXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBzaGlmdCAsXCJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYmxvY2shJ1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gcnVsZSBhbmQgdG9rZW5zWzBdLnRleHQgPT0gc3RvcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwic3RhY2suZW5kICN7QHN0YWNrWy0xXX0gI3t0b2tlbnNbMF0udGV4dH1cIlxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoQHN0YWNrWy0xXSBpbiBbJ2lmJydzd2l0Y2gnXSkgYW5kICh0b2tlbnNbMF0udGV4dCA9PSAnZWxzZScpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgZWxzZSBicmVhaydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1swXS50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGFycmF5IGVuZHMgaW4gY3VycmVudCBibG9jaydcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnbmwnICNvciB0b2tlbnNbMF0udGV4dCA9PSAnOydcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCBzdG9wOicgc3RvcCwgdG9rZW5zWzBdLCBAc3RhY2tcblxuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ2lmJyBhbmQgdG9rZW5zWzFdPy50ZXh0ICE9ICdlbHNlJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBpZmJyZWFrIChzaGlmdCBubCA7IGFuZCBicmVhayknIFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBubCArIGFycmF5IGVuZHMgaW4gY3VycmVudCBibG9jaydcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RvcFxuICAgICAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdjYWxsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY2FsbC5lbmQgKGRvbnQgc2hpZnQgbmwpJ1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gbmwgOycgXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIFxuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY29udGludWUuLi4nIFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnOycgYW5kIEBzdGFja1stMV0gaW4gWydjYWxsJyd7J11cbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBjYWxsIGJyZWFrIG9uIDsnXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnR5cGUgPT0gJ2Jsb2NrJyBcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBicmVhayBvbiBibG9jaydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gKSdcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBleCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBlcy5wdXNoIGV4XG5cbiAgICAgICAgZXNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwXG5cbiAgICAjIGNvbnN1bWVzIHRva2VucyBhbmQgcmV0dXJucyBhIHNpbmdsZSBleHByZXNzaW9uXG5cbiAgICBleHA6ICh0b2tlbnMpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IHRva2Vuc1xuXG4gICAgICAgIHRvayA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgbG9nIFk1IHcxIHRvaz8udGV4dCBpZiBAZGVidWdcblxuICAgICAgICBzd2l0Y2ggdG9rLnR5cGVcbiAgICAgICAgICAgIHdoZW4gJ2Jsb2NrJyAgICAgdGhlbiByZXR1cm4gZXJyb3IgXCJJTlRFUk5BTCBFUlJPUjogdW5leHBlY3RlZCBibG9jayB0b2tlbiBpbiBleHAhXCJcbiAgICAgICAgICAgIHdoZW4gJ25sJyAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIG5sXG4gICAgICAgICAgICB3aGVuICdrZXl3b3JkJ1xuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgICB0aGVuIHJldHVybiBAaWYgICAgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiByZXR1cm4gQGZvciAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gcmV0dXJuIEB3aGlsZSAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgICB0aGVuIHJldHVybiBAc3dpdGNoIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICAgdGhlbiByZXR1cm4gQHdoZW4gICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gcmV0dXJuIEBjbGFzcyAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIHJldHVybiBAcmV0dXJuIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRvay50ZXh0IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICctPicgJz0+JyAgIHRoZW4gcmV0dXJuIEBmdW5jIG51bGwsIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzsnICAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwIDtcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLCcgICAgICAgICB0aGVuIHJldHVybiBAZXhwIHRva2VucyAjIHNraXAgO1xuXG4gICAgICAgIGUgPSB0b2tlbjp0b2tcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIG54dCA9IHRva2Vuc1swXVxuXG4gICAgICAgICAgICBpZiBub3QgZSB0aGVuIHJldHVybiBlcnJvciAnbm8gZT8nIG54dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBPYmplY3QudmFsdWVzKGUpWzBdPy5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IE9iamVjdC52YWx1ZXMoZSlbMF0uY29sK09iamVjdC52YWx1ZXMoZSlbMF0udGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlIGlmIE9iamVjdC52YWx1ZXMoZSlbMF0/LmNsb3NlPy5jb2w/XG4gICAgICAgICAgICAgICAgbGFzdCA9IE9iamVjdC52YWx1ZXMoZSlbMF0uY2xvc2UuY29sK09iamVjdC52YWx1ZXMoZSlbMF0uY2xvc2UudGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGFzdCA9IC0xXG4gICAgICAgICAgICAgICAgQHZlcmIgJ3BhcnNlciBubyBsYXN0PyBlOicgZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQHZlcmIgJ2V4cCBsYXN0IG5leHQnIGxhc3QsIG54dC5jb2xcblxuICAgICAgICAgICAgaWYgbnh0LnR5cGUgPT0gJ29wJyBhbmQgbnh0LnRleHQgbm90IGluIFsnKysnICctLSddXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2Ygb3AnIGVcbiAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdmdW5jJ1xuICAgICAgICAgICAgICAgIGYgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGUgPSBAZnVuYyBlLCBmLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJygnXG4gICAgICAgICAgICAgICAgaWYgbnh0LmNvbCA9PSBsYXN0XG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGNhbGwnXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgb3BlbiBwYXJlbidcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJ1snIGFuZCBueHQuY29sID09IGxhc3QgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnXScgYW5kIGUudG9rZW4/LnRleHQgIT0gJ1snXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgaW5kZXgnIGVcbiAgICAgICAgICAgICAgICBlID0gQGluZGV4IGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnPycgYW5kIGxhc3QgPT0gbnh0LmNvbCBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICcuJ1xuICAgICAgICAgICAgICAgIHFtYXJrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlID0gQHByb3AgZSwgdG9rZW5zLCBxbWFya1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBlID0gQHByb3AgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJzonXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSAhPSAneydcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBmaXJzdCBrZXkgb2YgaW1wbGljaXQgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb2JqZWN0IGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBrZXkgb2YgKGltcGxpY2l0KSBvYmplY3QnIGVcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBrZXl2YWwgZSwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdrZXl3b3JkJyBhbmQgbnh0LnRleHQgPT0gJ2luJyBhbmQgQHN0YWNrWy0xXSAhPSAnZm9yJ1xuICAgICAgICAgICAgICAgIGUgPSBAaW5jb25kIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuXG4gICAgICAgICAgICAgICAgaWYgZS50b2tlbi50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHBhcmVucyBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudG9rZW4udGV4dCA9PSAnWydcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBhcnJheSBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudG9rZW4udGV4dCA9PSAneydcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBjdXJseSBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGUudG9rZW4udGV4dCBpbiBbJysnJy0nJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgaWYgbnh0LnR5cGUgbm90IGluIFsndmFyJydwYXJlbiddIGFuZCBlLnRva2VuLnRleHQgaW4gWycrKycnLS0nXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyBsaHMgaW5jcmVtZW50JyBlLCBueHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBudWxsLCBlLnRva2VuLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgaWYgZS5vcGVyYXRpb24ucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yPy50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdsZWZ0IGFuZCByaWdodCBzaWRlIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgaW4gWycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIGUudG9rZW4udHlwZSBub3QgaW4gWyd2YXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICd3cm9uZyByaHMgaW5jcmVtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAb3BlcmF0aW9uIGUsIHRva2Vucy5zaGlmdCgpIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbnh0LnR5cGUgPT0gJ2RvdHMnIGFuZCBlLnRva2VuLnR5cGUgaW4gWyd2YXInICdudW0nXVxuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbGFzdCA8IG54dC5jb2wgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICBueHQudGV4dCBub3QgaW4gJyldfSw7Oi4nIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluIFsndGhlbicgJ2Vsc2UnICdicmVhaycgJ2NvbnRpbnVlJyAnaW4nICdvZiddIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnR5cGUgbm90IGluIFsnbmwnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChueHQudHlwZSAhPSAnb3AnIG9yIGxhc3QgPCBueHQuY29sKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnR5cGUgbm90IGluIFsnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJyAncmVnZXgnICdwdW5jdCcgJ2NvbW1lbnQnICdvcCddKSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLnRva2VuLnRleHQgbm90IGluIFsnbnVsbCcgJ3VuZGVmaW5lZCcgJ0luZmluaXR5JyAnTmFOJyAndHJ1ZScgJ2ZhbHNlJyAneWVzJyAnbm8nXSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50eXBlICE9ICdrZXl3b3JkJyBvciAoZS50b2tlbi50ZXh0IGluIFsnbmV3JyAncmVxdWlyZSddKSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoKEBzdGFja1stMV0gbm90IGluIFsnaWYnICdmb3InXSkgb3Igbnh0LmxpbmUgPT0gZS50b2tlbi5saW5lKVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBlJyBlLCBAc3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGltcGxpY2l0IGNhbGwhIG54dCcgbnh0XG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY2FsbCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCBueHQudGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBhcnJheSBlbmQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPycgbnh0LCBAc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2UgIyBpZiBlIGlzIG5vdCBhIHRva2VuIGFueW1vcmVcbiAgICAgICAgICAgICAgICBpZiBueHQudGV4dCBpbiBbJysrJyctLSddIGFuZCBsYXN0ID09IG54dC5jb2xcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZG90cycgYW5kIEBzdGFja1stMV0gbm90IGluICcuJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQHNsaWNlIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwibm8gbnh0IG1hdGNoPz8gI3tAc3RhY2t9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPz8gZTonIGVcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ25vIG54dCBtYXRjaD8/IG54dDonIG54dFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAc3RhY2tcbiAgICAgICAgICAgICMgZml4IG51bGwgY2hlY2tzXG4gICAgICAgICAgICB5ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0IFwiZXhwICN7aWYgZW1wdHkoQHN0YWNrKSB0aGVuICdET05FJyBlbHNlICcnfVwiIGUgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIFxuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICBcbiAgICB0aGVuOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBubCA9ICdubCdcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGVycm9yIFwiI3tpZH06IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhXCJcblxuICAgICAgICB0aG4gPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuICAgICAgICBcbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgdGhlbiB0b2tlbnMnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIHRoblxuICAgICAgICBcbiAgICBibG9jazogKGlkLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBubCA9IG51bGxcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cHMgPSBAZXhwcyBpZCwgdG9rZW5zLCBubFxuXG4gICAgICAgIGlmIGJsb2NrIGFuZCBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2RhbmdsaW5nIGJsb2NrIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG4gICAgcHVzaDogKG5vZGUpIC0+XG5cbiAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBub2RlIGlmIEB2ZXJib3NlXG4gICAgICAgIEBzdGFjay5wdXNoIG5vZGVcblxuICAgIHBvcDogKG4pIC0+XG4gICAgICAgIHAgPSBAc3RhY2sucG9wKClcbiAgICAgICAgaWYgcCAhPSBuXG4gICAgICAgICAgICBlcnJvciBcInVuZXhwZWN0ZWQgcG9wIVwiIHAsIG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHByaW50LnN0YWNrIEBzdGFjaywgcCwgKHMpIC0+IFcxIHcxIHNcblxuICAgIHZlcmI6IC0+XG5cbiAgICAgICAgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUubG9nLCBhcmd1bWVudHNcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlXG4iXX0=
//# sourceURL=../coffee/parse.coffee
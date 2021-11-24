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
        var block, es, ex, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
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
                    if (((ref1 = tokens[0]) != null ? ref1.col : void 0) < block.col - 4 || ((ref2 = tokens[0]) != null ? ref2.col : void 0) === 0 || ((ref3 = tokens[0]) != null ? ref3.type : void 0) === 'comment') {
                        this.verb('dedent!', block.col, (ref4 = tokens[0]) != null ? ref4.col : void 0);
                        break;
                    }
                }
                if (((ref5 = tokens[0]) != null ? ref5.text : void 0) === ',') {
                    this.verb("exps shift ,");
                    tokens.shift();
                }
                this.verb('exps block! continue...');
                continue;
            }
            if (this.stack.slice(-1)[0] === rule && tokens[0].text === stop) {
                this.verb("stack.end " + this.stack.slice(-1)[0] + " " + tokens[0].text);
                break;
            }
            if (((ref6 = this.stack.slice(-1)[0]) === 'if' || ref6 === 'switch') && (tokens[0].text === 'else')) {
                this.verb('exps else break');
                break;
            }
            if (this.stack.slice(-1)[0] === '[' && tokens[0].text === ']') {
                this.verb('exps array ends in current block');
                tokens.shift();
                break;
            }
            if (this.stack.slice(-1)[0] === '{' && tokens[0].text === '}') {
                this.verb('exps curly ends in current block');
                tokens.shift();
                break;
            }
            if (tokens[0].type === 'nl') {
                this.verb('exps nl stop:', stop, tokens[0], this.stack);
                if (this.stack.slice(-1)[0] === 'if' && ((ref7 = tokens[1]) != null ? ref7.text : void 0) !== 'else') {
                    this.verb('exps ifbreak (shift nl ; and break)');
                    tokens.shift();
                    break;
                }
                if (this.stack.slice(-1)[0] === '[' && ((ref8 = tokens[1]) != null ? ref8.text : void 0) === ']') {
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
            if (tokens[0].text === ';' && ((ref9 = this.stack.slice(-1)[0]) === 'call' || ref9 === '{')) {
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
        var e, f, last, nxt, qmark, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref4, ref5, ref6, ref7, ref8, ref9, tok;
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
            } else if (nxt.type === 'func' && ((ref6 = (ref7 = e.token) != null ? ref7.type : void 0) !== 'num' && ref6 !== 'single' && ref6 !== 'double' && ref6 !== 'triple') && (ref8 = (ref9 = e.token) != null ? ref9.text : void 0, indexOf.call('}]', ref8) < 0)) {
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
            } else if (nxt.text === '[' && nxt.col === last && ((ref10 = tokens[1]) != null ? ref10.text : void 0) !== ']' && ((ref11 = e.token) != null ? ref11.text : void 0) !== '[') {
                this.verb('exp is lhs of index', e);
                e = this.index(e, tokens);
            } else if (nxt.text === '?' && last === nxt.col && ((ref12 = tokens[1]) != null ? ref12.text : void 0) === '.') {
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
                } else if (((ref13 = e.token.text) === '+' || ref13 === '-' || ref13 === '++' || ref13 === '--') && last === nxt.col) {
                    if (((ref14 = nxt.type) !== 'var' && ref14 !== 'paren') && ((ref15 = e.token.text) === '++' || ref15 === '--')) {
                        tokens.shift();
                        console.error('wrong lhs increment', e, nxt);
                        return;
                    }
                    e = this.operation(null, e.token, tokens);
                    if ((ref16 = (ref17 = e.operation.rhs) != null ? (ref18 = ref17.operation) != null ? (ref19 = ref18.operator) != null ? ref19.text : void 0 : void 0 : void 0) === '++' || ref16 === '--') {
                        console.error('left and right side increment');
                        return;
                    }
                } else if (((ref20 = nxt.text) === '++' || ref20 === '--') && last === nxt.col) {
                    if ((ref21 = e.token.type) !== 'var') {
                        tokens.shift();
                        console.error('wrong rhs increment');
                        return;
                    }
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && ((ref22 = e.token.type) === 'var' || ref22 === 'num')) {
                    e = this.slice(e, tokens);
                } else if (last < nxt.col && (ref23 = nxt.text, indexOf.call(')]},;:.', ref23) < 0) && ((ref24 = nxt.text) !== 'then' && ref24 !== 'else' && ref24 !== 'break' && ref24 !== 'continue' && ref24 !== 'in' && ref24 !== 'of') && ((ref25 = nxt.type) !== 'nl') && (nxt.type !== 'op' || last < nxt.col) && ((ref26 = e.token.type) !== 'num' && ref26 !== 'single' && ref26 !== 'double' && ref26 !== 'triple' && ref26 !== 'regex' && ref26 !== 'punct' && ref26 !== 'comment' && ref26 !== 'op') && ((ref27 = e.token.text) !== 'null' && ref27 !== 'undefined' && ref27 !== 'Infinity' && ref27 !== 'NaN' && ref27 !== 'true' && ref27 !== 'false' && ref27 !== 'yes' && ref27 !== 'no') && (e.token.type !== 'keyword' || ((ref28 = e.token.text) === 'new' || ref28 === 'require')) && (((ref29 = this.stack.slice(-1)[0]) !== 'if' && ref29 !== 'for') || nxt.line === e.token.line)) {
                    this.verb('exp is lhs of implicit call! e', e, this.stack.slice(-1)[0]);
                    this.verb('exp is lhs of implicit call! nxt', nxt);
                    e = this.call(e, tokens);
                } else if (this.stack.slice(-1)[0] === '[' && nxt.text === ']') {
                    this.verb('exp array end');
                    break;
                } else if (this.stack.slice(-1)[0] === '{' && nxt.text === '}') {
                    this.verb('exp curly end');
                    break;
                } else {
                    this.verb('no nxt match?', nxt, this.stack);
                    break;
                }
            } else {
                if (((ref30 = nxt.text) === '++' || ref30 === '--') && last === nxt.col) {
                    e = this.operation(e, tokens.shift());
                } else if (nxt.type === 'dots' && (ref31 = this.stack.slice(-1)[0], indexOf.call('.', ref31) < 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJwYXJzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUJBQUE7SUFBQTs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFRjtJQUVDLGVBQUMsSUFBRDtRQUVDLElBQUMsQ0FBQSxLQUFELGtCQUFXLElBQUksQ0FBRTtRQUNqQixJQUFDLENBQUEsT0FBRCxrQkFBVyxJQUFJLENBQUU7UUFDakIsSUFBQyxDQUFBLEdBQUQsa0JBQVcsSUFBSSxDQUFFO0lBSmxCOztvQkFZSCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxHQUFBLEdBQU07QUFFTixlQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBbkI7WUFDSSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sRUFBaUIsS0FBSyxDQUFDLE1BQXZCLENBQVg7UUFEVjtRQUdBLElBQUcsSUFBQyxDQUFBLEdBQUo7WUFBYSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBcUIsR0FBckIsRUFBYjs7ZUFFQTtJQVhHOztvQkFxQlAsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmO0FBRUYsWUFBQTtRQUFBLElBQVUsS0FBQSxDQUFNLE1BQU4sQ0FBVjtBQUFBLG1CQUFBOztRQUVBLEVBQUEsR0FB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MDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbmNsYXNzIFBhcnNlICMgdGhlIGJhc2UgY2xhc3Mgb2YgUGFyc2VyXG5cbiAgICBAOiAoYXJncykgLT5cblxuICAgICAgICBAZGVidWcgICA9IGFyZ3M/LmRlYnVnXG4gICAgICAgIEB2ZXJib3NlID0gYXJncz8udmVyYm9zZVxuICAgICAgICBAcmF3ICAgICA9IGFyZ3M/LnJhd1xuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHBhcnNlOiAoYmxvY2spIC0+ICMgY29udmVydCBibG9jayB0cmVlIHRvIGFic3RyYWN0IHN5bnRheCB0cmVlXG5cbiAgICAgICAgQHN0YWNrID0gW11cblxuICAgICAgICBhc3QgPSBbXVxuXG4gICAgICAgIHdoaWxlIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIGFzdCA9IGFzdC5jb25jYXQgQGV4cHMgJ3RsIGJsb2NrJyBibG9jay50b2tlbnNcblxuICAgICAgICBpZiBAcmF3IHRoZW4gcHJpbnQubm9vbiAncmF3IGFzdCcgYXN0XG5cbiAgICAgICAgYXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgbGlzdCBvZiBleHByZXNzaW9uc1xuXG4gICAgZXhwczogKHJ1bGUsIHRva2Vucywgc3RvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICBlcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiIFwiZXhwcyBibG9jazpcIiBibG9ja1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBibG9jay50b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGVzID0gZXMuY29uY2F0IEBleHBzICdleHBzIGJsb2NrJyBibG9jay50b2tlbnNcblxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgc2hpZnQgbmxcIiBcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KCkjIFdBUk5JTkchIHdlIGhhdmUgKy0tLS0tLS0gYW4gaW5kZW50YXRpb24gY29uc3RhbnQgaGVyZSEgdGhhdCBzaG91bGQgYmUgZG9uZSBkaWZmZXJlbnRseVxuICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LmNvbCA8IGJsb2NrLmNvbCAtIDQgb3IgdG9rZW5zWzBdPy5jb2wgPT0gMCBvciB0b2tlbnNbMF0/LnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZGVkZW50IScgYmxvY2suY29sLCB0b2tlbnNbMF0/LmNvbFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcsJ1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiBcImV4cHMgc2hpZnQgLFwiXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJsb2NrISBjb250aW51ZS4uLidcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09IHJ1bGUgYW5kIHRva2Vuc1swXS50ZXh0ID09IHN0b3BcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAdmVyYiBcInN0YWNrLmVuZCAje0BzdGFja1stMV19ICN7dG9rZW5zWzBdLnRleHR9XCJcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKEBzdGFja1stMV0gaW4gWydpZicnc3dpdGNoJ10pIGFuZCAodG9rZW5zWzBdLnRleHQgPT0gJ2Vsc2UnKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGVsc2UgYnJlYWsnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBzdGFja1stMV0gPT0gJ1snIGFuZCB0b2tlbnNbMF0udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnZXhwcyBhcnJheSBlbmRzIGluIGN1cnJlbnQgYmxvY2snXG4gICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICd7JyBhbmQgdG9rZW5zWzBdLnRleHQgPT0gJ30nXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY3VybHkgZW5kcyBpbiBjdXJyZW50IGJsb2NrJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdubCcgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgc3RvcDonIHN0b3AsIHRva2Vuc1swXSwgQHN0YWNrXG5cbiAgICAgICAgICAgICAgICBpZiBAc3RhY2tbLTFdID09ICdpZicgYW5kIHRva2Vuc1sxXT8udGV4dCAhPSAnZWxzZSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgaWZicmVhayAoc2hpZnQgbmwgOyBhbmQgYnJlYWspJyBcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnWycgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgbmwgKyBhcnJheSBlbmRzIGluIGN1cnJlbnQgYmxvY2snXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0b3BcbiAgICAgICAgICAgICAgICAgICAgaWYgQHN0YWNrWy0xXSA9PSAnY2FsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGNhbGwuZW5kIChkb250IHNoaWZ0IG5sKSdcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KCkgXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uIG5sIDsnIFxuICAgICAgICAgICAgICAgICAgICBicmVhayBcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGNvbnRpbnVlLi4uJyBcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJzsnIGFuZCBAc3RhY2tbLTFdIGluIFsnY2FsbCcneyddXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgY2FsbCBicmVhayBvbiA7J1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaycgXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2V4cHMgYnJlYWsgb24gYmxvY2snXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHBzIGJyZWFrIG9uICknXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZXggPSBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgZXMucHVzaCBleFxuXG4gICAgICAgIGVzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG4gICAgIyBjb25zdW1lcyB0b2tlbnMgYW5kIHJldHVybnMgYSBzaW5nbGUgZXhwcmVzc2lvblxuXG4gICAgZXhwOiAodG9rZW5zKSAtPlxuXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSB0b2tlbnNcblxuICAgICAgICB0b2sgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGxvZyBZNSB3MSB0b2s/LnRleHQgaWYgQGRlYnVnXG5cbiAgICAgICAgc3dpdGNoIHRvay50eXBlXG4gICAgICAgICAgICB3aGVuICdibG9jaycgICAgIHRoZW4gcmV0dXJuIGVycm9yIFwiSU5URVJOQUwgRVJST1I6IHVuZXhwZWN0ZWQgYmxvY2sgdG9rZW4gaW4gZXhwIVwiXG4gICAgICAgICAgICB3aGVuICdubCcgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCBubFxuICAgICAgICAgICAgd2hlbiAna2V5d29yZCdcbiAgICAgICAgICAgICAgICBzd2l0Y2ggdG9rLnRleHQgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiByZXR1cm4gQGlmICAgICB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gcmV0dXJuIEBmb3IgICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIHJldHVybiBAd2hpbGUgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiByZXR1cm4gQHN3aXRjaCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gcmV0dXJuIEB3aGVuICAgdG9rLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgICB0aGVuIHJldHVybiBAY2xhc3MgIHRvaywgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiByZXR1cm4gQHJldHVybiB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCB0b2sudGV4dCBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLT4nICc9PicgICB0aGVuIHJldHVybiBAZnVuYyBudWxsLCB0b2ssIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB3aGVuICc7JyAgICAgICAgIHRoZW4gcmV0dXJuIEBleHAgdG9rZW5zICMgc2tpcCA7XG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJywnICAgICAgICAgdGhlbiByZXR1cm4gQGV4cCB0b2tlbnMgIyBza2lwICxcblxuICAgICAgICBlID0gdG9rZW46dG9rXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBueHQgPSB0b2tlbnNbMF1cblxuICAgICAgICAgICAgaWYgbm90IGUgdGhlbiByZXR1cm4gZXJyb3IgJ25vIGU/JyBueHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgT2JqZWN0LnZhbHVlcyhlKVswXT8uY29sP1xuICAgICAgICAgICAgICAgIGxhc3QgPSBPYmplY3QudmFsdWVzKGUpWzBdLmNvbCtPYmplY3QudmFsdWVzKGUpWzBdLnRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgZWxzZSBpZiBPYmplY3QudmFsdWVzKGUpWzBdPy5jbG9zZT8uY29sP1xuICAgICAgICAgICAgICAgIGxhc3QgPSBPYmplY3QudmFsdWVzKGUpWzBdLmNsb3NlLmNvbCtPYmplY3QudmFsdWVzKGUpWzBdLmNsb3NlLnRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxhc3QgPSAtMVxuICAgICAgICAgICAgICAgIEB2ZXJiICdwYXJzZXIgbm8gbGFzdD8gZTonIGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEB2ZXJiICdleHAgbGFzdCBuZXh0JyBsYXN0LCBueHQuY29sXG5cbiAgICAgICAgICAgIGlmIG54dC50eXBlID09ICdvcCcgYW5kIG54dC50ZXh0IG5vdCBpbiBbJysrJyAnLS0nXVxuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIG9wJyBlXG4gICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gZSwgdG9rZW5zLnNoaWZ0KCksIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAnZnVuYycgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgIGUudG9rZW4/LnR5cGUgbm90IGluIFsnbnVtJydzaW5nbGUnJ2RvdWJsZScndHJpcGxlJ10gYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgIGUudG9rZW4/LnRleHQgbm90IGluICd9XSdcbiAgICAgICAgICAgICAgICBmID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBlID0gQGZ1bmMgZSwgZiwgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgICAgIGlmIG54dC5jb2wgPT0gbGFzdFxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBjYWxsJ1xuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIG9wZW4gcGFyZW4nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAcGFyZW5zIHRvaywgdG9rZW5zXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICdbJyBhbmQgbnh0LmNvbCA9PSBsYXN0IGFuZCB0b2tlbnNbMV0/LnRleHQgIT0gJ10nIGFuZCBlLnRva2VuPy50ZXh0ICE9ICdbJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgbGhzIG9mIGluZGV4JyBlXG4gICAgICAgICAgICAgICAgZSA9IEBpbmRleCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJz8nIGFuZCBsYXN0ID09IG54dC5jb2wgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnLidcbiAgICAgICAgICAgICAgICBxbWFyayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2VucywgcW1hcmtcbiAgICAgICAgICAgIGVsc2UgaWYgbnh0LnRleHQgPT0gJy4nXG4gICAgICAgICAgICAgICAgZSA9IEBwcm9wIGUsIHRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0ID09ICc6J1xuICAgICAgICAgICAgICAgIGlmIEBzdGFja1stMV0gIT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMgZmlyc3Qga2V5IG9mIGltcGxpY2l0IG9iamVjdCcgZVxuICAgICAgICAgICAgICAgICAgICBlID0gQG9iamVjdCBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgaXMga2V5IG9mIChpbXBsaWNpdCkgb2JqZWN0JyBlXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAa2V5dmFsIGUsIHRva2Vuc1xuICAgICAgICAgICAgZWxzZSBpZiBueHQudHlwZSA9PSAna2V5d29yZCcgYW5kIG54dC50ZXh0ID09ICdpbicgYW5kIEBzdGFja1stMV0gIT0gJ2ZvcidcbiAgICAgICAgICAgICAgICBlID0gQGluY29uZCBlLCB0b2tlbnNcbiAgICAgICAgICAgIGVsc2UgaWYgZS50b2tlblxuICAgICAgICAgICAgICAgIGlmIGUudG9rZW4udGV4dCA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgZSA9IEBwYXJlbnMgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ1snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAYXJyYXkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgPT0gJ3snXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAY3VybHkgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlLnRva2VuLnRleHQgaW4gWycrJyctJycrKycnLS0nXSBhbmQgbGFzdCA9PSBueHQuY29sXG4gICAgICAgICAgICAgICAgICAgIGlmIG54dC50eXBlIG5vdCBpbiBbJ3ZhcicncGFyZW4nXSBhbmQgZS50b2tlbi50ZXh0IGluIFsnKysnJy0tJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgbGhzIGluY3JlbWVudCcgZSwgbnh0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBvcGVyYXRpb24gbnVsbCwgZS50b2tlbiwgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGlmIGUub3BlcmF0aW9uLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvcj8udGV4dCBpbiBbJysrJyctLSddXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbGVmdCBhbmQgcmlnaHQgc2lkZSBpbmNyZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBpZiBlLnRva2VuLnR5cGUgbm90IGluIFsndmFyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnd3JvbmcgcmhzIGluY3JlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgZS50b2tlbi50eXBlIGluIFsndmFyJyAnbnVtJ11cbiAgICAgICAgICAgICAgICAgICAgZSA9IEBzbGljZSBlLCB0b2tlbnNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxhc3QgPCBueHQuY29sIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnRleHQgbm90IGluICcpXX0sOzouJyBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50ZXh0IG5vdCBpbiBbJ3RoZW4nICdlbHNlJyAnYnJlYWsnICdjb250aW51ZScgJ2luJyAnb2YnXSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgIG54dC50eXBlIG5vdCBpbiBbJ25sJ10gYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAobnh0LnR5cGUgIT0gJ29wJyBvciBsYXN0IDwgbnh0LmNvbCkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50eXBlIG5vdCBpbiBbJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZScgJ3JlZ2V4JyAncHVuY3QnICdjb21tZW50JyAnb3AnXSkgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAoZS50b2tlbi50ZXh0IG5vdCBpbiBbJ251bGwnICd1bmRlZmluZWQnICdJbmZpbml0eScgJ05hTicgJ3RydWUnICdmYWxzZScgJ3llcycgJ25vJ10pIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKGUudG9rZW4udHlwZSAhPSAna2V5d29yZCcgb3IgKGUudG9rZW4udGV4dCBpbiBbJ25ldycgJ3JlcXVpcmUnXSkpIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgKChAc3RhY2tbLTFdIG5vdCBpbiBbJ2lmJyAnZm9yJ10pIG9yIG54dC5saW5lID09IGUudG9rZW4ubGluZSlcbiAgICAgICAgICAgICAgICAgICAgQHZlcmIgJ2V4cCBpcyBsaHMgb2YgaW1wbGljaXQgY2FsbCEgZScgZSwgQHN0YWNrWy0xXVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGlzIGxocyBvZiBpbXBsaWNpdCBjYWxsISBueHQnIG54dFxuICAgICAgICAgICAgICAgICAgICBlID0gQGNhbGwgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBAc3RhY2tbLTFdID09ICdbJyBhbmQgbnh0LnRleHQgPT0gJ10nXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdleHAgYXJyYXkgZW5kJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHN0YWNrWy0xXSA9PSAneycgYW5kIG54dC50ZXh0ID09ICd9J1xuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnZXhwIGN1cmx5IGVuZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdubyBueHQgbWF0Y2g/JyBueHQsIEBzdGFja1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZSAjIGlmIGUgaXMgbm90IGEgdG9rZW4gYW55bW9yZVxuICAgICAgICAgICAgICAgIGlmIG54dC50ZXh0IGluIFsnKysnJy0tJ10gYW5kIGxhc3QgPT0gbnh0LmNvbFxuICAgICAgICAgICAgICAgICAgICBlID0gQG9wZXJhdGlvbiBlLCB0b2tlbnMuc2hpZnQoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG54dC50eXBlID09ICdkb3RzJyBhbmQgQHN0YWNrWy0xXSBub3QgaW4gJy4nXG4gICAgICAgICAgICAgICAgICAgIGUgPSBAc2xpY2UgZSwgdG9rZW5zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgXCJubyBueHQgbWF0Y2g/PyAje0BzdGFja31cIiBlIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgIEB2ZXJiICdubyBueHQgbWF0Y2g/PyBlOicgZVxuICAgICAgICAgICAgICAgICAgICBAdmVyYiAnbm8gbnh0IG1hdGNoPz8gbnh0Oicgbnh0XG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEBzdGFja1xuICAgICAgICAgICAgIyBmaXggbnVsbCBjaGVja3NcbiAgICAgICAgICAgIHllc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBwcmludC5hc3QgXCJleHAgI3tpZiBlbXB0eShAc3RhY2spIHRoZW4gJ0RPTkUnIGVsc2UgJyd9XCIgZSBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgIFxuICAgIHRoZW46IChpZCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgZXJyb3IgXCIje2lkfTogdGhlbiBvciBibG9jayBleHBlY3RlZCFcIlxuXG4gICAgICAgIHRobiA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG4gICAgICAgIFxuICAgICAgICBpZiBibG9jayBhbmQgYmxvY2sudG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyB0aGVuIHRva2VucycgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgdGhuXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGJsb2NrOiAoaWQsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgIG5sID0gbnVsbFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbmwgPSAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwcyA9IEBleHBzIGlkLCB0b2tlbnMsIG5sXG5cbiAgICAgICAgaWYgYmxvY2sgYW5kIGJsb2NrLnRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZGFuZ2xpbmcgYmxvY2sgdG9rZW5zJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBleHBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQHZlcmJvc2VcbiAgICAgICAgQHN0YWNrLnB1c2ggbm9kZVxuXG4gICAgcG9wOiAobikgLT5cbiAgICAgICAgcCA9IEBzdGFjay5wb3AoKVxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT5cblxuICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50c1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VcbiJdfQ==
//# sourceURL=../coffee/parse.coffee
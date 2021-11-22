// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000  00000000
000   000  000   000  000   000  000       000       000   000
00000000   000000000  0000000    0000000   0000000   0000000
000        000   000  000   000       000  000       000   000
000        000   000  000   000  0000000   00000000  000   000
 */
var Parse, Parser, empty, print,
    extend = function(child, parent) { for (var key in parent) { if (hasProp(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = Object.hasOwn;

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

Parse = require('./parse');

Parser = (function(superClass) {
    extend(Parser, superClass);

    function Parser() {
        return Parser.__super__.constructor.apply(this, arguments);
    }


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

})(Parse);

module.exports = Parser;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQkFBQTtJQUFBOzs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRUY7Ozs7Ozs7O0FBRUY7Ozs7Ozs7O3NCQVFBLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtRQUVBLElBQTRCLElBQUMsQ0FBQSxLQUE3QjtZQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFrQixNQUFsQixFQUFBOztRQUVBLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7UUFFTixJQUE4QixJQUFDLENBQUEsS0FBL0I7WUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWIsRUFBb0IsTUFBcEIsRUFBQTs7UUFFQSxvQ0FBWSxDQUFFLGNBQVgsS0FBbUIsTUFBdEI7WUFDSSxNQUFNLENBQUMsS0FBUCxDQUFBLEVBREo7U0FBQSxNQUVLLHNDQUFZLENBQUUsY0FBWCxLQUFtQixPQUF0QjtZQUNELE1BQUEsR0FBUyxNQUFNLENBQUMsS0FBUCxDQUFBLENBQWMsQ0FBQyxPQUR2QjtTQUFBLE1BQUE7WUFHRixPQUFBLENBQUMsS0FBRCxDQUFPLG9DQUFQLEVBSEU7O1FBS0wsR0FBQSxHQUFN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cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cblBhcnNlID0gcmVxdWlyZSAnLi9wYXJzZSdcblxuY2xhc3MgUGFyc2VyIGV4dGVuZHMgUGFyc2VcblxuICAgICMjI1xuICAgIDAwMCAgMDAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwMDAwXG4gICAgMDAwICAwMDBcbiAgICAwMDAgIDAwMFxuICAgICMjI1xuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpZicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBlcnJvciAncGFyc2VyLmlmOiB0aGVuIG9yIGJsb2NrIGV4cGVjdGVkISdcblxuICAgICAgICB0aG4gPSBAZXhwcyAnaWYgdGhlbicgdG9rZW5zXG5cbiAgICAgICAgZSA9IGlmOlxuICAgICAgICAgICAgICAgIGV4cDogICAgZXhwXG4gICAgICAgICAgICAgICAgdGhlbjogICB0aG5cblxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2lmJ1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Vsc2UgaWYnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMgPz0gW11cblxuICAgICAgICAgICAgZXhwID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlIGlmIHRoZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd0aGVuJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgIGVycm9yICdwYXJzZXIuaWY6IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhJ1xuXG4gICAgICAgICAgICB0aG4gPSBAZXhwcyAnZWxpZiB0aGVuJyB0b2tlbnNcblxuICAgICAgICAgICAgZS5pZi5lbGlmcy5wdXNoXG4gICAgICAgICAgICAgICAgZWxpZjpcbiAgICAgICAgICAgICAgICAgICAgZXhwOiAgZXhwXG4gICAgICAgICAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgICAgIEBwb3AgJ2lmJyAjIHNob3VsZG4ndCB0aGlzIGJlIHBvcHBlZCBhZnRlciB0aGUgZWxzZSBibG9jaz9cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsc2UgPSBAZXhwcyAnZWxzZScgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpZiBsZWZ0b3ZlcicgdG9rZW5zIGlmIHRva2Vucy5sZW5ndGggYW5kIEBkZWJ1Z1xuXG4gICAgICAgIGVcblxuICAgICMjI1xuICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIyNcbiAgICBcbiAgICBmb3I6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdmb3InXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdmb3InIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB2YWxzID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lub2YnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdsaXN0JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBsaXN0ID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGVycm9yICdwYXJzZXIuZm9yOiB0aGVuIG9yIGJsb2NrIGV4cGVjdGVkISdcblxuICAgICAgICBAcG9wICdmb3InICMgc2hvdWxkbid0IHRoaXMgYmUgcG9wcGVkIGFmdGVyIHRoZSB0aGVuIGJsb2NrP1xuICAgICAgICBcbiAgICAgICAgdGhuID0gQGV4cHMgJ2ZvciB0aGVuJyB0b2tlbnMsICdubCdcblxuICAgICAgICBmb3I6XG4gICAgICAgICAgICB2YWxzOiAgIHZhbHNcbiAgICAgICAgICAgIGlub2Y6ICAgaW5vZlxuICAgICAgICAgICAgbGlzdDogICBsaXN0XG4gICAgICAgICAgICB0aGVuOiAgIHRoblxuICAgICAgICAgICAgXG4gICAgIyMjXG4gICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIyNcbiAgICBcbiAgICB3aGlsZTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICd3aGlsZSB0aGVufGJsb2NrJyB0b2tlbnMgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAndGhlbidcbiAgICAgICAgICAgIG5sID0gJ25sJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgbmwgPSBudWxsXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIGVycm9yICdwYXJzZXIud2hpbGU6IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhJ1xuICAgICAgICBcblxuICAgICAgICBwcmludC50b2tlbnMgJ3doaWxlIHRoZW5zJyB0b2tlbnMgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEBleHBzICd3aGlsZSB0aGVuJyB0b2tlbnMsIG5sXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlOlxuICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgdGhlbjogdGhuXG4gICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIyNcblxuICAgIHN3aXRjaDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBtYXRjaCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgICAgIHJldHVybiBlcnJvciAncGFyc2VyLnN3aXRjaDogYmxvY2sgZXhwZWN0ZWQhJ1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHdoZW5zID0gW11cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICd3aGVuJ1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgd2hlbnMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGUgPSBzd2l0Y2g6XG4gICAgICAgICAgICAgICAgbWF0Y2g6ICBtYXRjaFxuICAgICAgICAgICAgICAgIHdoZW5zOiAgd2hlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIGVsc2U/JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWxzJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICd3aGVuLnZhbHMgdG9rZW5zWzBdJyB0b2tlbnNbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3doZW4gdmFsJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBAdmVyYiAnd2hlbi50aGVuIHRva2Vuc1swXScgdG9rZW5zWzBdXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ3RoZW4nXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBvcCAnd2hlbidcbiAgICAgICAgICAgIHJldHVybiBlcnJvciAncGFyc2VyLndoZW46IHRoZW4gb3IgYmxvY2sgZXhwZWN0ZWQhJ1xuXG4gICAgICAgIHRobiA9IEBleHBzICd3aGVuIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHdoZW46XG4gICAgICAgICAgICB2YWxzOiB2YWxzXG4gICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyMjXG5cbiAgICBjbGFzczogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdjbGFzcydcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NsYXNzJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgbmFtZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgZSA9IGNsYXNzOlxuICAgICAgICAgICAgbmFtZTpuYW1lXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBleHRlbmRzJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdleHRlbmRzJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGUuY2xhc3MuZXh0ZW5kcyA9IEBleHBzICdjbGFzcyBleHRlbmRzJyB0b2tlbnMsICdubCdcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NsYXNzIGJvZHknIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBwcmludC5ub29uICdiZWZvcmUgY2xhc3MgYm9keScgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICAgICAgZS5jbGFzcy5ib2R5ID0gQGV4cHMgJ2NsYXNzIGJvZHknIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdmVyYiAnbm8gY2xhc3MgYm9keSEnXG5cbiAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgICBwcmludC5hc3QgJ2UuY2xhc3MuYm9keScgZS5jbGFzcy5ib2R5XG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2NsYXNzIHBvcCcgdG9rZW5zIFxuXG4gICAgICAgIEBwb3AgJ2NsYXNzJ1xuXG4gICAgICAgIGVcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKGFyZ3MsIGFycm93LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgYm9keSA9IEBleHBzICdmdW5jIGJvZHknIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIGZ1bmM6XG4gICAgICAgICAgICBhcmdzOiAgYXJnc1xuICAgICAgICAgICAgYXJyb3c6IGFycm93XG4gICAgICAgICAgICBib2R5OiAgYm9keVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybjpcbiAgICAgICAgICAgIHJldDogdG9rXG4gICAgICAgICAgICB2YWw6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdjYWxsJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2FsbC5vcGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKCdcbiAgICAgICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFyZ3MgPSBAZXhwcyAnY2FsbCcgdG9rZW5zLCAnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXJncyA9IEBleHBzICdjYWxsJyB0b2tlbnMsICdubCdcblxuICAgICAgICBpZiBvcGVuIGFuZCB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgbm90IGNsb3NlXG4gICAgICAgICAgICBlcnJvciAnZXhwZWN0ZWQgKSdcblxuICAgICAgICB0b2sgPSB0b2sudG9rZW4gaWYgdG9rLnRva2VuXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjYWxsLmNsb3NlJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGNhbGw6XG4gICAgICAgICAgICBjYWxsZWU6IHRva1xuICAgICAgICAgICAgb3BlbjogICBvcGVuXG4gICAgICAgICAgICBhcmdzOiAgIGFyZ3NcbiAgICAgICAgICAgIGNsb3NlOiAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKGxocywgb3AsIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnM/WzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBcbiAgICAgICAgcmhzID0gQGV4cCB0b2tlbnMgaWYgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbGhzPy50b2tlbiB0aGVuIGxocyA9IGxocy50b2tlblxuICAgICAgICBpZiByaHM/LnRva2VuIHRoZW4gcmhzID0gcmhzLnRva2VuXG5cbiAgICAgICAgb3BlcmF0aW9uOlxuICAgICAgICAgICAgbGhzOiAgICAgICAgbGhzXG4gICAgICAgICAgICBvcGVyYXRvcjogICBvcFxuICAgICAgICAgICAgcmhzOiAgICAgICAgcmhzXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNsaWNlOiAoZnJvbSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGRvdHMgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIHVwdG8gPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIGlmIG5vdCB1cHRvIHRoZW4gcmV0dXJuIGVycm9yIFwibm8gc2xpY2UgZW5kIVwiXG4gICAgICAgIFxuICAgICAgICBpZiBmcm9tLnRva2VuIHRoZW4gZnJvbSA9IGZyb20udG9rZW5cbiAgICAgICAgaWYgdXB0by50b2tlbiB0aGVuIHVwdG8gPSB1cHRvLnRva2VuXG5cbiAgICAgICAgc2xpY2U6XG4gICAgICAgICAgICBmcm9tOiBmcm9tXG4gICAgICAgICAgICBkb3RzOiBkb3RzXG4gICAgICAgICAgICB1cHRvOiB1cHRvXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5OlxuICAgICAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICAgICAgZXhwczogIFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ1snXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICdbJyB0b2tlbnMsICddJyBcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICduZXh0IHRva2VuIG5vdCBhIF0nXG5cbiAgICAgICAgQHBvcCAnWydcblxuICAgICAgICBhcnJheTpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBleHBzOiAgZXhwc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWR4J1xuXG4gICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIHNsaWNlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ2luZGV4LmNsb3NlJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciAnZXhwZWN0ZWQgXSdcblxuICAgICAgICBAcG9wICdpZHgnXG5cbiAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICBpZHhlZTogdG9rXG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgc2xpZHg6IHNsaWNlXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnKCdcblxuICAgICAgICBleHBzID0gQGV4cHMgJygnIHRva2VucywgJyknXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciAnbmV4dCB0b2tlbiBub3QgYSApJ1xuXG4gICAgICAgIEBwb3AgJygnXG5cbiAgICAgICAgcGFyZW5zOlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGV4cHM6ICBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgICAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBjdXJseTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0OlxuICAgICAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgICAgICBrZXl2YWxzOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICd7JyB0b2tlbnMsICd9J1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ25leHQgdG9rZW4gbm90IGEgfSdcblxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiAgIGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgb2JqZWN0OiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAga2V5Q29sID0ga2V5LnRva2VuLmNvbFxuICAgICAgICBcbiAgICAgICAgZXhwcyA9IFtAa2V5dmFsIGtleSwgdG9rZW5zXVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPyBhbmQgKHRva2Vuc1swXS5jb2wgPT0ga2V5Q29sIG9yIHRva2Vuc1swXS50eXBlICE9ICdubCcpXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLmxpbmUgPT0ga2V5LnRva2VuLmxpbmUgdGhlbiBzdG9wPSdubCcgZWxzZSBzdG9wPW51bGxcbiAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsIHN0b3BcblxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJzonXG5cbiAgICAgICAgdmFsdWUgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJzonXG5cbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtleVxuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90ID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgQHB1c2ggJy4nXG5cbiAgICAgICAgcHJvcCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnLidcblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICBkb3RcbiAgICAgICAgICAgIHByb3A6IHByb3BcblxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBwdXNoOiAobm9kZSkgLT5cblxuICAgICAgICBwcmludC5zdGFjayBAc3RhY2ssIG5vZGUgaWYgQHZlcmJvc2VcbiAgICAgICAgQHN0YWNrLnB1c2ggbm9kZVxuXG4gICAgcG9wOiAobikgLT5cbiAgICAgICAgcCA9IEBzdGFjay5wb3AoKVxuICAgICAgICBpZiBwICE9IG5cbiAgICAgICAgICAgIGVycm9yIFwidW5leHBlY3RlZCBwb3AhXCIgcCwgblxuICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgcHJpbnQuc3RhY2sgQHN0YWNrLCBwLCAocykgLT4gVzEgdzEgc1xuXG4gICAgdmVyYjogLT5cblxuICAgICAgICBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgY29uc29sZS5sb2cuYXBwbHkgY29uc29sZS5sb2csIGFyZ3VtZW50c1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIl19
//# sourceURL=../coffee/parser.coffee
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
        var base, e, exp, ref, ref1, ref2, thn;
        this.push('if');
        if (this.debug) {
            print.tokens('if', tokens);
        }
        exp = this.exp(tokens);
        if (this.debug) {
            print.tokens('then', tokens);
        }
        thn = this.then('if then', tokens);
        e = {
            "if": {
                exp: exp,
                then: thn
            }
        };
        while (((ref = tokens[0]) != null ? ref.text : void 0) === 'else' && ((ref1 = tokens[1]) != null ? ref1.text : void 0) === 'if') {
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
            thn = this.then('elif then', tokens);
            e["if"].elifs.push({
                elif: {
                    exp: exp,
                    then: thn
                }
            });
        }
        if (((ref2 = tokens[0]) != null ? ref2.text : void 0) === 'else') {
            if (this.debug) {
                print.tokens('else', tokens);
            }
            tokens.shift();
            e["if"]["else"] = this.exps('else', tokens, 'nl');
        }
        this.pop('if');
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
        var inof, list, thn, vals;
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
        thn = this.then('for then', tokens);
        this.pop('for');
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
        var cond, thn;
        this.push('while');
        cond = this.exp(tokens);
        if (this.verbose) {
            print.tokens('while then|block', tokens);
        }
        thn = this.then('while then', tokens);
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
        var ref, thn, vals;
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
        thn = this.then('when then', tokens);
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

    Parser.prototype.call = function(tok, tokens, qmrk) {
        var args, close, e, open, ref, ref1;
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
        e = {
            call: {
                callee: tok
            }
        };
        e.call.open = open;
        if (qmrk) {
            e.call.qmrk = qmrk;
        }
        e.call.args = args;
        e.call.close = close;
        return e;
    };

    Parser.prototype.operation = function(lhs, op, tokens) {
        var block, ref, rhs;
        if ((tokens != null ? (ref = tokens[0]) != null ? ref.type : void 0 : void 0) === 'block') {
            block = tokens.shift();
            tokens = block.tokens;
        }
        if (tokens) {
            rhs = this.exp(tokens);
        }
        if (block && !empty(block.tokens)) {
            print.tokens('dangling operation block tokens!', block.tokens);
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

    Parser.prototype.incond = function(lhs, tokens) {
        var intok;
        intok = tokens.shift();
        return {
            incond: {
                lhs: lhs,
                "in": intok,
                rhs: this.exp(tokens)
            }
        };
    };

    Parser.prototype.array = function(open, tokens) {
        var close, exps, ref, ref1;
        if (((ref = tokens[0]) != null ? ref.text : void 0) === ']') {
            return {
                array: {
                    open: open,
                    items: [],
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
                items: exps,
                close: close
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

    Parser.prototype.prop = function(obj, tokens, qmrk) {
        var dot, e, prop;
        dot = tokens.shift();
        this.push('.');
        prop = this.exp(tokens);
        this.pop('.');
        e = {
            prop: {
                obj: obj
            }
        };
        if (qmrk) {
            e.prop.qmrk = qmrk;
        }
        e.prop.dot = dot;
        e.prop.prop = prop;
        return e;
    };

    return Parser;

})(Parse);

module.exports = Parser;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQkFBQTtJQUFBOzs7QUFRQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBQ1IsS0FBQSxHQUFRLFNBQUMsQ0FBRDtXQUFPLENBQUEsQ0FBQSxLQUFNLEVBQU4sSUFBQSxDQUFBLEtBQVMsSUFBVCxJQUFBLENBQUEsS0FBYyxRQUFkLENBQUEsSUFBNEIsQ0FBQyxPQUFPLENBQVAsS0FBYSxRQUFiLElBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBWixDQUFjLENBQUMsTUFBZixLQUF5QixDQUFwRDtBQUFuQzs7QUFFUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRUY7Ozs7Ozs7O0FBRUY7Ozs7Ozs7O3NCQVFBLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtRQUVBLElBQTRCLElBQUMsQ0FBQSxLQUE3QjtZQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFrQixNQUFsQixFQUFBOztRQUVBLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7UUFFTixJQUE4QixJQUFDLENBQUEsS0FBL0I7WUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWIsRUFBb0IsTUFBcEIsRUFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBQWdCLE1BQWhCO1FBRU4sQ0FBQSxHQUFJO1lBQUEsQ0FBQSxFQUFBLENBQUEsRUFDSTtnQkFBQSxHQUFBLEVBQVEsR0FBUjtnQkFDQSxJQUFBLEVBQVEsR0FEUjthQURKOztBQUlKLCtDQUFlLENBQUUsY0FBWCxLQUFtQixNQUFuQixzQ0FBdUMsQ0FBRSxjQUFYLEtBQW1CLElBQXZEO1lBRUksSUFBaUMs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SUFBRCxDQUFNLEdBQU47UUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMO1FBRVIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMO2VBRUE7WUFBQSxNQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFPLEdBQVA7Z0JBQ0EsS0FBQSxFQUFPLEtBRFA7Z0JBRUEsR0FBQSxFQUFPLEtBRlA7YUFESjs7SUFWSTs7cUJBcUJSLElBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWMsSUFBZDtBQUVGLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLEtBQVAsQ0FBQTtRQUVOLElBQUMsQ0FBQSxJQUFELENBQU0sR0FBTjtRQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7UUFFUCxJQUFDLENBQUEsR0FBRCxDQUFLLEdBQUw7UUFFQSxDQUFBLEdBQUk7WUFBQSxJQUFBLEVBQU07Z0JBQUEsR0FBQSxFQUFLLEdBQUw7YUFBTjs7UUFDSixJQUFzQixJQUF0QjtZQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBUCxHQUFjLEtBQWQ7O1FBQ0EsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFQLEdBQWM7UUFDZCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQVAsR0FBYztlQUNkO0lBZEU7Ozs7R0FyaEJXOztBQXFpQnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cblBhcnNlID0gcmVxdWlyZSAnLi9wYXJzZSdcblxuY2xhc3MgUGFyc2VyIGV4dGVuZHMgUGFyc2VcblxuICAgICMjI1xuICAgIDAwMCAgMDAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwMDAwXG4gICAgMDAwICAwMDBcbiAgICAwMDAgIDAwMFxuICAgICMjI1xuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpZicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2lmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICBleHA6ICAgIGV4cFxuICAgICAgICAgICAgICAgIHRoZW46ICAgdGhuXG5cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpZidcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlIGlmJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsaWZzID89IFtdXG5cbiAgICAgICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZSBpZiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRobiA9IEB0aGVuICdlbGlmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBleHA6ICBleHBcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Vsc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaWYgbGVmdG92ZXInIHRva2VucyBpZiB0b2tlbnMubGVuZ3RoIGFuZCBAZGVidWdcblxuICAgICAgICBlXG5cbiAgICAjIyNcbiAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyMjXG4gICAgXG4gICAgZm9yOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnZm9yJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdmFscyA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpbm9mJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpbm9mID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnbGlzdCcgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2ZvciB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG5cbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICAgbGlzdFxuICAgICAgICAgICAgdGhlbjogICB0aG5cbiAgICAgICAgICAgIFxuICAgICMjI1xuICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyMjXG4gICAgXG4gICAgd2hpbGU6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHByaW50LnRva2VucyAnd2hpbGUgdGhlbnxibG9jaycgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hpbGUgdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlOlxuICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgdGhlbjogdGhuXG4gICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIyNcblxuICAgIHN3aXRjaDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBtYXRjaCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgICAgIHJldHVybiBlcnJvciAncGFyc2VyLnN3aXRjaDogYmxvY2sgZXhwZWN0ZWQhJ1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHdoZW5zID0gW11cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICd3aGVuJ1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgd2hlbnMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGUgPSBzd2l0Y2g6XG4gICAgICAgICAgICAgICAgbWF0Y2g6ICBtYXRjaFxuICAgICAgICAgICAgICAgIHdoZW5zOiAgd2hlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIGVsc2U/JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWxzJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICd3aGVuLnZhbHMgdG9rZW5zWzBdJyB0b2tlbnNbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3doZW4gdmFsJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBAdmVyYiAnd2hlbi50aGVuIHRva2Vuc1swXScgdG9rZW5zWzBdXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hlbiB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB3aGVuOlxuICAgICAgICAgICAgdmFsczogdmFsc1xuICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMjI1xuXG4gICAgY2xhc3M6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnY2xhc3MnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBib2R5JyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQubm9vbiAnYmVmb3JlIGNsYXNzIGJvZHknIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgICAgIGUuY2xhc3MuYm9keSA9IEBleHBzICdjbGFzcyBib2R5JyB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZlcmIgJ25vIGNsYXNzIGJvZHkhJ1xuXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuYXN0ICdlLmNsYXNzLmJvZHknIGUuY2xhc3MuYm9keVxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBwb3AnIHRva2VucyBcblxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIGJvZHkgPSBAZXhwcyAnZnVuYyBib2R5JyB0b2tlbnMsICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBmdW5jOlxuICAgICAgICAgICAgYXJnczogIGFyZ3NcbiAgICAgICAgICAgIGFycm93OiBhcnJvd1xuICAgICAgICAgICAgYm9keTogIGJvZHlcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmV0dXJuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm46XG4gICAgICAgICAgICByZXQ6IHRva1xuICAgICAgICAgICAgdmFsOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGNhbGw6ICh0b2ssIHRva2VucywgcW1yaykgLT5cblxuICAgICAgICBAcHVzaCAnY2FsbCdcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwub3BlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJygnXG4gICAgICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBhcmdzID0gW11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJ2NhbGwnIHRva2VucywgJyknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFyZ3MgPSBAZXhwcyAnY2FsbCcgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIG9wZW4gYW5kIG5vdCBjbG9zZVxuICAgICAgICAgICAgZXJyb3IgJ2V4cGVjdGVkICknXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuXG4gICAgICAgIHByaW50LnRva2VucyAnY2FsbC5jbG9zZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIEBwb3AgJ2NhbGwnXG4gICAgICAgIFxuICAgICAgICBlID0gY2FsbDogY2FsbGVlOiB0b2tcbiAgICAgICAgZS5jYWxsLm9wZW4gID0gb3BlblxuICAgICAgICBlLmNhbGwucW1yayAgPSBxbXJrIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zP1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHJocyA9IEBleHAgdG9rZW5zIGlmIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdkYW5nbGluZyBvcGVyYXRpb24gYmxvY2sgdG9rZW5zIScgYmxvY2sudG9rZW5zIGlmIGJsb2NrIGFuZCBub3QgZW1wdHkgYmxvY2sudG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbGhzPy50b2tlbiB0aGVuIGxocyA9IGxocy50b2tlblxuICAgICAgICBpZiByaHM/LnRva2VuIHRoZW4gcmhzID0gcmhzLnRva2VuXG5cbiAgICAgICAgb3BlcmF0aW9uOlxuICAgICAgICAgICAgbGhzOiAgICAgICAgbGhzXG4gICAgICAgICAgICBvcGVyYXRvcjogICBvcFxuICAgICAgICAgICAgcmhzOiAgICAgICAgcmhzXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKGxocywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaW50b2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnWydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ1snIHRva2VucywgJ10nIFxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ25leHQgdG9rZW4gbm90IGEgXSdcblxuICAgICAgICBAcG9wICdbJ1xuXG4gICAgICAgIGFycmF5OlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGl0ZW1zOiBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6IChmcm9tLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90cyA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgdXB0byA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgaWYgbm90IHVwdG8gdGhlbiByZXR1cm4gZXJyb3IgXCJubyBzbGljZSBlbmQhXCJcbiAgICAgICAgXG4gICAgICAgIGlmIGZyb20udG9rZW4gdGhlbiBmcm9tID0gZnJvbS50b2tlblxuICAgICAgICBpZiB1cHRvLnRva2VuIHRoZW4gdXB0byA9IHVwdG8udG9rZW5cblxuICAgICAgICBzbGljZTpcbiAgICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgICAgIGRvdHM6IGRvdHNcbiAgICAgICAgICAgIHVwdG86IHVwdG9cblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZHgnXG5cbiAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgc2xpY2UgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5kZXguY2xvc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICdleHBlY3RlZCBdJ1xuXG4gICAgICAgIEBwb3AgJ2lkeCdcblxuICAgICAgICBpbmRleDpcbiAgICAgICAgICAgIGlkeGVlOiB0b2tcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBzbGlkeDogc2xpY2VcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICcoJ1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICduZXh0IHRva2VuIG5vdCBhICknXG5cbiAgICAgICAgQHBvcCAnKCdcblxuICAgICAgICBwYXJlbnM6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgZXhwczogIGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDBcblxuICAgIGN1cmx5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfSdcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q6XG4gICAgICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAgICAgIGtleXZhbHM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ3snIHRva2VucywgJ30nXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciAnbmV4dCB0b2tlbiBub3QgYSB9J1xuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBrZXlDb2wgPSBrZXkudG9rZW4uY29sXG4gICAgICAgIFxuICAgICAgICBleHBzID0gW0BrZXl2YWwga2V5LCB0b2tlbnNdXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLmNvbCA9PSBrZXlDb2wgb3IgdG9rZW5zWzBdLnR5cGUgIT0gJ25sJylcbiAgICAgICAgXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0ubGluZSA9PSBrZXkudG9rZW4ubGluZSB0aGVuIHN0b3A9J25sJyBlbHNlIHN0b3A9bnVsbFxuICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2Vucywgc3RvcFxuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnOidcblxuICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBrZXl2YWw6XG4gICAgICAgICAgICBrZXk6ICAga2V5XG4gICAgICAgICAgICBjb2xvbjogY29sb25cbiAgICAgICAgICAgIHZhbDogICB2YWx1ZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIHByb3A6IChvYmosIHRva2VucywgcW1yaykgLT5cblxuICAgICAgICBkb3QgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJy4nXG5cbiAgICAgICAgcHJvcCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnLidcblxuICAgICAgICBlID0gcHJvcDogb2JqOiBvYmpcbiAgICAgICAgZS5wcm9wLnFtcmsgPSBxbXJrIGlmIHFtcmtcbiAgICAgICAgZS5wcm9wLmRvdCAgPSBkb3RcbiAgICAgICAgZS5wcm9wLnByb3AgPSBwcm9wXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
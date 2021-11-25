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
    hasProp = Object.hasOwn,
    indexOf = [].indexOf;

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
            e["if"]["else"] = this.block('else', tokens);
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
        vals = this.exps('for vals', tokens);
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
        var args, close, e, open, ref, ref1, ref2, ref3;
        this.push('call');
        if (this.debug) {
            print.tokens('call.open', tokens);
        }
        if (tok.token) {
            tok = tok.token;
        }
        if (tok.type === 'keyword' && ((ref = tok.text) === 'typeof' || ref === 'delete')) {
            this.push('onearg');
        }
        if (tokens[0].text === '(') {
            open = tokens.shift();
            if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ')') {
                args = [];
            } else {
                args = this.exps('call', tokens, ')');
            }
        } else {
            if (this.debug) {
                print.tokens('call args', tokens);
            }
            args = this.block('call', tokens);
            if (this.debug) {
                print.ast('call args', args);
            }
        }
        if (open && ((ref2 = tokens[0]) != null ? ref2.text : void 0) === ')') {
            close = tokens.shift();
        }
        if (open && !close) {
            console.error('expected )');
        }
        if (this.debug) {
            print.tokens('call.close', tokens);
        }
        if (tok.type === 'keyword' && ((ref3 = tok.text) === 'typeof' || ref3 === 'delete')) {
            this.pop('onearg');
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
        var rhs;
        this.push("op" + op.text);
        if (lhs && this.debug) {
            print.tokens("operation " + lhs.text + " " + op.text, tokens);
        }
        if (tokens) {
            rhs = this.blockExp('operation', tokens);
        }
        this.pop("op" + op.text);
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
        var close, items, ref, ref1, ref2, ref3;
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
        items = this.exps('[', tokens, ']');
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ']') {
            close = tokens.shift();
        } else {
            close = {
                text: ']',
                type: 'paren',
                line: -1,
                col: -1
            };
        }
        this.pop('[');
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block' && ((ref3 = this.stack.slice(-1)[0]) !== 'for' && ref3 !== 'if')) {
            this.verb('fucked up indentation! block after array! flattening block tokens:');
            if (this.verbose) {
                print.tokens('tokens before splice', tokens);
            }
            tokens.splice.apply(tokens, [0, 1].concat(tokens[0].tokens));
            if (this.verbose) {
                print.tokens('tokens after splice', tokens);
            }
        }
        return {
            array: {
                open: open,
                items: items,
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
        if (this.debug) {
            print.tokens('index.open', tokens);
        }
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
            close = {
                text: '}',
                type: 'paren',
                line: -1,
                col: -1
            };
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
        var exps, ref, ref1, stop;
        this.push('{');
        if (this.debug) {
            print.tokens('object val', tokens);
        }
        exps = [this.keyval(key, tokens)];
        if (this.debug) {
            print.tokens('object continue...?', tokens);
        }
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'nl') {
            tokens.shift();
        }
        if ((tokens[0] != null) && (tokens[0].col === key.col || tokens[0].line === key.line)) {
            if (ref1 = tokens[0].text, indexOf.call('])', ref1) < 0) {
                if (this.debug) {
                    this.verb('continue object...');
                }
                if (tokens[0].line === key.line) {
                    stop = 'nl';
                } else {
                    stop = null;
                }
                exps = exps.concat(this.exps('object', tokens, stop));
            }
        }
        if (this.debug) {
            print.tokens('object pop', tokens);
        }
        this.pop('{');
        return {
            object: {
                keyvals: exps
            }
        };
    };

    Parser.prototype.keyval = function(key, tokens) {
        var block, col, colon, line, ref, ref1, ref2, ref3, value;
        colon = tokens.shift();
        this.push(':');
        if (((ref = tokens[0]) != null ? ref.type : void 0) === 'block') {
            block = tokens.shift();
            if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl') {
                tokens.shift();
            }
            value = this.exps('keyval value', block.tokens);
        } else {
            value = this.exp(tokens);
        }
        this.pop(':');
        if ((ref2 = key.type) === 'keyword' || ref2 === 'op' || ref2 === 'punct') {
            key.type = 'single';
            key.text = "'" + key.text + "'";
        } else if (key.type === 'var') {
            key.type = 'key';
        } else if (key.prop) {
            ref3 = this.firstLineCol(key), line = ref3.line, col = ref3.col;
            key = {
                type: 'single',
                text: "'" + (this.renderer.node(key)) + "'",
                line: line,
                col: col
            };
        } else {
            console.log(key);
        }
        return {
            keyval: {
                key: key,
                colon: colon,
                val: value
            }
        };
    };

    Parser.prototype.prop = function(obj, tokens, qmrk) {
        return {
            prop: {
                obj: obj,
                dot: tokens.shift(),
                prop: tokens.shift()
            }
        };
    };

    return Parser;

})(Parse);

module.exports = Parser;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQkFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGOzs7Ozs7OztBQUVGOzs7Ozs7OztzQkFRQSxJQUFBLEdBQUksU0FBQyxHQUFELEVBQU0sTUFBTjtBQUVBLFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU47UUFFQSxJQUE0QixJQUFDLENBQUEsS0FBN0I7WUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBa0IsTUFBbEIsRUFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMO1FBRU4sSUFBOEIsSUFBQyxDQUFBLEtBQS9CO1lBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFiLEVBQW9CLE1BQXBCLEVBQUE7O1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFnQixNQUFoQjtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFRLEdBQVI7Z0JBQ0EsSUFBQSxFQUFRLEdBRFI7YUFESjs7QUFJSiwrQ0FBZSxDQUFFLGNBQVgsS0FBbUIsTUFBbkIsc0NBQXVDLENBQUUsY0FBWCxLQUFtQixJQUF2RDtZQUVJLElBQWlD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LEtBQVksS0FBZjtZQUNELEdBQUcsQ0FBQyxJQUFKLEdBQVcsTUFEVjtTQUFBLE1BRUEsSUFBRyxHQUFHLENBQUMsSUFBUDtZQUNELE9BQWMsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLENBQWQsRUFBQyxnQkFBRCxFQUFPO1lBQ1AsR0FBQSxHQUNJO2dCQUFBLElBQUEsRUFBTSxRQUFOO2dCQUNBLElBQUEsRUFBTSxHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxHQUFmLENBQUQsQ0FBSCxHQUF1QixHQUQ3QjtnQkFFQSxJQUFBLEVBQU0sSUFGTjtnQkFHQSxHQUFBLEVBQU0sR0FITjtjQUhIO1NBQUEsTUFBQTtZQVFGLE9BQUEsQ0FBQyxHQUFELENBQUssR0FBTCxFQVJFOztlQVVMO1lBQUEsTUFBQSxFQUNJO2dCQUFBLEdBQUEsRUFBTyxHQUFQO2dCQUNBLEtBQUEsRUFBTyxLQURQO2dCQUVBLEdBQUEsRUFBTyxLQUZQO2FBREo7O0lBOUJJOztxQkF5Q1IsSUFBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLE1BQU4sRUFBYyxJQUFkO2VBRUY7WUFBQSxJQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFNLEdBQU47Z0JBQ0EsR0FBQSxFQUFNLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FETjtnQkFFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUZOO2FBREo7O0lBRkU7Ozs7R0ExakJXOztBQWtrQnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cblBhcnNlID0gcmVxdWlyZSAnLi9wYXJzZSdcblxuY2xhc3MgUGFyc2VyIGV4dGVuZHMgUGFyc2VcblxuICAgICMjI1xuICAgIDAwMCAgMDAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwMDAwXG4gICAgMDAwICAwMDBcbiAgICAwMDAgIDAwMFxuICAgICMjI1xuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpZicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2lmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICBleHA6ICAgIGV4cFxuICAgICAgICAgICAgICAgIHRoZW46ICAgdGhuXG5cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpZidcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlIGlmJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsaWZzID89IFtdXG5cbiAgICAgICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZSBpZiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRobiA9IEB0aGVuICdlbGlmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBleHA6ICBleHBcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Vsc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbHNlID0gQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdpZidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lmIGxlZnRvdmVyJyB0b2tlbnMgaWYgdG9rZW5zLmxlbmd0aCBhbmQgQGRlYnVnXG5cbiAgICAgICAgZVxuXG4gICAgIyMjXG4gICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMjI1xuICAgIFxuICAgIGZvcjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2ZvcicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICMgdmFscyA9IEBleHAgdG9rZW5zXG4gICAgICAgIHZhbHMgPSBAZXhwcyAnZm9yIHZhbHMnIHRva2Vuc1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5vZicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ2xpc3QnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiA9IEB0aGVuICdmb3IgdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICAgdmFsc1xuICAgICAgICAgICAgaW5vZjogICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgIGxpc3RcbiAgICAgICAgICAgIHRoZW46ICAgdGhuXG4gICAgICAgICAgICBcbiAgICAjIyNcbiAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMjI1xuICAgIFxuICAgIHdoaWxlOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ3doaWxlIHRoZW58YmxvY2snIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ3doaWxlIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICB3aGlsZTpcbiAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgIHRoZW46IHRoblxuICAgICAgICBcbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyMjXG5cbiAgICBzd2l0Y2g6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgbWF0Y2ggPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcG9wICdzd2l0Y2gnXG4gICAgICAgICAgICByZXR1cm4gZXJyb3IgJ3BhcnNlci5zd2l0Y2g6IGJsb2NrIGV4cGVjdGVkISdcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIHdoZW5zJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICB3aGVucyA9IFtdXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnd2hlbidcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIHdoZW4nIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIHdoZW5zLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBlID0gc3dpdGNoOlxuICAgICAgICAgICAgICAgIG1hdGNoOiAgbWF0Y2hcbiAgICAgICAgICAgICAgICB3aGVuczogIHdoZW5zXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCBlbHNlPycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIGVsc2UnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5zd2l0Y2guZWxzZSA9IEBleHBzICdlbHNlJyB0b2tlbnMsICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBlXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doZW4nXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ3doZW4gdmFscycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IFtdXG4gICAgICAgIFxuICAgICAgICBAdmVyYiAnd2hlbi52YWxzIHRva2Vuc1swXScgdG9rZW5zWzBdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSAodG9rZW5zWzBdPyBhbmQgKHRva2Vuc1swXS50eXBlIG5vdCBpbiBbJ2Jsb2NrJydubCddKSBhbmQgdG9rZW5zWzBdLnRleHQgIT0gJ3RoZW4nKVxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICd3aGVuIHZhbCcgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgdmFscy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ3doZW4gdGhlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgQHZlcmIgJ3doZW4udGhlbiB0b2tlbnNbMF0nIHRva2Vuc1swXVxuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ3doZW4gdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgd2hlbjpcbiAgICAgICAgICAgIHZhbHM6IHZhbHNcbiAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIyNcblxuICAgIGNsYXNzOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NsYXNzJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBuYW1lID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBlID0gY2xhc3M6XG4gICAgICAgICAgICBuYW1lOm5hbWVcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2V4dGVuZHMnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZS5jbGFzcy5leHRlbmRzID0gQGV4cHMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgYm9keScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHByaW50Lm5vb24gJ2JlZm9yZSBjbGFzcyBib2R5JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgICAgICBlLmNsYXNzLmJvZHkgPSBAZXhwcyAnY2xhc3MgYm9keScgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB2ZXJiICdubyBjbGFzcyBib2R5ISdcblxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LmFzdCAnZS5jbGFzcy5ib2R5JyBlLmNsYXNzLmJvZHlcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgcG9wJyB0b2tlbnMgXG5cbiAgICAgICAgQHBvcCAnY2xhc3MnXG5cbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAoYXJncywgYXJyb3csIHRva2VucykgLT5cblxuICAgICAgICBib2R5ID0gQGV4cHMgJ2Z1bmMgYm9keScgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgZnVuYzpcbiAgICAgICAgICAgIGFyZ3M6ICBhcmdzXG4gICAgICAgICAgICBhcnJvdzogYXJyb3dcbiAgICAgICAgICAgIGJvZHk6ICBib2R5XG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuOlxuICAgICAgICAgICAgcmV0OiB0b2tcbiAgICAgICAgICAgIHZhbDogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjYWxsLm9wZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB0b2sgPSB0b2sudG9rZW4gaWYgdG9rLnRva2VuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgQHB1c2ggJ29uZWFyZydcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcoJ1xuICAgICAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgYXJncyA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IEBleHBzICdjYWxsJyB0b2tlbnMsICcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwgYXJncycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgYXJncyA9IEBibG9jayAnY2FsbCcgdG9rZW5zXG4gICAgICAgICAgICBwcmludC5hc3QgJ2NhbGwgYXJncycgYXJncyBpZiBAZGVidWdcblxuICAgICAgICBpZiBvcGVuIGFuZCB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgbm90IGNsb3NlXG4gICAgICAgICAgICBlcnJvciAnZXhwZWN0ZWQgKSdcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwuY2xvc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0IGluIFsndHlwZW9mJyAnZGVsZXRlJ11cbiAgICAgICAgICAgIEBwb3AgJ29uZWFyZydcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2NhbGwnXG4gICAgICAgIFxuICAgICAgICBlID0gY2FsbDogY2FsbGVlOiB0b2tcbiAgICAgICAgZS5jYWxsLm9wZW4gID0gb3BlblxuICAgICAgICBlLmNhbGwucW1yayAgPSBxbXJrIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgIyBpZiBsaHM/LnRva2VuIHRoZW4gbGhzID0gbGhzLnRva2VuXG4gICAgICAgIHByaW50LnRva2VucyBcIm9wZXJhdGlvbiAje2xocy50ZXh0fSAje29wLnRleHR9XCIgdG9rZW5zIGlmIGxocyBhbmQgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICByaHMgPSBAYmxvY2tFeHAgJ29wZXJhdGlvbicgdG9rZW5zIGlmIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgIyBpZiByaHM/LnRva2VuIHRoZW4gcmhzID0gcmhzLnRva2VuXG4gICAgICAgIFxuICAgICAgICBAcG9wIFwib3Aje29wLnRleHR9XCJcbiAgICAgICAgXG4gICAgICAgIG9wZXJhdGlvbjpcbiAgICAgICAgICAgIGxoczogICAgICAgIGxoc1xuICAgICAgICAgICAgb3BlcmF0b3I6ICAgb3BcbiAgICAgICAgICAgIHJoczogICAgICAgIHJoc1xuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpbmNvbmQ6IChsaHMsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGludG9rID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGluY29uZDpcbiAgICAgICAgICAgIGxoczogbGhzXG4gICAgICAgICAgICBpbjogIGludG9rXG4gICAgICAgICAgICByaHM6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5OlxuICAgICAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ1snXG5cbiAgICAgICAgaXRlbXMgPSBAZXhwcyAnWycgdG9rZW5zLCAnXSdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nIHRoZW4gY2xvc2UgPSB0b2tlbnMuc2hpZnQoKSBlbHNlIGNsb3NlID0gdGV4dDonXScgdHlwZToncGFyZW4nIGxpbmU6LTEgY29sOi0xIFxuXG4gICAgICAgIEBwb3AgJ1snXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJyBhbmQgQHN0YWNrWy0xXSBub3QgaW4gWydmb3InICdpZiddXG4gICAgICAgICAgICBAdmVyYiAnZnVja2VkIHVwIGluZGVudGF0aW9uISBibG9jayBhZnRlciBhcnJheSEgZmxhdHRlbmluZyBibG9jayB0b2tlbnM6J1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0b2tlbnMgYmVmb3JlIHNwbGljZScgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICB0b2tlbnMuc3BsaWNlLmFwcGx5IHRva2VucywgWzAgMV0uY29uY2F0IHRva2Vuc1swXS50b2tlbnNcbiAgICAgICAgICAgIHByaW50LnRva2VucyAndG9rZW5zIGFmdGVyIHNwbGljZScgdG9rZW5zIGlmIEB2ZXJib3NlXG5cbiAgICAgICAgYXJyYXk6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6IChmcm9tLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90cyA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgdXB0byA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgaWYgbm90IHVwdG8gdGhlbiByZXR1cm4gZXJyb3IgXCJubyBzbGljZSBlbmQhXCJcbiAgICAgICAgXG4gICAgICAgICMgaWYgZnJvbS50b2tlbiB0aGVuIGZyb20gPSBmcm9tLnRva2VuXG4gICAgICAgICMgaWYgdXB0by50b2tlbiB0aGVuIHVwdG8gPSB1cHRvLnRva2VuXG5cbiAgICAgICAgc2xpY2U6XG4gICAgICAgICAgICBmcm9tOiBmcm9tXG4gICAgICAgICAgICBkb3RzOiBkb3RzXG4gICAgICAgICAgICB1cHRvOiB1cHRvXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWR4J1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5kZXgub3BlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBzbGljZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpbmRleC5jbG9zZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ2V4cGVjdGVkIF0nXG5cbiAgICAgICAgQHBvcCAnaWR4J1xuXG4gICAgICAgIGluZGV4OlxuICAgICAgICAgICAgaWR4ZWU6IHRva1xuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIHNsaWR4OiBzbGljZVxuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBwYXJlbnM6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJygnXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICcoJyB0b2tlbnMsICcpJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ25leHQgdG9rZW4gbm90IGEgKSdcblxuICAgICAgICBAcG9wICcoJ1xuXG4gICAgICAgIHBhcmVuczpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBleHBzOiAgZXhwc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgICAgMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgY3VybHk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDpcbiAgICAgICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICAgICAga2V5dmFsczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAneycgdG9rZW5zLCAnfSdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nIHRoZW4gY2xvc2UgPSB0b2tlbnMuc2hpZnQoKSBlbHNlIGNsb3NlID0gdGV4dDonfScgdHlwZToncGFyZW4nIGxpbmU6LTEgY29sOi0xIFxuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBwcmludC50b2tlbnMgJ29iamVjdCB2YWwnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBbQGtleXZhbCBrZXksIHRva2Vuc11cbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnb2JqZWN0IGNvbnRpbnVlLi4uPycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHRva2Vucy5zaGlmdCgpIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLmNvbCA9PSBrZXkuY29sIG9yIHRva2Vuc1swXS5saW5lID09IGtleS5saW5lKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgbm90IGluICddKSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnY29udGludWUgb2JqZWN0Li4uJyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0ubGluZSA9PSBrZXkubGluZSB0aGVuIHN0b3A9J25sJyBlbHNlIHN0b3A9bnVsbFxuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsIHN0b3BcblxuICAgICAgICBwcmludC50b2tlbnMgJ29iamVjdCBwb3AnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAga2V5dmFsOiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICc6J1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgdmFsdWUgPSBAZXhwcyAna2V5dmFsIHZhbHVlJyBibG9jay50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBAcG9wICc6J1xuXG4gICAgICAgIGlmIGtleS50eXBlIGluIFsna2V5d29yZCcgJ29wJyAncHVuY3QnXVxuICAgICAgICAgICAga2V5LnR5cGUgPSAnc2luZ2xlJ1xuICAgICAgICAgICAga2V5LnRleHQgPSBcIicje2tleS50ZXh0fSdcIlxuICAgICAgICBlbHNlIGlmIGtleS50eXBlID09ICd2YXInXG4gICAgICAgICAgICBrZXkudHlwZSA9ICdrZXknXG4gICAgICAgIGVsc2UgaWYga2V5LnByb3BcbiAgICAgICAgICAgIHtsaW5lLCBjb2x9ID0gQGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgICAgIGtleSA9IFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzaW5nbGUnXG4gICAgICAgICAgICAgICAgdGV4dDogXCInI3tAcmVuZGVyZXIubm9kZSBrZXl9J1wiXG4gICAgICAgICAgICAgICAgbGluZTogbGluZVxuICAgICAgICAgICAgICAgIGNvbDogIGNvbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cga2V5XG5cbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtleVxuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAjIHFtcms6IHFtcmtcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
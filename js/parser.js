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
        if (vals.length === 1) {
            vals = vals[0];
        }
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
        this.push('func');
        body = this.exps('func body', tokens, 'nl');
        this.pop('func');
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
        var args, close, e, last, open, ref, ref1, ref2, ref3;
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
        last = this.lastLineCol(tok);
        if (tokens[0].text === '(' && tokens[0].line === last.line && tokens[0].col === last.col) {
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
        if (this.debug) {
            print.ast('operation lhs', lhs);
        }
        if (this.debug) {
            print.tokens("operation " + (lhs != null ? lhs.text : void 0) + " " + op.text, tokens);
        }
        if (op.text === '=') {
            rhs = this.exp(tokens);
        } else {
            rhs = this.exp(tokens);
        }
        if (this.debug) {
            print.ast('operation rhs', rhs);
        }
        if (this.debug) {
            print.tokens("operation " + (rhs != null ? rhs.text : void 0) + " " + op.text, tokens);
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
        var exps, first, ref, ref1, stop;
        this.push('{');
        first = this.firstLineCol(key);
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
        if ((tokens[0] != null) && (tokens[0].col === first.col || tokens[0].line === first.line)) {
            if (ref1 = tokens[0].text, indexOf.call('])', ref1) < 0) {
                if (this.debug) {
                    this.verb('continue object...');
                }
                if (tokens[0].line === first.line) {
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

    Parser.prototype["this"] = function(obj, tokens) {
        return {
            prop: {
                obj: obj,
                dot: {
                    type: 'punct',
                    text: '.',
                    line: obj.line,
                    col: obj.col
                },
                prop: tokens.shift()
            }
        };
    };

    return Parser;

})(Parse);

module.exports = Parser;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQkFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGOzs7Ozs7OztBQUVGOzs7Ozs7OztzQkFRQSxJQUFBLEdBQUksU0FBQyxHQUFELEVBQU0sTUFBTjtBQUVBLFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU47UUFFQSxJQUE0QixJQUFDLENBQUEsS0FBN0I7WUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBa0IsTUFBbEIsRUFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMO1FBRU4sSUFBOEIsSUFBQyxDQUFBLEtBQS9CO1lBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFiLEVBQW9CLE1BQXBCLEVBQUE7O1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFnQixNQUFoQjtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFRLEdBQVI7Z0JBQ0EsSUFBQSxFQUFRLEdBRFI7YUFESjs7QUFJSiwrQ0FBZSxDQUFFLGNBQVgsS0FBbUIsTUFBbkIsc0NBQXVDLENBQUUsY0FBWCxLQUFtQixJQUF2RDtZQUVJLElBQWlD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QUFlLEdBQWYsQ0FBRCxDQUFILEdBQXVCLEdBRDdCO2dCQUVBLElBQUEsRUFBTSxJQUZOO2dCQUdBLEdBQUEsRUFBTSxHQUhOO2NBSEg7O2VBVUw7WUFBQSxNQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFPLEdBQVA7Z0JBQ0EsS0FBQSxFQUFPLEtBRFA7Z0JBRUEsR0FBQSxFQUFPLEtBRlA7YUFESjs7SUE5Qkk7O3FCQXlDUixJQUFBLEdBQU0sU0FBQyxHQUFELEVBQU0sTUFBTixFQUFjLElBQWQ7ZUFFRjtZQUFBLElBQUEsRUFDSTtnQkFBQSxHQUFBLEVBQU0sR0FBTjtnQkFDQSxHQUFBLEVBQU0sTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUROO2dCQUVBLElBQUEsRUFBTSxNQUFNLENBQUMsS0FBUCxDQUFBLENBRk47YUFESjs7SUFGRTs7c0JBY04sTUFBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLE1BQU47ZUFFRjtZQUFBLElBQUEsRUFDSTtnQkFBQSxHQUFBLEVBQU0sR0FBTjtnQkFDQSxHQUFBLEVBQU07b0JBQUEsSUFBQSxFQUFLLE9BQUw7b0JBQWEsSUFBQSxFQUFLLEdBQWxCO29CQUFzQixJQUFBLEVBQUssR0FBRyxDQUFDLElBQS9CO29CQUFxQyxHQUFBLEVBQUksR0FBRyxDQUFDLEdBQTdDO2lCQUROO2dCQUVBLElBQUEsRUFBTSxNQUFNLENBQUMsS0FBUCxDQUFBLENBRk47YUFESjs7SUFGRTs7OztHQWxsQlc7O0FBeWxCckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuUGFyc2UgPSByZXF1aXJlICcuL3BhcnNlJ1xuXG5jbGFzcyBQYXJzZXIgZXh0ZW5kcyBQYXJzZVxuXG4gICAgIyMjXG4gICAgMDAwICAwMDAwMDAwMFxuICAgIDAwMCAgMDAwXG4gICAgMDAwICAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwXG4gICAgIyMjXG5cbiAgICBpZjogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lmJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgZXhwID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ3RoZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB0aG4gPSBAdGhlbiAnaWYgdGhlbicgdG9rZW5zXG5cbiAgICAgICAgZSA9IGlmOlxuICAgICAgICAgICAgICAgIGV4cDogICAgZXhwXG4gICAgICAgICAgICAgICAgdGhlbjogICB0aG5cblxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2lmJ1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Vsc2UgaWYnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMgPz0gW11cblxuICAgICAgICAgICAgZXhwID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlIGlmIHRoZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICAgICAgdGhuID0gQHRoZW4gJ2VsaWYgdGhlbicgdG9rZW5zXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMucHVzaFxuICAgICAgICAgICAgICAgIGVsaWY6XG4gICAgICAgICAgICAgICAgICAgIGV4cDogIGV4cFxuICAgICAgICAgICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsc2UgPSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaWYgbGVmdG92ZXInIHRva2VucyBpZiB0b2tlbnMubGVuZ3RoIGFuZCBAZGVidWdcblxuICAgICAgICBlXG5cbiAgICAjIyNcbiAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyMjXG4gICAgXG4gICAgZm9yOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnZm9yJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gdmFsc1swXSBpZiB2YWxzLmxlbmd0aCA9PSAxXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpbm9mJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpbm9mID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnbGlzdCcgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2ZvciB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG5cbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICAgbGlzdFxuICAgICAgICAgICAgdGhlbjogICB0aG5cbiAgICAgICAgICAgIFxuICAgICMjI1xuICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyMjXG4gICAgXG4gICAgd2hpbGU6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHByaW50LnRva2VucyAnd2hpbGUgdGhlbnxibG9jaycgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hpbGUgdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlOlxuICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgdGhlbjogdGhuXG4gICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIyNcblxuICAgIHN3aXRjaDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBtYXRjaCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgICAgIHJldHVybiBlcnJvciAncGFyc2VyLnN3aXRjaDogYmxvY2sgZXhwZWN0ZWQhJ1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHdoZW5zID0gW11cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICd3aGVuJ1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgd2hlbnMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGUgPSBzd2l0Y2g6XG4gICAgICAgICAgICAgICAgbWF0Y2g6ICBtYXRjaFxuICAgICAgICAgICAgICAgIHdoZW5zOiAgd2hlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIGVsc2U/JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWxzJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICd3aGVuLnZhbHMgdG9rZW5zWzBdJyB0b2tlbnNbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3doZW4gdmFsJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBAdmVyYiAnd2hlbi50aGVuIHRva2Vuc1swXScgdG9rZW5zWzBdXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hlbiB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB3aGVuOlxuICAgICAgICAgICAgdmFsczogdmFsc1xuICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMjI1xuXG4gICAgY2xhc3M6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnY2xhc3MnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBib2R5JyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQubm9vbiAnYmVmb3JlIGNsYXNzIGJvZHknIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgICAgIGUuY2xhc3MuYm9keSA9IEBleHBzICdjbGFzcyBib2R5JyB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZlcmIgJ25vIGNsYXNzIGJvZHkhJ1xuXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuYXN0ICdlLmNsYXNzLmJvZHknIGUuY2xhc3MuYm9keVxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBwb3AnIHRva2VucyBcblxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgYm9keSA9IEBleHBzICdmdW5jIGJvZHknIHRva2VucywgJ25sJ1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnZnVuYydcbiAgICAgICAgXG4gICAgICAgIGZ1bmM6XG4gICAgICAgICAgICBhcmdzOiAgYXJnc1xuICAgICAgICAgICAgYXJyb3c6IGFycm93XG4gICAgICAgICAgICBib2R5OiAgYm9keVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybjpcbiAgICAgICAgICAgIHJldDogdG9rXG4gICAgICAgICAgICB2YWw6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHRvaywgdG9rZW5zLCBxbXJrKSAtPlxuXG4gICAgICAgIEBwdXNoICdjYWxsJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2FsbC5vcGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0IGluIFsndHlwZW9mJyAnZGVsZXRlJ11cbiAgICAgICAgICAgIEBwdXNoICdvbmVhcmcnXG4gICAgICAgIFxuICAgICAgICBsYXN0ID0gQGxhc3RMaW5lQ29sIHRva1xuICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKCcgYW5kIHRva2Vuc1swXS5saW5lID09IGxhc3QubGluZSBhbmQgdG9rZW5zWzBdLmNvbCA9PSBsYXN0LmNvbFxuICAgICAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgYXJncyA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IEBleHBzICdjYWxsJyB0b2tlbnMsICcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwgYXJncycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgYXJncyA9IEBibG9jayAnY2FsbCcgdG9rZW5zXG4gICAgICAgICAgICBwcmludC5hc3QgJ2NhbGwgYXJncycgYXJncyBpZiBAZGVidWdcblxuICAgICAgICBpZiBvcGVuIGFuZCB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgbm90IGNsb3NlXG4gICAgICAgICAgICBlcnJvciAnZXhwZWN0ZWQgKSdcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwuY2xvc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0IGluIFsndHlwZW9mJyAnZGVsZXRlJ11cbiAgICAgICAgICAgIEBwb3AgJ29uZWFyZydcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2NhbGwnXG4gICAgICAgIFxuICAgICAgICBlID0gY2FsbDogY2FsbGVlOiB0b2tcbiAgICAgICAgZS5jYWxsLm9wZW4gID0gb3BlblxuICAgICAgICBlLmNhbGwucW1yayAgPSBxbXJrIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0ICdvcGVyYXRpb24gbGhzJyBsaHMgaWYgQGRlYnVnXG4gICAgICAgIHByaW50LnRva2VucyBcIm9wZXJhdGlvbiAje2xocz8udGV4dH0gI3tvcC50ZXh0fVwiIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIG9wLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAjIHJocyA9IEBibG9ja0V4cCAnb3BlcmF0aW9uIGxocycgdG9rZW5zXG4gICAgICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0ICdvcGVyYXRpb24gcmhzJyByaHMgaWYgQGRlYnVnXG4gICAgICAgIHByaW50LnRva2VucyBcIm9wZXJhdGlvbiAje3Jocz8udGV4dH0gI3tvcC50ZXh0fVwiIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIEBwb3AgXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgb3BlcmF0aW9uOlxuICAgICAgICAgICAgbGhzOiAgICAgICAgbGhzXG4gICAgICAgICAgICBvcGVyYXRvcjogICBvcFxuICAgICAgICAgICAgcmhzOiAgICAgICAgcmhzXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKGxocywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaW50b2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnWydcblxuICAgICAgICBpdGVtcyA9IEBleHBzICdbJyB0b2tlbnMsICddJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXScgdGhlbiBjbG9zZSA9IHRva2Vucy5zaGlmdCgpIGVsc2UgY2xvc2UgPSB0ZXh0OiddJyB0eXBlOidwYXJlbicgbGluZTotMSBjb2w6LTEgXG5cbiAgICAgICAgQHBvcCAnWydcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ2ZvcicgJ2lmJ11cbiAgICAgICAgICAgIEB2ZXJiICdmdWNrZWQgdXAgaW5kZW50YXRpb24hIGJsb2NrIGFmdGVyIGFycmF5ISBmbGF0dGVuaW5nIGJsb2NrIHRva2VuczonXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3Rva2VucyBiZWZvcmUgc3BsaWNlJyB0b2tlbnMgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHRva2Vucy5zcGxpY2UuYXBwbHkgdG9rZW5zLCBbMCAxXS5jb25jYXQgdG9rZW5zWzBdLnRva2Vuc1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0b2tlbnMgYWZ0ZXIgc3BsaWNlJyB0b2tlbnMgaWYgQHZlcmJvc2VcblxuICAgICAgICBhcnJheTpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogKGZyb20sIHRva2VucykgLT5cblxuICAgICAgICBkb3RzID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICB1cHRvID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBpZiBub3QgdXB0byB0aGVuIHJldHVybiBlcnJvciBcIm5vIHNsaWNlIGVuZCFcIlxuICAgICAgICBcbiAgICAgICAgc2xpY2U6XG4gICAgICAgICAgICBmcm9tOiBmcm9tXG4gICAgICAgICAgICBkb3RzOiBkb3RzXG4gICAgICAgICAgICB1cHRvOiB1cHRvXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWR4J1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5kZXgub3BlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBzbGljZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpbmRleC5jbG9zZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ2V4cGVjdGVkIF0nXG5cbiAgICAgICAgQHBvcCAnaWR4J1xuXG4gICAgICAgIGluZGV4OlxuICAgICAgICAgICAgaWR4ZWU6IHRva1xuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIHNsaWR4OiBzbGljZVxuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBwYXJlbnM6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJygnXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICcoJyB0b2tlbnMsICcpJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ25leHQgdG9rZW4gbm90IGEgKSdcblxuICAgICAgICBAcG9wICcoJ1xuXG4gICAgICAgIHBhcmVuczpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBleHBzOiAgZXhwc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgICAgMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgY3VybHk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDpcbiAgICAgICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICAgICAga2V5dmFsczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAneycgdG9rZW5zLCAnfSdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nIHRoZW4gY2xvc2UgPSB0b2tlbnMuc2hpZnQoKSBlbHNlIGNsb3NlID0gdGV4dDonfScgdHlwZToncGFyZW4nIGxpbmU6LTEgY29sOi0xIFxuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBmaXJzdCA9IEBmaXJzdExpbmVDb2wga2V5XG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ29iamVjdCB2YWwnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBbQGtleXZhbCBrZXksIHRva2Vuc11cbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnb2JqZWN0IGNvbnRpbnVlLi4uPycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHRva2Vucy5zaGlmdCgpIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8gYW5kICh0b2tlbnNbMF0uY29sID09IGZpcnN0LmNvbCBvciB0b2tlbnNbMF0ubGluZSA9PSBmaXJzdC5saW5lKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgbm90IGluICddKSdcbiAgICAgICAgICAgICAgICBAdmVyYiAnY29udGludWUgb2JqZWN0Li4uJyBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0ubGluZSA9PSBmaXJzdC5saW5lIHRoZW4gc3RvcD0nbmwnIGVsc2Ugc3RvcD1udWxsXG4gICAgICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2Vucywgc3RvcFxuXG4gICAgICAgIHByaW50LnRva2VucyAnb2JqZWN0IHBvcCcgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJzonXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHBzICdrZXl2YWwgdmFsdWUnIGJsb2NrLnRva2Vuc1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgdmFsdWUgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJzonXG5cbiAgICAgICAgaWYga2V5LnR5cGUgaW4gWydrZXl3b3JkJyAnb3AnICdwdW5jdCddXG4gICAgICAgICAgICBrZXkudHlwZSA9ICdzaW5nbGUnXG4gICAgICAgICAgICBrZXkudGV4dCA9IFwiJyN7a2V5LnRleHR9J1wiXG4gICAgICAgIGVsc2UgaWYga2V5LnR5cGUgPT0gJ3ZhcidcbiAgICAgICAgICAgIGtleS50eXBlID0gJ2tleSdcbiAgICAgICAgZWxzZSBpZiBrZXkucHJvcFxuICAgICAgICAgICAge2xpbmUsIGNvbH0gPSBAZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICAgICAga2V5ID0gXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NpbmdsZSdcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIicje0ByZW5kZXJlci5ub2RlIGtleX0nXCJcbiAgICAgICAgICAgICAgICBsaW5lOiBsaW5lXG4gICAgICAgICAgICAgICAgY29sOiAgY29sXG4gICAgICAgICMgZWxzZVxuICAgICAgICAgICAgIyBsb2cga2V5XG5cbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtleVxuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAjIHFtcms6IHFtcmtcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHRoaXM6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICB0eXBlOidwdW5jdCcgdGV4dDonLicgbGluZTpvYmoubGluZSwgY29sOm9iai5jb2xcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
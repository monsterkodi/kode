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

    Parser.prototype.scope = function(exps) {
        return {
            vars: [],
            exps: exps
        };
    };


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
                then: this.scope(thn)
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
                    then: this.scope(thn)
                }
            });
        }
        if (((ref2 = tokens[0]) != null ? ref2.text : void 0) === 'else') {
            if (this.debug) {
                print.tokens('else', tokens);
            }
            tokens.shift();
            e["if"]["else"] = this.scope(this.block('else', tokens));
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
        vals = this.exps('for vals', tokens);
        if (vals.length === 1) {
            vals = vals[0];
        }
        inof = tokens.shift();
        list = this.exp(tokens);
        thn = this.then('for then', tokens);
        this.pop('for');
        return {
            "for": {
                vals: vals,
                inof: inof,
                list: list,
                then: this.scope(thn)
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
                then: this.scope(thn)
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
                then: this.scope(thn)
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
            this.nameMethods(e["class"].body[0].object.keyvals);
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
        var body, e;
        this.push('func');
        body = this.scope(this.exps('func body', tokens, 'nl'));
        this.pop('func');
        e = {
            func: {}
        };
        if (args) {
            e.func.args = args;
        }
        e.func.arrow = arrow;
        e.func.body = body;
        return e;
    };

    Parser.prototype["return"] = function(tok, tokens) {
        var e, ref, val;
        if (((ref = tokens[0]) != null ? ref.type : void 0) !== 'nl') {
            val = this.exp(tokens);
        }
        e = {
            "return": {
                ret: tok
            }
        };
        if (val) {
            e["return"].val = val;
        }
        return e;
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
        if (open) {
            e.call.open = open;
        }
        if (qmrk) {
            e.call.qmrk = qmrk;
        }
        e.call.args = args;
        if (close) {
            e.call.close = close;
        }
        return e;
    };

    Parser.prototype.operation = function(lhs, op, tokens) {
        var e, rhs;
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
        e = {
            operation: {}
        };
        if (lhs) {
            e.operation.lhs = lhs;
        }
        e.operation.operator = op;
        if (rhs) {
            e.operation.rhs = rhs;
        }
        return e;
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
            console.error('parser.index expected ]');
            print.tokens('missing ]', tokens);
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
                text: "'" + (this.kode.renderer.node(key)) + "'",
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

    Parser.prototype.prop = function(obj, tokens) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQkFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7OztBQUtQOzs7Ozs7OztzQkFRQSxJQUFBLEdBQUksU0FBQyxHQUFELEVBQU0sTUFBTjtBQUVBLFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU47UUFFQSxJQUE0QixJQUFDLENBQUEsS0FBN0I7WUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBa0IsTUFBbEIsRUFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMO1FBRU4sSUFBOEIsSUFBQyxDQUFBLEtBQS9CO1lBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFiLEVBQW9CLE1BQXBCLEVBQUE7O1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFnQixNQUFoQjtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFRLEdBQVI7Z0JBQ0EsSUFBQSxFQUFRLElBQUMs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RCxFQUFNLE1BQU47ZUFFRjtZQUFBLElBQUEsRUFDSTtnQkFBQSxHQUFBLEVBQU0sR0FBTjtnQkFDQSxHQUFBLEVBQU07b0JBQUEsSUFBQSxFQUFLLE9BQUw7b0JBQWEsSUFBQSxFQUFLLEdBQWxCO29CQUFzQixJQUFBLEVBQUssR0FBRyxDQUFDLElBQS9CO29CQUFxQyxHQUFBLEVBQUksR0FBRyxDQUFDLEdBQTdDO2lCQUROO2dCQUVBLElBQUEsRUFBTSxNQUFNLENBQUMsS0FBUCxDQUFBLENBRk47YUFESjs7SUFGRTs7OztHQTVsQlc7O0FBbW1CckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcbmVtcHR5ID0gKGEpIC0+IGEgaW4gWycnIG51bGwgdW5kZWZpbmVkXSBvciAodHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBPYmplY3Qua2V5cyhhKS5sZW5ndGggPT0gMClcblxuUGFyc2UgPSByZXF1aXJlICcuL3BhcnNlJ1xuXG5jbGFzcyBQYXJzZXIgZXh0ZW5kcyBQYXJzZVxuXG4gICAgc2NvcGU6IChleHBzKSAtPlxuICAgICAgICBcbiAgICAgICAgdmFyczogW11cbiAgICAgICAgZXhwczogZXhwc1xuICAgIFxuICAgICMjI1xuICAgIDAwMCAgMDAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwMDAwXG4gICAgMDAwICAwMDBcbiAgICAwMDAgIDAwMFxuICAgICMjI1xuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpZicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICd0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2lmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICBleHA6ICAgIGV4cFxuICAgICAgICAgICAgICAgIHRoZW46ICAgQHNjb3BlIHRoblxuXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZScgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaWYnXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZSBpZicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbGlmcyA/PSBbXVxuXG4gICAgICAgICAgICBleHAgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2Vsc2UgaWYgdGhlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICB0aG4gPSBAdGhlbiAnZWxpZiB0aGVuJyB0b2tlbnNcblxuICAgICAgICAgICAgZS5pZi5lbGlmcy5wdXNoXG4gICAgICAgICAgICAgICAgZWxpZjpcbiAgICAgICAgICAgICAgICAgICAgZXhwOiAgZXhwXG4gICAgICAgICAgICAgICAgICAgIHRoZW46IEBzY29wZSB0aG5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsc2UgPSBAc2NvcGUgQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdpZidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lmIGxlZnRvdmVyJyB0b2tlbnMgaWYgdG9rZW5zLmxlbmd0aCBhbmQgQGRlYnVnXG5cbiAgICAgICAgZVxuXG4gICAgIyMjXG4gICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMjI1xuICAgIFxuICAgIGZvcjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcblxuICAgICAgICAjIHByaW50LnRva2VucyAnZm9yJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gdmFsc1swXSBpZiB2YWxzLmxlbmd0aCA9PSAxXG5cbiAgICAgICAgIyBwcmludC50b2tlbnMgJ2lub2YnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgIyBwcmludC50b2tlbnMgJ2xpc3QnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiA9IEB0aGVuICdmb3IgdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICAgdmFsc1xuICAgICAgICAgICAgaW5vZjogICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgIGxpc3RcbiAgICAgICAgICAgIHRoZW46ICAgQHNjb3BlIHRoblxuICAgICAgICAgICAgXG4gICAgIyMjXG4gICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIyNcbiAgICBcbiAgICB3aGlsZTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICd3aGlsZSB0aGVufGJsb2NrJyB0b2tlbnMgaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGlsZSB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiBAc2NvcGUgdGhuXG4gICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIyNcblxuICAgIHN3aXRjaDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBtYXRjaCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgICAgIHJldHVybiBlcnJvciAncGFyc2VyLnN3aXRjaDogYmxvY2sgZXhwZWN0ZWQhJ1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbnMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHdoZW5zID0gW11cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICd3aGVuJ1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggd2hlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgd2hlbnMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGUgPSBzd2l0Y2g6XG4gICAgICAgICAgICAgICAgbWF0Y2g6ICBtYXRjaFxuICAgICAgICAgICAgICAgIHdoZW5zOiAgd2hlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnc3dpdGNoIGVsc2U/JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggZWxzZScgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWxzJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICd3aGVuLnZhbHMgdG9rZW5zWzBdJyB0b2tlbnNbMF1cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3doZW4gdmFsJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnd2hlbiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBAdmVyYiAnd2hlbi50aGVuIHRva2Vuc1swXScgdG9rZW5zWzBdXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hlbiB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB3aGVuOlxuICAgICAgICAgICAgdmFsczogdmFsc1xuICAgICAgICAgICAgdGhlbjogQHNjb3BlIHRoblxuXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIyNcblxuICAgIGNsYXNzOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NsYXNzJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBuYW1lID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBlID0gY2xhc3M6XG4gICAgICAgICAgICBuYW1lOm5hbWVcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2V4dGVuZHMnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZS5jbGFzcy5leHRlbmRzID0gQGV4cHMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgYm9keScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHByaW50Lm5vb24gJ2JlZm9yZSBjbGFzcyBib2R5JyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgICAgICBlLmNsYXNzLmJvZHkgPSBAZXhwcyAnY2xhc3MgYm9keScgdG9rZW5zXG4gICAgICAgICAgICBAbmFtZU1ldGhvZHMgZS5jbGFzcy5ib2R5WzBdLm9iamVjdC5rZXl2YWxzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB2ZXJiICdubyBjbGFzcyBib2R5ISdcblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgIHByaW50LmFzdCAnZS5jbGFzcy5ib2R5JyBlLmNsYXNzLmJvZHlcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgcG9wJyB0b2tlbnMgXG5cbiAgICAgICAgQHBvcCAnY2xhc3MnXG5cbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAoYXJncywgYXJyb3csIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnZnVuYydcbiAgICAgICAgXG4gICAgICAgIGJvZHkgPSBAc2NvcGUgQGV4cHMgJ2Z1bmMgYm9keScgdG9rZW5zLCAnbmwnXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgZSA9IGZ1bmM6e31cbiAgICAgICAgZS5mdW5jLmFyZ3MgID0gYXJncyBpZiBhcmdzXG4gICAgICAgIGUuZnVuYy5hcnJvdyA9IGFycm93XG4gICAgICAgIGUuZnVuYy5ib2R5ICA9IGJvZHlcbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSAhPSAnbmwnXG4gICAgICAgICAgICB2YWwgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgZSA9IHJldHVybjogcmV0OiB0b2tcbiAgICAgICAgZS5yZXR1cm4udmFsID0gdmFsIGlmIHZhbFxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHRvaywgdG9rZW5zLCBxbXJrKSAtPlxuXG4gICAgICAgIEBwdXNoICdjYWxsJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2FsbC5vcGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0IGluIFsndHlwZW9mJyAnZGVsZXRlJ11cbiAgICAgICAgICAgIEBwdXNoICdvbmVhcmcnXG4gICAgICAgIFxuICAgICAgICBsYXN0ID0gQGxhc3RMaW5lQ29sIHRva1xuICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKCcgYW5kIHRva2Vuc1swXS5saW5lID09IGxhc3QubGluZSBhbmQgdG9rZW5zWzBdLmNvbCA9PSBsYXN0LmNvbFxuICAgICAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgYXJncyA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IEBleHBzICdjYWxsJyB0b2tlbnMsICcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwgYXJncycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgYXJncyA9IEBibG9jayAnY2FsbCcgdG9rZW5zXG4gICAgICAgICAgICBwcmludC5hc3QgJ2NhbGwgYXJncycgYXJncyBpZiBAZGVidWdcblxuICAgICAgICBpZiBvcGVuIGFuZCB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgbm90IGNsb3NlXG4gICAgICAgICAgICBlcnJvciAnZXhwZWN0ZWQgKSdcblxuICAgICAgICBwcmludC50b2tlbnMgJ2NhbGwuY2xvc2UnIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0IGluIFsndHlwZW9mJyAnZGVsZXRlJ11cbiAgICAgICAgICAgIEBwb3AgJ29uZWFyZydcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2NhbGwnXG4gICAgICAgIFxuICAgICAgICBlID0gY2FsbDogY2FsbGVlOiB0b2tcbiAgICAgICAgZS5jYWxsLm9wZW4gID0gb3BlbiAgaWYgb3BlblxuICAgICAgICBlLmNhbGwucW1yayAgPSBxbXJrICBpZiBxbXJrXG4gICAgICAgIGUuY2FsbC5hcmdzICA9IGFyZ3NcbiAgICAgICAgZS5jYWxsLmNsb3NlID0gY2xvc2UgaWYgY2xvc2VcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAobGhzLCBvcCwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoIFwib3Aje29wLnRleHR9XCJcbiAgICAgICAgXG4gICAgICAgIHByaW50LmFzdCAnb3BlcmF0aW9uIGxocycgbGhzIGlmIEBkZWJ1Z1xuICAgICAgICBwcmludC50b2tlbnMgXCJvcGVyYXRpb24gI3tsaHM/LnRleHR9ICN7b3AudGV4dH1cIiB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiBvcC50ZXh0ID09ICc9J1xuICAgICAgICAgICAgIyByaHMgPSBAYmxvY2tFeHAgJ29wZXJhdGlvbiBsaHMnIHRva2Vuc1xuICAgICAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHByaW50LmFzdCAnb3BlcmF0aW9uIHJocycgcmhzIGlmIEBkZWJ1Z1xuICAgICAgICBwcmludC50b2tlbnMgXCJvcGVyYXRpb24gI3tyaHM/LnRleHR9ICN7b3AudGV4dH1cIiB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBAcG9wIFwib3Aje29wLnRleHR9XCJcbiAgICAgICAgXG4gICAgICAgIGUgPSBvcGVyYXRpb246IHt9XG4gICAgICAgIGUub3BlcmF0aW9uLmxocyAgICAgID0gbGhzIGlmIGxoc1xuICAgICAgICBlLm9wZXJhdGlvbi5vcGVyYXRvciA9IG9wXG4gICAgICAgIGUub3BlcmF0aW9uLnJocyAgICAgID0gcmhzIGlmIHJoc1xuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKGxocywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaW50b2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnWydcblxuICAgICAgICBpdGVtcyA9IEBleHBzICdbJyB0b2tlbnMsICddJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXScgdGhlbiBjbG9zZSA9IHRva2Vucy5zaGlmdCgpIGVsc2UgY2xvc2UgPSB0ZXh0OiddJyB0eXBlOidwYXJlbicgbGluZTotMSBjb2w6LTEgXG5cbiAgICAgICAgQHBvcCAnWydcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snIGFuZCBAc3RhY2tbLTFdIG5vdCBpbiBbJ2ZvcicgJ2lmJ11cbiAgICAgICAgICAgIEB2ZXJiICdmdWNrZWQgdXAgaW5kZW50YXRpb24hIGJsb2NrIGFmdGVyIGFycmF5ISBmbGF0dGVuaW5nIGJsb2NrIHRva2VuczonXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3Rva2VucyBiZWZvcmUgc3BsaWNlJyB0b2tlbnMgaWYgQHZlcmJvc2VcbiAgICAgICAgICAgIHRva2Vucy5zcGxpY2UuYXBwbHkgdG9rZW5zLCBbMCAxXS5jb25jYXQgdG9rZW5zWzBdLnRva2Vuc1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0b2tlbnMgYWZ0ZXIgc3BsaWNlJyB0b2tlbnMgaWYgQHZlcmJvc2VcblxuICAgICAgICBhcnJheTpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogKGZyb20sIHRva2VucykgLT5cblxuICAgICAgICBkb3RzID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICB1cHRvID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBpZiBub3QgdXB0byB0aGVuIHJldHVybiBlcnJvciBcIm5vIHNsaWNlIGVuZCFcIlxuICAgICAgICBcbiAgICAgICAgc2xpY2U6XG4gICAgICAgICAgICBmcm9tOiBmcm9tXG4gICAgICAgICAgICBkb3RzOiBkb3RzXG4gICAgICAgICAgICB1cHRvOiB1cHRvXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWR4J1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaW5kZXgub3BlbicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBzbGljZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpbmRleC5jbG9zZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IgJ3BhcnNlci5pbmRleCBleHBlY3RlZCBdJ1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdtaXNzaW5nIF0nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ2lkeCdcblxuICAgICAgICBpbmRleDpcbiAgICAgICAgICAgIGlkeGVlOiB0b2tcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBzbGlkeDogc2xpY2VcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICcoJ1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICduZXh0IHRva2VuIG5vdCBhICknXG5cbiAgICAgICAgQHBvcCAnKCdcblxuICAgICAgICBwYXJlbnM6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgZXhwczogIGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDBcblxuICAgIGN1cmx5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfSdcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q6XG4gICAgICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAgICAgIGtleXZhbHM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ3snIHRva2VucywgJ30nXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9JyB0aGVuIGNsb3NlID0gdG9rZW5zLnNoaWZ0KCkgZWxzZSBjbG9zZSA9IHRleHQ6J30nIHR5cGU6J3BhcmVuJyBsaW5lOi0xIGNvbDotMSBcblxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiAgIGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgb2JqZWN0OiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZmlyc3QgPSBAZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdvYmplY3QgdmFsJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBleHBzID0gW0BrZXl2YWwga2V5LCB0b2tlbnNdXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ29iamVjdCBjb250aW51ZS4uLj8nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB0b2tlbnMuc2hpZnQoKSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLmNvbCA9PSBmaXJzdC5jb2wgb3IgdG9rZW5zWzBdLmxpbmUgPT0gZmlyc3QubGluZSlcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXS50ZXh0IG5vdCBpbiAnXSknXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2NvbnRpbnVlIG9iamVjdC4uLicgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdLmxpbmUgPT0gZmlyc3QubGluZSB0aGVuIHN0b3A9J25sJyBlbHNlIHN0b3A9bnVsbFxuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsIHN0b3BcblxuICAgICAgICBwcmludC50b2tlbnMgJ29iamVjdCBwb3AnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAga2V5dmFsOiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICc6J1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgdmFsdWUgPSBAZXhwcyAna2V5dmFsIHZhbHVlJyBibG9jay50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBAcG9wICc6J1xuXG4gICAgICAgIGlmIGtleS50eXBlIGluIFsna2V5d29yZCcgJ29wJyAncHVuY3QnXVxuICAgICAgICAgICAga2V5LnR5cGUgPSAnc2luZ2xlJ1xuICAgICAgICAgICAga2V5LnRleHQgPSBcIicje2tleS50ZXh0fSdcIlxuICAgICAgICBlbHNlIGlmIGtleS50eXBlID09ICd2YXInXG4gICAgICAgICAgICBrZXkudHlwZSA9ICdrZXknXG4gICAgICAgIGVsc2UgaWYga2V5LnByb3BcbiAgICAgICAgICAgIHtsaW5lLCBjb2x9ID0gQGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgICAgIGtleSA9IFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzaW5nbGUnXG4gICAgICAgICAgICAgICAgdGV4dDogXCInI3tAa29kZS5yZW5kZXJlci5ub2RlIGtleX0nXCJcbiAgICAgICAgICAgICAgICBsaW5lOiBsaW5lXG4gICAgICAgICAgICAgICAgY29sOiAgY29sXG5cbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtleVxuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB0aGlzOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdHlwZToncHVuY3QnIHRleHQ6Jy4nIGxpbmU6b2JqLmxpbmUsIGNvbDpvYmouY29sXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyXG4iXX0=
//# sourceURL=../coffee/parser.coffee
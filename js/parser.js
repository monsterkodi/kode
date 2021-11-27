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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyQkFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxTQUFDLENBQUQ7V0FBTyxDQUFBLENBQUEsS0FBTSxFQUFOLElBQUEsQ0FBQSxLQUFTLElBQVQsSUFBQSxDQUFBLEtBQWMsUUFBZCxDQUFBLElBQTRCLENBQUMsT0FBTyxDQUFQLEtBQWEsUUFBYixJQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVosQ0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBcEQ7QUFBbkM7O0FBRVIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7OztBQUtQOzs7Ozs7OztzQkFRQSxJQUFBLEdBQUksU0FBQyxHQUFELEVBQU0sTUFBTjtBQUVBLFlBQUE7UUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU47UUFFQSxJQUE0QixJQUFDLENBQUEsS0FBN0I7WUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBa0IsTUFBbEIsRUFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMO1FBRU4sSUFBOEIsSUFBQyxDQUFBLEtBQS9CO1lBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxNQUFiLEVBQW9CLE1BQXBCLEVBQUE7O1FBRUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFnQixNQUFoQjtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFRLEdBQVI7Z0JBQ0EsSUFBQSxFQUFRLElBQUMs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LENBQUMsSUFBL0I7b0JBQXFDLEdBQUEsRUFBSSxHQUFHLENBQUMsR0FBN0M7aUJBRE47Z0JBRUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FGTjthQURKOztJQUZFOzs7O0dBemxCVzs7QUFnbUJyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5QYXJzZSA9IHJlcXVpcmUgJy4vcGFyc2UnXG5cbmNsYXNzIFBhcnNlciBleHRlbmRzIFBhcnNlXG5cbiAgICBzY29wZTogKGV4cHMpIC0+XG4gICAgICAgIFxuICAgICAgICB2YXJzOiBbXVxuICAgICAgICBleHBzOiBleHBzXG4gICAgXG4gICAgIyMjXG4gICAgMDAwICAwMDAwMDAwMFxuICAgIDAwMCAgMDAwXG4gICAgMDAwICAwMDAwMDBcbiAgICAwMDAgIDAwMFxuICAgIDAwMCAgMDAwXG4gICAgIyMjXG5cbiAgICBpZjogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZidcblxuICAgICAgICBwcmludC50b2tlbnMgJ2lmJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgZXhwID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ3RoZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB0aG4gPSBAdGhlbiAnaWYgdGhlbicgdG9rZW5zXG5cbiAgICAgICAgZSA9IGlmOlxuICAgICAgICAgICAgICAgIGV4cDogICAgZXhwXG4gICAgICAgICAgICAgICAgdGhlbjogICBAc2NvcGUgdGhuXG5cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpZidcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlIGlmJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsaWZzID89IFtdXG5cbiAgICAgICAgICAgIGV4cCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgICAgIHByaW50LnRva2VucyAnZWxzZSBpZiB0aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRobiA9IEB0aGVuICdlbGlmIHRoZW4nIHRva2Vuc1xuXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBleHA6ICBleHBcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogQHNjb3BlIHRoblxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdlbHNlJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxzZSA9IEBzY29wZSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnaWYgbGVmdG92ZXInIHRva2VucyBpZiB0b2tlbnMubGVuZ3RoIGFuZCBAZGVidWdcblxuICAgICAgICBlXG5cbiAgICAjIyNcbiAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyMjXG4gICAgXG4gICAgZm9yOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuXG4gICAgICAgICMgcHJpbnQudG9rZW5zICdmb3InIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB2YWxzID0gQGV4cHMgJ2ZvciB2YWxzJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSB2YWxzWzBdIGlmIHZhbHMubGVuZ3RoID09IDFcblxuICAgICAgICAjIHByaW50LnRva2VucyAnaW5vZicgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICAjIHByaW50LnRva2VucyAnbGlzdCcgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2ZvciB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG5cbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICAgbGlzdFxuICAgICAgICAgICAgdGhlbjogICBAc2NvcGUgdGhuXG4gICAgICAgICAgICBcbiAgICAjIyNcbiAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMjI1xuICAgIFxuICAgIHdoaWxlOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ3doaWxlIHRoZW58YmxvY2snIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ3doaWxlIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICB3aGlsZTpcbiAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgIHRoZW46IEBzY29wZSB0aG5cbiAgICAgICAgXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4gICAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMjI1xuXG4gICAgc3dpdGNoOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIG1hdGNoID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBvcCAnc3dpdGNoJ1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yICdwYXJzZXIuc3dpdGNoOiBibG9jayBleHBlY3RlZCEnXG4gICAgICAgIFxuICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCB3aGVucycgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgd2hlbnMgPSBbXVxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ3doZW4nXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCB3aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZSA9IHN3aXRjaDpcbiAgICAgICAgICAgICAgICBtYXRjaDogIG1hdGNoXG4gICAgICAgICAgICAgICAgd2hlbnM6ICB3aGVuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdzd2l0Y2ggZWxzZT8nIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCBlbHNlJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuc3dpdGNoLmVsc2UgPSBAZXhwcyAnZWxzZScgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgZVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICd3aGVuIHZhbHMnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgQHZlcmIgJ3doZW4udmFscyB0b2tlbnNbMF0nIHRva2Vuc1swXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgKHRva2Vuc1swXT8gYW5kICh0b2tlbnNbMF0udHlwZSBub3QgaW4gWydibG9jaycnbmwnXSkgYW5kIHRva2Vuc1swXS50ZXh0ICE9ICd0aGVuJylcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWwnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIHZhbHMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICd3aGVuIHRoZW4nIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIEB2ZXJiICd3aGVuLnRoZW4gdG9rZW5zWzBdJyB0b2tlbnNbMF1cbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGVuIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHdoZW46XG4gICAgICAgICAgICB2YWxzOiB2YWxzXG4gICAgICAgICAgICB0aGVuOiBAc2NvcGUgdGhuXG5cbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMjI1xuXG4gICAgY2xhc3M6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnY2xhc3MnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIHByaW50LnRva2VucyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBib2R5JyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQubm9vbiAnYmVmb3JlIGNsYXNzIGJvZHknIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgICAgIGUuY2xhc3MuYm9keSA9IEBleHBzICdjbGFzcyBib2R5JyB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZlcmIgJ25vIGNsYXNzIGJvZHkhJ1xuXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuYXN0ICdlLmNsYXNzLmJvZHknIGUuY2xhc3MuYm9keVxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBwb3AnIHRva2VucyBcblxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgYm9keSA9IEBzY29wZSBAZXhwcyAnZnVuYyBib2R5JyB0b2tlbnMsICdubCdcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2Z1bmMnXG4gICAgICAgIFxuICAgICAgICBlID0gZnVuYzp7fVxuICAgICAgICBlLmZ1bmMuYXJncyAgPSBhcmdzIGlmIGFyZ3NcbiAgICAgICAgZS5mdW5jLmFycm93ID0gYXJyb3dcbiAgICAgICAgZS5mdW5jLmJvZHkgID0gYm9keVxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlICE9ICdubCdcbiAgICAgICAgICAgIHZhbCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBlID0gcmV0dXJuOiByZXQ6IHRva1xuICAgICAgICBlLnJldHVybi52YWwgPSB2YWwgaWYgdmFsXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjYWxsLm9wZW4nIHRva2VucyBpZiBAZGVidWdcblxuICAgICAgICB0b2sgPSB0b2sudG9rZW4gaWYgdG9rLnRva2VuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgQHB1c2ggJ29uZWFyZydcbiAgICAgICAgXG4gICAgICAgIGxhc3QgPSBAbGFzdExpbmVDb2wgdG9rXG4gICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcoJyBhbmQgdG9rZW5zWzBdLmxpbmUgPT0gbGFzdC5saW5lIGFuZCB0b2tlbnNbMF0uY29sID09IGxhc3QuY29sXG4gICAgICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBhcmdzID0gW11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJ2NhbGwnIHRva2VucywgJyknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnY2FsbCBhcmdzJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICBhcmdzID0gQGJsb2NrICdjYWxsJyB0b2tlbnNcbiAgICAgICAgICAgIHByaW50LmFzdCAnY2FsbCBhcmdzJyBhcmdzIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIG9wZW4gYW5kIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBpZiBvcGVuIGFuZCBub3QgY2xvc2VcbiAgICAgICAgICAgIGVycm9yICdleHBlY3RlZCApJ1xuXG4gICAgICAgIHByaW50LnRva2VucyAnY2FsbC5jbG9zZScgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgQHBvcCAnb25lYXJnJ1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGUgPSBjYWxsOiBjYWxsZWU6IHRva1xuICAgICAgICBlLmNhbGwub3BlbiAgPSBvcGVuICBpZiBvcGVuXG4gICAgICAgIGUuY2FsbC5xbXJrICA9IHFtcmsgIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZSBpZiBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0ICdvcGVyYXRpb24gbGhzJyBsaHMgaWYgQGRlYnVnXG4gICAgICAgIHByaW50LnRva2VucyBcIm9wZXJhdGlvbiAje2xocz8udGV4dH0gI3tvcC50ZXh0fVwiIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIGlmIG9wLnRleHQgPT0gJz0nXG4gICAgICAgICAgICAjIHJocyA9IEBibG9ja0V4cCAnb3BlcmF0aW9uIGxocycgdG9rZW5zXG4gICAgICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0ICdvcGVyYXRpb24gcmhzJyByaHMgaWYgQGRlYnVnXG4gICAgICAgIHByaW50LnRva2VucyBcIm9wZXJhdGlvbiAje3Jocz8udGV4dH0gI3tvcC50ZXh0fVwiIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgXG4gICAgICAgIEBwb3AgXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgZSA9IG9wZXJhdGlvbjoge31cbiAgICAgICAgZS5vcGVyYXRpb24ubGhzICAgICAgPSBsaHMgaWYgbGhzXG4gICAgICAgIGUub3BlcmF0aW9uLm9wZXJhdG9yID0gb3BcbiAgICAgICAgZS5vcGVyYXRpb24ucmhzICAgICAgPSByaHMgaWYgcmhzXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAobGhzLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpbnRvayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBpbmNvbmQ6XG4gICAgICAgICAgICBsaHM6IGxoc1xuICAgICAgICAgICAgaW46ICBpbnRva1xuICAgICAgICAgICAgcmhzOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGFycmF5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIHJldHVybiBhcnJheTpcbiAgICAgICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICdbJ1xuXG4gICAgICAgIGl0ZW1zID0gQGV4cHMgJ1snIHRva2VucywgJ10nXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJyB0aGVuIGNsb3NlID0gdG9rZW5zLnNoaWZ0KCkgZWxzZSBjbG9zZSA9IHRleHQ6J10nIHR5cGU6J3BhcmVuJyBsaW5lOi0xIGNvbDotMSBcblxuICAgICAgICBAcG9wICdbJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaycgYW5kIEBzdGFja1stMV0gbm90IGluIFsnZm9yJyAnaWYnXVxuICAgICAgICAgICAgQHZlcmIgJ2Z1Y2tlZCB1cCBpbmRlbnRhdGlvbiEgYmxvY2sgYWZ0ZXIgYXJyYXkhIGZsYXR0ZW5pbmcgYmxvY2sgdG9rZW5zOidcbiAgICAgICAgICAgIHByaW50LnRva2VucyAndG9rZW5zIGJlZm9yZSBzcGxpY2UnIHRva2VucyBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgdG9rZW5zLnNwbGljZS5hcHBseSB0b2tlbnMsIFswIDFdLmNvbmNhdCB0b2tlbnNbMF0udG9rZW5zXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3Rva2VucyBhZnRlciBzcGxpY2UnIHRva2VucyBpZiBAdmVyYm9zZVxuXG4gICAgICAgIGFycmF5OlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNsaWNlOiAoZnJvbSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGRvdHMgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIHVwdG8gPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIGlmIG5vdCB1cHRvIHRoZW4gcmV0dXJuIGVycm9yIFwibm8gc2xpY2UgZW5kIVwiXG4gICAgICAgIFxuICAgICAgICBzbGljZTpcbiAgICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgICAgIGRvdHM6IGRvdHNcbiAgICAgICAgICAgIHVwdG86IHVwdG9cblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZHgnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdpbmRleC5vcGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIHNsaWNlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBwcmludC50b2tlbnMgJ2luZGV4LmNsb3NlJyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciAnZXhwZWN0ZWQgXSdcblxuICAgICAgICBAcG9wICdpZHgnXG5cbiAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICBpZHhlZTogdG9rXG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgc2xpZHg6IHNsaWNlXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnKCdcblxuICAgICAgICBleHBzID0gQGV4cHMgJygnIHRva2VucywgJyknXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciAnbmV4dCB0b2tlbiBub3QgYSApJ1xuXG4gICAgICAgIEBwb3AgJygnXG5cbiAgICAgICAgcGFyZW5zOlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGV4cHM6ICBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgICAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBjdXJseTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0OlxuICAgICAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgICAgICBrZXl2YWxzOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICd7JyB0b2tlbnMsICd9J1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfScgdGhlbiBjbG9zZSA9IHRva2Vucy5zaGlmdCgpIGVsc2UgY2xvc2UgPSB0ZXh0Oid9JyB0eXBlOidwYXJlbicgbGluZTotMSBjb2w6LTEgXG5cbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG4gICAgICAgICAgICBjbG9zZTogICBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGZpcnN0ID0gQGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgXG4gICAgICAgIHByaW50LnRva2VucyAnb2JqZWN0IHZhbCcgdG9rZW5zIGlmIEBkZWJ1Z1xuICAgICAgICBcbiAgICAgICAgZXhwcyA9IFtAa2V5dmFsIGtleSwgdG9rZW5zXVxuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdvYmplY3QgY29udGludWUuLi4/JyB0b2tlbnMgaWYgQGRlYnVnXG5cbiAgICAgICAgdG9rZW5zLnNoaWZ0KCkgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPyBhbmQgKHRva2Vuc1swXS5jb2wgPT0gZmlyc3QuY29sIG9yIHRva2Vuc1swXS5saW5lID09IGZpcnN0LmxpbmUpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCBub3QgaW4gJ10pJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdjb250aW51ZSBvYmplY3QuLi4nIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1swXS5saW5lID09IGZpcnN0LmxpbmUgdGhlbiBzdG9wPSdubCcgZWxzZSBzdG9wPW51bGxcbiAgICAgICAgICAgICAgICBleHBzID0gZXhwcy5jb25jYXQgQGV4cHMgJ29iamVjdCcgdG9rZW5zLCBzdG9wXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdvYmplY3QgcG9wJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnOidcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KCkgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cHMgJ2tleXZhbCB2YWx1ZScgYmxvY2sudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBpZiBrZXkudHlwZSBpbiBbJ2tleXdvcmQnICdvcCcgJ3B1bmN0J11cbiAgICAgICAgICAgIGtleS50eXBlID0gJ3NpbmdsZSdcbiAgICAgICAgICAgIGtleS50ZXh0ID0gXCInI3trZXkudGV4dH0nXCJcbiAgICAgICAgZWxzZSBpZiBrZXkudHlwZSA9PSAndmFyJ1xuICAgICAgICAgICAga2V5LnR5cGUgPSAna2V5J1xuICAgICAgICBlbHNlIGlmIGtleS5wcm9wXG4gICAgICAgICAgICB7bGluZSwgY29sfSA9IEBmaXJzdExpbmVDb2wga2V5XG4gICAgICAgICAgICBrZXkgPSBcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2luZ2xlJ1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiJyN7QGtvZGUucmVuZGVyZXIubm9kZSBrZXl9J1wiXG4gICAgICAgICAgICAgICAgbGluZTogbGluZVxuICAgICAgICAgICAgICAgIGNvbDogIGNvbFxuXG4gICAgICAgIGtleXZhbDpcbiAgICAgICAgICAgIGtleTogICBrZXlcbiAgICAgICAgICAgIGNvbG9uOiBjb2xvblxuICAgICAgICAgICAgdmFsOiAgIHZhbHVlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgdGhpczogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHR5cGU6J3B1bmN0JyB0ZXh0OicuJyBsaW5lOm9iai5saW5lLCBjb2w6b2JqLmNvbFxuICAgICAgICAgICAgcHJvcDogdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIl19
//# sourceURL=../coffee/parser.coffee
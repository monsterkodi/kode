// koffee 1.20.0

/*
00000000    0000000   00000000    0000000  00000000  00000000
000   000  000   000  000   000  000       000       000   000
00000000   000000000  0000000    0000000   0000000   0000000
000        000   000  000   000       000  000       000   000
000        000   000  000   000  0000000   00000000  000   000
 */
var Parse, Parser, empty, firstLineCol, lastLineCol, print, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = Object.hasOwn,
    indexOf = [].indexOf;

print = require('./print');

Parse = require('./parse');

ref = require('./utils'), firstLineCol = ref.firstLineCol, lastLineCol = ref.lastLineCol, empty = ref.empty;

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

    Parser.prototype["if"] = function(tok, tokens) {
        var base, cond, e, ref1, ref2, ref3, thn;
        this.push('if');
        cond = this.exp(tokens);
        thn = this.then('then', tokens);
        e = {
            "if": {
                cond: cond,
                then: this.scope(thn)
            }
        };
        while (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'else' && ((ref2 = tokens[1]) != null ? ref2.text : void 0) === 'if') {
            tokens.shift();
            tokens.shift();
            if ((base = e["if"]).elifs != null) {
                base.elifs;
            } else {
                base.elifs = [];
            }
            cond = this.exp(tokens);
            thn = this.then('elif', tokens);
            e["if"].elifs.push({
                elif: {
                    cond: cond,
                    then: this.scope(thn)
                }
            });
        }
        if (((ref3 = tokens[0]) != null ? ref3.text : void 0) === 'else') {
            tokens.shift();
            e["if"]["else"] = this.scope(this.block('else', tokens));
        }
        this.pop('if');
        return e;
    };

    Parser.prototype.ifTail = function(e, tok, tokens) {
        return {
            "if": {
                cond: this.exp(tokens),
                then: this.scope([e])
            }
        };
    };

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

    Parser.prototype["while"] = function(tok, tokens) {
        var cond, thn;
        this.push('while');
        cond = this.exp(tokens);
        thn = this.then('while then', tokens);
        this.pop('while');
        return {
            "while": {
                cond: cond,
                then: this.scope(thn)
            }
        };
    };

    Parser.prototype["switch"] = function(tok, tokens) {
        var e, match, ref1, ref2, ref3, whens;
        this.push('switch');
        match = this.exp(tokens);
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
        } else {
            this.pop('switch');
            return console.error('parser.switch: block expected!');
        }
        whens = [];
        while (((ref2 = tokens[0]) != null ? ref2.text : void 0) === 'when') {
            whens.push(this.exp(tokens));
        }
        e = {
            "switch": {
                match: match,
                whens: whens
            }
        };
        if (((ref3 = tokens[0]) != null ? ref3.text : void 0) === 'else') {
            tokens.shift();
            e["switch"]["else"] = this.exps('else', tokens, 'nl');
        }
        this.pop('switch');
        return e;
    };

    Parser.prototype.when = function(tok, tokens) {
        var ref1, thn, vals;
        this.push('when');
        vals = [];
        while ((tokens[0] != null) && ((ref1 = tokens[0].type) !== 'block' && ref1 !== 'nl') && tokens[0].text !== 'then') {
            vals.push(this.exp(tokens));
        }
        thn = this.then('when then', tokens);
        this.pop('when');
        return {
            when: {
                vals: vals,
                then: this.scope(thn)
            }
        };
    };

    Parser.prototype["class"] = function(tok, tokens) {
        var e, name, ref1, ref2;
        this.push('class');
        name = tokens.shift();
        e = {
            "class": {
                name: name
            }
        };
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'extends') {
            tokens.shift();
            e["class"]["extends"] = this.exps('class extends', tokens, 'nl');
        }
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
            tokens = tokens.shift().tokens;
            e["class"].body = this.exps('class body', tokens);
            this.nameMethods(e["class"].body[0].object.keyvals);
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
        var e, ref1, val;
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) !== 'nl') {
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
        var args, close, e, last, name, open, ref1, ref2, ref3, ref4;
        this.push('call');
        if (tok.token) {
            tok = tok.token;
        }
        last = lastLineCol(tok);
        if (tokens[0].text === '(' && tokens[0].line === last.line && tokens[0].col === last.col) {
            open = tokens.shift();
            if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ')') {
                args = [];
            } else {
                this.push('args(');
                args = this.exps('(', tokens, ')');
                this.pop('args(');
            }
        } else {
            if (tok.type === 'keyword' && ((ref2 = tok.text) === 'typeof' || ref2 === 'delete')) {
                name = 'arg';
            } else {
                name = 'args';
            }
            args = this.block(name, tokens);
        }
        if (open) {
            if (((ref3 = tokens[0]) != null ? ref3.text : void 0) === ')') {
                close = tokens.shift();
            } else if (((ref4 = tokens[0]) != null ? ref4.type : void 0) === 'nl' && tokens[1].text === ')') {
                this.shiftNewline('implicit call ends', tokens);
                close = tokens.shift();
            }
        }
        if (open && !close) {
            console.error('parser.call explicit call without closing )');
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
        if (op.text === '=') {
            rhs = this.exp(tokens);
        } else {
            rhs = this.exp(tokens);
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
        var close, items, ref1;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ']') {
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
        close = this.shiftClose('array', ']', tokens);
        this.pop('[');
        return {
            array: {
                open: open,
                items: items,
                close: close
            }
        };
    };

    Parser.prototype.slice = function(from, tokens) {
        var dots, ref1, upto;
        dots = tokens.shift();
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ']') {
            upto = null;
        } else {
            upto = this.exp(tokens);
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
        var close, open, ref1, slice;
        this.push('idx');
        open = tokens.shift();
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'dots') {
            slice = this.slice(null, tokens);
        } else {
            slice = this.exp(tokens);
        }
        close = this.shiftClose('index', ']', tokens);
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
        var close, exps;
        this.push('(');
        exps = this.exps('(', tokens, ')');
        close = this.shiftClose('parens', ')', tokens);
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
        var close, exps, ref1;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === '}') {
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
        close = this.shiftClose('curly', '}', tokens);
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
        var exps, first, ref1, ref2, ref3, ref4, ref5;
        this.push('{');
        first = firstLineCol(key);
        exps = [this.keyval(key, tokens)];
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl') {
            if (((ref2 = tokens[1]) != null ? ref2.col : void 0) >= first.col && (ref3 = tokens[1].text, indexOf.call('])', ref3) < 0)) {
                this.shiftNewline('continue block object ...', tokens);
                exps = exps.concat(this.exps('object', tokens));
            }
        } else {
            if (((ref4 = tokens[0]) != null ? ref4.line : void 0) === first.line && (ref5 = tokens[0].text, indexOf.call('])};', ref5) < 0)) {
                exps = exps.concat(this.exps('object', tokens, ';'));
            }
        }
        this.pop('{');
        return {
            object: {
                keyvals: exps
            }
        };
    };

    Parser.prototype.keyval = function(key, tokens) {
        var block, col, colon, line, ref1, ref2, ref3, text, value;
        colon = tokens.shift();
        this.push(':');
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            block = tokens.shift();
            value = this.exps('keyval value', block.tokens);
        } else {
            value = this.exp(tokens);
        }
        this.pop(':');
        if ((ref2 = key.type) === 'keyword' || ref2 === 'op' || ref2 === 'punct' || ref2 === 'var' || ref2 === 'this') {
            key.type = 'key';
            key.text = key.text;
        } else if (key.prop) {
            ref3 = firstLineCol(key), line = ref3.line, col = ref3.col;
            text = this.kode.renderer.node(key);
            if (text.startsWith('this')) {
                if (text === 'this') {
                    text = '@';
                } else if (text.startsWith('this.')) {
                    text = '@' + text.slice(5);
                }
            }
            delete key.prop;
            key.type = 'key';
            key.text = text;
            key.line = line;
            key.col = col;
        } else {
            console.log('WHAT COULD THAT BE?', key);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFUixNQUF1QyxPQUFBLENBQVEsU0FBUixDQUF2QyxFQUFFLCtCQUFGLEVBQWdCLDZCQUFoQixFQUE2Qjs7QUFFdkI7Ozs7Ozs7cUJBRUYsS0FBQSxHQUFPLFNBQUMsSUFBRDtlQUVIO1lBQUEsSUFBQSxFQUFNLEVBQU47WUFDQSxJQUFBLEVBQU0sSUFETjs7SUFGRzs7c0JBV1AsSUFBQSxHQUFJLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFFQSxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOO1FBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtRQUVQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYSxNQUFiO1FBRU4sQ0FBQSxHQUFJO1lBQUEsQ0FBQSxFQUFBLENBQUEsRUFDSTtnQkFBQSxJQUFBLEVBQVEsSUFBUjtnQkFDQSxJQUFBLEVBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQLENBRFI7YUFESjs7QUFJSixpREFBZSxDQUFFLGNBQVgsS0FBbUIsTUFBbkIsc0NBQXVDLENBQUUsY0FBWCxLQUFtQixJQUF2RDtZQUVJLE1BQU0sQ0FBQyxLQUFQLENBQUE7WUFDQSxNQUFNLENBQUMsS0FBUCxDQUFBOztvQkFFSSxDQUFDOztvQkFBRCxDQUFDLFFBQVM7O1lBRWQsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtZQUVQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYSxNQUFiO1lBRU4sQ0FBQyxFQUFDLEVBQUQsRUFBRyxDQUFD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O2VBRUY7WUFBQSxJQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFNLEdBQU47Z0JBQ0EsR0FBQSxFQUFNLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FETjtnQkFFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUZOO2FBREo7O0lBRkU7O3NCQWFOLE1BQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxNQUFOO2VBRUY7WUFBQSxJQUFBLEVBQ0k7Z0JBQUEsR0FBQSxFQUFNLEdBQU47Z0JBQ0EsR0FBQSxFQUFNO29CQUFBLElBQUEsRUFBSyxPQUFMO29CQUFhLElBQUEsRUFBSyxHQUFsQjtvQkFBc0IsSUFBQSxFQUFLLEdBQUcsQ0FBQyxJQUEvQjtvQkFBcUMsR0FBQSxFQUFJLEdBQUcsQ0FBQyxHQUE3QztpQkFETjtnQkFFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUZOO2FBREo7O0lBRkU7Ozs7R0FwaEJXOztBQTJoQnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5QYXJzZSA9IHJlcXVpcmUgJy4vcGFyc2UnXG5cbnsgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCwgZW1wdHkgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlciBleHRlbmRzIFBhcnNlXG5cbiAgICBzY29wZTogKGV4cHMpIC0+XG4gICAgICAgIFxuICAgICAgICB2YXJzOiBbXVxuICAgICAgICBleHBzOiBleHBzXG4gICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAndGhlbicgdG9rZW5zXG5cbiAgICAgICAgZSA9IGlmOlxuICAgICAgICAgICAgICAgIGNvbmQ6ICAgY29uZFxuICAgICAgICAgICAgICAgIHRoZW46ICAgQHNjb3BlIHRoblxuXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZScgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaWYnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsaWZzID89IFtdXG5cbiAgICAgICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgICAgICB0aG4gPSBAdGhlbiAnZWxpZicgdG9rZW5zXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMucHVzaFxuICAgICAgICAgICAgICAgIGVsaWY6XG4gICAgICAgICAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogQHNjb3BlIHRoblxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbHNlID0gQHNjb3BlIEBibG9jayAnZWxzZScgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnaWYnXG5cbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaWZUYWlsOiAoZSwgdG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZjpcbiAgICAgICAgICAgIGNvbmQ6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICB0aGVuOiBAc2NvcGUgW2VdXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGZvcjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcblxuICAgICAgICB2YWxzID0gQGV4cHMgJ2ZvciB2YWxzJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSB2YWxzWzBdIGlmIHZhbHMubGVuZ3RoID09IDFcblxuICAgICAgICBpbm9mID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiA9IEB0aGVuICdmb3IgdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICAgdmFsc1xuICAgICAgICAgICAgaW5vZjogICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgIGxpc3RcbiAgICAgICAgICAgIHRoZW46ICAgQHNjb3BlIHRoblxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgd2hpbGU6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGlsZSB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiBAc2NvcGUgdGhuXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgbWF0Y2ggPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcG9wICdzd2l0Y2gnXG4gICAgICAgICAgICByZXR1cm4gZXJyb3IgJ3BhcnNlci5zd2l0Y2g6IGJsb2NrIGV4cGVjdGVkISdcbiAgICAgICAgXG4gICAgICAgIHdoZW5zID0gW11cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICd3aGVuJ1xuICAgICAgICAgICAgd2hlbnMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGUgPSBzd2l0Y2g6XG4gICAgICAgICAgICAgICAgbWF0Y2g6ICBtYXRjaFxuICAgICAgICAgICAgICAgIHdoZW5zOiAgd2hlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5zd2l0Y2guZWxzZSA9IEBleHBzICdlbHNlJyB0b2tlbnMsICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBlXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGVuIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHdoZW46XG4gICAgICAgICAgICB2YWxzOiB2YWxzXG4gICAgICAgICAgICB0aGVuOiBAc2NvcGUgdGhuXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NsYXNzJ1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICAgICAgZS5jbGFzcy5ib2R5ID0gQGV4cHMgJ2NsYXNzIGJvZHknIHRva2Vuc1xuICAgICAgICAgICAgQG5hbWVNZXRob2RzIGUuY2xhc3MuYm9keVswXS5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgYm9keSA9IEBzY29wZSBAZXhwcyAnZnVuYyBib2R5JyB0b2tlbnMsICdubCdcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2Z1bmMnXG4gICAgICAgIFxuICAgICAgICBlID0gZnVuYzp7fVxuICAgICAgICBlLmZ1bmMuYXJncyAgPSBhcmdzIGlmIGFyZ3NcbiAgICAgICAgZS5mdW5jLmFycm93ID0gYXJyb3dcbiAgICAgICAgZS5mdW5jLmJvZHkgID0gYm9keVxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlICE9ICdubCdcbiAgICAgICAgICAgIHZhbCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBlID0gcmV0dXJuOiByZXQ6IHRva1xuICAgICAgICBlLnJldHVybi52YWwgPSB2YWwgaWYgdmFsXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCB0b2tcbiAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJygnIGFuZCB0b2tlbnNbMF0ubGluZSA9PSBsYXN0LmxpbmUgYW5kIHRva2Vuc1swXS5jb2wgPT0gbGFzdC5jb2xcbiAgICAgICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICdhcmdzKCdcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJygnIHRva2VucywgJyknXG4gICAgICAgICAgICAgICAgQHBvcCAnYXJncygnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJnJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJncydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXJncyA9IEBibG9jayBuYW1lLCB0b2tlbnNcblxuICAgICAgICBpZiBvcGVuIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2ltcGxpY2l0IGNhbGwgZW5kcycgdG9rZW5zXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIG9wZW4gYW5kIG5vdCBjbG9zZVxuICAgICAgICAgICAgZXJyb3IgJ3BhcnNlci5jYWxsIGV4cGxpY2l0IGNhbGwgd2l0aG91dCBjbG9zaW5nICknXG5cbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGUgPSBjYWxsOiBjYWxsZWU6IHRva1xuICAgICAgICBlLmNhbGwub3BlbiAgPSBvcGVuICBpZiBvcGVuXG4gICAgICAgIGUuY2FsbC5xbXJrICA9IHFtcmsgIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZSBpZiBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3AudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgZSA9IG9wZXJhdGlvbjoge31cbiAgICAgICAgZS5vcGVyYXRpb24ubGhzICAgICAgPSBsaHMgaWYgbGhzXG4gICAgICAgIGUub3BlcmF0aW9uLm9wZXJhdG9yID0gb3BcbiAgICAgICAgZS5vcGVyYXRpb24ucmhzICAgICAgPSByaHMgaWYgcmhzXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAobGhzLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpbnRvayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBpbmNvbmQ6XG4gICAgICAgICAgICBsaHM6IGxoc1xuICAgICAgICAgICAgaW46ICBpbnRva1xuICAgICAgICAgICAgcmhzOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGFycmF5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIHJldHVybiBhcnJheTpcbiAgICAgICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICdbJ1xuXG4gICAgICAgIGl0ZW1zID0gQGV4cHMgJ1snIHRva2VucywgJ10nXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnYXJyYXknICddJyB0b2tlbnNcblxuICAgICAgICBAcG9wICdbJ1xuICAgICAgICBcbiAgICAgICAgYXJyYXk6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6IChmcm9tLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90cyA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgdXB0byA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdXB0byA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgc2xpY2U6XG4gICAgICAgICAgICBmcm9tOiBmcm9tXG4gICAgICAgICAgICBkb3RzOiBkb3RzXG4gICAgICAgICAgICB1cHRvOiB1cHRvXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWR4J1xuXG4gICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdkb3RzJ1xuICAgICAgICAgICAgc2xpY2UgPSBAc2xpY2UgbnVsbCwgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNsaWNlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdpbmRleCcgJ10nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnaWR4J1xuXG4gICAgICAgIGluZGV4OlxuICAgICAgICAgICAgaWR4ZWU6IHRva1xuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIHNsaWR4OiBzbGljZVxuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBwYXJlbnM6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJygnXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICcoJyB0b2tlbnMsICcpJ1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ3BhcmVucycgJyknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnKCdcblxuICAgICAgICBwYXJlbnM6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgZXhwczogIGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDBcblxuICAgIGN1cmx5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfSdcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q6XG4gICAgICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAgICAgIGtleXZhbHM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ3snIHRva2VucywgJ30nXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnY3VybHknICd9JyB0b2tlbnNcblxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiAgIGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgb2JqZWN0OiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wga2V5XG4gICAgICAgIFxuICAgICAgICBleHBzID0gW0BrZXl2YWwga2V5LCB0b2tlbnNdXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgaWYgdG9rZW5zWzFdPy5jb2wgPj0gZmlyc3QuY29sIGFuZCB0b2tlbnNbMV0udGV4dCBub3QgaW4gJ10pJ1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2NvbnRpbnVlIGJsb2NrIG9iamVjdCAuLi4nIHRva2Vuc1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy5saW5lID09IGZpcnN0LmxpbmUgYW5kIHRva2Vuc1swXS50ZXh0IG5vdCBpbiAnXSl9OydcbiAgICAgICAgICAgICAgICBleHBzID0gZXhwcy5jb25jYXQgQGV4cHMgJ29iamVjdCcgdG9rZW5zLCAnOydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAga2V5dmFsOiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICc6J1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHBzICdrZXl2YWwgdmFsdWUnIGJsb2NrLnRva2Vuc1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgdmFsdWUgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJzonXG5cbiAgICAgICAgaWYga2V5LnR5cGUgaW4gWydrZXl3b3JkJyAnb3AnICdwdW5jdCcgJ3ZhcicgJ3RoaXMnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrZXkudHlwZSA9ICdrZXknXG4gICAgICAgICAgICBrZXkudGV4dCA9IGtleS50ZXh0XG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBrZXkucHJvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB7bGluZSwgY29sfSA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgICAgIHRleHQgPSBAa29kZS5yZW5kZXJlci5ub2RlIGtleVxuICAgICAgICAgICAgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzJ1xuICAgICAgICAgICAgICAgIGlmIHRleHQgPT0gJ3RoaXMnIHRoZW4gdGV4dCA9ICdAJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzLicgdGhlbiB0ZXh0ID0gJ0AnICsgdGV4dFs1Li5dXG4gICAgICAgICAgICBkZWxldGUga2V5LnByb3BcbiAgICAgICAgICAgIGtleS50eXBlID0gJ2tleSdcbiAgICAgICAgICAgIGtleS50ZXh0ID0gdGV4dFxuICAgICAgICAgICAga2V5LmxpbmUgPSBsaW5lXG4gICAgICAgICAgICBrZXkuY29sICA9IGNvbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ1dIQVQgQ09VTEQgVEhBVCBCRT8nIGtleVxuXG4gICAgICAgIGtleXZhbDpcbiAgICAgICAgICAgIGtleTogICBrZXlcbiAgICAgICAgICAgIGNvbG9uOiBjb2xvblxuICAgICAgICAgICAgdmFsOiAgIHZhbHVlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgdGhpczogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHR5cGU6J3B1bmN0JyB0ZXh0OicuJyBsaW5lOm9iai5saW5lLCBjb2w6b2JqLmNvbFxuICAgICAgICAgICAgcHJvcDogdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIl19
//# sourceURL=../coffee/parser.coffee
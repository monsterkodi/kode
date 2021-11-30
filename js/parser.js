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
            return this.error({
                pop: 'switch',
                msg: 'block expected!'
            }, tokens);
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
            this.error({
                hdr: 'call',
                msg: 'explicit call without closing )'
            }, tokens);
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
        var block, col, colon, k, line, ref1, ref2, ref3, text, value;
        colon = tokens.shift();
        this.push(':');
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'block') {
            block = tokens.shift();
            value = this.exps('keyval value', block.tokens);
        } else {
            value = this.exp(tokens);
        }
        this.pop(':');
        k = {
            type: 'key'
        };
        if (key.type) {
            if ((ref2 = key.type) !== 'keyword' && ref2 !== 'op' && ref2 !== 'punct' && ref2 !== 'var' && ref2 !== 'this' && ref2 !== 'num' && ref2 !== 'single' && ref2 !== 'double' && ref2 !== 'triple') {
                console.log('what could that be?', key);
            }
            k.text = key.text;
            k.line = key.line;
            k.col = key.col;
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
            k.text = text;
            k.line = line;
            k.col = col;
        } else {
            console.log('WHAT COULD THAT BE?', key);
        }
        return {
            keyval: {
                key: k,
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

    Parser.prototype.assert = function(obj, tokens) {
        return {
            assert: {
                obj: obj,
                qmrk: tokens.shift()
            }
        };
    };

    Parser.prototype.qmrkop = function(lhs, tokens) {
        return {
            qmrkop: {
                lhs: lhs,
                qmrk: tokens.shift(),
                rhs: this.exp(tokens)
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

    Parser.prototype.error = function(o, tokens) {
        var ref1, ref2, ref3;
        if (o.pop) {
            this.pop(o.pop);
        }
        console.error(B3(b7(" " + ((ref1 = (ref2 = tokens[0]) != null ? ref2.line : void 0) != null ? ref1 : ' ') + " ")) + R1(y4(" " + ((ref3 = o.hdr) != null ? ref3 : o.pop) + " ")) + R2(y7(" " + o.msg + " ")));
        return null;
    };

    return Parser;

})(Parse);

module.exports = Parser;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFUixNQUF1QyxPQUFBLENBQVEsU0FBUixDQUF2QyxFQUFFLCtCQUFGLEVBQWdCLDZCQUFoQixFQUE2Qjs7QUFFdkI7Ozs7Ozs7cUJBRUYsS0FBQSxHQUFPLFNBQUMsSUFBRDtlQUVIO1lBQUEsSUFBQSxFQUFNLEVBQU47WUFDQSxJQUFBLEVBQU0sSUFETjs7SUFGRzs7c0JBV1AsSUFBQSxHQUFJLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFFQSxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOO1FBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtRQUVQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYSxNQUFiO1FBRU4sQ0FBQSxHQUFJO1lBQUEsQ0FBQSxFQUFBLENBQUEsRUFDSTtnQkFBQSxJQUFBLEVBQVEsSUFBUjtnQkFDQSxJQUFBLEVBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQLENBRFI7YUFESjs7QUFJSixpREFBZSxDQUFFLGNBQVgsS0FBbUIsTUFBbkIsc0NBQXVDLENBQUUsY0FBWCxLQUFtQixJQUF2RDtZQUVJLE1BQU0sQ0FBQyxLQUFQLENBQUE7WUFDQSxNQUFNLENBQUMsS0FBUCxDQUFBOztvQkFFSSxDQUFDOztvQkFBRCxDQUFDLFFBQVM7O1lBRWQsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtZQUVQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYSxNQUFiO1lBRU4sQ0FBQyxFQUFDLEVBQUQsRUFBRyxDQUFD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R0FBQSxFQUFJLEdBQUcsQ0FBQyxHQUE3QztpQkFETjtnQkFFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUZOO2FBREo7O0lBRkU7O3FCQU9OLEtBQUEsR0FBTyxTQUFDLENBQUQsRUFBSSxNQUFKO0FBRUgsWUFBQTtRQUFBLElBQWMsQ0FBQyxDQUFDLEdBQWhCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsR0FBUCxFQUFBOztRQUFtQixPQUFBLENBQ25CLEtBRG1CLENBQ2IsRUFBQSxDQUFHLEVBQUEsQ0FBRyxHQUFBLEdBQUcsMkVBQW1CLEdBQW5CLENBQUgsR0FBMEIsR0FBN0IsQ0FBSCxDQUFBLEdBQXVDLEVBQUEsQ0FBRyxFQUFBLENBQUcsR0FBQSxHQUFHLGlDQUFTLENBQUMsQ0FBQyxHQUFYLENBQUgsR0FBa0IsR0FBckIsQ0FBSCxDQUF2QyxHQUFzRSxFQUFBLENBQUcsRUFBQSxDQUFHLEdBQUEsR0FBSSxDQUFDLENBQUMsR0FBTixHQUFVLEdBQWIsQ0FBSCxDQUR6RDtlQUVuQjtJQUpHOzs7O0dBNWlCVTs7QUFrakJyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuUGFyc2UgPSByZXF1aXJlICcuL3BhcnNlJ1xuXG57IGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wsIGVtcHR5IH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBQYXJzZXIgZXh0ZW5kcyBQYXJzZVxuXG4gICAgc2NvcGU6IChleHBzKSAtPlxuICAgICAgICBcbiAgICAgICAgdmFyczogW11cbiAgICAgICAgZXhwczogZXhwc1xuICAgIFxuICAgICMgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDBcblxuICAgIGlmOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2lmJ1xuXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ3RoZW4nIHRva2Vuc1xuXG4gICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICBjb25kOiAgIGNvbmRcbiAgICAgICAgICAgICAgICB0aGVuOiAgIEBzY29wZSB0aG5cblxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2lmJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbGlmcyA/PSBbXVxuXG4gICAgICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAgICAgdGhuID0gQHRoZW4gJ2VsaWYnIHRva2Vuc1xuXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICAgICAgICAgIHRoZW46IEBzY29wZSB0aG5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxzZSA9IEBzY29wZSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGlmVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWY6XG4gICAgICAgICAgICBjb25kOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgdGhlbjogQHNjb3BlIFtlXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3I6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdmb3InXG5cbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gdmFsc1swXSBpZiB2YWxzLmxlbmd0aCA9PSAxXG5cbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBsaXN0ID0gQGV4cCB0b2tlbnNcblxuICAgICAgICB0aG4gPSBAdGhlbiAnZm9yIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnZm9yJyBcblxuICAgICAgICBmb3I6XG4gICAgICAgICAgICB2YWxzOiAgIHZhbHNcbiAgICAgICAgICAgIGlub2Y6ICAgaW5vZlxuICAgICAgICAgICAgbGlzdDogICBsaXN0XG4gICAgICAgICAgICB0aGVuOiAgIEBzY29wZSB0aG5cbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHdoaWxlOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hpbGUgdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlOlxuICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgdGhlbjogQHNjb3BlIHRoblxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgc3dpdGNoOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIG1hdGNoID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEBlcnJvciBwb3A6J3N3aXRjaCcgbXNnOidibG9jayBleHBlY3RlZCEnIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgd2hlbnMgPSBbXVxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ3doZW4nXG4gICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZSA9IHN3aXRjaDpcbiAgICAgICAgICAgICAgICBtYXRjaDogIG1hdGNoXG4gICAgICAgICAgICAgICAgd2hlbnM6ICB3aGVuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IFtdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSAodG9rZW5zWzBdPyBhbmQgKHRva2Vuc1swXS50eXBlIG5vdCBpbiBbJ2Jsb2NrJydubCddKSBhbmQgdG9rZW5zWzBdLnRleHQgIT0gJ3RoZW4nKVxuICAgICAgICAgICAgdmFscy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hlbiB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB3aGVuOlxuICAgICAgICAgICAgdmFsczogdmFsc1xuICAgICAgICAgICAgdGhlbjogQHNjb3BlIHRoblxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdjbGFzcydcblxuICAgICAgICBuYW1lID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBlID0gY2xhc3M6XG4gICAgICAgICAgICBuYW1lOm5hbWVcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2V4dGVuZHMnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZS5jbGFzcy5leHRlbmRzID0gQGV4cHMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgICAgIGUuY2xhc3MuYm9keSA9IEBleHBzICdjbGFzcyBib2R5JyB0b2tlbnNcbiAgICAgICAgICAgIEBuYW1lTWV0aG9kcyBlLmNsYXNzLmJvZHlbMF0ub2JqZWN0LmtleXZhbHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnY2xhc3MnXG5cbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAoYXJncywgYXJyb3csIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnZnVuYydcbiAgICAgICAgXG4gICAgICAgIGJvZHkgPSBAc2NvcGUgQGV4cHMgJ2Z1bmMgYm9keScgdG9rZW5zLCAnbmwnXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgZSA9IGZ1bmM6e31cbiAgICAgICAgZS5mdW5jLmFyZ3MgID0gYXJncyBpZiBhcmdzXG4gICAgICAgIGUuZnVuYy5hcnJvdyA9IGFycm93XG4gICAgICAgIGUuZnVuYy5ib2R5ICA9IGJvZHlcbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSAhPSAnbmwnXG4gICAgICAgICAgICB2YWwgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgZSA9IHJldHVybjogcmV0OiB0b2tcbiAgICAgICAgZS5yZXR1cm4udmFsID0gdmFsIGlmIHZhbFxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgY2FsbDogKHRvaywgdG9rZW5zLCBxbXJrKSAtPlxuXG4gICAgICAgIEBwdXNoICdjYWxsJ1xuXG4gICAgICAgIHRvayA9IHRvay50b2tlbiBpZiB0b2sudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBsYXN0ID0gbGFzdExpbmVDb2wgdG9rXG4gICAgICAgIGlmIHRva2Vuc1swXS50ZXh0ID09ICcoJyBhbmQgdG9rZW5zWzBdLmxpbmUgPT0gbGFzdC5saW5lIGFuZCB0b2tlbnNbMF0uY29sID09IGxhc3QuY29sXG4gICAgICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBhcmdzID0gW11cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcHVzaCAnYXJncygnXG4gICAgICAgICAgICAgICAgYXJncyA9IEBleHBzICcoJyB0b2tlbnMsICcpJ1xuICAgICAgICAgICAgICAgIEBwb3AgJ2FyZ3MoJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB0b2sudHlwZSA9PSAna2V5d29yZCcgYW5kIHRvay50ZXh0IGluIFsndHlwZW9mJyAnZGVsZXRlJ11cbiAgICAgICAgICAgICAgICBuYW1lID0gJ2FyZydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBuYW1lID0gJ2FyZ3MnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFyZ3MgPSBAYmxvY2sgbmFtZSwgdG9rZW5zXG5cbiAgICAgICAgaWYgb3BlbiBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnIGFuZCB0b2tlbnNbMV0udGV4dCA9PSAnKSdcbiAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lICdpbXBsaWNpdCBjYWxsIGVuZHMnIHRva2Vuc1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBpZiBvcGVuIGFuZCBub3QgY2xvc2UgdGhlbiBAZXJyb3IgaGRyOidjYWxsJyBtc2c6J2V4cGxpY2l0IGNhbGwgd2l0aG91dCBjbG9zaW5nICknIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ2NhbGwnXG4gICAgICAgIFxuICAgICAgICBlID0gY2FsbDogY2FsbGVlOiB0b2tcbiAgICAgICAgZS5jYWxsLm9wZW4gID0gb3BlbiAgaWYgb3BlblxuICAgICAgICBlLmNhbGwucW1yayAgPSBxbXJrICBpZiBxbXJrXG4gICAgICAgIGUuY2FsbC5hcmdzICA9IGFyZ3NcbiAgICAgICAgZS5jYWxsLmNsb3NlID0gY2xvc2UgaWYgY2xvc2VcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAobGhzLCBvcCwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoIFwib3Aje29wLnRleHR9XCJcbiAgICAgICAgXG4gICAgICAgIGlmIG9wLnRleHQgPT0gJz0nXG4gICAgICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wIFwib3Aje29wLnRleHR9XCJcbiAgICAgICAgXG4gICAgICAgIGUgPSBvcGVyYXRpb246IHt9XG4gICAgICAgIGUub3BlcmF0aW9uLmxocyAgICAgID0gbGhzIGlmIGxoc1xuICAgICAgICBlLm9wZXJhdGlvbi5vcGVyYXRvciA9IG9wXG4gICAgICAgIGUub3BlcmF0aW9uLnJocyAgICAgID0gcmhzIGlmIHJoc1xuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKGxocywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaW50b2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnWydcblxuICAgICAgICBpdGVtcyA9IEBleHBzICdbJyB0b2tlbnMsICddJ1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2FycmF5JyAnXScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnWydcbiAgICAgICAgXG4gICAgICAgIGFycmF5OlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNsaWNlOiAoZnJvbSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGRvdHMgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIHVwdG8gPSBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHVwdG8gPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHNsaWNlOlxuICAgICAgICAgICAgZnJvbTogZnJvbVxuICAgICAgICAgICAgZG90czogZG90c1xuICAgICAgICAgICAgdXB0bzogdXB0b1xuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2lkeCdcblxuICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnZG90cydcbiAgICAgICAgICAgIHNsaWNlID0gQHNsaWNlIG51bGwsIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzbGljZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnaW5kZXgnICddJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lkeCdcblxuICAgICAgICBpbmRleDpcbiAgICAgICAgICAgIGlkeGVlOiB0b2tcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBzbGlkeDogc2xpY2VcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICcoJ1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdwYXJlbnMnICcpJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJygnXG5cbiAgICAgICAgcGFyZW5zOlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGV4cHM6ICBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgICAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBjdXJseTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0OlxuICAgICAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgICAgICBrZXl2YWxzOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICd7JyB0b2tlbnMsICd9J1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2N1cmx5JyAnfScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG4gICAgICAgICAgICBjbG9zZTogICBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICBcbiAgICAgICAgZXhwcyA9IFtAa2V5dmFsIGtleSwgdG9rZW5zXVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgIGlmIHRva2Vuc1sxXT8uY29sID49IGZpcnN0LmNvbCBhbmQgdG9rZW5zWzFdLnRleHQgbm90IGluICddKSdcbiAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lICdjb250aW51ZSBibG9jayBvYmplY3QgLi4uJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBleHBzID0gZXhwcy5jb25jYXQgQGV4cHMgJ29iamVjdCcgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8ubGluZSA9PSBmaXJzdC5saW5lIGFuZCB0b2tlbnNbMF0udGV4dCBub3QgaW4gJ10pfTsnXG4gICAgICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2VucywgJzsnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnOidcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdmFsdWUgPSBAZXhwcyAna2V5dmFsIHZhbHVlJyBibG9jay50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBAcG9wICc6J1xuXG4gICAgICAgIGsgPSB0eXBlOidrZXknXG4gICAgICAgIFxuICAgICAgICBpZiBrZXkudHlwZSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2V5LnR5cGUgbm90IGluIFsna2V5d29yZCcgJ29wJyAncHVuY3QnICd2YXInICd0aGlzJyAnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJ11cbiAgICAgICAgICAgICAgICBsb2cgJ3doYXQgY291bGQgdGhhdCBiZT8nIGtleVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrLnRleHQgPSBrZXkudGV4dFxuICAgICAgICAgICAgay5saW5lID0ga2V5LmxpbmVcbiAgICAgICAgICAgIGsuY29sICA9IGtleS5jb2xcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGtleS5wcm9wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHtsaW5lLCBjb2x9ID0gZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICAgICAgdGV4dCA9IEBrb2RlLnJlbmRlcmVyLm5vZGUga2V5XG4gICAgICAgICAgICBpZiB0ZXh0LnN0YXJ0c1dpdGggJ3RoaXMnXG4gICAgICAgICAgICAgICAgaWYgdGV4dCA9PSAndGhpcycgdGhlbiB0ZXh0ID0gJ0AnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0ZXh0LnN0YXJ0c1dpdGggJ3RoaXMuJyB0aGVuIHRleHQgPSAnQCcgKyB0ZXh0WzUuLl1cblxuICAgICAgICAgICAgay50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgay5saW5lID0gbGluZVxuICAgICAgICAgICAgay5jb2wgID0gY29sXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdXSEFUIENPVUxEIFRIQVQgQkU/JyBrZXlcbiAgICAgICAgICAgIFxuICAgICAgICBrZXl2YWw6XG4gICAgICAgICAgICBrZXk6ICAga1xuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICBhc3NlcnQ6IChvYmosIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGFzc2VydDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgcW1yazogdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgIHFtcmtvcDogKGxocywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgcW1ya29wOlxuICAgICAgICAgICAgbGhzOiAgbGhzXG4gICAgICAgICAgICBxbXJrOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgcmhzOiAgQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHRoaXM6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICB0eXBlOidwdW5jdCcgdGV4dDonLicgbGluZTpvYmoubGluZSwgY29sOm9iai5jb2xcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG5cbiAgICBlcnJvcjogKG8sIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3Agby5wb3AgaWYgby5wb3BcbiAgICAgICAgZXJyb3IgQjMoYjcoXCIgI3t0b2tlbnNbMF0/LmxpbmUgPyAnICd9IFwiKSkgKyBSMSh5NChcIiAje28uaGRyID8gby5wb3B9IFwiKSkgKyBSMih5NyhcIiAje28ubXNnfSBcIikpXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
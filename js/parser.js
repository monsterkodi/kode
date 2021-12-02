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
        var base, cond, e, ref1, ref2, ref3, ref4, ref5, thn;
        this.push('if');
        cond = this.exp(tokens);
        thn = this.then('if', tokens);
        e = {
            "if": {
                cond: cond,
                then: thn
            }
        };
        this.shiftNewlineTok('if after then', tokens, tok, ((ref1 = tokens[1]) != null ? ref1.text : void 0) === 'else');
        while (((ref3 = tokens[0]) != null ? ref3.text : void 0) === 'else' && ((ref4 = tokens[1]) != null ? ref4.text : void 0) === 'if') {
            tokens.shift();
            tokens.shift();
            if ((base = e["if"]).elifs != null) {
                base.elifs;
            } else {
                base.elifs = [];
            }
            cond = this.exp(tokens);
            thn = this.then('elif', tokens);
            this.shiftNewlineTok('if after elif then', tokens, tok, ((ref2 = tokens[1]) != null ? ref2.text : void 0) === 'else');
            e["if"].elifs.push({
                elif: {
                    cond: cond,
                    then: thn
                }
            });
        }
        if (((ref5 = tokens[0]) != null ? ref5.text : void 0) === 'else') {
            tokens.shift();
            e["if"]["else"] = this.block('else', tokens);
        }
        this.pop('if');
        return e;
    };

    Parser.prototype.ifTail = function(e, tok, tokens) {
        return {
            "if": {
                cond: this.exp(tokens),
                then: [e]
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
        thn = this.then('for', tokens);
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

    Parser.prototype.forTail = function(e, tok, tokens) {
        var inof, list, vals;
        this.push('for');
        vals = this.exps('for vals', tokens);
        if (vals.length === 1) {
            vals = vals[0];
        }
        inof = tokens.shift();
        list = this.exp(tokens);
        this.pop('for');
        return {
            "for": {
                vals: vals,
                inof: inof,
                list: list,
                then: [e]
            }
        };
    };

    Parser.prototype["while"] = function(tok, tokens) {
        var cond, thn;
        this.push('while');
        cond = this.exp(tokens);
        thn = this.then('while', tokens);
        this.pop('while');
        return {
            "while": {
                cond: cond,
                then: thn
            }
        };
    };

    Parser.prototype.whileTail = function(e, tok, tokens) {
        var cond;
        cond = this.exp(tokens);
        return {
            "while": {
                cond: cond,
                then: [e]
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
        thn = this.then('when', tokens);
        this.shiftNewlineTok('when with empty then', tokens, tok, empty(thn));
        this.pop('when');
        return {
            when: {
                vals: vals,
                then: thn
            }
        };
    };

    Parser.prototype["try"] = function(tok, tokens) {
        var ctch, exps, fnlly, ref1, ref2, ref3, ref4;
        this.push('try');
        exps = this.block('body', tokens);
        this.shiftNewlineTok('try body end', tokens, tok, (ref1 = tokens[1].text) === 'catch' || ref1 === 'finally');
        if (((ref2 = tokens[0]) != null ? ref2.text : void 0) === 'catch') {
            this.push('catch');
            tokens.shift();
            ctch = {
                errr: this.exp(tokens),
                exps: this.block('body', tokens)
            };
            this.pop('catch');
            this.shiftNewlineTok('try catch end', tokens, tok, ((ref3 = tokens[1]) != null ? ref3.text : void 0) === 'finally');
        }
        if (((ref4 = tokens[0]) != null ? ref4.text : void 0) === 'finally') {
            tokens.shift();
            fnlly = this.block('body', tokens);
        }
        this.pop('try');
        return {
            "try": {
                exps: exps,
                "catch": ctch,
                "finally": fnlly
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
        body = this.scope(this.block('body', tokens));
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
            val = this.block('return', tokens);
            if ((val != null ? val.length : void 0) > 1) {
                console.log('dafuk?');
            }
            val = val != null ? val[0] : void 0;
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
        var intok, rhs;
        intok = tokens.shift();
        this.push('in?');
        rhs = this.exp(tokens);
        this.pop('in?');
        return {
            incond: {
                lhs: lhs,
                "in": intok,
                rhs: rhs
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
        var qmrk, rhs;
        this.push('?');
        qmrk = tokens.shift();
        rhs = this.exp(tokens);
        this.pop('?');
        return {
            qmrkop: {
                lhs: lhs,
                qmrk: qmrk,
                rhs: rhs
            }
        };
    };

    Parser.prototype.qmrkcolon = function(qmrkop, tokens) {
        var colon, rhs;
        this.push(':');
        colon = tokens.shift();
        rhs = this.exp(tokens);
        this.pop(':');
        return {
            qmrkcolon: {
                lhs: qmrkop.lhs,
                qmrk: qmrkop.qmrk,
                mid: qmrkop.rhs,
                colon: colon,
                rhs: rhs
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBb0JBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRVIsTUFBdUMsT0FBQSxDQUFRLFNBQVIsQ0FBdkMsRUFBRSwrQkFBRixFQUFnQiw2QkFBaEIsRUFBNkI7O0FBRXZCOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7O3NCQVdQLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtRQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7UUFFUCxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsTUFBWDtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsSUFBQSxFQUFRLElBQVI7Z0JBQ0EsSUFBQSxFQUFRLEdBRFI7YUFESjs7UUFJSixJQUFDLENBQUEsZUFBRCxDQUFpQixlQUFqQixFQUFpQyxNQUFqQyxFQUF5QyxHQUF6QyxvQ0FBdUQsQ0FBRSxjQUFYLEtBQW1CLE1BQWpFO0FBRUEsaURBQWUsQ0FBRSxjQUFYLEtBQW1CLE1BQW5CLHNDQUF1QyxDQUFFLGNBQVgsS0FBbUIsSUFBdkQ7WUFFSSxNQUFNLENBQUMsS0FBUCxDQUFBO1lBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBQTs7b0JBRUksQ0FBQzs7b0JBQUQsQ0FBQyxRQUFTOztZQUVkLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7WUFFUCxHQUFBLEdBQU0sSUFB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QVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbiMgdGhpcyBpcyB0aGUgZXF1aXZhbGVudCBvZiBhIEJORiBvciBncmFtbWFyIGZvciB0aGlzIGxpdHRsZSBsYW5ndWFnZS5cbiMgICAgXG4jIGluc3RlYWQgb2YgY29udmVydGluZyBhbiBlc3NlbnRpYWxseSBkeW5hbWljIHByb2JsZW0gdG8gYSBzdGF0aWMgXG4jIHJlcHJlc2VudGF0aW9uIGFuZCB0aGVuIGNvbnZlcnRpbmcgdGhhdCBiYWNrIGludG8gZHluYW1pYyBjb2RlIGFnYWluLFxuIyBpIGRlY2lkZWQgdG8gZ28gdGhlIGRpcmVjdCByb3V0ZS5cbiNcbiMgaXQgbWlnaHQgYmUgbGVzcyBmb3JtYWwgYW5kIHNsaWd0aGx5IGxlc3MgY29uY2lzZSwgYnV0IGl0J3MgZGVmaW5pdGVseSBcbiMgbW9yZSBjdXN0b21pemFibGUgYW5kIGVhc2llciB0byBkZWJ1Zy5cbiNcbiMgYnV0IHRoZSBiaWdnZXN0IGFkdmFudGFnZSBpcyB0aGF0IHRoZSBtYWluIGZlYXR1cmVzIGFyZSBzZXBlcmF0ZWQgZnJvbVxuIyB0aGUgbmFzdHkgZGV0YWlscyBhbmQgY29ybmVyIGNhc2VzLCB3aGljaCBhcmUgaGFuZGxlZCBpbiB0aGUgYmFzZSBjbGFzc1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5QYXJzZSA9IHJlcXVpcmUgJy4vcGFyc2UnXG5cbnsgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCwgZW1wdHkgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlciBleHRlbmRzIFBhcnNlXG5cbiAgICBzY29wZTogKGV4cHMpIC0+XG4gICAgICAgIFxuICAgICAgICB2YXJzOiBbXVxuICAgICAgICBleHBzOiBleHBzXG4gICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnaWYnIHRva2Vuc1xuXG4gICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICBjb25kOiAgIGNvbmRcbiAgICAgICAgICAgICAgICB0aGVuOiAgIHRoblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hpZnROZXdsaW5lVG9rICdpZiBhZnRlciB0aGVuJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdPy50ZXh0ID09ICdlbHNlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpZidcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMgPz0gW11cblxuICAgICAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgICAgIHRobiA9IEB0aGVuICdlbGlmJyB0b2tlbnNcblxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAnaWYgYWZ0ZXIgZWxpZiB0aGVuJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdPy50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbHNlID0gQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdpZidcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaWZUYWlsOiAoZSwgdG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZjpcbiAgICAgICAgICAgIGNvbmQ6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICB0aGVuOiBbZV1cbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZm9yOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuXG4gICAgICAgIHZhbHMgPSBAZXhwcyAnZm9yIHZhbHMnIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IHZhbHNbMF0gaWYgdmFscy5sZW5ndGggPT0gMVxuXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuICA9IEB0aGVuICdmb3InIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnZm9yJyBcblxuICAgICAgICBmb3I6XG4gICAgICAgICAgICB2YWxzOiAgIHZhbHNcbiAgICAgICAgICAgIGlub2Y6ICAgaW5vZlxuICAgICAgICAgICAgbGlzdDogICBsaXN0XG4gICAgICAgICAgICB0aGVuOiAgIHRoblxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBmb3JUYWlsOiAoZSwgdG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG5cbiAgICAgICAgdmFscyA9IHZhbHNbMF0gaWYgdmFscy5sZW5ndGggPT0gMVxuXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuICAgICAgICBcbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogIHZhbHNcbiAgICAgICAgICAgIGlub2Y6ICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgbGlzdFxuICAgICAgICAgICAgdGhlbjogW2VdXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB3aGlsZTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ3doaWxlJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHdoaWxlVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAjIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiBbZV1cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgbWF0Y2ggPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gQGVycm9yIHBvcDonc3dpdGNoJyBtc2c6J2Jsb2NrIGV4cGVjdGVkIScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB3aGVucyA9IFtdXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnd2hlbidcbiAgICAgICAgICAgIHdoZW5zLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBlID0gc3dpdGNoOlxuICAgICAgICAgICAgICAgIG1hdGNoOiAgbWF0Y2hcbiAgICAgICAgICAgICAgICB3aGVuczogIHdoZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuc3dpdGNoLmVsc2UgPSBAZXhwcyAnZWxzZScgdG9rZW5zLCAnbmwnXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ3doZW4gd2l0aCBlbXB0eSB0aGVuJyB0b2tlbnMsIHRvaywgZW1wdHkgdGhuXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgd2hlbjpcbiAgICAgICAgICAgIHZhbHM6IHZhbHNcbiAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3RyeSdcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAndHJ5IGJvZHkgZW5kJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdLnRleHQgaW4gWydjYXRjaCcgJ2ZpbmFsbHknXVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdjYXRjaCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHB1c2ggJ2NhdGNoJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgICAgIGN0Y2ggPSBcbiAgICAgICAgICAgICAgICBlcnJyOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgIGV4cHM6IEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICAgICAgQHBvcCAgJ2NhdGNoJ1xuXG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lVG9rICd0cnkgY2F0Y2ggZW5kJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdPy50ZXh0ID09ICdmaW5hbGx5J1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZmluYWxseSdcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBmbmxseSA9IEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAndHJ5J1xuXG4gICAgICAgIHRyeTpcbiAgICAgICAgICAgIGV4cHM6ICAgIGV4cHNcbiAgICAgICAgICAgIGNhdGNoOiAgIGN0Y2hcbiAgICAgICAgICAgIGZpbmFsbHk6IGZubGx5XG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NsYXNzJ1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICAgICAgZS5jbGFzcy5ib2R5ID0gQGV4cHMgJ2NsYXNzIGJvZHknIHRva2Vuc1xuICAgICAgICAgICAgQG5hbWVNZXRob2RzIGUuY2xhc3MuYm9keVswXS5vYmplY3Qua2V5dmFsc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgYm9keSA9IEBzY29wZSBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnZnVuYydcbiAgICAgICAgXG4gICAgICAgIGUgPSBmdW5jOnt9XG4gICAgICAgIGUuZnVuYy5hcmdzICA9IGFyZ3MgaWYgYXJnc1xuICAgICAgICBlLmZ1bmMuYXJyb3cgPSBhcnJvd1xuICAgICAgICBlLmZ1bmMuYm9keSAgPSBib2R5XG4gICAgICAgIGVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmV0dXJuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgIT0gJ25sJyAgICAgICAgXG4gICAgICAgICAgICB2YWwgPSBAYmxvY2sgJ3JldHVybicgdG9rZW5zXG4gICAgICAgICAgICBpZiB2YWw/Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrPydcbiAgICAgICAgICAgIHZhbCA9IHZhbD9bMF1cbiAgICAgICAgICAgIFxuICAgICAgICBlID0gcmV0dXJuOiByZXQ6IHRva1xuICAgICAgICBlLnJldHVybi52YWwgPSB2YWwgaWYgdmFsXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCB0b2tcbiAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJygnIGFuZCB0b2tlbnNbMF0ubGluZSA9PSBsYXN0LmxpbmUgYW5kIHRva2Vuc1swXS5jb2wgPT0gbGFzdC5jb2xcbiAgICAgICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICdhcmdzKCdcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJygnIHRva2VucywgJyknXG4gICAgICAgICAgICAgICAgQHBvcCAnYXJncygnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJnJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJncydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXJncyA9IEBibG9jayBuYW1lLCB0b2tlbnNcblxuICAgICAgICBpZiBvcGVuIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2ltcGxpY2l0IGNhbGwgZW5kcycgdG9rZW5zXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIG9wZW4gYW5kIG5vdCBjbG9zZSB0aGVuIEBlcnJvciBoZHI6J2NhbGwnIG1zZzonZXhwbGljaXQgY2FsbCB3aXRob3V0IGNsb3NpbmcgKScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGUgPSBjYWxsOiBjYWxsZWU6IHRva1xuICAgICAgICBlLmNhbGwub3BlbiAgPSBvcGVuICBpZiBvcGVuXG4gICAgICAgIGUuY2FsbC5xbXJrICA9IHFtcmsgIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZSBpZiBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3AudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgZSA9IG9wZXJhdGlvbjoge31cbiAgICAgICAgZS5vcGVyYXRpb24ubGhzICAgICAgPSBsaHMgaWYgbGhzXG4gICAgICAgIGUub3BlcmF0aW9uLm9wZXJhdG9yID0gb3BcbiAgICAgICAgZS5vcGVyYXRpb24ucmhzICAgICAgPSByaHMgaWYgcmhzXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAobGhzLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpbnRvayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnaW4/J1xuICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBAcG9wICAnaW4/J1xuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogcmhzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5OlxuICAgICAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ1snXG5cbiAgICAgICAgaXRlbXMgPSBAZXhwcyAnWycgdG9rZW5zLCAnXSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdhcnJheScgJ10nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ1snXG4gICAgICAgIFxuICAgICAgICBhcnJheTpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogKGZyb20sIHRva2VucykgLT5cblxuICAgICAgICBkb3RzID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICB1cHRvID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB1cHRvID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBzbGljZTpcbiAgICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgICAgIGRvdHM6IGRvdHNcbiAgICAgICAgICAgIHVwdG86IHVwdG9cblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZHgnXG5cbiAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2RvdHMnXG4gICAgICAgICAgICBzbGljZSA9IEBzbGljZSBudWxsLCB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2xpY2UgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2luZGV4JyAnXScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdpZHgnXG5cbiAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICBpZHhlZTogdG9rXG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgc2xpZHg6IHNsaWNlXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnKCdcblxuICAgICAgICBleHBzID0gQGV4cHMgJygnIHRva2VucywgJyknXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAncGFyZW5zJyAnKScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICcoJ1xuXG4gICAgICAgIHBhcmVuczpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBleHBzOiAgZXhwc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgICAgMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgY3VybHk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDpcbiAgICAgICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICAgICAga2V5dmFsczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAneycgdG9rZW5zLCAnfSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdjdXJseScgJ30nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBbQGtleXZhbCBrZXksIHRva2Vuc11cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICBpZiB0b2tlbnNbMV0/LmNvbCA+PSBmaXJzdC5jb2wgYW5kIHRva2Vuc1sxXS50ZXh0IG5vdCBpbiAnXSknXG4gICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnY29udGludWUgYmxvY2sgb2JqZWN0IC4uLicgdG9rZW5zXG4gICAgICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LmxpbmUgPT0gZmlyc3QubGluZSBhbmQgdG9rZW5zWzBdLnRleHQgbm90IGluICddKX07J1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsICc7J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJzonXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cHMgJ2tleXZhbCB2YWx1ZScgYmxvY2sudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBrID0gdHlwZTona2V5J1xuICAgICAgICBcbiAgICAgICAgaWYga2V5LnR5cGUgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtleS50eXBlIG5vdCBpbiBbJ2tleXdvcmQnICdvcCcgJ3B1bmN0JyAndmFyJyAndGhpcycgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgbG9nICd3aGF0IGNvdWxkIHRoYXQgYmU/JyBrZXlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgay50ZXh0ID0ga2V5LnRleHRcbiAgICAgICAgICAgIGsubGluZSA9IGtleS5saW5lXG4gICAgICAgICAgICBrLmNvbCAgPSBrZXkuY29sXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBrZXkucHJvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB7bGluZSwgY29sfSA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgICAgIHRleHQgPSBAa29kZS5yZW5kZXJlci5ub2RlIGtleVxuICAgICAgICAgICAgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzJ1xuICAgICAgICAgICAgICAgIGlmIHRleHQgPT0gJ3RoaXMnIHRoZW4gdGV4dCA9ICdAJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzLicgdGhlbiB0ZXh0ID0gJ0AnICsgdGV4dFs1Li5dXG5cbiAgICAgICAgICAgIGsudGV4dCA9IHRleHRcbiAgICAgICAgICAgIGsubGluZSA9IGxpbmVcbiAgICAgICAgICAgIGsuY29sICA9IGNvbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnV0hBVCBDT1VMRCBUSEFUIEJFPycga2V5XG4gICAgICAgICAgICBcbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtcbiAgICAgICAgICAgIGNvbG9uOiBjb2xvblxuICAgICAgICAgICAgdmFsOiAgIHZhbHVlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGFzc2VydDogKG9iaiwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgYXNzZXJ0OlxuICAgICAgICAgICAgb2JqOiAgICBvYmpcbiAgICAgICAgICAgIHFtcms6ICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBxbXJrb3A6IChsaHMsIHRva2VucykgLT5cbiAgICAgXG4gICAgICAgIEBwdXNoICc/J1xuICAgICAgICBcbiAgICAgICAgcW1yayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIHJocyAgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAgJz8nXG4gICAgICAgIFxuICAgICAgICBxbXJrb3A6XG4gICAgICAgICAgICBsaHM6ICAgIGxoc1xuICAgICAgICAgICAgcW1yazogICBxbXJrXG4gICAgICAgICAgICByaHM6ICAgIHJoc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHFtcmtjb2xvbjogKHFtcmtvcCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJzonXG4gICAgICAgIFxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIHJocyA9IEBleHAgdG9rZW5zIFxuICAgICAgICBcbiAgICAgICAgQHBvcCAgJzonXG4gICAgICAgIFxuICAgICAgICBxbXJrY29sb246XG4gICAgICAgICAgICBsaHM6ICAgIHFtcmtvcC5saHNcbiAgICAgICAgICAgIHFtcms6ICAgcW1ya29wLnFtcmtcbiAgICAgICAgICAgIG1pZDogICAgcW1ya29wLnJoc1xuICAgICAgICAgICAgY29sb246ICBjb2xvblxuICAgICAgICAgICAgcmhzOiAgICByaHNcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHRoaXM6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICB0eXBlOidwdW5jdCcgdGV4dDonLicgbGluZTpvYmoubGluZSwgY29sOm9iai5jb2xcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG5cbiAgICBlcnJvcjogKG8sIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3Agby5wb3AgaWYgby5wb3BcbiAgICAgICAgZXJyb3IgQjMoYjcoXCIgI3t0b2tlbnNbMF0/LmxpbmUgPyAnICd9IFwiKSkgKyBSMSh5NChcIiAje28uaGRyID8gby5wb3B9IFwiKSkgKyBSMih5NyhcIiAje28ubXNnfSBcIikpXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
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

    Parser.prototype.each = function(e, tokens) {
        tokens.shift();
        return {
            each: {
                lhs: e,
                fnc: this.exp(tokens)
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
        var e, lastWhen, match, ref1, ref2, ref3, ref4, ref5, whens;
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
        while (((ref4 = tokens[0]) != null ? ref4.text : void 0) === 'when') {
            lastWhen = tokens[0];
            whens.push(this.exp(tokens));
            this.shiftNewlineTok('switch after when', tokens, lastWhen, (ref2 = (ref3 = tokens[1]) != null ? ref3.text : void 0) === 'when' || ref2 === 'else');
        }
        e = {
            "switch": {
                match: match,
                whens: whens
            }
        };
        if (((ref5 = tokens[0]) != null ? ref5.text : void 0) === 'else') {
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
        var close, comp, items, ref1;
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
        if (comp = this.lcomp(items)) {
            return comp;
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
        var close, comp, exps;
        this.push('(');
        exps = this.exps('(', tokens, ')');
        close = this.shiftClose('parens', ')', tokens);
        this.pop('(');
        if (comp = this.lcomp(exps)) {
            return comp;
        }
        return {
            parens: {
                open: open,
                exps: exps,
                close: close
            }
        };
    };

    Parser.prototype.lcomp = function(exps) {
        var f;
        if (!(f = exps[0]["for"])) {
            return;
        }
        return {
            lcomp: exps[0]
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
        var block, exps, first, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
        this.push('{');
        first = firstLineCol(key);
        exps = [this.keyval(key, tokens)];
        while (tokens.length) {
            if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl') {
                if ((ref2 = (ref3 = tokens[1]) != null ? ref3.type : void 0) !== 'single' && ref2 !== 'double' && ref2 !== 'triple' && ref2 !== 'var' && ref2 !== 'keyword' && ref2 !== 'num') {
                    break;
                }
                if (ref4 = (ref5 = tokens[2]) != null ? ref5.text : void 0, indexOf.call(': ', ref4) < 0) {
                    break;
                }
                if (((ref6 = tokens[1]) != null ? ref6.col : void 0) >= first.col && (ref7 = tokens[1].text, indexOf.call('])', ref7) < 0)) {
                    this.shiftNewline('continue implicit object on nl...', tokens);
                    exps.push(this.exp(tokens));
                    continue;
                }
                break;
            } else if (((ref8 = tokens[0]) != null ? ref8.type : void 0) === 'block') {
                block = tokens.shift();
                tokens = block.tokens;
                exps = exps.concat(this.exps('object', block.tokens));
                break;
            } else if (((ref9 = tokens[0]) != null ? ref9.line : void 0) === first.line && (ref10 = tokens[0].text, indexOf.call('])};', ref10) < 0)) {
                exps = exps.concat(this.exps('object', tokens, ';'));
                break;
            } else {
                if (ref11 = tokens[0].text, indexOf.call('])};', ref11) >= 0) {
                    break;
                }
                if ((ref12 = tokens[0].type) !== 'single' && ref12 !== 'double' && ref12 !== 'triple' && ref12 !== 'var' && ref12 !== 'keyword' && ref12 !== 'num') {
                    break;
                }
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
            value = this.exp(block.tokens);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBb0JBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRVIsTUFBdUMsT0FBQSxDQUFRLFNBQVIsQ0FBdkMsRUFBRSwrQkFBRixFQUFnQiw2QkFBaEIsRUFBNkI7O0FBRXZCOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7O3NCQVdQLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtRQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7UUFFUCxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsTUFBWDtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsSUFBQSxFQUFRLElBQVI7Z0JBQ0EsSUFBQSxFQUFRLEdBRFI7YUFESjs7UUFJSixJQUFDLENBQUEsZUFBRCxDQUFpQixlQUFqQixFQUFpQyxNQUFqQyxFQUF5QyxHQUF6QyxvQ0FBdUQsQ0FBRSxjQUFYLEtBQW1CLE1BQWpFO0FBRUEsaURBQWUsQ0FBRSxjQUFYLEtBQW1CLE1BQW5CLHNDQUF1QyxDQUFFLGNBQVgsS0FBbUIsSUFBdkQ7WUFFSSxNQUFNLENBQUMsS0FBUCxDQUFBO1lBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBQTs7b0JBRUksQ0FBQzs7b0JBQUQsQ0FBQyxRQUFTOztZQUVkLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7WUFFUCxHQUFBLEdBQU0sSUFB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R0FBTyxTQUFDLENBQUQsRUFBSSxNQUFKO0FBRUgsWUFBQTtRQUFBLElBQWMsQ0FBQyxDQUFDLEdBQWhCO1lBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsR0FBUCxFQUFBOztRQUFtQixPQUFBLENBQ25CLEtBRG1CLENBQ2IsRUFBQSxDQUFHLEVBQUEsQ0FBRyxHQUFBLEdBQUcsMkVBQW1CLEdBQW5CLENBQUgsR0FBMEIsR0FBN0IsQ0FBSCxDQUFBLEdBQXVDLEVBQUEsQ0FBRyxFQUFBLENBQUcsR0FBQSxHQUFHLGlDQUFTLENBQUMsQ0FBQyxHQUFYLENBQUgsR0FBa0IsR0FBckIsQ0FBSCxDQUF2QyxHQUFzRSxFQUFBLENBQUcsRUFBQSxDQUFHLEdBQUEsR0FBSSxDQUFDLENBQUMsR0FBTixHQUFVLEdBQWIsQ0FBSCxDQUR6RDtlQUVuQjtJQUpHOzs7O0dBcHVCVTs7QUEwdUJyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxuIyB0aGlzIGlzIHRoZSBlcXVpdmFsZW50IG9mIGEgQk5GIG9yIGdyYW1tYXIgZm9yIHRoaXMgbGl0dGxlIGxhbmd1YWdlLlxuIyAgICBcbiMgaW5zdGVhZCBvZiBjb252ZXJ0aW5nIGFuIGVzc2VudGlhbGx5IGR5bmFtaWMgcHJvYmxlbSB0byBhIHN0YXRpYyBcbiMgcmVwcmVzZW50YXRpb24gYW5kIHRoZW4gY29udmVydGluZyB0aGF0IGJhY2sgaW50byBkeW5hbWljIGNvZGUgYWdhaW4sXG4jIGkgZGVjaWRlZCB0byBnbyB0aGUgZGlyZWN0IHJvdXRlLlxuI1xuIyBpdCBtaWdodCBiZSBsZXNzIGZvcm1hbCBhbmQgc2xpZ3RobHkgbGVzcyBjb25jaXNlLCBidXQgaXQncyBkZWZpbml0ZWx5IFxuIyBtb3JlIGN1c3RvbWl6YWJsZSBhbmQgZWFzaWVyIHRvIGRlYnVnLlxuI1xuIyBidXQgdGhlIGJpZ2dlc3QgYWR2YW50YWdlIGlzIHRoYXQgdGhlIG1haW4gZmVhdHVyZXMgYXJlIHNlcGVyYXRlZCBmcm9tXG4jIHRoZSBuYXN0eSBkZXRhaWxzIGFuZCBjb3JuZXIgY2FzZXMsIHdoaWNoIGFyZSBoYW5kbGVkIGluIHRoZSBiYXNlIGNsYXNzXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblBhcnNlID0gcmVxdWlyZSAnLi9wYXJzZSdcblxueyBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sLCBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2VyIGV4dGVuZHMgUGFyc2VcblxuICAgIHNjb3BlOiAoZXhwcykgLT5cbiAgICAgICAgXG4gICAgICAgIHZhcnM6IFtdXG4gICAgICAgIGV4cHM6IGV4cHNcbiAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZidcblxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICdpZicgdG9rZW5zXG5cbiAgICAgICAgZSA9IGlmOlxuICAgICAgICAgICAgICAgIGNvbmQ6ICAgY29uZFxuICAgICAgICAgICAgICAgIHRoZW46ICAgdGhuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ2lmIGFmdGVyIHRoZW4nIHRva2VucywgdG9rLCB0b2tlbnNbMV0/LnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2lmJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbGlmcyA/PSBbXVxuXG4gICAgICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAgICAgdGhuID0gQHRoZW4gJ2VsaWYnIHRva2Vuc1xuXG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lVG9rICdpZiBhZnRlciBlbGlmIHRoZW4nIHRva2VucywgdG9rLCB0b2tlbnNbMV0/LnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUuaWYuZWxpZnMucHVzaFxuICAgICAgICAgICAgICAgIGVsaWY6XG4gICAgICAgICAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsc2UgPSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBpZlRhaWw6IChlLCB0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmOlxuICAgICAgICAgICAgY29uZDogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIHRoZW46IFtlXVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3I6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdmb3InXG5cbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gdmFsc1swXSBpZiB2YWxzLmxlbmd0aCA9PSAxXG5cbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBsaXN0ID0gQGV4cCB0b2tlbnNcblxuICAgICAgICB0aG4gID0gQHRoZW4gJ2ZvcicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICAgdmFsc1xuICAgICAgICAgICAgaW5vZjogICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgIGxpc3RcbiAgICAgICAgICAgIHRoZW46ICAgdGhuXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZWFjaDogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBlYWNoOlxuICAgICAgICAgICAgbGhzOiAgICBlXG4gICAgICAgICAgICBmbmM6ICAgIEBleHAgdG9rZW5zIFxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBmb3JUYWlsOiAoZSwgdG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG5cbiAgICAgICAgdmFscyA9IHZhbHNbMF0gaWYgdmFscy5sZW5ndGggPT0gMVxuXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuICAgICAgICBcbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogIHZhbHNcbiAgICAgICAgICAgIGlub2Y6ICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgbGlzdFxuICAgICAgICAgICAgdGhlbjogW2VdXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB3aGlsZTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ3doaWxlJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHdoaWxlVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAjIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiBbZV1cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgbWF0Y2ggPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gQGVycm9yIHBvcDonc3dpdGNoJyBtc2c6J2Jsb2NrIGV4cGVjdGVkIScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB3aGVucyA9IFtdXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnd2hlbidcbiAgICAgICAgICAgIGxhc3RXaGVuID0gdG9rZW5zWzBdXG4gICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lVG9rICdzd2l0Y2ggYWZ0ZXIgd2hlbicgdG9rZW5zLCBsYXN0V2hlbiwgdG9rZW5zWzFdPy50ZXh0IGluIFsnd2hlbicgJ2Vsc2UnXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGUgPSBzd2l0Y2g6XG4gICAgICAgICAgICAgICAgbWF0Y2g6ICBtYXRjaFxuICAgICAgICAgICAgICAgIHdoZW5zOiAgd2hlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5zd2l0Y2guZWxzZSA9IEBleHBzICdlbHNlJyB0b2tlbnMsICdubCdcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgKHRva2Vuc1swXT8gYW5kICh0b2tlbnNbMF0udHlwZSBub3QgaW4gWydibG9jaycnbmwnXSkgYW5kIHRva2Vuc1swXS50ZXh0ICE9ICd0aGVuJylcbiAgICAgICAgICAgIHZhbHMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ3doZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAnd2hlbiB3aXRoIGVtcHR5IHRoZW4nIHRva2VucywgdG9rLCBlbXB0eSB0aG5cbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB3aGVuOlxuICAgICAgICAgICAgdmFsczogdmFsc1xuICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdHJ5OiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAndHJ5J1xuICAgICAgICBcbiAgICAgICAgZXhwcyA9IEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hpZnROZXdsaW5lVG9rICd0cnkgYm9keSBlbmQnIHRva2VucywgdG9rLCB0b2tlbnNbMV0udGV4dCBpbiBbJ2NhdGNoJyAnZmluYWxseSddXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2NhdGNoJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcHVzaCAnY2F0Y2gnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICAgICAgY3RjaCA9IFxuICAgICAgICAgICAgICAgIGVycnI6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgZXhwczogQGJsb2NrICdib2R5JyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgICAgICBAcG9wICAnY2F0Y2gnXG5cbiAgICAgICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ3RyeSBjYXRjaCBlbmQnIHRva2VucywgdG9rLCB0b2tlbnNbMV0/LnRleHQgPT0gJ2ZpbmFsbHknXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdmaW5hbGx5J1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGZubGx5ID0gQGJsb2NrICdib2R5JyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICd0cnknXG5cbiAgICAgICAgdHJ5OlxuICAgICAgICAgICAgZXhwczogICAgZXhwc1xuICAgICAgICAgICAgY2F0Y2g6ICAgY3RjaFxuICAgICAgICAgICAgZmluYWxseTogZm5sbHlcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnY2xhc3MnXG5cbiAgICAgICAgbmFtZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgZSA9IGNsYXNzOlxuICAgICAgICAgICAgbmFtZTpuYW1lXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdleHRlbmRzJ1xuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGUuY2xhc3MuZXh0ZW5kcyA9IEBleHBzICdjbGFzcyBleHRlbmRzJyB0b2tlbnMsICdubCdcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgICAgICBlLmNsYXNzLmJvZHkgPSBAZXhwcyAnY2xhc3MgYm9keScgdG9rZW5zXG4gICAgICAgICAgICBAbmFtZU1ldGhvZHMgZS5jbGFzcy5ib2R5WzBdLm9iamVjdC5rZXl2YWxzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2NsYXNzJ1xuXG4gICAgICAgIGVcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKGFyZ3MsIGFycm93LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2Z1bmMnXG4gICAgICAgIFxuICAgICAgICBib2R5ID0gQHNjb3BlIEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgZSA9IGZ1bmM6e31cbiAgICAgICAgZS5mdW5jLmFyZ3MgID0gYXJncyBpZiBhcmdzXG4gICAgICAgIGUuZnVuYy5hcnJvdyA9IGFycm93XG4gICAgICAgIGUuZnVuYy5ib2R5ICA9IGJvZHlcbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSAhPSAnbmwnICAgICAgICBcbiAgICAgICAgICAgIHZhbCA9IEBibG9jayAncmV0dXJuJyB0b2tlbnNcbiAgICAgICAgICAgIGlmIHZhbD8ubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIGxvZyAnZGFmdWs/J1xuICAgICAgICAgICAgdmFsID0gdmFsP1swXVxuICAgICAgICAgICAgXG4gICAgICAgIGUgPSByZXR1cm46IHJldDogdG9rXG4gICAgICAgIGUucmV0dXJuLnZhbCA9IHZhbCBpZiB2YWxcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGNhbGw6ICh0b2ssIHRva2VucywgcW1yaykgLT5cblxuICAgICAgICBAcHVzaCAnY2FsbCdcblxuICAgICAgICB0b2sgPSB0b2sudG9rZW4gaWYgdG9rLnRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbGFzdCA9IGxhc3RMaW5lQ29sIHRva1xuICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKCcgYW5kIHRva2Vuc1swXS5saW5lID09IGxhc3QubGluZSBhbmQgdG9rZW5zWzBdLmNvbCA9PSBsYXN0LmNvbFxuICAgICAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgYXJncyA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHB1c2ggJ2FyZ3MoJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcbiAgICAgICAgICAgICAgICBAcG9wICdhcmdzKCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCBpbiBbJ3R5cGVvZicgJ2RlbGV0ZSddXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdhcmcnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdhcmdzJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhcmdzID0gQGJsb2NrIG5hbWUsIHRva2Vuc1xuXG4gICAgICAgIGlmIG9wZW4gXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnaW1wbGljaXQgY2FsbCBlbmRzJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgbm90IGNsb3NlIHRoZW4gQGVycm9yIGhkcjonY2FsbCcgbXNnOidleHBsaWNpdCBjYWxsIHdpdGhvdXQgY2xvc2luZyApJyB0b2tlbnNcblxuICAgICAgICBAcG9wICdjYWxsJ1xuICAgICAgICBcbiAgICAgICAgZSA9IGNhbGw6IGNhbGxlZTogdG9rXG4gICAgICAgIGUuY2FsbC5vcGVuICA9IG9wZW4gIGlmIG9wZW5cbiAgICAgICAgZS5jYWxsLnFtcmsgID0gcW1yayAgaWYgcW1ya1xuICAgICAgICBlLmNhbGwuYXJncyAgPSBhcmdzXG4gICAgICAgIGUuY2FsbC5jbG9zZSA9IGNsb3NlIGlmIGNsb3NlXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKGxocywgb3AsIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCBcIm9wI3tvcC50ZXh0fVwiXG4gICAgICAgIFxuICAgICAgICBpZiBvcC50ZXh0ID09ICc9J1xuICAgICAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCBcIm9wI3tvcC50ZXh0fVwiXG4gICAgICAgIFxuICAgICAgICBlID0gb3BlcmF0aW9uOiB7fVxuICAgICAgICBlLm9wZXJhdGlvbi5saHMgICAgICA9IGxocyBpZiBsaHNcbiAgICAgICAgZS5vcGVyYXRpb24ub3BlcmF0b3IgPSBvcFxuICAgICAgICBlLm9wZXJhdGlvbi5yaHMgICAgICA9IHJocyBpZiByaHNcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpbmNvbmQ6IChsaHMsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGludG9rID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdpbj8nXG4gICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgIEBwb3AgICdpbj8nXG4gICAgICAgIFxuICAgICAgICBpbmNvbmQ6XG4gICAgICAgICAgICBsaHM6IGxoc1xuICAgICAgICAgICAgaW46ICBpbnRva1xuICAgICAgICAgICAgcmhzOiByaHNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBhcnJheTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnWydcblxuICAgICAgICBpdGVtcyA9IEBleHBzICdbJyB0b2tlbnMsICddJ1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2FycmF5JyAnXScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnWydcbiAgICAgICAgXG4gICAgICAgIGlmIGNvbXAgPSBAbGNvbXAgaXRlbXNcbiAgICAgICAgICAgIHJldHVybiBjb21wXG4gICAgICAgIFxuICAgICAgICBhcnJheTpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogKGZyb20sIHRva2VucykgLT5cblxuICAgICAgICBkb3RzID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICB1cHRvID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB1cHRvID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBzbGljZTpcbiAgICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgICAgIGRvdHM6IGRvdHNcbiAgICAgICAgICAgIHVwdG86IHVwdG9cblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZHgnXG5cbiAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2RvdHMnXG4gICAgICAgICAgICBzbGljZSA9IEBzbGljZSBudWxsLCB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2xpY2UgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2luZGV4JyAnXScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdpZHgnXG5cbiAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICBpZHhlZTogdG9rXG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgc2xpZHg6IHNsaWNlXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnKCdcblxuICAgICAgICBleHBzID0gQGV4cHMgJygnIHRva2VucywgJyknXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAncGFyZW5zJyAnKScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICcoJ1xuXG4gICAgICAgIGlmIGNvbXAgPSBAbGNvbXAgZXhwc1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBcbiAgICAgICAgXG4gICAgICAgIHBhcmVuczpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBleHBzOiAgZXhwc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBsY29tcDogKGV4cHMpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGYgPSBleHBzWzBdLmZvclxuICAgICAgICBcbiAgICAgICAgbGNvbXA6IGV4cHNbMF1cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgICAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBjdXJseTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0OlxuICAgICAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgICAgICBrZXl2YWxzOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICd7JyB0b2tlbnMsICd9J1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2N1cmx5JyAnfScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG4gICAgICAgICAgICBjbG9zZTogICBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICBcbiAgICAgICAgZXhwcyA9IFtAa2V5dmFsIGtleSwgdG9rZW5zXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCdcbiAgICAgICAgICAgICAgICBicmVhayBpZiB0b2tlbnNbMV0/LnR5cGUgbm90IGluIFsnc2luZ2xlJydkb3VibGUnJ3RyaXBsZScndmFyJydrZXl3b3JkJydudW0nXVxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIHRva2Vuc1syXT8udGV4dCBub3QgaW4gJzogJyAjIHNwYWNlIGNoZWNrcyBmb3IgbmV3bGluZSFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMV0/LmNvbCA+PSBmaXJzdC5jb2wgYW5kIHRva2Vuc1sxXS50ZXh0IG5vdCBpbiAnXSknXG4gICAgICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2NvbnRpbnVlIGltcGxpY2l0IG9iamVjdCBvbiBubC4uLicgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGV4cHMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIHRva2VucyA9IGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyBibG9jay50b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LmxpbmUgPT0gZmlyc3QubGluZSBhbmQgdG9rZW5zWzBdLnRleHQgbm90IGluICddKX07J1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsICc7J1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgdG9rZW5zWzBdLnRleHQgaW4gJ10pfTsnXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgdG9rZW5zWzBdLnR5cGUgbm90IGluIFsnc2luZ2xlJydkb3VibGUnJ3RyaXBsZScndmFyJydrZXl3b3JkJydudW0nXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJzonXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cCBibG9jay50b2tlbnNcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBAcG9wICc6J1xuXG4gICAgICAgIGsgPSB0eXBlOidrZXknXG4gICAgICAgIFxuICAgICAgICBpZiBrZXkudHlwZSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYga2V5LnR5cGUgbm90IGluIFsna2V5d29yZCcgJ29wJyAncHVuY3QnICd2YXInICd0aGlzJyAnbnVtJyAnc2luZ2xlJyAnZG91YmxlJyAndHJpcGxlJ11cbiAgICAgICAgICAgICAgICBsb2cgJ3doYXQgY291bGQgdGhhdCBiZT8nIGtleVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBrLnRleHQgPSBrZXkudGV4dFxuICAgICAgICAgICAgay5saW5lID0ga2V5LmxpbmVcbiAgICAgICAgICAgIGsuY29sICA9IGtleS5jb2xcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGtleS5wcm9wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHtsaW5lLCBjb2x9ID0gZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICAgICAgdGV4dCA9IEBrb2RlLnJlbmRlcmVyLm5vZGUga2V5XG4gICAgICAgICAgICBpZiB0ZXh0LnN0YXJ0c1dpdGggJ3RoaXMnXG4gICAgICAgICAgICAgICAgaWYgdGV4dCA9PSAndGhpcycgdGhlbiB0ZXh0ID0gJ0AnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0ZXh0LnN0YXJ0c1dpdGggJ3RoaXMuJyB0aGVuIHRleHQgPSAnQCcgKyB0ZXh0WzUuLl1cblxuICAgICAgICAgICAgay50ZXh0ID0gdGV4dFxuICAgICAgICAgICAgay5saW5lID0gbGluZVxuICAgICAgICAgICAgay5jb2wgID0gY29sXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9nICdXSEFUIENPVUxEIFRIQVQgQkU/JyBrZXlcbiAgICAgICAgICAgIFxuICAgICAgICBrZXl2YWw6XG4gICAgICAgICAgICBrZXk6ICAga1xuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgYXNzZXJ0OiAob2JqLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBhc3NlcnQ6XG4gICAgICAgICAgICBvYmo6ICAgIG9ialxuICAgICAgICAgICAgcW1yazogICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIHFtcmtvcDogKGxocywgdG9rZW5zKSAtPlxuICAgICBcbiAgICAgICAgQHB1c2ggJz8nXG4gICAgICAgIFxuICAgICAgICBxbXJrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgcmhzICA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICAnPydcbiAgICAgICAgXG4gICAgICAgIHFtcmtvcDpcbiAgICAgICAgICAgIGxoczogICAgbGhzXG4gICAgICAgICAgICBxbXJrOiAgIHFtcmtcbiAgICAgICAgICAgIHJoczogICAgcmhzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwIDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcW1ya2NvbG9uOiAocW1ya29wLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnOidcbiAgICAgICAgXG4gICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgcmhzID0gQGV4cCB0b2tlbnMgXG4gICAgICAgIFxuICAgICAgICBAcG9wICAnOidcbiAgICAgICAgXG4gICAgICAgIHFtcmtjb2xvbjpcbiAgICAgICAgICAgIGxoczogICAgcW1ya29wLmxoc1xuICAgICAgICAgICAgcW1yazogICBxbXJrb3AucW1ya1xuICAgICAgICAgICAgbWlkOiAgICBxbXJrb3AucmhzXG4gICAgICAgICAgICBjb2xvbjogIGNvbG9uXG4gICAgICAgICAgICByaHM6ICAgIHJoc1xuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgdGhpczogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHR5cGU6J3B1bmN0JyB0ZXh0OicuJyBsaW5lOm9iai5saW5lLCBjb2w6b2JqLmNvbFxuICAgICAgICAgICAgcHJvcDogdG9rZW5zLnNoaWZ0KClcblxuICAgIGVycm9yOiAobywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHBvcCBvLnBvcCBpZiBvLnBvcFxuICAgICAgICBlcnJvciBCMyhiNyhcIiAje3Rva2Vuc1swXT8ubGluZSA/ICcgJ30gXCIpKSArIFIxKHk0KFwiICN7by5oZHIgPyBvLnBvcH0gXCIpKSArIFIyKHk3KFwiICN7by5tc2d9IFwiKSlcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIl19
//# sourceURL=../coffee/parser.coffee
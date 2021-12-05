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
        var base, cond, e, ref1, ref2, ref3, ref4, ref5, ref6, thn;
        if (tokens[0].type === 'block') {
            return this.ifBlock(tok, tokens);
        }
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
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
            this.verb('block after if then -> switch to block mode');
            this.pop('if');
            return this.ifBlock(tok, tokens, e);
        }
        while (((ref4 = tokens[0]) != null ? ref4.text : void 0) === 'else' && ((ref5 = tokens[1]) != null ? ref5.text : void 0) === 'if') {
            tokens.shift();
            tokens.shift();
            if ((base = e["if"]).elifs != null) {
                base.elifs;
            } else {
                base.elifs = [];
            }
            cond = this.exp(tokens);
            thn = this.then('elif', tokens);
            this.shiftNewlineTok('if after elif then', tokens, tok, ((ref3 = tokens[1]) != null ? ref3.text : void 0) === 'else');
            e["if"].elifs.push({
                elif: {
                    cond: cond,
                    then: thn
                }
            });
        }
        if (((ref6 = tokens[0]) != null ? ref6.text : void 0) === 'else') {
            tokens.shift();
            e["if"]["else"] = this.block('else', tokens);
        }
        this.pop('if');
        return e;
    };

    Parser.prototype.ifBlock = function(tok, tokens, e) {
        var base, cond, ref1, subbs, thn;
        this.push('if');
        subbs = this.subBlocks(tokens.shift().tokens);
        if (!e) {
            tokens = subbs.shift();
            e = {
                "if": {
                    cond: this.exp(tokens),
                    then: this.then('if', tokens)
                }
            };
        }
        while (subbs.length) {
            tokens = subbs.shift();
            if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'else') {
                tokens.shift();
                e["if"]["else"] = this.block('else', tokens);
                break;
            }
            cond = this.exp(tokens);
            thn = this.then('elif', tokens);
            if ((base = e["if"]).elifs != null) {
                base.elifs;
            } else {
                base.elifs = [];
            }
            e["if"].elifs.push({
                elif: {
                    cond: cond,
                    then: thn
                }
            });
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
        var e, lastWhen, match, ref1, ref2, ref3, ref4, ref5, ref6, ref7, subbs, whens;
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
        e = {
            "switch": {
                match: match,
                whens: whens
            }
        };
        if (((ref2 = tokens[0]) != null ? ref2.text : void 0) !== 'when') {
            subbs = this.subBlocks(tokens);
            while (subbs.length) {
                tokens = subbs.shift();
                if (((ref3 = tokens[0]) != null ? ref3.text : void 0) === 'else') {
                    tokens.shift();
                    e["switch"]["else"] = this.block('else', tokens);
                    break;
                }
                whens.push(this.when(null, tokens));
                if ((whens.slice(-2, -1)[0] != null) && empty(whens.slice(-2, -1)[0].when.then)) {
                    whens.slice(-1)[0].when.vals = whens.slice(-2, -1)[0].when.vals.concat(whens.slice(-1)[0].when.vals);
                    whens.splice(-2, 1);
                }
            }
        } else {
            while (((ref6 = tokens[0]) != null ? ref6.text : void 0) === 'when') {
                lastWhen = tokens[0];
                whens.push(this.exp(tokens));
                this.shiftNewlineTok('switch after when', tokens, lastWhen, (ref4 = (ref5 = tokens[1]) != null ? ref5.text : void 0) === 'when' || ref4 === 'else');
            }
            if (((ref7 = tokens[0]) != null ? ref7.text : void 0) === 'else') {
                tokens.shift();
                e["switch"]["else"] = this.block('else', tokens);
            }
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
            this.nameMethods(e["class"].body);
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
        rhs = this.exp(tokens);
        this.pop("op" + op.text);
        if (op.text === '=') {
            if (rhs["switch"]) {
                this.verb('rhs is switch');
                rhs = {
                    call: {
                        callee: {
                            parens: {
                                exps: [
                                    {
                                        func: {
                                            arrow: {
                                                text: '->'
                                            },
                                            body: {
                                                vars: [],
                                                exps: [rhs]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                };
            }
        } else if (op.text === '?=') {
            op.text = '=';
            rhs = {
                qmrkop: {
                    lhs: lhs,
                    qmrk: {
                        type: 'op',
                        text: '?',
                        line: op.line,
                        col: op.col
                    },
                    rhs: rhs
                }
            };
        }
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
        var close, comp, exps, ref1;
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === ')') {
            return {
                parens: {
                    open: open,
                    exps: [],
                    close: tokens.shift()
                }
            };
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBb0JBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRVIsTUFBdUMsT0FBQSxDQUFRLFNBQVIsQ0FBdkMsRUFBRSwrQkFBRixFQUFnQiw2QkFBaEIsRUFBNkI7O0FBRXZCOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7O3NCQVdQLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVYsS0FBa0IsT0FBckI7QUFDSSxtQkFBTyxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsRUFBYyxNQUFkLEVBRFg7O1FBR0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOO1FBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtRQUNQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBVyxNQUFYO1FBRU4sQ0FBQSxHQUFJO1lBQUEsQ0FBQSxFQUFBLENBQUEsRUFDSTtnQkFBQSxJQUFBLEVBQVEsSUFBUjtnQkFDQSxJQUFBLEVBQVEsR0FEUjthQURKOztRQUlKLElBQUMsQ0FBQSxlQUFELENBQWlCLGVBQWpCLEVBQWlDLE1BQWpDLEVBQXlDLEdBQXpDLG9DQUF1RCxDQUFFLGNBQVgsS0FBbUIsTUFBakU7UUFFQSxzQ0FBWSxDQUFFLGNBQVgsS0FBbUIsT0FBdEI7WUFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLDZDQUFOO1lBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMO0FB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LENBQUcsR0FBQSxHQUFHLGlDQUFTLENBQUMsQ0FBQyxHQUFYLENBQUgsR0FBa0IsR0FBckIsQ0FBSCxDQUF2QyxHQUFzRSxFQUFBLENBQUcsRUFBQSxDQUFHLEdBQUEsR0FBSSxDQUFDLENBQUMsR0FBTixHQUFVLEdBQWIsQ0FBSCxDQUR6RDtlQUVuQjtJQUpHOzs7O0dBcDBCVTs7QUEwMEJyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxuIyB0aGlzIGlzIHRoZSBlcXVpdmFsZW50IG9mIGEgQk5GIG9yIGdyYW1tYXIgZm9yIHRoaXMgbGl0dGxlIGxhbmd1YWdlLlxuIyAgICBcbiMgaW5zdGVhZCBvZiBjb252ZXJ0aW5nIGFuIGVzc2VudGlhbGx5IGR5bmFtaWMgcHJvYmxlbSB0byBhIHN0YXRpYyBcbiMgcmVwcmVzZW50YXRpb24gYW5kIHRoZW4gY29udmVydGluZyB0aGF0IGJhY2sgaW50byBkeW5hbWljIGNvZGUgYWdhaW4sXG4jIGkgZGVjaWRlZCB0byBnbyB0aGUgZGlyZWN0IHJvdXRlLlxuI1xuIyBpdCBtaWdodCBiZSBsZXNzIGZvcm1hbCBhbmQgc2xpZ3RobHkgbGVzcyBjb25jaXNlLCBidXQgaXQncyBkZWZpbml0ZWx5IFxuIyBtb3JlIGN1c3RvbWl6YWJsZSBhbmQgZWFzaWVyIHRvIGRlYnVnLlxuI1xuIyBidXQgdGhlIGJpZ2dlc3QgYWR2YW50YWdlIGlzIHRoYXQgdGhlIG1haW4gZmVhdHVyZXMgYXJlIHNlcGVyYXRlZCBmcm9tXG4jIHRoZSBuYXN0eSBkZXRhaWxzIGFuZCBjb3JuZXIgY2FzZXMsIHdoaWNoIGFyZSBoYW5kbGVkIGluIHRoZSBiYXNlIGNsYXNzXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblBhcnNlID0gcmVxdWlyZSAnLi9wYXJzZSdcblxueyBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sLCBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2VyIGV4dGVuZHMgUGFyc2VcblxuICAgIHNjb3BlOiAoZXhwcykgLT5cbiAgICAgICAgXG4gICAgICAgIHZhcnM6IFtdXG4gICAgICAgIGV4cHM6IGV4cHNcbiAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXS50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHJldHVybiBAaWZCbG9jayB0b2ssIHRva2Vuc1xuXG4gICAgICAgIEBwdXNoICdpZidcbiAgICAgICAgXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuICAgICAgICB0aG4gPSBAdGhlbiAnaWYnIHRva2Vuc1xuXG4gICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICBjb25kOiAgIGNvbmRcbiAgICAgICAgICAgICAgICB0aGVuOiAgIHRoblxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAc2hpZnROZXdsaW5lVG9rICdpZiBhZnRlciB0aGVuJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdPy50ZXh0ID09ICdlbHNlJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIEB2ZXJiICdibG9jayBhZnRlciBpZiB0aGVuIC0+IHN3aXRjaCB0byBibG9jayBtb2RlJyBcbiAgICAgICAgICAgIEBwb3AgJ2lmJ1xuICAgICAgICAgICAgcmV0dXJuIEBpZkJsb2NrIHRvaywgdG9rZW5zLCBlXG4gICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnIGFuZCB0b2tlbnNbMV0/LnRleHQgPT0gJ2lmJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbGlmcyA/PSBbXVxuXG4gICAgICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAgICAgdGhuID0gQHRoZW4gJ2VsaWYnIHRva2Vuc1xuXG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lVG9rICdpZiBhZnRlciBlbGlmIHRoZW4nIHRva2VucywgdG9rLCB0b2tlbnNbMV0/LnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUuaWYuZWxpZnMucHVzaFxuICAgICAgICAgICAgICAgIGVsaWY6XG4gICAgICAgICAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsc2UgPSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGlmQmxvY2s6ICh0b2ssIHRva2VucywgZSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdpZidcblxuICAgICAgICBzdWJicyA9IEBzdWJCbG9ja3MgdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgZVxuICAgICAgICAgICAgdG9rZW5zID0gc3ViYnMuc2hpZnQoKVxuICAgICAgICAgICAgZSA9IGlmOlxuICAgICAgICAgICAgICAgICAgICBjb25kOiAgIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIHRoZW46ICAgQHRoZW4gJ2lmJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIHN1YmJzLmxlbmd0aFxuICAgICAgICAgICAgdG9rZW5zID0gc3ViYnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgZS5pZi5lbHNlID0gQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICB0aG4gID0gQHRoZW4gJ2VsaWYnIHRva2Vuc1xuXG4gICAgICAgICAgICBlLmlmLmVsaWZzID89IFtdXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICAgICAgICAgIHRoZW46IHRoblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnaWYnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGlmVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWY6XG4gICAgICAgICAgICBjb25kOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgdGhlbjogW2VdXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGZvcjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcblxuICAgICAgICB2YWxzID0gQGV4cHMgJ2ZvciB2YWxzJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSB2YWxzWzBdIGlmIHZhbHMubGVuZ3RoID09IDFcblxuICAgICAgICBpbm9mID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiAgPSBAdGhlbiAnZm9yJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG5cbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICAgbGlzdFxuICAgICAgICAgICAgdGhlbjogICB0aG5cbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBlYWNoOiAoZSwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGVhY2g6XG4gICAgICAgICAgICBsaHM6ICAgIGVcbiAgICAgICAgICAgIGZuYzogICAgQGV4cCB0b2tlbnMgXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGZvclRhaWw6IChlLCB0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdmb3InXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gQGV4cHMgJ2ZvciB2YWxzJyB0b2tlbnNcblxuICAgICAgICB2YWxzID0gdmFsc1swXSBpZiB2YWxzLmxlbmd0aCA9PSAxXG5cbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBsaXN0ID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG4gICAgICAgIFxuICAgICAgICBmb3I6XG4gICAgICAgICAgICB2YWxzOiAgdmFsc1xuICAgICAgICAgICAgaW5vZjogIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICBsaXN0XG4gICAgICAgICAgICB0aGVuOiBbZV1cbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHdoaWxlOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hpbGUnIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICB3aGlsZTpcbiAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgd2hpbGVUYWlsOiAoZSwgdG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICAjIEBwdXNoICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgICMgQHBvcCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICB3aGlsZTpcbiAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgIHRoZW46IFtlXVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHN3aXRjaDogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIG1hdGNoID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEBlcnJvciBwb3A6J3N3aXRjaCcgbXNnOidibG9jayBleHBlY3RlZCEnIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgd2hlbnMgPSBbXVxuICAgICAgICBlID0gc3dpdGNoOlxuICAgICAgICAgICAgICAgIG1hdGNoOiAgbWF0Y2hcbiAgICAgICAgICAgICAgICB3aGVuczogIHdoZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ICE9ICd3aGVuJ1xuXG4gICAgICAgICAgICBzdWJicyA9IEBzdWJCbG9ja3MgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHN1YmJzLmxlbmd0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRva2VucyA9IHN1YmJzLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgICAgIGUuc3dpdGNoLmVsc2UgPSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGVucy5wdXNoIEB3aGVuIG51bGwsIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB3aGVuc1stMl0/IGFuZCBlbXB0eSB3aGVuc1stMl0ud2hlbi50aGVuIFxuICAgICAgICAgICAgICAgICAgICB3aGVuc1stMV0ud2hlbi52YWxzID0gd2hlbnNbLTJdLndoZW4udmFscy5jb25jYXQgd2hlbnNbLTFdLndoZW4udmFsc1xuICAgICAgICAgICAgICAgICAgICB3aGVucy5zcGxpY2UgLTIgMSBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ3doZW4nXG4gICAgICAgICAgICAgICAgbGFzdFdoZW4gPSB0b2tlbnNbMF1cbiAgICAgICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAnc3dpdGNoIGFmdGVyIHdoZW4nIHRva2VucywgbGFzdFdoZW4sIHRva2Vuc1sxXT8udGV4dCBpbiBbJ3doZW4nICdlbHNlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuICAgIFxuICAgICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgXG4gICAgICAgICAgICAgICAgZS5zd2l0Y2guZWxzZSA9IEBibG9jayAnZWxzZScgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnc3dpdGNoJ1xuICAgICAgICBcbiAgICAgICAgZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doZW4nXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gW11cbiAgICAgICAgXG4gICAgICAgIHdoaWxlICh0b2tlbnNbMF0/IGFuZCAodG9rZW5zWzBdLnR5cGUgbm90IGluIFsnYmxvY2snJ25sJ10pIGFuZCB0b2tlbnNbMF0udGV4dCAhPSAndGhlbicpXG4gICAgICAgICAgICB2YWxzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ3doZW4gd2l0aCBlbXB0eSB0aGVuJyB0b2tlbnMsIHRvaywgZW1wdHkgdGhuXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgd2hlbjpcbiAgICAgICAgICAgIHZhbHM6IHZhbHNcbiAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHRyeTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3RyeSdcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAndHJ5IGJvZHkgZW5kJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdLnRleHQgaW4gWydjYXRjaCcgJ2ZpbmFsbHknXVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdjYXRjaCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHB1c2ggJ2NhdGNoJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgICAgIGN0Y2ggPSBcbiAgICAgICAgICAgICAgICBlcnJyOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgIGV4cHM6IEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICAgICAgQHBvcCAgJ2NhdGNoJ1xuXG4gICAgICAgICAgICBAc2hpZnROZXdsaW5lVG9rICd0cnkgY2F0Y2ggZW5kJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdPy50ZXh0ID09ICdmaW5hbGx5J1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZmluYWxseSdcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBmbmxseSA9IEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAndHJ5J1xuXG4gICAgICAgIHRyeTpcbiAgICAgICAgICAgIGV4cHM6ICAgIGV4cHNcbiAgICAgICAgICAgIGNhdGNoOiAgIGN0Y2hcbiAgICAgICAgICAgIGZpbmFsbHk6IGZubGx5XG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NsYXNzJ1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuXG4gICAgICAgICAgICBlLmNsYXNzLmJvZHkgPSBAZXhwcyAnY2xhc3MgYm9keScgdG9rZW5zXG4gICAgICAgICAgICBAbmFtZU1ldGhvZHMgZS5jbGFzcy5ib2R5XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2NsYXNzJ1xuXG4gICAgICAgIGVcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG4gICAgZnVuYzogKGFyZ3MsIGFycm93LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2Z1bmMnXG4gICAgICAgIFxuICAgICAgICBib2R5ID0gQHNjb3BlIEBibG9jayAnYm9keScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgZSA9IGZ1bmM6e31cbiAgICAgICAgZS5mdW5jLmFyZ3MgID0gYXJncyBpZiBhcmdzXG4gICAgICAgIGUuZnVuYy5hcnJvdyA9IGFycm93XG4gICAgICAgIGUuZnVuYy5ib2R5ICA9IGJvZHlcbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSAhPSAnbmwnICAgICAgICBcbiAgICAgICAgICAgIHZhbCA9IEBibG9jayAncmV0dXJuJyB0b2tlbnNcbiAgICAgICAgICAgIGlmIHZhbD8ubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIGxvZyAnZGFmdWs/J1xuICAgICAgICAgICAgdmFsID0gdmFsP1swXVxuICAgICAgICAgICAgXG4gICAgICAgIGUgPSByZXR1cm46IHJldDogdG9rXG4gICAgICAgIGUucmV0dXJuLnZhbCA9IHZhbCBpZiB2YWxcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGNhbGw6ICh0b2ssIHRva2VucywgcW1yaykgLT5cblxuICAgICAgICBAcHVzaCAnY2FsbCdcblxuICAgICAgICB0b2sgPSB0b2sudG9rZW4gaWYgdG9rLnRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbGFzdCA9IGxhc3RMaW5lQ29sIHRva1xuICAgICAgICBpZiB0b2tlbnNbMF0udGV4dCA9PSAnKCcgYW5kIHRva2Vuc1swXS5saW5lID09IGxhc3QubGluZSBhbmQgdG9rZW5zWzBdLmNvbCA9PSBsYXN0LmNvbFxuICAgICAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgYXJncyA9IFtdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHB1c2ggJ2FyZ3MoJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcbiAgICAgICAgICAgICAgICBAcG9wICdhcmdzKCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCBpbiBbJ3R5cGVvZicgJ2RlbGV0ZSddXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdhcmcnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdhcmdzJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhcmdzID0gQGJsb2NrIG5hbWUsIHRva2Vuc1xuXG4gICAgICAgIGlmIG9wZW4gXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJyBhbmQgdG9rZW5zWzFdLnRleHQgPT0gJyknXG4gICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnaW1wbGljaXQgY2FsbCBlbmRzJyB0b2tlbnNcbiAgICAgICAgICAgICAgICBjbG9zZSA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgb3BlbiBhbmQgbm90IGNsb3NlIHRoZW4gQGVycm9yIGhkcjonY2FsbCcgbXNnOidleHBsaWNpdCBjYWxsIHdpdGhvdXQgY2xvc2luZyApJyB0b2tlbnNcblxuICAgICAgICBAcG9wICdjYWxsJ1xuICAgICAgICBcbiAgICAgICAgZSA9IGNhbGw6IGNhbGxlZTogdG9rXG4gICAgICAgIGUuY2FsbC5vcGVuICA9IG9wZW4gIGlmIG9wZW5cbiAgICAgICAgZS5jYWxsLnFtcmsgID0gcW1yayAgaWYgcW1ya1xuICAgICAgICBlLmNhbGwuYXJncyAgPSBhcmdzXG4gICAgICAgIGUuY2FsbC5jbG9zZSA9IGNsb3NlIGlmIGNsb3NlXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuICAgIG9wZXJhdGlvbjogKGxocywgb3AsIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCBcIm9wI3tvcC50ZXh0fVwiXG4gICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgIEBwb3AgXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3AudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcmhzLnN3aXRjaFxuICAgICAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMgc3dpdGNoJ1xuICAgICAgICAgICAgICAgIHJocyA9XG4gICAgICAgICAgICAgICAgICAgIGNhbGw6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsZWU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW5zOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBzOiAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICctPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyczogW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBzOiBbcmhzXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgZWxzZSBpZiBvcC50ZXh0ID09ICc/PSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb3AudGV4dCA9ICc9J1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByaHMgPSBcbiAgICAgICAgICAgICAgICBxbXJrb3A6XG4gICAgICAgICAgICAgICAgICAgIGxoczogbGhzICMgc2hvdWxkIGxocyBiZSBjbG9uZWQgaGVyZT9cbiAgICAgICAgICAgICAgICAgICAgcW1yazogXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOidvcCcgXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Oic/J1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZTogb3AubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sOiAgb3AuY29sXG4gICAgICAgICAgICAgICAgICAgIHJoczogcmhzXG4gICAgICAgICAgICBcbiAgICAgICAgZSA9IG9wZXJhdGlvbjoge31cbiAgICAgICAgZS5vcGVyYXRpb24ubGhzICAgICAgPSBsaHMgaWYgbGhzXG4gICAgICAgIGUub3BlcmF0aW9uLm9wZXJhdG9yID0gb3BcbiAgICAgICAgZS5vcGVyYXRpb24ucmhzICAgICAgPSByaHMgaWYgcmhzXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAobGhzLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpbnRvayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnaW4/J1xuICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBAcG9wICAnaW4/J1xuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogcmhzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5OlxuICAgICAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ1snXG5cbiAgICAgICAgaXRlbXMgPSBAZXhwcyAnWycgdG9rZW5zLCAnXSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdhcnJheScgJ10nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ1snXG4gICAgICAgIFxuICAgICAgICBpZiBjb21wID0gQGxjb21wIGl0ZW1zXG4gICAgICAgICAgICByZXR1cm4gY29tcFxuICAgICAgICBcbiAgICAgICAgYXJyYXk6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6IChmcm9tLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90cyA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgdXB0byA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdXB0byA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgc2xpY2U6XG4gICAgICAgICAgICBmcm9tOiBmcm9tXG4gICAgICAgICAgICBkb3RzOiBkb3RzXG4gICAgICAgICAgICB1cHRvOiB1cHRvXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgaW5kZXg6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnaWR4J1xuXG4gICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdkb3RzJ1xuICAgICAgICAgICAgc2xpY2UgPSBAc2xpY2UgbnVsbCwgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNsaWNlID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdpbmRleCcgJ10nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnaWR4J1xuXG4gICAgICAgIGluZGV4OlxuICAgICAgICAgICAgaWR4ZWU6IHRva1xuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIHNsaWR4OiBzbGljZVxuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBwYXJlbnM6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVuczpcbiAgICAgICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgICAgIGV4cHM6ICBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJygnXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICcoJyB0b2tlbnMsICcpJ1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ3BhcmVucycgJyknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnKCdcblxuICAgICAgICBpZiBjb21wID0gQGxjb21wIGV4cHNcbiAgICAgICAgICAgIHJldHVybiBjb21wXG4gICAgICAgIFxuICAgICAgICBwYXJlbnM6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgZXhwczogIGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgbGNvbXA6IChleHBzKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmID0gZXhwc1swXS5mb3JcbiAgICAgICAgXG4gICAgICAgIGxjb21wOiBleHBzWzBdXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgICAgMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgY3VybHk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDpcbiAgICAgICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICAgICAga2V5dmFsczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAneycgdG9rZW5zLCAnfSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdjdXJseScgJ30nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBbQGtleXZhbCBrZXksIHRva2Vuc11cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vucy5sZW5ndGhcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgdG9rZW5zWzFdPy50eXBlIG5vdCBpbiBbJ3NpbmdsZScnZG91YmxlJyd0cmlwbGUnJ3Zhcicna2V5d29yZCcnbnVtJ11cbiAgICAgICAgICAgICAgICBicmVhayBpZiB0b2tlbnNbMl0/LnRleHQgbm90IGluICc6ICcgIyBzcGFjZSBjaGVja3MgZm9yIG5ld2xpbmUhXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzFdPy5jb2wgPj0gZmlyc3QuY29sIGFuZCB0b2tlbnNbMV0udGV4dCBub3QgaW4gJ10pJ1xuICAgICAgICAgICAgICAgICAgICBAc2hpZnROZXdsaW5lICdjb250aW51ZSBpbXBsaWNpdCBvYmplY3Qgb24gbmwuLi4nIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBleHBzLnB1c2ggQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgICB0b2tlbnMgPSBibG9jay50b2tlbnNcbiAgICAgICAgICAgICAgICBleHBzID0gZXhwcy5jb25jYXQgQGV4cHMgJ29iamVjdCcgYmxvY2sudG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy5saW5lID09IGZpcnN0LmxpbmUgYW5kIHRva2Vuc1swXS50ZXh0IG5vdCBpbiAnXSl9OydcbiAgICAgICAgICAgICAgICBleHBzID0gZXhwcy5jb25jYXQgQGV4cHMgJ29iamVjdCcgdG9rZW5zLCAnOydcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIHRva2Vuc1swXS50ZXh0IGluICddKX07J1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIHRva2Vuc1swXS50eXBlIG5vdCBpbiBbJ3NpbmdsZScnZG91YmxlJyd0cmlwbGUnJ3Zhcicna2V5d29yZCcnbnVtJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAga2V5dmFsOiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICc6J1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHAgYmxvY2sudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBrID0gdHlwZTona2V5J1xuICAgICAgICBcbiAgICAgICAgaWYga2V5LnR5cGUgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtleS50eXBlIG5vdCBpbiBbJ2tleXdvcmQnICdvcCcgJ3B1bmN0JyAndmFyJyAndGhpcycgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgbG9nICd3aGF0IGNvdWxkIHRoYXQgYmU/JyBrZXlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgay50ZXh0ID0ga2V5LnRleHRcbiAgICAgICAgICAgIGsubGluZSA9IGtleS5saW5lXG4gICAgICAgICAgICBrLmNvbCAgPSBrZXkuY29sXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBrZXkucHJvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB7bGluZSwgY29sfSA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgICAgIHRleHQgPSBAa29kZS5yZW5kZXJlci5ub2RlIGtleVxuICAgICAgICAgICAgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzJ1xuICAgICAgICAgICAgICAgIGlmIHRleHQgPT0gJ3RoaXMnIHRoZW4gdGV4dCA9ICdAJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzLicgdGhlbiB0ZXh0ID0gJ0AnICsgdGV4dFs1Li5dXG5cbiAgICAgICAgICAgIGsudGV4dCA9IHRleHRcbiAgICAgICAgICAgIGsubGluZSA9IGxpbmVcbiAgICAgICAgICAgIGsuY29sICA9IGNvbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnV0hBVCBDT1VMRCBUSEFUIEJFPycga2V5XG4gICAgICAgICAgICBcbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtcbiAgICAgICAgICAgIGNvbG9uOiBjb2xvblxuICAgICAgICAgICAgdmFsOiAgIHZhbHVlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGFzc2VydDogKG9iaiwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgYXNzZXJ0OlxuICAgICAgICAgICAgb2JqOiAgICBvYmpcbiAgICAgICAgICAgIHFtcms6ICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBxbXJrb3A6IChsaHMsIHRva2VucykgLT5cbiAgICAgXG4gICAgICAgIEBwdXNoICc/J1xuICAgICAgICBcbiAgICAgICAgcW1yayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIHJocyAgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAgJz8nXG4gICAgICAgIFxuICAgICAgICBxbXJrb3A6XG4gICAgICAgICAgICBsaHM6ICAgIGxoc1xuICAgICAgICAgICAgcW1yazogICBxbXJrXG4gICAgICAgICAgICByaHM6ICAgIHJoc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHFtcmtjb2xvbjogKHFtcmtvcCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJzonXG4gICAgICAgIFxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIHJocyA9IEBleHAgdG9rZW5zIFxuICAgICAgICBcbiAgICAgICAgQHBvcCAgJzonXG4gICAgICAgIFxuICAgICAgICBxbXJrY29sb246XG4gICAgICAgICAgICBsaHM6ICAgIHFtcmtvcC5saHNcbiAgICAgICAgICAgIHFtcms6ICAgcW1ya29wLnFtcmtcbiAgICAgICAgICAgIG1pZDogICAgcW1ya29wLnJoc1xuICAgICAgICAgICAgY29sb246ICBjb2xvblxuICAgICAgICAgICAgcmhzOiAgICByaHNcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHRoaXM6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICB0eXBlOidwdW5jdCcgdGV4dDonLicgbGluZTpvYmoubGluZSwgY29sOm9iai5jb2xcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG5cbiAgICBlcnJvcjogKG8sIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3Agby5wb3AgaWYgby5wb3BcbiAgICAgICAgZXJyb3IgQjMoYjcoXCIgI3t0b2tlbnNbMF0/LmxpbmUgPyAnICd9IFwiKSkgKyBSMSh5NChcIiAje28uaGRyID8gby5wb3B9IFwiKSkgKyBSMih5NyhcIiAje28ubXNnfSBcIikpXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
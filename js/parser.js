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
        if (rhs != null ? rhs["switch"] : void 0) {
            this.verb('rhs is switch');
            rhs = {
                call: {
                    callee: {
                        parens: {
                            exps: [
                                {
                                    func: {
                                        arrow: {
                                            text: '=>'
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
        if (op.text === '?=') {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBb0JBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRVIsTUFBdUMsT0FBQSxDQUFRLFNBQVIsQ0FBdkMsRUFBRSwrQkFBRixFQUFnQiw2QkFBaEIsRUFBNkI7O0FBRXZCOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7O3NCQVdQLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQVYsS0FBa0IsT0FBckI7QUFDSSxtQkFBTyxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQsRUFBYyxNQUFkLEVBRFg7O1FBR0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOO1FBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtRQUNQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBVyxNQUFYO1FBRU4sQ0FBQSxHQUFJO1lBQUEsQ0FBQSxFQUFBLENBQUEsRUFDSTtnQkFBQSxJQUFBLEVBQVEsSUFBUjtnQkFDQSxJQUFBLEVBQVEsR0FEUjthQURKOztRQUlKLElBQUMsQ0FBQSxlQUFELENBQWlCLGVBQWpCLEVBQWlDLE1BQWpDLEVBQXlDLEdBQXpDLG9DQUF1RCxDQUFFLGNBQVgsS0FBbUIsTUFBakU7UUFFQSxzQ0FBWSxDQUFFLGNBQVgsS0FBbUIsT0FBdEI7WUFDSSxJQUFDLENBQUEsSUFBRCxDQUFNLDZDQUFOO1lBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMO0FB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LEdBQXJCLENBQUgsQ0FBdkMsR0FBc0UsRUFBQSxDQUFHLEVBQUEsQ0FBRyxHQUFBLEdBQUksQ0FBQyxDQUFDLEdBQU4sR0FBVSxHQUFiLENBQUgsQ0FEekQ7ZUFFbkI7SUFKRzs7OztHQXAwQlU7O0FBMDBCckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbiMgdGhpcyBpcyB0aGUgZXF1aXZhbGVudCBvZiBhIEJORiBvciBncmFtbWFyIGZvciB0aGlzIGxpdHRsZSBsYW5ndWFnZS5cbiMgICAgXG4jIGluc3RlYWQgb2YgY29udmVydGluZyBhbiBlc3NlbnRpYWxseSBkeW5hbWljIHByb2JsZW0gdG8gYSBzdGF0aWMgXG4jIHJlcHJlc2VudGF0aW9uIGFuZCB0aGVuIGNvbnZlcnRpbmcgdGhhdCBiYWNrIGludG8gZHluYW1pYyBjb2RlIGFnYWluLFxuIyBpIGRlY2lkZWQgdG8gZ28gdGhlIGRpcmVjdCByb3V0ZS5cbiNcbiMgaXQgbWlnaHQgYmUgbGVzcyBmb3JtYWwgYW5kIHNsaWd0aGx5IGxlc3MgY29uY2lzZSwgYnV0IGl0J3MgZGVmaW5pdGVseSBcbiMgbW9yZSBjdXN0b21pemFibGUgYW5kIGVhc2llciB0byBkZWJ1Zy5cbiNcbiMgYnV0IHRoZSBiaWdnZXN0IGFkdmFudGFnZSBpcyB0aGF0IHRoZSBtYWluIGZlYXR1cmVzIGFyZSBzZXBlcmF0ZWQgZnJvbVxuIyB0aGUgbmFzdHkgZGV0YWlscyBhbmQgY29ybmVyIGNhc2VzLCB3aGljaCBhcmUgaGFuZGxlZCBpbiB0aGUgYmFzZSBjbGFzc1xuXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5QYXJzZSA9IHJlcXVpcmUgJy4vcGFyc2UnXG5cbnsgZmlyc3RMaW5lQ29sLCBsYXN0TGluZUNvbCwgZW1wdHkgfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFBhcnNlciBleHRlbmRzIFBhcnNlXG5cbiAgICBzY29wZTogKGV4cHMpIC0+XG4gICAgICAgIFxuICAgICAgICB2YXJzOiBbXVxuICAgICAgICBleHBzOiBleHBzXG4gICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICByZXR1cm4gQGlmQmxvY2sgdG9rLCB0b2tlbnNcblxuICAgICAgICBAcHVzaCAnaWYnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcbiAgICAgICAgdGhuID0gQHRoZW4gJ2lmJyB0b2tlbnNcblxuICAgICAgICBlID0gaWY6XG4gICAgICAgICAgICAgICAgY29uZDogICBjb25kXG4gICAgICAgICAgICAgICAgdGhlbjogICB0aG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAnaWYgYWZ0ZXIgdGhlbicgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXT8udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICBAdmVyYiAnYmxvY2sgYWZ0ZXIgaWYgdGhlbiAtPiBzd2l0Y2ggdG8gYmxvY2sgbW9kZScgXG4gICAgICAgICAgICBAcG9wICdpZidcbiAgICAgICAgICAgIHJldHVybiBAaWZCbG9jayB0b2ssIHRva2VucywgZVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpZidcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMgPz0gW11cblxuICAgICAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgICAgIHRobiA9IEB0aGVuICdlbGlmJyB0b2tlbnNcblxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAnaWYgYWZ0ZXIgZWxpZiB0aGVuJyB0b2tlbnMsIHRvaywgdG9rZW5zWzFdPy50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLmlmLmVsaWZzLnB1c2hcbiAgICAgICAgICAgICAgICBlbGlmOlxuICAgICAgICAgICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICAgICAgICAgIHRoZW46IHRoblxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICAgICAgZS5pZi5lbHNlID0gQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdpZidcbiAgICAgICAgZVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpZkJsb2NrOiAodG9rLCB0b2tlbnMsIGUpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnaWYnXG5cbiAgICAgICAgc3ViYnMgPSBAc3ViQmxvY2tzIHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IGVcbiAgICAgICAgICAgIHRva2VucyA9IHN1YmJzLnNoaWZ0KClcbiAgICAgICAgICAgIGUgPSBpZjpcbiAgICAgICAgICAgICAgICAgICAgY29uZDogICBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICB0aGVuOiAgIEB0aGVuICdpZicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBzdWJicy5sZW5ndGhcbiAgICAgICAgICAgIHRva2VucyA9IHN1YmJzLnNoaWZ0KClcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgIGUuaWYuZWxzZSA9IEBibG9jayAnZWxzZScgdG9rZW5zXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgdGhuICA9IEB0aGVuICdlbGlmJyB0b2tlbnNcblxuICAgICAgICAgICAgZS5pZi5lbGlmcyA/PSBbXVxuICAgICAgICAgICAgZS5pZi5lbGlmcy5wdXNoXG4gICAgICAgICAgICAgICAgZWxpZjpcbiAgICAgICAgICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgICAgICAgICB0aGVuOiB0aG5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lmJ1xuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBpZlRhaWw6IChlLCB0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmOlxuICAgICAgICAgICAgY29uZDogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIHRoZW46IFtlXVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBmb3I6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdmb3InXG5cbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB2YWxzID0gdmFsc1swXSBpZiB2YWxzLmxlbmd0aCA9PSAxXG5cbiAgICAgICAgaW5vZiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBsaXN0ID0gQGV4cCB0b2tlbnNcblxuICAgICAgICB0aG4gID0gQHRoZW4gJ2ZvcicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICAgdmFsc1xuICAgICAgICAgICAgaW5vZjogICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgIGxpc3RcbiAgICAgICAgICAgIHRoZW46ICAgdGhuXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZWFjaDogKGUsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBlYWNoOlxuICAgICAgICAgICAgbGhzOiAgICBlXG4gICAgICAgICAgICBmbmM6ICAgIEBleHAgdG9rZW5zIFxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBmb3JUYWlsOiAoZSwgdG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IEBleHBzICdmb3IgdmFscycgdG9rZW5zXG5cbiAgICAgICAgdmFscyA9IHZhbHNbMF0gaWYgdmFscy5sZW5ndGggPT0gMVxuXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdmb3InIFxuICAgICAgICBcbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogIHZhbHNcbiAgICAgICAgICAgIGlub2Y6ICBpbm9mXG4gICAgICAgICAgICBsaXN0OiAgbGlzdFxuICAgICAgICAgICAgdGhlbjogW2VdXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB3aGlsZTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ3doaWxlJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHdoaWxlVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBAcHVzaCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcblxuICAgICAgICAjIEBwb3AgJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgd2hpbGU6XG4gICAgICAgICAgICBjb25kOiBjb25kXG4gICAgICAgICAgICB0aGVuOiBbZV1cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBzd2l0Y2g6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBtYXRjaCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBAZXJyb3IgcG9wOidzd2l0Y2gnIG1zZzonYmxvY2sgZXhwZWN0ZWQhJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHdoZW5zID0gW11cbiAgICAgICAgZSA9IHN3aXRjaDpcbiAgICAgICAgICAgICAgICBtYXRjaDogIG1hdGNoXG4gICAgICAgICAgICAgICAgd2hlbnM6ICB3aGVuc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCAhPSAnd2hlbidcblxuICAgICAgICAgICAgc3ViYnMgPSBAc3ViQmxvY2tzIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBzdWJicy5sZW5ndGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0b2tlbnMgPSBzdWJicy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hlbnMucHVzaCBAd2hlbiBudWxsLCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgd2hlbnNbLTJdPyBhbmQgZW1wdHkgd2hlbnNbLTJdLndoZW4udGhlbiBcbiAgICAgICAgICAgICAgICAgICAgd2hlbnNbLTFdLndoZW4udmFscyA9IHdoZW5zWy0yXS53aGVuLnZhbHMuY29uY2F0IHdoZW5zWy0xXS53aGVuLnZhbHNcbiAgICAgICAgICAgICAgICAgICAgd2hlbnMuc3BsaWNlIC0yIDEgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICd3aGVuJ1xuICAgICAgICAgICAgICAgIGxhc3RXaGVuID0gdG9rZW5zWzBdXG4gICAgICAgICAgICAgICAgd2hlbnMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ3N3aXRjaCBhZnRlciB3aGVuJyB0b2tlbnMsIGxhc3RXaGVuLCB0b2tlbnNbMV0/LnRleHQgaW4gWyd3aGVuJyAnZWxzZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZSdcbiAgICBcbiAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgIFxuICAgICAgICAgICAgICAgIGUuc3dpdGNoLmVsc2UgPSBAYmxvY2sgJ2Vsc2UnIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IFtdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSAodG9rZW5zWzBdPyBhbmQgKHRva2Vuc1swXS50eXBlIG5vdCBpbiBbJ2Jsb2NrJydubCddKSBhbmQgdG9rZW5zWzBdLnRleHQgIT0gJ3RoZW4nKVxuICAgICAgICAgICAgdmFscy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hpZnROZXdsaW5lVG9rICd3aGVuIHdpdGggZW1wdHkgdGhlbicgdG9rZW5zLCB0b2ssIGVtcHR5IHRoblxuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHdoZW46XG4gICAgICAgICAgICB2YWxzOiB2YWxzXG4gICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICB0cnk6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd0cnknXG4gICAgICAgIFxuICAgICAgICBleHBzID0gQGJsb2NrICdib2R5JyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ3RyeSBib2R5IGVuZCcgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXS50ZXh0IGluIFsnY2F0Y2gnICdmaW5hbGx5J11cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnY2F0Y2gnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBwdXNoICdjYXRjaCdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgICAgICBjdGNoID0gXG4gICAgICAgICAgICAgICAgZXJycjogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICBleHBzOiBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgICAgIEBwb3AgICdjYXRjaCdcblxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAndHJ5IGNhdGNoIGVuZCcgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXT8udGV4dCA9PSAnZmluYWxseSdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2ZpbmFsbHknXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZm5sbHkgPSBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3RyeSdcblxuICAgICAgICB0cnk6XG4gICAgICAgICAgICBleHBzOiAgICBleHBzXG4gICAgICAgICAgICBjYXRjaDogICBjdGNoXG4gICAgICAgICAgICBmaW5hbGx5OiBmbmxseVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdjbGFzcydcblxuICAgICAgICBuYW1lID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBlID0gY2xhc3M6XG4gICAgICAgICAgICBuYW1lOm5hbWVcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2V4dGVuZHMnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZS5jbGFzcy5leHRlbmRzID0gQGV4cHMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcblxuICAgICAgICAgICAgZS5jbGFzcy5ib2R5ID0gQGV4cHMgJ2NsYXNzIGJvZHknIHRva2Vuc1xuICAgICAgICAgICAgQG5hbWVNZXRob2RzIGUuY2xhc3MuYm9keVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgYm9keSA9IEBzY29wZSBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnZnVuYydcbiAgICAgICAgXG4gICAgICAgIGUgPSBmdW5jOnt9XG4gICAgICAgIGUuZnVuYy5hcmdzICA9IGFyZ3MgaWYgYXJnc1xuICAgICAgICBlLmZ1bmMuYXJyb3cgPSBhcnJvd1xuICAgICAgICBlLmZ1bmMuYm9keSAgPSBib2R5XG4gICAgICAgIGVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmV0dXJuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgIT0gJ25sJyAgICAgICAgXG4gICAgICAgICAgICB2YWwgPSBAYmxvY2sgJ3JldHVybicgdG9rZW5zXG4gICAgICAgICAgICBpZiB2YWw/Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrPydcbiAgICAgICAgICAgIHZhbCA9IHZhbD9bMF1cbiAgICAgICAgICAgIFxuICAgICAgICBlID0gcmV0dXJuOiByZXQ6IHRva1xuICAgICAgICBlLnJldHVybi52YWwgPSB2YWwgaWYgdmFsXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCB0b2tcbiAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJygnIGFuZCB0b2tlbnNbMF0ubGluZSA9PSBsYXN0LmxpbmUgYW5kIHRva2Vuc1swXS5jb2wgPT0gbGFzdC5jb2xcbiAgICAgICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICdhcmdzKCdcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJygnIHRva2VucywgJyknXG4gICAgICAgICAgICAgICAgQHBvcCAnYXJncygnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJnJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJncydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXJncyA9IEBibG9jayBuYW1lLCB0b2tlbnNcblxuICAgICAgICBpZiBvcGVuIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2ltcGxpY2l0IGNhbGwgZW5kcycgdG9rZW5zXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIG9wZW4gYW5kIG5vdCBjbG9zZSB0aGVuIEBlcnJvciBoZHI6J2NhbGwnIG1zZzonZXhwbGljaXQgY2FsbCB3aXRob3V0IGNsb3NpbmcgKScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGUgPSBjYWxsOiBjYWxsZWU6IHRva1xuICAgICAgICBlLmNhbGwub3BlbiAgPSBvcGVuICBpZiBvcGVuXG4gICAgICAgIGUuY2FsbC5xbXJrICA9IHFtcmsgIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZSBpZiBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBAcG9wIFwib3Aje29wLnRleHR9XCJcbiAgICAgICAgXG4gICAgICAgICMgaWYgb3AudGV4dCBpbiBbJz0nICcrPScgJy09JyAnLz0nICcqPScgJ3w9JyAnKycgJy0nICcvJyAnKiddXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcmhzPy5zd2l0Y2hcbiAgICAgICAgICAgIEB2ZXJiICdyaHMgaXMgc3dpdGNoJ1xuICAgICAgICAgICAgcmhzID1cbiAgICAgICAgICAgICAgICBjYWxsOlxuICAgICAgICAgICAgICAgICAgICBjYWxsZWU6XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwczogICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3c6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnPT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwczogW3Joc11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgaWYgb3AudGV4dCA9PSAnPz0nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9wLnRleHQgPSAnPSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmhzID0gXG4gICAgICAgICAgICAgICAgcW1ya29wOlxuICAgICAgICAgICAgICAgICAgICBsaHM6IGxocyAjIHNob3VsZCBsaHMgYmUgY2xvbmVkIGhlcmU/XG4gICAgICAgICAgICAgICAgICAgIHFtcms6IFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTonb3AnIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDonPydcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmU6IG9wLmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbDogIG9wLmNvbFxuICAgICAgICAgICAgICAgICAgICByaHM6IHJoc1xuICAgICAgICAgICAgXG4gICAgICAgIGUgPSBvcGVyYXRpb246IHt9XG4gICAgICAgIGUub3BlcmF0aW9uLmxocyAgICAgID0gbGhzIGlmIGxoc1xuICAgICAgICBlLm9wZXJhdGlvbi5vcGVyYXRvciA9IG9wXG4gICAgICAgIGUub3BlcmF0aW9uLnJocyAgICAgID0gcmhzIGlmIHJoc1xuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKGxocywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaW50b2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2luPydcbiAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgQHBvcCAgJ2luPydcbiAgICAgICAgXG4gICAgICAgIGluY29uZDpcbiAgICAgICAgICAgIGxoczogbGhzXG4gICAgICAgICAgICBpbjogIGludG9rXG4gICAgICAgICAgICByaHM6IHJoc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGFycmF5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIHJldHVybiBhcnJheTpcbiAgICAgICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICdbJ1xuXG4gICAgICAgIGl0ZW1zID0gQGV4cHMgJ1snIHRva2VucywgJ10nXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnYXJyYXknICddJyB0b2tlbnNcblxuICAgICAgICBAcG9wICdbJ1xuICAgICAgICBcbiAgICAgICAgaWYgY29tcCA9IEBsY29tcCBpdGVtc1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBcbiAgICAgICAgXG4gICAgICAgIGFycmF5OlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNsaWNlOiAoZnJvbSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGRvdHMgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnXSdcbiAgICAgICAgICAgIHVwdG8gPSBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHVwdG8gPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHNsaWNlOlxuICAgICAgICAgICAgZnJvbTogZnJvbVxuICAgICAgICAgICAgZG90czogZG90c1xuICAgICAgICAgICAgdXB0bzogdXB0b1xuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2lkeCdcblxuICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnZG90cydcbiAgICAgICAgICAgIHNsaWNlID0gQHNsaWNlIG51bGwsIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzbGljZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnaW5kZXgnICddJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lkeCdcblxuICAgICAgICBpbmRleDpcbiAgICAgICAgICAgIGlkeGVlOiB0b2tcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBzbGlkeDogc2xpY2VcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnKSdcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnM6XG4gICAgICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgICAgICBleHBzOiAgW11cbiAgICAgICAgICAgICAgICBjbG9zZTogdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIEBwdXNoICcoJ1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdwYXJlbnMnICcpJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJygnXG5cbiAgICAgICAgaWYgY29tcCA9IEBsY29tcCBleHBzXG4gICAgICAgICAgICByZXR1cm4gY29tcFxuICAgICAgICBcbiAgICAgICAgcGFyZW5zOlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGV4cHM6ICBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGxjb21wOiAoZXhwcykgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZiA9IGV4cHNbMF0uZm9yXG4gICAgICAgIFxuICAgICAgICBsY29tcDogZXhwc1swXVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAgIDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDBcblxuICAgIGN1cmx5OiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnfSdcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q6XG4gICAgICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAgICAgIGtleXZhbHM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6ICAgdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBleHBzID0gQGV4cHMgJ3snIHRva2VucywgJ30nXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnY3VybHknICd9JyB0b2tlbnNcblxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcbiAgICAgICAgICAgIGNsb3NlOiAgIGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgb2JqZWN0OiAoa2V5LCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZmlyc3QgPSBmaXJzdExpbmVDb2wga2V5XG4gICAgICAgIFxuICAgICAgICBleHBzID0gW0BrZXl2YWwga2V5LCB0b2tlbnNdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIHRva2Vuc1sxXT8udHlwZSBub3QgaW4gWydzaW5nbGUnJ2RvdWJsZScndHJpcGxlJyd2YXInJ2tleXdvcmQnJ251bSddXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgdG9rZW5zWzJdPy50ZXh0IG5vdCBpbiAnOiAnICMgc3BhY2UgY2hlY2tzIGZvciBuZXdsaW5lIVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHRva2Vuc1sxXT8uY29sID49IGZpcnN0LmNvbCBhbmQgdG9rZW5zWzFdLnRleHQgbm90IGluICddKSdcbiAgICAgICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnY29udGludWUgaW1wbGljaXQgb2JqZWN0IG9uIG5sLi4uJyB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgZXhwcy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgICAgICBibG9jayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgICAgdG9rZW5zID0gYmxvY2sudG9rZW5zXG4gICAgICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIGJsb2NrLnRva2Vuc1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlIGlmIHRva2Vuc1swXT8ubGluZSA9PSBmaXJzdC5saW5lIGFuZCB0b2tlbnNbMF0udGV4dCBub3QgaW4gJ10pfTsnXG4gICAgICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2VucywgJzsnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBicmVhayBpZiB0b2tlbnNbMF0udGV4dCBpbiAnXSl9OydcbiAgICAgICAgICAgICAgICBicmVhayBpZiB0b2tlbnNbMF0udHlwZSBub3QgaW4gWydzaW5nbGUnJ2RvdWJsZScndHJpcGxlJyd2YXInJ2tleXdvcmQnJ251bSddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIGtleXZhbDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIGNvbG9uID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBAcHVzaCAnOidcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgYmxvY2sgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgdmFsdWUgPSBAZXhwIGJsb2NrLnRva2Vuc1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgdmFsdWUgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJzonXG5cbiAgICAgICAgayA9IHR5cGU6J2tleSdcbiAgICAgICAgXG4gICAgICAgIGlmIGtleS50eXBlIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBrZXkudHlwZSBub3QgaW4gWydrZXl3b3JkJyAnb3AnICdwdW5jdCcgJ3ZhcicgJ3RoaXMnICdudW0nICdzaW5nbGUnICdkb3VibGUnICd0cmlwbGUnXVxuICAgICAgICAgICAgICAgIGxvZyAnd2hhdCBjb3VsZCB0aGF0IGJlPycga2V5XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGsudGV4dCA9IGtleS50ZXh0XG4gICAgICAgICAgICBrLmxpbmUgPSBrZXkubGluZVxuICAgICAgICAgICAgay5jb2wgID0ga2V5LmNvbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYga2V5LnByb3BcbiAgICAgICAgICAgIFxuICAgICAgICAgICAge2xpbmUsIGNvbH0gPSBmaXJzdExpbmVDb2wga2V5XG4gICAgICAgICAgICB0ZXh0ID0gQGtvZGUucmVuZGVyZXIubm9kZSBrZXlcbiAgICAgICAgICAgIGlmIHRleHQuc3RhcnRzV2l0aCAndGhpcydcbiAgICAgICAgICAgICAgICBpZiB0ZXh0ID09ICd0aGlzJyB0aGVuIHRleHQgPSAnQCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRleHQuc3RhcnRzV2l0aCAndGhpcy4nIHRoZW4gdGV4dCA9ICdAJyArIHRleHRbNS4uXVxuXG4gICAgICAgICAgICBrLnRleHQgPSB0ZXh0XG4gICAgICAgICAgICBrLmxpbmUgPSBsaW5lXG4gICAgICAgICAgICBrLmNvbCAgPSBjb2xcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2cgJ1dIQVQgQ09VTEQgVEhBVCBCRT8nIGtleVxuICAgICAgICAgICAgXG4gICAgICAgIGtleXZhbDpcbiAgICAgICAgICAgIGtleTogICBrXG4gICAgICAgICAgICBjb2xvbjogY29sb25cbiAgICAgICAgICAgIHZhbDogICB2YWx1ZVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuICAgIHByb3A6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgcHJvcDogdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBhc3NlcnQ6IChvYmosIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGFzc2VydDpcbiAgICAgICAgICAgIG9iajogICAgb2JqXG4gICAgICAgICAgICBxbXJrOiAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMDAgMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgIDAwMDAwIDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgcW1ya29wOiAobGhzLCB0b2tlbnMpIC0+XG4gICAgIFxuICAgICAgICBAcHVzaCAnPydcbiAgICAgICAgXG4gICAgICAgIHFtcmsgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICByaHMgID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgICc/J1xuICAgICAgICBcbiAgICAgICAgcW1ya29wOlxuICAgICAgICAgICAgbGhzOiAgICBsaHNcbiAgICAgICAgICAgIHFtcms6ICAgcW1ya1xuICAgICAgICAgICAgcmhzOiAgICByaHNcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBxbXJrY29sb246IChxbXJrb3AsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICc6J1xuICAgICAgICBcbiAgICAgICAgY29sb24gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICByaHMgPSBAZXhwIHRva2VucyBcbiAgICAgICAgXG4gICAgICAgIEBwb3AgICc6J1xuICAgICAgICBcbiAgICAgICAgcW1ya2NvbG9uOlxuICAgICAgICAgICAgbGhzOiAgICBxbXJrb3AubGhzXG4gICAgICAgICAgICBxbXJrOiAgIHFtcmtvcC5xbXJrXG4gICAgICAgICAgICBtaWQ6ICAgIHFtcmtvcC5yaHNcbiAgICAgICAgICAgIGNvbG9uOiAgY29sb25cbiAgICAgICAgICAgIHJoczogICAgcmhzXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB0aGlzOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdHlwZToncHVuY3QnIHRleHQ6Jy4nIGxpbmU6b2JqLmxpbmUsIGNvbDpvYmouY29sXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuXG4gICAgZXJyb3I6IChvLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcG9wIG8ucG9wIGlmIG8ucG9wXG4gICAgICAgIGVycm9yIEIzKGI3KFwiICN7dG9rZW5zWzBdPy5saW5lID8gJyAnfSBcIikpICsgUjEoeTQoXCIgI3tvLmhkciA/IG8ucG9wfSBcIikpICsgUjIoeTcoXCIgI3tvLm1zZ30gXCIpKVxuICAgICAgICBudWxsXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyXG4iXX0=
//# sourceURL=../coffee/parser.coffee
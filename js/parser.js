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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBb0JBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRVIsTUFBdUMsT0FBQSxDQUFRLFNBQVIsQ0FBdkMsRUFBRSwrQkFBRixFQUFnQiw2QkFBaEIsRUFBNkI7O0FBRXZCOzs7Ozs7O3FCQUVGLEtBQUEsR0FBTyxTQUFDLElBQUQ7ZUFFSDtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQ0EsSUFBQSxFQUFNLElBRE47O0lBRkc7O3NCQVdQLElBQUEsR0FBSSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBRUEsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtRQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7UUFFUCxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVcsTUFBWDtRQUVOLENBQUEsR0FBSTtZQUFBLENBQUEsRUFBQSxDQUFBLEVBQ0k7Z0JBQUEsSUFBQSxFQUFRLElBQVI7Z0JBQ0EsSUFBQSxFQUFRLEdBRFI7YUFESjs7UUFJSixJQUFDLENBQUEsZUFBRCxDQUFpQixlQUFqQixFQUFpQyxNQUFqQyxFQUF5QyxHQUF6QyxvQ0FBdUQsQ0FBRSxjQUFYLEtBQW1CLE1BQWpFO0FBRUEsaURBQWUsQ0FBRSxjQUFYLEtBQW1CLE1BQW5CLHNDQUF1QyxDQUFFLGNBQVgsS0FBbUIsSUFBdkQ7WUFFSSxNQUFNLENBQUMsS0FBUCxDQUFBO1lBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBQTs7b0JBRUksQ0FBQzs7b0JBQUQsQ0FBQyxRQUFTOztZQUVkLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUw7WUFFUCxHQUFBLEdBQU0sSUFB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QUFRLE1BQU0sQ0FBQyxJQURmO2dCQUVBLEdBQUEsRUFBUSxNQUFNLENBQUMsR0FGZjtnQkFHQSxLQUFBLEVBQVEsS0FIUjtnQkFJQSxHQUFBLEVBQVEsR0FKUjthQURKOztJQVRPOztzQkFzQlgsTUFBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLE1BQU47ZUFFRjtZQUFBLElBQUEsRUFDSTtnQkFBQSxHQUFBLEVBQU0sR0FBTjtnQkFDQSxHQUFBLEVBQU07b0JBQUEsSUFBQSxFQUFLLE9BQUw7b0JBQWEsSUFBQSxFQUFLLEdBQWxCO29CQUFzQixJQUFBLEVBQUssR0FBRyxDQUFDLElBQS9CO29CQUFxQyxHQUFBLEVBQUksR0FBRyxDQUFDLEdBQTdDO2lCQUROO2dCQUVBLElBQUEsRUFBTSxNQUFNLENBQUMsS0FBUCxDQUFBLENBRk47YUFESjs7SUFGRTs7cUJBT04sS0FBQSxHQUFPLFNBQUMsQ0FBRCxFQUFJLE1BQUo7QUFFSCxZQUFBO1FBQUEsSUFBYyxDQUFDLENBQUMsR0FBaEI7WUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxHQUFQLEVBQUE7O1FBQW1CLE9BQUEsQ0FDbkIsS0FEbUIsQ0FDYixFQUFBLENBQUcsRUFBQSxDQUFHLEdBQUEsR0FBRywyRUFBbUIsR0FBbkIsQ0FBSCxHQUEwQixHQUE3QixDQUFILENBQUEsR0FBdUMsRUFBQSxDQUFHLEVBQUEsQ0FBRyxHQUFBLEdBQUcsaUNBQVMsQ0FBQyxDQUFDLEdBQVgsQ0FBSCxHQUFrQixHQUFyQixDQUFILENBQXZDLEdBQXNFLEVBQUEsQ0FBRyxFQUFBLENBQUcsR0FBQSxHQUFJLENBQUMsQ0FBQyxHQUFOLEdBQVUsR0FBYixDQUFILENBRHpEO2VBRW5CO0lBSkc7Ozs7R0FqckJVOztBQXVyQnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG4jIHRoaXMgaXMgdGhlIGVxdWl2YWxlbnQgb2YgYSBCTkYgb3IgZ3JhbW1hciBmb3IgdGhpcyBsaXR0bGUgbGFuZ3VhZ2UuXG4jICAgIFxuIyBpbnN0ZWFkIG9mIGNvbnZlcnRpbmcgYW4gZXNzZW50aWFsbHkgZHluYW1pYyBwcm9ibGVtIHRvIGEgc3RhdGljIFxuIyByZXByZXNlbnRhdGlvbiBhbmQgdGhlbiBjb252ZXJ0aW5nIHRoYXQgYmFjayBpbnRvIGR5bmFtaWMgY29kZSBhZ2FpbixcbiMgaSBkZWNpZGVkIHRvIGdvIHRoZSBkaXJlY3Qgcm91dGUuXG4jXG4jIGl0IG1pZ2h0IGJlIGxlc3MgZm9ybWFsIGFuZCBzbGlndGhseSBsZXNzIGNvbmNpc2UsIGJ1dCBpdCdzIGRlZmluaXRlbHkgXG4jIG1vcmUgY3VzdG9taXphYmxlIGFuZCBlYXNpZXIgdG8gZGVidWcuXG4jXG4jIGJ1dCB0aGUgYmlnZ2VzdCBhZHZhbnRhZ2UgaXMgdGhhdCB0aGUgbWFpbiBmZWF0dXJlcyBhcmUgc2VwZXJhdGVkIGZyb21cbiMgdGhlIG5hc3R5IGRldGFpbHMgYW5kIGNvcm5lciBjYXNlcywgd2hpY2ggYXJlIGhhbmRsZWQgaW4gdGhlIGJhc2UgY2xhc3NcblxucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuUGFyc2UgPSByZXF1aXJlICcuL3BhcnNlJ1xuXG57IGZpcnN0TGluZUNvbCwgbGFzdExpbmVDb2wsIGVtcHR5IH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBQYXJzZXIgZXh0ZW5kcyBQYXJzZVxuXG4gICAgc2NvcGU6IChleHBzKSAtPlxuICAgICAgICBcbiAgICAgICAgdmFyczogW11cbiAgICAgICAgZXhwczogZXhwc1xuICAgIFxuICAgICMgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDBcblxuICAgIGlmOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2lmJ1xuXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ2lmJyB0b2tlbnNcblxuICAgICAgICBlID0gaWY6XG4gICAgICAgICAgICAgICAgY29uZDogICBjb25kXG4gICAgICAgICAgICAgICAgdGhlbjogICB0aG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAnaWYgYWZ0ZXIgdGhlbicgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXT8udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlIHRva2Vuc1swXT8udGV4dCA9PSAnZWxzZScgYW5kIHRva2Vuc1sxXT8udGV4dCA9PSAnaWYnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsaWZzID89IFtdXG5cbiAgICAgICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgICAgICB0aG4gPSBAdGhlbiAnZWxpZicgdG9rZW5zXG5cbiAgICAgICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ2lmIGFmdGVyIGVsaWYgdGhlbicgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXT8udGV4dCA9PSAnZWxzZSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZS5pZi5lbGlmcy5wdXNoXG4gICAgICAgICAgICAgICAgZWxpZjpcbiAgICAgICAgICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2Vsc2UnXG5cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxzZSA9IEBibG9jayAnZWxzZScgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnaWYnXG4gICAgICAgIGVcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGlmVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWY6XG4gICAgICAgICAgICBjb25kOiBAZXhwIHRva2Vuc1xuICAgICAgICAgICAgdGhlbjogW2VdXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGZvcjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcblxuICAgICAgICB2YWxzID0gQGV4cHMgJ2ZvciB2YWxzJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSB2YWxzWzBdIGlmIHZhbHMubGVuZ3RoID09IDFcblxuICAgICAgICBpbm9mID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiAgPSBAdGhlbiAnZm9yJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG5cbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICAgbGlzdFxuICAgICAgICAgICAgdGhlbjogICB0aG5cbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgZm9yVGFpbDogKGUsIHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ2ZvcidcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSBAZXhwcyAnZm9yIHZhbHMnIHRva2Vuc1xuXG4gICAgICAgIHZhbHMgPSB2YWxzWzBdIGlmIHZhbHMubGVuZ3RoID09IDFcblxuICAgICAgICBpbm9mID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGxpc3QgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnZm9yJyBcbiAgICAgICAgXG4gICAgICAgIGZvcjpcbiAgICAgICAgICAgIHZhbHM6ICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgaW5vZlxuICAgICAgICAgICAgbGlzdDogIGxpc3RcbiAgICAgICAgICAgIHRoZW46IFtlXVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgd2hpbGU6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIGNvbmQgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIHRobiA9IEB0aGVuICd3aGlsZScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlOlxuICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgdGhlbjogdGhuXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICB3aGlsZVRhaWw6IChlLCB0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgICMgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgIyBAcG9wICd3aGlsZSdcbiAgICAgICAgXG4gICAgICAgIHdoaWxlOlxuICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgdGhlbjogW2VdXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG4gICAgc3dpdGNoOiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIG1hdGNoID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEBlcnJvciBwb3A6J3N3aXRjaCcgbXNnOidibG9jayBleHBlY3RlZCEnIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgd2hlbnMgPSBbXVxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ3doZW4nXG4gICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZSA9IHN3aXRjaDpcbiAgICAgICAgICAgICAgICBtYXRjaDogIG1hdGNoXG4gICAgICAgICAgICAgICAgd2hlbnM6ICB3aGVuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IFtdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSAodG9rZW5zWzBdPyBhbmQgKHRva2Vuc1swXS50eXBlIG5vdCBpbiBbJ2Jsb2NrJydubCddKSBhbmQgdG9rZW5zWzBdLnRleHQgIT0gJ3RoZW4nKVxuICAgICAgICAgICAgdmFscy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICB0aG4gPSBAdGhlbiAnd2hlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAc2hpZnROZXdsaW5lVG9rICd3aGVuIHdpdGggZW1wdHkgdGhlbicgdG9rZW5zLCB0b2ssIGVtcHR5IHRoblxuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHdoZW46XG4gICAgICAgICAgICB2YWxzOiB2YWxzXG4gICAgICAgICAgICB0aGVuOiB0aG5cblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICB0cnk6ICh0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwdXNoICd0cnknXG4gICAgICAgIFxuICAgICAgICBleHBzID0gQGJsb2NrICdib2R5JyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBzaGlmdE5ld2xpbmVUb2sgJ3RyeSBib2R5IGVuZCcgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXS50ZXh0IGluIFsnY2F0Y2gnICdmaW5hbGx5J11cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnY2F0Y2gnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBwdXNoICdjYXRjaCdcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgICAgICBjdGNoID0gXG4gICAgICAgICAgICAgICAgZXJycjogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICBleHBzOiBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgICAgIEBwb3AgICdjYXRjaCdcblxuICAgICAgICAgICAgQHNoaWZ0TmV3bGluZVRvayAndHJ5IGNhdGNoIGVuZCcgdG9rZW5zLCB0b2ssIHRva2Vuc1sxXT8udGV4dCA9PSAnZmluYWxseSdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2ZpbmFsbHknXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZm5sbHkgPSBAYmxvY2sgJ2JvZHknIHRva2Vuc1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3RyeSdcblxuICAgICAgICB0cnk6XG4gICAgICAgICAgICBleHBzOiAgICBleHBzXG4gICAgICAgICAgICBjYXRjaDogICBjdGNoXG4gICAgICAgICAgICBmaW5hbGx5OiBmbmxseVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdjbGFzcydcblxuICAgICAgICBuYW1lID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBlID0gY2xhc3M6XG4gICAgICAgICAgICBuYW1lOm5hbWVcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ2V4dGVuZHMnXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgZS5jbGFzcy5leHRlbmRzID0gQGV4cHMgJ2NsYXNzIGV4dGVuZHMnIHRva2VucywgJ25sJ1xuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnYmxvY2snXG4gICAgICAgICAgICB0b2tlbnMgPSB0b2tlbnMuc2hpZnQoKS50b2tlbnNcbiAgICAgICAgICAgIGUuY2xhc3MuYm9keSA9IEBleHBzICdjbGFzcyBib2R5JyB0b2tlbnNcbiAgICAgICAgICAgIEBuYW1lTWV0aG9kcyBlLmNsYXNzLmJvZHlbMF0ub2JqZWN0LmtleXZhbHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCAnY2xhc3MnXG5cbiAgICAgICAgZVxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbiAgICBmdW5jOiAoYXJncywgYXJyb3csIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnZnVuYydcbiAgICAgICAgXG4gICAgICAgIGJvZHkgPSBAc2NvcGUgQGJsb2NrICdib2R5JyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2Z1bmMnXG4gICAgICAgIFxuICAgICAgICBlID0gZnVuYzp7fVxuICAgICAgICBlLmZ1bmMuYXJncyAgPSBhcmdzIGlmIGFyZ3NcbiAgICAgICAgZS5mdW5jLmFycm93ID0gYXJyb3dcbiAgICAgICAgZS5mdW5jLmJvZHkgID0gYm9keVxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlICE9ICdubCdcbiAgICAgICAgICAgIHZhbCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBlID0gcmV0dXJuOiByZXQ6IHRva1xuICAgICAgICBlLnJldHVybi52YWwgPSB2YWwgaWYgdmFsXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCB0b2tcbiAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJygnIGFuZCB0b2tlbnNbMF0ubGluZSA9PSBsYXN0LmxpbmUgYW5kIHRva2Vuc1swXS5jb2wgPT0gbGFzdC5jb2xcbiAgICAgICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICdhcmdzKCdcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJygnIHRva2VucywgJyknXG4gICAgICAgICAgICAgICAgQHBvcCAnYXJncygnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJnJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJncydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXJncyA9IEBibG9jayBuYW1lLCB0b2tlbnNcblxuICAgICAgICBpZiBvcGVuIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2ltcGxpY2l0IGNhbGwgZW5kcycgdG9rZW5zXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIG9wZW4gYW5kIG5vdCBjbG9zZSB0aGVuIEBlcnJvciBoZHI6J2NhbGwnIG1zZzonZXhwbGljaXQgY2FsbCB3aXRob3V0IGNsb3NpbmcgKScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGUgPSBjYWxsOiBjYWxsZWU6IHRva1xuICAgICAgICBlLmNhbGwub3BlbiAgPSBvcGVuICBpZiBvcGVuXG4gICAgICAgIGUuY2FsbC5xbXJrICA9IHFtcmsgIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZSBpZiBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgaWYgb3AudGV4dCA9PSAnPSdcbiAgICAgICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJocyA9IEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgZSA9IG9wZXJhdGlvbjoge31cbiAgICAgICAgZS5vcGVyYXRpb24ubGhzICAgICAgPSBsaHMgaWYgbGhzXG4gICAgICAgIGUub3BlcmF0aW9uLm9wZXJhdG9yID0gb3BcbiAgICAgICAgZS5vcGVyYXRpb24ucmhzICAgICAgPSByaHMgaWYgcmhzXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAobGhzLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBpbnRvayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnaW4/J1xuICAgICAgICByaHMgPSBAZXhwIHRva2Vuc1xuICAgICAgICBAcG9wICAnaW4/J1xuICAgICAgICBcbiAgICAgICAgaW5jb25kOlxuICAgICAgICAgICAgbGhzOiBsaHNcbiAgICAgICAgICAgIGluOiAgaW50b2tcbiAgICAgICAgICAgIHJoczogcmhzXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5OlxuICAgICAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ1snXG5cbiAgICAgICAgaXRlbXMgPSBAZXhwcyAnWycgdG9rZW5zLCAnXSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdhcnJheScgJ10nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ1snXG4gICAgICAgIFxuICAgICAgICBhcnJheTpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzbGljZTogKGZyb20sIHRva2VucykgLT5cblxuICAgICAgICBkb3RzID0gdG9rZW5zLnNoaWZ0KClcblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ10nXG4gICAgICAgICAgICB1cHRvID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB1cHRvID0gQGV4cCB0b2tlbnNcblxuICAgICAgICBzbGljZTpcbiAgICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgICAgIGRvdHM6IGRvdHNcbiAgICAgICAgICAgIHVwdG86IHVwdG9cblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICBpbmRleDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZHgnXG5cbiAgICAgICAgb3BlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2RvdHMnXG4gICAgICAgICAgICBzbGljZSA9IEBzbGljZSBudWxsLCB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2xpY2UgPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2luZGV4JyAnXScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICdpZHgnXG5cbiAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICBpZHhlZTogdG9rXG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgc2xpZHg6IHNsaWNlXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgIHBhcmVuczogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnKCdcblxuICAgICAgICBleHBzID0gQGV4cHMgJygnIHRva2VucywgJyknXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAncGFyZW5zJyAnKScgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICcoJ1xuXG4gICAgICAgIHBhcmVuczpcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBleHBzOiAgZXhwc1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgICAgMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMFxuXG4gICAgY3VybHk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICd9J1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDpcbiAgICAgICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICAgICAga2V5dmFsczogW11cbiAgICAgICAgICAgICAgICBjbG9zZTogICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAneycgdG9rZW5zLCAnfSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdjdXJseScgJ30nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ3snXG5cbiAgICAgICAgb2JqZWN0OlxuICAgICAgICAgICAgb3BlbjogICAgb3BlblxuICAgICAgICAgICAga2V5dmFsczogZXhwc1xuICAgICAgICAgICAgY2xvc2U6ICAgY2xvc2VcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBvYmplY3Q6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAneydcblxuICAgICAgICBmaXJzdCA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgXG4gICAgICAgIGV4cHMgPSBbQGtleXZhbCBrZXksIHRva2Vuc11cbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnbmwnXG4gICAgICAgICAgICBpZiB0b2tlbnNbMV0/LmNvbCA+PSBmaXJzdC5jb2wgYW5kIHRva2Vuc1sxXS50ZXh0IG5vdCBpbiAnXSknXG4gICAgICAgICAgICAgICAgQHNoaWZ0TmV3bGluZSAnY29udGludWUgYmxvY2sgb2JqZWN0IC4uLicgdG9rZW5zXG4gICAgICAgICAgICAgICAgZXhwcyA9IGV4cHMuY29uY2F0IEBleHBzICdvYmplY3QnIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB0b2tlbnNbMF0/LmxpbmUgPT0gZmlyc3QubGluZSBhbmQgdG9rZW5zWzBdLnRleHQgbm90IGluICddKX07J1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsICc7J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJzonXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cHMgJ2tleXZhbCB2YWx1ZScgYmxvY2sudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBrID0gdHlwZTona2V5J1xuICAgICAgICBcbiAgICAgICAgaWYga2V5LnR5cGUgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGtleS50eXBlIG5vdCBpbiBbJ2tleXdvcmQnICdvcCcgJ3B1bmN0JyAndmFyJyAndGhpcycgJ251bScgJ3NpbmdsZScgJ2RvdWJsZScgJ3RyaXBsZSddXG4gICAgICAgICAgICAgICAgbG9nICd3aGF0IGNvdWxkIHRoYXQgYmU/JyBrZXlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgay50ZXh0ID0ga2V5LnRleHRcbiAgICAgICAgICAgIGsubGluZSA9IGtleS5saW5lXG4gICAgICAgICAgICBrLmNvbCAgPSBrZXkuY29sXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBrZXkucHJvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB7bGluZSwgY29sfSA9IGZpcnN0TGluZUNvbCBrZXlcbiAgICAgICAgICAgIHRleHQgPSBAa29kZS5yZW5kZXJlci5ub2RlIGtleVxuICAgICAgICAgICAgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzJ1xuICAgICAgICAgICAgICAgIGlmIHRleHQgPT0gJ3RoaXMnIHRoZW4gdGV4dCA9ICdAJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgdGV4dC5zdGFydHNXaXRoICd0aGlzLicgdGhlbiB0ZXh0ID0gJ0AnICsgdGV4dFs1Li5dXG5cbiAgICAgICAgICAgIGsudGV4dCA9IHRleHRcbiAgICAgICAgICAgIGsubGluZSA9IGxpbmVcbiAgICAgICAgICAgIGsuY29sICA9IGNvbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnV0hBVCBDT1VMRCBUSEFUIEJFPycga2V5XG4gICAgICAgICAgICBcbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtcbiAgICAgICAgICAgIGNvbG9uOiBjb2xvblxuICAgICAgICAgICAgdmFsOiAgIHZhbHVlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMFxuXG4gICAgcHJvcDogKG9iaiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIHByb3A6XG4gICAgICAgICAgICBvYmo6ICBvYmpcbiAgICAgICAgICAgIGRvdDogIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGFzc2VydDogKG9iaiwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgYXNzZXJ0OlxuICAgICAgICAgICAgb2JqOiAgICBvYmpcbiAgICAgICAgICAgIHFtcms6ICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwMCAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwIDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBxbXJrb3A6IChsaHMsIHRva2VucykgLT5cbiAgICAgXG4gICAgICAgIEBwdXNoICc/J1xuICAgICAgICBcbiAgICAgICAgcW1yayA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIHJocyAgPSBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAgJz8nXG4gICAgICAgIFxuICAgICAgICBxbXJrb3A6XG4gICAgICAgICAgICBsaHM6ICAgIGxoc1xuICAgICAgICAgICAgcW1yazogICBxbXJrXG4gICAgICAgICAgICByaHM6ICAgIHJoc1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwIDAwIDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMCAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHFtcmtjb2xvbjogKHFtcmtvcCwgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJzonXG4gICAgICAgIFxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgIHJocyA9IEBleHAgdG9rZW5zIFxuICAgICAgICBcbiAgICAgICAgQHBvcCAgJzonXG4gICAgICAgIFxuICAgICAgICBxbXJrY29sb246XG4gICAgICAgICAgICBsaHM6ICAgIHFtcmtvcC5saHNcbiAgICAgICAgICAgIHFtcms6ICAgcW1ya29wLnFtcmtcbiAgICAgICAgICAgIG1pZDogICAgcW1ya29wLnJoc1xuICAgICAgICAgICAgY29sb246ICBjb2xvblxuICAgICAgICAgICAgcmhzOiAgICByaHNcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHRoaXM6IChvYmosIHRva2VucykgLT5cblxuICAgICAgICBwcm9wOlxuICAgICAgICAgICAgb2JqOiAgb2JqXG4gICAgICAgICAgICBkb3Q6ICB0eXBlOidwdW5jdCcgdGV4dDonLicgbGluZTpvYmoubGluZSwgY29sOm9iai5jb2xcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG5cbiAgICBlcnJvcjogKG8sIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3Agby5wb3AgaWYgby5wb3BcbiAgICAgICAgZXJyb3IgQjMoYjcoXCIgI3t0b2tlbnNbMF0/LmxpbmUgPyAnICd9IFwiKSkgKyBSMSh5NChcIiAje28uaGRyID8gby5wb3B9IFwiKSkgKyBSMih5NyhcIiAje28ubXNnfSBcIikpXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiJdfQ==
//# sourceURL=../coffee/parser.coffee
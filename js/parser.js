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
            if (this.debug) {
                print.tokens('when val', tokens);
            }
            vals.push(this.exp(tokens));
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

    Parser.prototype["class"] = function(tok, tokens) {
        var e, name, ref1, ref2;
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
        if (((ref1 = tokens[0]) != null ? ref1.text : void 0) === 'extends') {
            tokens.shift();
            e["class"]["extends"] = this.exps('class extends', tokens, 'nl');
        }
        if (((ref2 = tokens[0]) != null ? ref2.type : void 0) === 'block') {
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
        if (this.debug) {
            print.ast('operation lhs', lhs);
        }
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
        var close, items, ref1, ref2, ref3;
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
        var exps, first, ref1, ref2, ref3, ref4, ref5, ref6;
        this.push('{');
        first = firstLineCol(key);
        if (this.debug) {
            print.tokens('object val', tokens);
        }
        exps = [this.keyval(key, tokens)];
        if (((ref1 = tokens[0]) != null ? ref1.type : void 0) === 'nl') {
            this.verb('object nl', first.col, (ref2 = tokens[1]) != null ? ref2.col : void 0);
            if (((ref3 = tokens[1]) != null ? ref3.col : void 0) >= first.col && (ref4 = tokens[1].text, indexOf.call('])', ref4) < 0)) {
                if (this.debug) {
                    this.verb('continue block object...');
                }
                this.shiftNewline('continue block object ...', tokens);
                exps = exps.concat(this.exps('object', tokens));
            } else {
                this.verb('outdent! object done');
            }
        } else {
            if (((ref5 = tokens[0]) != null ? ref5.line : void 0) === first.line && (ref6 = tokens[0].text, indexOf.call('])};', ref6) < 0)) {
                if (this.debug) {
                    this.verb('continue inline object...');
                }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsicGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFUixNQUF1QyxPQUFBLENBQVEsU0FBUixDQUF2QyxFQUFFLCtCQUFGLEVBQWdCLDZCQUFoQixFQUE2Qjs7QUFFdkI7Ozs7Ozs7cUJBRUYsS0FBQSxHQUFPLFNBQUMsSUFBRDtlQUVIO1lBQUEsSUFBQSxFQUFNLEVBQU47WUFDQSxJQUFBLEVBQU0sSUFETjs7SUFGRzs7c0JBV1AsSUFBQSxHQUFJLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFFQSxZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOO1FBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtRQUVQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYSxNQUFiO1FBRU4sQ0FBQSxHQUFJO1lBQUEsQ0FBQSxFQUFBLENBQUEsRUFDSTtnQkFBQSxJQUFBLEVBQVEsSUFBUjtnQkFDQSxJQUFBLEVBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQLENBRFI7YUFESjs7QUFJSixpREFBZSxDQUFFLGNBQVgsS0FBbUIsTUFBbkIsc0NBQXVDLENBQUUsY0FBWCxLQUFtQixJQUF2RDtZQUVJLE1BQU0sQ0FBQyxLQUFQLENBQUE7WUFDQSxNQUFNLENBQUMsS0FBUCxDQUFBOztvQkFFSSxDQUFDOztvQkFBRCxDQUFDLFFBQVM7O1lBRWQsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTDtZQUVQLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFBYSxNQUFiO1lBRU4sQ0FBQyxFQUFDLEVBQUQsRUFBRyxDQUFD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ICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnByaW50ID0gcmVxdWlyZSAnLi9wcmludCdcblBhcnNlID0gcmVxdWlyZSAnLi9wYXJzZSdcblxueyBmaXJzdExpbmVDb2wsIGxhc3RMaW5lQ29sLCBlbXB0eSB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgUGFyc2VyIGV4dGVuZHMgUGFyc2VcblxuICAgIHNjb3BlOiAoZXhwcykgLT5cbiAgICAgICAgXG4gICAgICAgIHZhcnM6IFtdXG4gICAgICAgIGV4cHM6IGV4cHNcbiAgICBcbiAgICAjIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwXG5cbiAgICBpZjogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdpZidcblxuICAgICAgICBjb25kID0gQGV4cCB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIHRobiA9IEB0aGVuICd0aGVuJyB0b2tlbnNcblxuICAgICAgICBlID0gaWY6XG4gICAgICAgICAgICAgICAgY29uZDogICBjb25kXG4gICAgICAgICAgICAgICAgdGhlbjogICBAc2NvcGUgdGhuXG5cbiAgICAgICAgd2hpbGUgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJyBhbmQgdG9rZW5zWzFdPy50ZXh0ID09ICdpZidcblxuICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgICAgIGUuaWYuZWxpZnMgPz0gW11cblxuICAgICAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgICAgIHRobiA9IEB0aGVuICdlbGlmJyB0b2tlbnNcblxuICAgICAgICAgICAgZS5pZi5lbGlmcy5wdXNoXG4gICAgICAgICAgICAgICAgZWxpZjpcbiAgICAgICAgICAgICAgICAgICAgY29uZDogY29uZFxuICAgICAgICAgICAgICAgICAgICB0aGVuOiBAc2NvcGUgdGhuXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLmlmLmVsc2UgPSBAc2NvcGUgQGJsb2NrICdlbHNlJyB0b2tlbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAcG9wICdpZidcblxuICAgICAgICBlXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBpZlRhaWw6IChlLCB0b2ssIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmOlxuICAgICAgICAgICAgY29uZDogQGV4cCB0b2tlbnNcbiAgICAgICAgICAgIHRoZW46IEBzY29wZSBbZV1cblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZm9yOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnZm9yJ1xuXG4gICAgICAgIHZhbHMgPSBAZXhwcyAnZm9yIHZhbHMnIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgdmFscyA9IHZhbHNbMF0gaWYgdmFscy5sZW5ndGggPT0gMVxuXG4gICAgICAgIGlub2YgPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbiAgICAgICAgbGlzdCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ2ZvciB0aGVuJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2ZvcicgXG5cbiAgICAgICAgZm9yOlxuICAgICAgICAgICAgdmFsczogICB2YWxzXG4gICAgICAgICAgICBpbm9mOiAgIGlub2ZcbiAgICAgICAgICAgIGxpc3Q6ICAgbGlzdFxuICAgICAgICAgICAgdGhlbjogICBAc2NvcGUgdGhuXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB3aGlsZTogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgQHB1c2ggJ3doaWxlJ1xuICAgICAgICBcbiAgICAgICAgY29uZCA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgdGhuID0gQHRoZW4gJ3doaWxlIHRoZW4nIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHBvcCAnd2hpbGUnXG4gICAgICAgIFxuICAgICAgICB3aGlsZTpcbiAgICAgICAgICAgIGNvbmQ6IGNvbmRcbiAgICAgICAgICAgIHRoZW46IEBzY29wZSB0aG5cbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHN3aXRjaDogKHRvaywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdzd2l0Y2gnXG4gICAgICAgIFxuICAgICAgICBtYXRjaCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJ1xuICAgICAgICAgICAgdG9rZW5zID0gdG9rZW5zLnNoaWZ0KCkudG9rZW5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgICAgIHJldHVybiBlcnJvciAncGFyc2VyLnN3aXRjaDogYmxvY2sgZXhwZWN0ZWQhJ1xuICAgICAgICBcbiAgICAgICAgd2hlbnMgPSBbXVxuICAgICAgICB3aGlsZSB0b2tlbnNbMF0/LnRleHQgPT0gJ3doZW4nXG4gICAgICAgICAgICBwcmludC50b2tlbnMgJ3N3aXRjaCB3aGVuJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgICAgICB3aGVucy5wdXNoIEBleHAgdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZSA9IHN3aXRjaDpcbiAgICAgICAgICAgICAgICBtYXRjaDogIG1hdGNoXG4gICAgICAgICAgICAgICAgd2hlbnM6ICB3aGVuc1xuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICdlbHNlJ1xuXG4gICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBlLnN3aXRjaC5lbHNlID0gQGV4cHMgJ2Vsc2UnIHRva2VucywgJ25sJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwb3AgJ3N3aXRjaCdcbiAgICAgICAgXG4gICAgICAgIGVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB3aGVuOiAodG9rLCB0b2tlbnMpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHVzaCAnd2hlbidcbiAgICAgICAgXG4gICAgICAgIHZhbHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgd2hpbGUgKHRva2Vuc1swXT8gYW5kICh0b2tlbnNbMF0udHlwZSBub3QgaW4gWydibG9jaycnbmwnXSkgYW5kIHRva2Vuc1swXS50ZXh0ICE9ICd0aGVuJylcbiAgICAgICAgICAgIHByaW50LnRva2VucyAnd2hlbiB2YWwnIHRva2VucyBpZiBAZGVidWdcbiAgICAgICAgICAgIHZhbHMucHVzaCBAZXhwIHRva2Vuc1xuICAgICAgICBcbiAgICAgICAgQHZlcmIgJ3doZW4udGhlbiB0b2tlbnNbMF0nIHRva2Vuc1swXVxuICAgICAgICBcbiAgICAgICAgdGhuID0gQHRoZW4gJ3doZW4gdGhlbicgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBAcG9wICd3aGVuJ1xuICAgICAgICBcbiAgICAgICAgd2hlbjpcbiAgICAgICAgICAgIHZhbHM6IHZhbHNcbiAgICAgICAgICAgIHRoZW46IEBzY29wZSB0aG5cblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6ICh0b2ssIHRva2VucykgLT5cblxuICAgICAgICBAcHVzaCAnY2xhc3MnXG5cbiAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcycgdG9rZW5zIGlmIEBkZWJ1Z1xuXG4gICAgICAgIG5hbWUgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGUgPSBjbGFzczpcbiAgICAgICAgICAgIG5hbWU6bmFtZVxuXG4gICAgICAgIGlmIHRva2Vuc1swXT8udGV4dCA9PSAnZXh0ZW5kcydcbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBlLmNsYXNzLmV4dGVuZHMgPSBAZXhwcyAnY2xhc3MgZXh0ZW5kcycgdG9rZW5zLCAnbmwnXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIHRva2VucyA9IHRva2Vucy5zaGlmdCgpLnRva2Vuc1xuICAgICAgICAgICAgZS5jbGFzcy5ib2R5ID0gQGV4cHMgJ2NsYXNzIGJvZHknIHRva2Vuc1xuICAgICAgICAgICAgQG5hbWVNZXRob2RzIGUuY2xhc3MuYm9keVswXS5vYmplY3Qua2V5dmFsc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdmVyYiAnbm8gY2xhc3MgYm9keSEnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgcHJpbnQuYXN0ICdlLmNsYXNzLmJvZHknIGUuY2xhc3MuYm9keVxuICAgICAgICAgICAgcHJpbnQudG9rZW5zICdjbGFzcyBwb3AnIHRva2VucyBcblxuICAgICAgICBAcG9wICdjbGFzcydcblxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuICAgIGZ1bmM6IChhcmdzLCBhcnJvdywgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICdmdW5jJ1xuICAgICAgICBcbiAgICAgICAgYm9keSA9IEBzY29wZSBAZXhwcyAnZnVuYyBib2R5JyB0b2tlbnMsICdubCdcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2Z1bmMnXG4gICAgICAgIFxuICAgICAgICBlID0gZnVuYzp7fVxuICAgICAgICBlLmZ1bmMuYXJncyAgPSBhcmdzIGlmIGFyZ3NcbiAgICAgICAgZS5mdW5jLmFycm93ID0gYXJyb3dcbiAgICAgICAgZS5mdW5jLmJvZHkgID0gYm9keVxuICAgICAgICBlXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJldHVybjogKHRvaywgdG9rZW5zKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlICE9ICdubCdcbiAgICAgICAgICAgIHZhbCA9IEBleHAgdG9rZW5zXG4gICAgICAgIFxuICAgICAgICBlID0gcmV0dXJuOiByZXQ6IHRva1xuICAgICAgICBlLnJldHVybi52YWwgPSB2YWwgaWYgdmFsXG4gICAgICAgIGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBjYWxsOiAodG9rLCB0b2tlbnMsIHFtcmspIC0+XG5cbiAgICAgICAgQHB1c2ggJ2NhbGwnXG5cbiAgICAgICAgdG9rID0gdG9rLnRva2VuIGlmIHRvay50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGxhc3QgPSBsYXN0TGluZUNvbCB0b2tcbiAgICAgICAgaWYgdG9rZW5zWzBdLnRleHQgPT0gJygnIGFuZCB0b2tlbnNbMF0ubGluZSA9PSBsYXN0LmxpbmUgYW5kIHRva2Vuc1swXS5jb2wgPT0gbGFzdC5jb2xcbiAgICAgICAgICAgIG9wZW4gPSB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwdXNoICdhcmdzKCdcbiAgICAgICAgICAgICAgICBhcmdzID0gQGV4cHMgJygnIHRva2VucywgJyknXG4gICAgICAgICAgICAgICAgQHBvcCAnYXJncygnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgaW4gWyd0eXBlb2YnICdkZWxldGUnXVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJnJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5hbWUgPSAnYXJncydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXJncyA9IEBibG9jayBuYW1lLCB0b2tlbnNcblxuICAgICAgICBpZiBvcGVuIFxuICAgICAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgdG9rZW5zWzBdPy50eXBlID09ICdubCcgYW5kIHRva2Vuc1sxXS50ZXh0ID09ICcpJ1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2ltcGxpY2l0IGNhbGwgZW5kcycgdG9rZW5zXG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICAgIGlmIG9wZW4gYW5kIG5vdCBjbG9zZVxuICAgICAgICAgICAgZXJyb3IgJ3BhcnNlci5jYWxsIGV4cGxpY2l0IGNhbGwgd2l0aG91dCBjbG9zaW5nICknXG5cbiAgICAgICAgQHBvcCAnY2FsbCdcbiAgICAgICAgXG4gICAgICAgIGUgPSBjYWxsOiBjYWxsZWU6IHRva1xuICAgICAgICBlLmNhbGwub3BlbiAgPSBvcGVuICBpZiBvcGVuXG4gICAgICAgIGUuY2FsbC5xbXJrICA9IHFtcmsgIGlmIHFtcmtcbiAgICAgICAgZS5jYWxsLmFyZ3MgID0gYXJnc1xuICAgICAgICBlLmNhbGwuY2xvc2UgPSBjbG9zZSBpZiBjbG9zZVxuICAgICAgICBlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChsaHMsIG9wLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggXCJvcCN7b3AudGV4dH1cIlxuICAgICAgICBcbiAgICAgICAgcHJpbnQuYXN0ICdvcGVyYXRpb24gbGhzJyBsaHMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBpZiBvcC50ZXh0ID09ICc9J1xuICAgICAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmhzID0gQGV4cCB0b2tlbnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHBvcCBcIm9wI3tvcC50ZXh0fVwiXG4gICAgICAgIFxuICAgICAgICBlID0gb3BlcmF0aW9uOiB7fVxuICAgICAgICBlLm9wZXJhdGlvbi5saHMgICAgICA9IGxocyBpZiBsaHNcbiAgICAgICAgZS5vcGVyYXRpb24ub3BlcmF0b3IgPSBvcFxuICAgICAgICBlLm9wZXJhdGlvbi5yaHMgICAgICA9IHJocyBpZiByaHNcbiAgICAgICAgZVxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpbmNvbmQ6IChsaHMsIHRva2VucykgLT5cbiAgICAgICAgXG4gICAgICAgIGludG9rID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGluY29uZDpcbiAgICAgICAgICAgIGxoczogbGhzXG4gICAgICAgICAgICBpbjogIGludG9rXG4gICAgICAgICAgICByaHM6IEBleHAgdG9rZW5zXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgYXJyYXk6IChvcGVuLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5OlxuICAgICAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgICAgICAgICAgY2xvc2U6IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ1snXG5cbiAgICAgICAgaXRlbXMgPSBAZXhwcyAnWycgdG9rZW5zLCAnXSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdhcnJheScgJ10nIHRva2Vuc1xuXG4gICAgICAgIEBwb3AgJ1snXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ2Jsb2NrJyBhbmQgQHN0YWNrWy0xXSBub3QgaW4gWydmb3InICdpZiddXG4gICAgICAgICAgICBAdmVyYiAnZnVja2VkIHVwIGluZGVudGF0aW9uISBibG9jayBhZnRlciBhcnJheSEgZmxhdHRlbmluZyBibG9jayB0b2tlbnM6J1xuICAgICAgICAgICAgcHJpbnQudG9rZW5zICd0b2tlbnMgYmVmb3JlIHNwbGljZScgdG9rZW5zIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICB0b2tlbnMuc3BsaWNlLmFwcGx5IHRva2VucywgWzAgMV0uY29uY2F0IHRva2Vuc1swXS50b2tlbnNcbiAgICAgICAgICAgIHByaW50LnRva2VucyAndG9rZW5zIGFmdGVyIHNwbGljZScgdG9rZW5zIGlmIEB2ZXJib3NlXG5cbiAgICAgICAgYXJyYXk6XG4gICAgICAgICAgICBvcGVuOiAgb3BlblxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6IChmcm9tLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgZG90cyA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50ZXh0ID09ICddJ1xuICAgICAgICAgICAgIyB1cHRvID0gdHlwZTonbnVtJyB0ZXh0OictMSdcbiAgICAgICAgICAgIHVwdG8gPSBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHVwdG8gPSBAZXhwIHRva2Vuc1xuXG4gICAgICAgICMgaWYgbm90IHVwdG8gdGhlbiByZXR1cm4gZXJyb3IgXCJubyBzbGljZSBlbmQhXCJcbiAgICAgICAgXG4gICAgICAgIHNsaWNlOlxuICAgICAgICAgICAgZnJvbTogZnJvbVxuICAgICAgICAgICAgZG90czogZG90c1xuICAgICAgICAgICAgdXB0bzogdXB0b1xuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIGluZGV4OiAodG9rLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgQHB1c2ggJ2lkeCdcblxuICAgICAgICBvcGVuID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgXG4gICAgICAgIGlmIHRva2Vuc1swXT8udHlwZSA9PSAnZG90cydcbiAgICAgICAgICAgICMgc2xpY2UgPSBAc2xpY2Uge3R5cGU6J251bScgdGV4dDonMCd9LCB0b2tlbnNcbiAgICAgICAgICAgIHNsaWNlID0gQHNsaWNlIG51bGwsIHRva2Vuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzbGljZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgY2xvc2UgPSBAc2hpZnRDbG9zZSAnaW5kZXgnICddJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJ2lkeCdcblxuICAgICAgICBpbmRleDpcbiAgICAgICAgICAgIGlkeGVlOiB0b2tcbiAgICAgICAgICAgIG9wZW46ICBvcGVuXG4gICAgICAgICAgICBzbGlkeDogc2xpY2VcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgcGFyZW5zOiAob3BlbiwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICcoJ1xuXG4gICAgICAgIGV4cHMgPSBAZXhwcyAnKCcgdG9rZW5zLCAnKSdcblxuICAgICAgICBjbG9zZSA9IEBzaGlmdENsb3NlICdwYXJlbnMnICcpJyB0b2tlbnNcbiAgICAgICAgXG4gICAgICAgIEBwb3AgJygnXG5cbiAgICAgICAgcGFyZW5zOlxuICAgICAgICAgICAgb3BlbjogIG9wZW5cbiAgICAgICAgICAgIGV4cHM6ICBleHBzXG4gICAgICAgICAgICBjbG9zZTogY2xvc2VcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgICAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwXG5cbiAgICBjdXJseTogKG9wZW4sIHRva2VucykgLT5cblxuICAgICAgICBpZiB0b2tlbnNbMF0/LnRleHQgPT0gJ30nXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0OlxuICAgICAgICAgICAgICAgIG9wZW46ICAgIG9wZW5cbiAgICAgICAgICAgICAgICBrZXl2YWxzOiBbXVxuICAgICAgICAgICAgICAgIGNsb3NlOiAgIHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJ3snXG5cbiAgICAgICAgZXhwcyA9IEBleHBzICd7JyB0b2tlbnMsICd9J1xuXG4gICAgICAgIGNsb3NlID0gQHNoaWZ0Q2xvc2UgJ2N1cmx5JyAnfScgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAneydcblxuICAgICAgICBvYmplY3Q6XG4gICAgICAgICAgICBvcGVuOiAgICBvcGVuXG4gICAgICAgICAgICBrZXl2YWxzOiBleHBzXG4gICAgICAgICAgICBjbG9zZTogICBjbG9zZVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIG9iamVjdDogKGtleSwgdG9rZW5zKSAtPlxuXG4gICAgICAgIEBwdXNoICd7J1xuXG4gICAgICAgIGZpcnN0ID0gZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICBcbiAgICAgICAgcHJpbnQudG9rZW5zICdvYmplY3QgdmFsJyB0b2tlbnMgaWYgQGRlYnVnXG4gICAgICAgIFxuICAgICAgICBleHBzID0gW0BrZXl2YWwga2V5LCB0b2tlbnNdXG4gICAgICAgIFxuICAgICAgICBpZiB0b2tlbnNbMF0/LnR5cGUgPT0gJ25sJ1xuICAgICAgICAgICAgQHZlcmIgJ29iamVjdCBubCcgZmlyc3QuY29sLCB0b2tlbnNbMV0/LmNvbFxuICAgICAgICAgICAgaWYgdG9rZW5zWzFdPy5jb2wgPj0gZmlyc3QuY29sIGFuZCB0b2tlbnNbMV0udGV4dCBub3QgaW4gJ10pJ1xuICAgICAgICAgICAgICAgIEB2ZXJiICdjb250aW51ZSBibG9jayBvYmplY3QuLi4nIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIEBzaGlmdE5ld2xpbmUgJ2NvbnRpbnVlIGJsb2NrIG9iamVjdCAuLi4nIHRva2Vuc1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAdmVyYiAnb3V0ZGVudCEgb2JqZWN0IGRvbmUnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHRva2Vuc1swXT8ubGluZSA9PSBmaXJzdC5saW5lIGFuZCB0b2tlbnNbMF0udGV4dCBub3QgaW4gJ10pfTsnXG4gICAgICAgICAgICAgICAgQHZlcmIgJ2NvbnRpbnVlIGlubGluZSBvYmplY3QuLi4nIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIGV4cHMgPSBleHBzLmNvbmNhdCBAZXhwcyAnb2JqZWN0JyB0b2tlbnMsICc7J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcG9wICd7J1xuXG4gICAgICAgIG9iamVjdDpcbiAgICAgICAgICAgIGtleXZhbHM6IGV4cHNcblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICBrZXl2YWw6IChrZXksIHRva2VucykgLT5cblxuICAgICAgICBjb2xvbiA9IHRva2Vucy5zaGlmdCgpXG5cbiAgICAgICAgQHB1c2ggJzonXG5cbiAgICAgICAgaWYgdG9rZW5zWzBdPy50eXBlID09ICdibG9jaydcbiAgICAgICAgICAgIGJsb2NrID0gdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHZhbHVlID0gQGV4cHMgJ2tleXZhbCB2YWx1ZScgYmxvY2sudG9rZW5zXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICB2YWx1ZSA9IEBleHAgdG9rZW5zXG5cbiAgICAgICAgQHBvcCAnOidcblxuICAgICAgICBpZiBrZXkudHlwZSBpbiBbJ2tleXdvcmQnICdvcCcgJ3B1bmN0JyAndmFyJyAndGhpcyddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGtleS50eXBlID0gJ2tleSdcbiAgICAgICAgICAgIGtleS50ZXh0ID0ga2V5LnRleHRcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGtleS5wcm9wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHtsaW5lLCBjb2x9ID0gZmlyc3RMaW5lQ29sIGtleVxuICAgICAgICAgICAgdGV4dCA9IEBrb2RlLnJlbmRlcmVyLm5vZGUga2V5XG4gICAgICAgICAgICBpZiB0ZXh0LnN0YXJ0c1dpdGggJ3RoaXMnXG4gICAgICAgICAgICAgICAgaWYgdGV4dCA9PSAndGhpcycgdGhlbiB0ZXh0ID0gJ0AnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0ZXh0LnN0YXJ0c1dpdGggJ3RoaXMuJyB0aGVuIHRleHQgPSAnQCcgKyB0ZXh0WzUuLl1cbiAgICAgICAgICAgIGRlbGV0ZSBrZXkucHJvcFxuICAgICAgICAgICAga2V5LnR5cGUgPSAna2V5J1xuICAgICAgICAgICAga2V5LnRleHQgPSB0ZXh0XG4gICAgICAgICAgICBrZXkubGluZSA9IGxpbmVcbiAgICAgICAgICAgIGtleS5jb2wgID0gY29sXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvZyAnV0hBVCBDT1VMRCBUSEFUIEJFPycga2V5XG5cbiAgICAgICAga2V5dmFsOlxuICAgICAgICAgICAga2V5OiAgIGtleVxuICAgICAgICAgICAgY29sb246IGNvbG9uXG4gICAgICAgICAgICB2YWw6ICAgdmFsdWVcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbiAgICBwcm9wOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgIHByb3A6IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB0aGlzOiAob2JqLCB0b2tlbnMpIC0+XG5cbiAgICAgICAgcHJvcDpcbiAgICAgICAgICAgIG9iajogIG9ialxuICAgICAgICAgICAgZG90OiAgdHlwZToncHVuY3QnIHRleHQ6Jy4nIGxpbmU6b2JqLmxpbmUsIGNvbDpvYmouY29sXG4gICAgICAgICAgICBwcm9wOiB0b2tlbnMuc2hpZnQoKVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyXG4iXX0=
//# sourceURL=../coffee/parser.coffee
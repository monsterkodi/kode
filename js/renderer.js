// koffee 1.20.0

/*
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
 */
var Renderer, empty, kstr, opmap, print;

kstr = require('kstr');

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
};

opmap = {
    and: '&&',
    or: '||',
    '==': '===',
    '!=': '!=='
};

Renderer = (function() {
    function Renderer(kode) {
        var ref, ref1;
        this.kode = kode;
        this.debug = (ref = this.kode.args) != null ? ref.debug : void 0;
        this.verbose = (ref1 = this.kode.args) != null ? ref1.verbose : void 0;
    }

    Renderer.prototype.render = function(ast) {
        var s;
        s = '';
        s += this.block(ast);
        return s;
    };

    Renderer.prototype.block = function(nodes) {
        return nodes.map((function(_this) {
            return function(s) {
                return _this.node(s);
            };
        })(this)).join('\n');
    };

    Renderer.prototype.nodes = function(nodes, sep) {
        var ss;
        if (sep == null) {
            sep = ';';
        }
        ss = nodes.map((function(_this) {
            return function(s) {
                return _this.node(s);
            };
        })(this));
        return ss.join(sep);
    };

    Renderer.prototype.node = function(exp) {
        var a, k, s, v;
        if (!exp) {
            return '';
        }
        if ((exp.type != null) && (exp.text != null)) {
            return this.token(exp);
        }
        if (exp instanceof Array) {
            return ((function() {
                var i, len, results;
                results = [];
                for (i = 0, len = exp.length; i < len; i++) {
                    a = exp[i];
                    results.push(this.node(a));
                }
                return results;
            }).call(this)).join(';\n');
        }
        s = '';
        for (k in exp) {
            v = exp[k];
            s += (function() {
                switch (k) {
                    case 'if':
                        return this["if"](v);
                    case 'for':
                        return this["for"](v);
                    case 'while':
                        return this["while"](v);
                    case 'return':
                        return this["return"](v);
                    case 'class':
                        return this["class"](v);
                    case 'switch':
                        return this["switch"](v);
                    case 'when':
                        return this.when(v);
                    case 'operation':
                        return this.operation(v);
                    case 'incond':
                        return this.incond(v);
                    case 'parens':
                        return this.parens(v);
                    case 'object':
                        return this.object(v);
                    case 'keyval':
                        return this.keyval(v);
                    case 'array':
                        return this.array(v);
                    case 'index':
                        return this.index(v);
                    case 'slice':
                        return this.slice(v);
                    case 'prop':
                        return this.prop(v);
                    case 'func':
                        return this.func(v);
                    case 'call':
                        return this.call(v);
                    case 'var':
                        return v.text;
                    default:
                        console.log(R4('renderer.node unhandled exp'), exp);
                        return '';
                }
            }).call(this);
        }
        return s;
    };

    Renderer.prototype["class"] = function(n) {
        var i, len, m, mthds, ref, ref1, ref2, ref3, ref4, ref5, s;
        s = '';
        s += "class " + n.name.text;
        if (n["extends"]) {
            s += " extends " + n["extends"].map(function(e) {
                return e.text;
            }).join(', ');
        }
        s += '\n{';
        mthds = (ref = (ref1 = n.body) != null ? (ref2 = ref1.object) != null ? ref2.keyvals : void 0 : void 0) != null ? ref : (ref3 = n.body) != null ? (ref4 = ref3[0]) != null ? (ref5 = ref4.object) != null ? ref5.keyvals : void 0 : void 0 : void 0;
        if (mthds != null ? mthds.length : void 0) {
            mthds = this.prepareMethods(mthds);
            this.indent = '    ';
            for (i = 0, len = mthds.length; i < len; i++) {
                m = mthds[i];
                s += '\n';
                s += this.mthd(m);
            }
            s += '\n';
            this.indent = '';
        }
        s += '}';
        return s;
    };

    Renderer.prototype.prepareMethods = function(mthds) {
        var ast, b, base, bind, bn, constructor, i, j, len, len1, m, name, ref;
        bind = [];
        for (i = 0, len = mthds.length; i < len; i++) {
            m = mthds[i];
            if (!m.keyval) {
                if (!m.type === 'comment') {
                    console.log('wtf?', m);
                    print.ast('not an method?', m);
                }
                continue;
            }
            name = m.keyval.key.text;
            if (name === '@' || name === 'constructor') {
                if (constructor) {
                    console.error('more than one constructor?');
                }
                m.keyval.key.text = 'constructor';
                constructor = m;
            } else if (name.startsWith("'this.")) {
                m.keyval.key.text = 'static ' + name.slice(6, -1);
            } else if (((ref = m.keyval.val.func) != null ? ref.arrow.text : void 0) === '=>') {
                bind.push(m);
            }
        }
        if (bind.length && !constructor) {
            ast = this.kode.ast("constructor: ->");
            if (this.debug) {
                print.noon('ast', ast);
            }
            constructor = ast[0].object.keyvals[0];
            mthds.unshift(constructor);
            if (this.debug) {
                print.noon('constructor', constructor);
                print.ast('implicit constructor', constructor);
                print.ast('mthds with implicit construcotr', mthds);
            }
        }
        if (bind.length) {
            for (j = 0, len1 = bind.length; j < len1; j++) {
                b = bind[j];
                bn = b.keyval.key.text;
                if (this.verbose) {
                    console.log('method to bind:', bn);
                }
                if ((base = constructor.keyval.val.func).body != null) {
                    base.body;
                } else {
                    base.body = [];
                }
                constructor.keyval.val.func.body.push({
                    type: 'code',
                    text: "this." + bn + " = this." + bn + ".bind(this);"
                });
            }
            if (this.debug) {
                print.ast('constructor after bind', constructor);
            }
        }
        if (this.debug) {
            print.ast('prepared mthds', mthds);
        }
        return mthds;
    };

    Renderer.prototype.mthd = function(n) {
        var s;
        if (n.type === 'comment') {
            return this.comment(n);
        }
        if (n.keyval) {
            s = this.func(n.keyval.val.func, n.keyval.key.text);
        }
        return s;
    };

    Renderer.prototype.func = function(n, name) {
        var args, gi, id, ref, ref1, ref2, s, ss;
        if (name == null) {
            name = 'function';
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        s = gi + name;
        s += ' (';
        args = (ref1 = n.args) != null ? (ref2 = ref1.parens) != null ? ref2.exps : void 0 : void 0;
        if (args) {
            s += args.map((function(_this) {
                return function(a) {
                    return _this.node(a);
                };
            })(this)).join(', ');
        }
        s += ')\n';
        s += gi + '{';
        if (!empty(n.body)) {
            this.indent = gi + id;
            s += '\n';
            ss = n.body.map((function(_this) {
                return function(s) {
                    return _this.node(s);
                };
            })(this));
            if (!ss.slice(-1)[0].startsWith('return') && name !== 'constructor') {
                ss.push('return ' + kstr.lstrip(ss.pop()));
            }
            ss = ss.map((function(_this) {
                return function(s) {
                    return _this.indent + s;
                };
            })(this));
            s += ss.join(';\n');
            s += '\n' + gi;
            this.indent = gi;
        }
        s += '}';
        return s;
    };

    Renderer.prototype["return"] = function(n) {
        var s;
        s = 'return ';
        s += kstr.lstrip(this.node(n.val));
        return s;
    };

    Renderer.prototype.call = function(p) {
        var ref;
        if ((ref = p.callee.text) === 'log' || ref === 'warn' || ref === 'error') {
            p.callee.text = "console." + p.callee.text;
        }
        return (this.node(p.callee)) + "(" + (this.nodes(p.args, ',')) + ")";
    };

    Renderer.prototype["if"] = function(n) {
        var e, elif, gi, i, id, j, l, len, len1, len2, len3, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, s;
        if (!n.then) {
            console.error('if expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "if (" + (this.node(n.exp)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        ref4 = (ref3 = n.elifs) != null ? ref3 : [];
        for (j = 0, len1 = ref4.length; j < len1; j++) {
            elif = ref4[j];
            s += '\n';
            s += gi + ("else if (" + (this.node(elif.elif.exp)) + ")\n");
            s += gi + "{\n";
            ref6 = (ref5 = elif.elif.then) != null ? ref5 : [];
            for (l = 0, len2 = ref6.length; l < len2; l++) {
                e = ref6[l];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref7 = n["else"];
            for (q = 0, len3 = ref7.length; q < len3; q++) {
                e = ref7[q];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.indent = gi;
        return s;
    };

    Renderer.prototype["for"] = function(n) {
        var e, gi, i, id, len, list, listVar, ref, ref1, ref2, ref3, ref4, s, val;
        if (!n.then) {
            console.error('for expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        val = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = 'list';
        s = '';
        s += "var " + listVar + " = " + list + "\n";
        s += gi + ("for (var i = 0; i < " + listVar + ".length; i++)\n");
        s += gi + "{\n";
        s += gi + id + (val + " = " + listVar + "[i]\n");
        ref4 = (ref3 = n.then) != null ? ref3 : [];
        for (i = 0, len = ref4.length; i < len; i++) {
            e = ref4[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype["while"] = function(n) {
        var e, gi, i, id, len, ref, ref1, ref2, s;
        if (!n.then) {
            console.error('when expected then', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "while (" + (this.node(n.cond)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.then) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype["switch"] = function(n) {
        var e, gi, i, id, j, len, len1, ref, ref1, ref2, ref3, s;
        if (!n.match) {
            console.error('switch expected match', n);
        }
        if (!n.whens) {
            console.error('switch expected whens', n);
        }
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        s = '';
        s += "switch (" + (this.node(n.match)) + ")\n";
        s += gi + "{\n";
        ref2 = (ref1 = n.whens) != null ? ref1 : [];
        for (i = 0, len = ref2.length; i < len; i++) {
            e = ref2[i];
            s += gi + this.node(e) + '\n';
        }
        if (n["else"]) {
            s += gi + id + 'default:\n';
            ref3 = n["else"];
            for (j = 0, len1 = ref3.length; j < len1; j++) {
                e = ref3[j];
                s += gi + id + id + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.indent = gi;
        return s;
    };

    Renderer.prototype.when = function(n) {
        var e, i, j, len, len1, ref, ref1, s;
        if (!n.vals) {
            return console.error('when expected vals', n);
        }
        if (!n.then) {
            return console.error('when expected then', n);
        }
        s = '';
        ref = n.vals;
        for (i = 0, len = ref.length; i < len; i++) {
            e = ref[i];
            s += this.indent + 'case ' + this.node(e) + ':\n';
        }
        ref1 = n.then;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
            e = ref1[j];
            s += this.indent + '    ' + this.node(e) + '\n';
        }
        s += this.indent + '    ' + 'break';
        return s;
    };

    Renderer.prototype.token = function(tok) {
        if (tok.type === 'comment') {
            return this.comment(tok);
        } else if (tok.type === 'this') {
            return 'this';
        } else if (tok.type === 'triple') {
            return '`' + tok.text.slice(3, -3) + '`';
        } else if (tok.type === 'keyword' && tok.text === 'yes') {
            return 'true';
        } else if (tok.type === 'keyword' && tok.text === 'no') {
            return 'false';
        } else {
            return tok.text;
        }
    };

    Renderer.prototype.comment = function(tok) {
        if (tok.text.startsWith('###')) {
            return '/*' + tok.text.slice(3, -3) + '*/' + '\n';
        } else if (tok.text.startsWith('#')) {
            return kstr.pad('', tok.col) + '//' + tok.text.slice(1);
        } else {
            console.error("# comment token expected");
            return '';
        }
    };

    Renderer.prototype.operation = function(op) {
        var o, ref, ref1, ref2, ref3, ref4, ref5, ro, sep;
        o = (ref = opmap[op.operator.text]) != null ? ref : op.operator.text;
        sep = ' ';
        if (!op.lhs || !op.rhs) {
            sep = '';
        }
        if (o === '<' || o === '<=' || o === '===' || o === '!==' || o === '>=' || o === '>') {
            ro = (ref1 = opmap[(ref2 = op.rhs) != null ? (ref3 = ref2.operation) != null ? ref3.operator.text : void 0 : void 0]) != null ? ref1 : (ref4 = op.rhs) != null ? (ref5 = ref4.operation) != null ? ref5.operator.text : void 0 : void 0;
            if (ro === '<' || ro === '<=' || ro === '===' || ro === '!==' || ro === '>=' || ro === '>') {
                return '(' + this.node(op.lhs) + sep + o + sep + this.node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.node(op.rhs)) + ')';
            }
        }
        return this.node(op.lhs) + sep + o + sep + kstr.lstrip(this.node(op.rhs));
    };

    Renderer.prototype.incond = function(p) {
        return (this.node(p.rhs)) + ".indexOf(" + (this.node(p.lhs)) + ") >= 0";
    };

    Renderer.prototype.parens = function(p) {
        return "(" + (this.nodes(p.exps)) + ")";
    };

    Renderer.prototype.object = function(p) {
        return "{" + (this.nodes(p.keyvals, ',')) + "}";
    };

    Renderer.prototype.keyval = function(p) {
        return (this.node(p.key)) + ":" + (this.node(p.val));
    };

    Renderer.prototype.prop = function(p) {
        return (this.node(p.obj)) + "." + (this.node(p.prop));
    };

    Renderer.prototype.index = function(p) {
        var add, ni, o, ref;
        if (p.slidx.slice) {
            add = '';
            if (p.slidx.slice.dots.text === '..') {
                add = '+1';
            }
            return (this.node(p.idxee)) + ".slice(" + (this.node(p.slidx.slice.from)) + ", " + (this.node(p.slidx.slice.upto)) + add + ")";
        } else {
            if (p.slidx.operation) {
                o = p.slidx.operation;
                if (o.operator.text === '-' && !o.lhs && ((ref = o.rhs) != null ? ref.type : void 0) === 'num') {
                    ni = parseInt(o.rhs.text);
                    if (ni === 1) {
                        return (this.node(p.idxee)) + ".slice(-" + ni + ")[0]";
                    } else {
                        return (this.node(p.idxee)) + ".slice(-" + ni + ",-" + (ni - 1) + ")[0]";
                    }
                }
            }
            return (this.node(p.idxee)) + "[" + (this.node(p.slidx)) + "]";
        }
    };

    Renderer.prototype.array = function(p) {
        var ref;
        if ((ref = p.items[0]) != null ? ref.slice : void 0) {
            return this.slice(p.items[0].slice);
        } else {
            return "[" + (this.nodes(p.items, ',')) + "]";
        }
    };

    Renderer.prototype.slice = function(p) {
        var from, o, upto, x;
        if ((p.from.type === 'num' && 'num' === p.upto.type)) {
            from = parseInt(p.from.text);
            upto = parseInt(p.upto.text);
            if (upto - from <= 10) {
                if (p.dots.text === '...') {
                    upto--;
                }
                return '[' + (((function() {
                    var i, ref, ref1, results;
                    results = [];
                    for (x = i = ref = from, ref1 = upto; ref <= ref1 ? i <= ref1 : i >= ref1; x = ref <= ref1 ? ++i : --i) {
                        results.push(x);
                    }
                    return results;
                })()).join(',')) + ']';
            } else {
                o = p.dots.text === '...' ? '<' : '<=';
                return "(function() { var r = []; for (var i = " + from + "; i " + o + " " + upto + "; i++){ r.push(i); } return r; }).apply(this)";
            }
        } else {
            o = p.dots.text === '...' ? '<' : '<=';
            return "(function() { var r = []; for (var i = " + (this.node(p.from)) + "; i " + o + " " + (this.node(p.upto)) + "; i++){ r.push(i); } return r; }).apply(this)";
        }
    };

    return Renderer;

})();

module.exports = Renderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVSLEtBQUEsR0FDSTtJQUFBLEdBQUEsRUFBUSxJQUFSO0lBQ0EsRUFBQSxFQUFRLElBRFI7SUFFQSxJQUFBLEVBQVEsS0FGUjtJQUdBLElBQUEsRUFBUSxLQUhSOzs7QUFLRTtJQUVDLGtCQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCx1Q0FBcUIsQ0FBRTtRQUN2QixJQUFDLENBQUEsT0FBRCx5Q0FBcUIsQ0FBRTtJQUh4Qjs7dUJBS0gsTUFBQSxHQUFRLFNBQUMsR0FBRDtBQUVKLFlBQUE7UUFBQSxDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssSUFBQyxDQUFBLEtBQUQsQ0FBTyxHQUFQO2VBQ0w7SUFKSTs7dUJBTVIsS0FBQSxHQUFPLFNBQUMsS0FBRDtlQUVILEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO3VCQUFPLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTjtZQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0I7SUFGRzs7dUJBSVAs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QSxHQUF5QyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLElBQVIsQ0FBRCxDQUF6QyxHQUF1RCxNQUF2RCxHQUE2RCxDQUE3RCxHQUErRCxHQUEvRCxHQUFpRSxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLElBQVIsQ0FBRCxDQUFqRSxHQUErRSxnREFYbkY7O0lBRkk7Ozs7OztBQWVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbm9wbWFwID1cbiAgICBhbmQ6ICAgICcmJidcbiAgICBvcjogICAgICd8fCdcbiAgICAnPT0nOiAgICc9PT0nXG4gICAgJyE9JzogICAnIT09J1xuXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICByZW5kZXI6IChhc3QpIC0+XG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gQGJsb2NrIGFzdFxuICAgICAgICBzXG5cbiAgICBibG9jazogKG5vZGVzKSAtPlxuXG4gICAgICAgIG5vZGVzLm1hcCgocykgPT4gQG5vZGUgcykuam9pbiAnXFxuJ1xuICAgICAgICBcbiAgICBub2RlczogKG5vZGVzLCBzZXA9JzsnKSAtPlxuICAgICAgICBzcyA9IG5vZGVzLm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICBzcy5qb2luIHNlcFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuICAgIG5vZGU6IChleHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gJycgaWYgbm90IGV4cFxuXG4gICAgICAgIGlmIGV4cC50eXBlPyBhbmQgZXhwLnRleHQ/IHRoZW4gcmV0dXJuIEB0b2tlbiBleHBcblxuICAgICAgICBpZiBleHAgaW5zdGFuY2VvZiBBcnJheSB0aGVuIHJldHVybiAoQG5vZGUoYSkgZm9yIGEgaW4gZXhwKS5qb2luICc7XFxuJ1xuXG4gICAgICAgIHMgPSAnJ1xuXG4gICAgICAgIGZvciBrLHYgb2YgZXhwXG5cbiAgICAgICAgICAgIHMgKz0gc3dpdGNoIGtcbiAgICAgICAgICAgICAgICB3aGVuICdpZicgICAgICAgIHRoZW4gQGlmIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmb3InICAgICAgIHRoZW4gQGZvciB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hpbGUnICAgICB0aGVuIEB3aGlsZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncmV0dXJuJyAgICB0aGVuIEByZXR1cm4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NsYXNzJyAgICAgdGhlbiBAY2xhc3MgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3N3aXRjaCcgICAgdGhlbiBAc3dpdGNoIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGVuJyAgICAgIHRoZW4gQHdoZW4gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29wZXJhdGlvbicgdGhlbiBAb3BlcmF0aW9uIHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmNvbmQnICAgIHRoZW4gQGluY29uZCB2XG4gICAgICAgICAgICAgICAgd2hlbiAncGFyZW5zJyAgICB0aGVuIEBwYXJlbnMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ29iamVjdCcgICAgdGhlbiBAb2JqZWN0IHZcbiAgICAgICAgICAgICAgICB3aGVuICdrZXl2YWwnICAgIHRoZW4gQGtleXZhbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnYXJyYXknICAgICB0aGVuIEBhcnJheSB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5kZXgnICAgICB0aGVuIEBpbmRleCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc2xpY2UnICAgICB0aGVuIEBzbGljZSB2XG4gICAgICAgICAgICAgICAgd2hlbiAncHJvcCcgICAgICB0aGVuIEBwcm9wIHZcbiAgICAgICAgICAgICAgICB3aGVuICdmdW5jJyAgICAgIHRoZW4gQGZ1bmMgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2NhbGwnICAgICAgdGhlbiBAY2FsbCB2XG4gICAgICAgICAgICAgICAgd2hlbiAndmFyJyAgICAgICB0aGVuIHYudGV4dFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbG9nIFI0KCdyZW5kZXJlci5ub2RlIHVuaGFuZGxlZCBleHAnKSwgZXhwICMgaWYgQGRlYnVnIG9yIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbiAgICBjbGFzczogKG4pIC0+XG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJjbGFzcyAje24ubmFtZS50ZXh0fVwiXG5cbiAgICAgICAgaWYgbi5leHRlbmRzXG4gICAgICAgICAgICBzICs9IFwiIGV4dGVuZHMgXCIgKyBuLmV4dGVuZHMubWFwKChlKSAtPiBlLnRleHQpLmpvaW4gJywgJ1xuXG4gICAgICAgIHMgKz0gJ1xcbnsnXG5cbiAgICAgICAgbXRoZHMgPSBuLmJvZHk/Lm9iamVjdD8ua2V5dmFscyA/IG4uYm9keT9bMF0/Lm9iamVjdD8ua2V5dmFsc1xuICAgICAgICBcbiAgICAgICAgaWYgbXRoZHM/Lmxlbmd0aFxuICAgICAgICAgICAgbXRoZHMgPSBAcHJlcGFyZU1ldGhvZHMgbXRoZHNcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnICAgICdcbiAgICAgICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgICAgIHMgKz0gQG10aGQgbVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgQGluZGVudCA9ICcnXG4gICAgICAgIHMgKz0gJ30nXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgIFxuICAgIHByZXBhcmVNZXRob2RzOiAobXRoZHMpIC0+XG5cbiAgICAgICAgYmluZCA9IFtdXG4gICAgICAgIGZvciBtIGluIG10aGRzXG4gICAgICAgICAgICBpZiBub3QgbS5rZXl2YWwgXG4gICAgICAgICAgICAgICAgaWYgbm90IG0udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAgICAgbG9nICd3dGY/JyBtIFxuICAgICAgICAgICAgICAgICAgICBwcmludC5hc3QgJ25vdCBhbiBtZXRob2Q/JyBtXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIG5hbWUgPSBtLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgaWYgbmFtZSBpbiBbJ0AnICdjb25zdHJ1Y3RvciddXG4gICAgICAgICAgICAgICAgaWYgY29uc3RydWN0b3IgdGhlbiBlcnJvciAnbW9yZSB0aGFuIG9uZSBjb25zdHJ1Y3Rvcj8nXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwua2V5LnRleHQ9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IG1cbiAgICAgICAgICAgIGVsc2UgaWYgbmFtZS5zdGFydHNXaXRoIFwiJ3RoaXMuXCIgIydAJ1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLmtleS50ZXh0ID0gJ3N0YXRpYyAnICsgbmFtZVs2Li4tMl1cbiAgICAgICAgICAgIGVsc2UgaWYgbS5rZXl2YWwudmFsLmZ1bmM/LmFycm93LnRleHQgPT0gJz0+J1xuICAgICAgICAgICAgICAgIGJpbmQucHVzaCBtXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoIGFuZCBub3QgY29uc3RydWN0b3IgIyBmb3VuZCBzb21lIG1ldGhvZHMgdG8gYmluZCwgYnV0IG5vIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBhc3QgPSBAa29kZS5hc3QgXCJjb25zdHJ1Y3RvcjogLT5cIiAjIGNyZWF0ZSBvbmUgZnJvbSBzY3JhdGNoXG4gICAgICAgICAgICBwcmludC5ub29uICdhc3QnIGFzdCBpZiBAZGVidWdcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gYXN0WzBdLm9iamVjdC5rZXl2YWxzWzBdXG4gICAgICAgICAgICBtdGhkcy51bnNoaWZ0IGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBpZiBAZGVidWdcbiAgICAgICAgICAgICAgICBwcmludC5ub29uICdjb25zdHJ1Y3RvcicgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ2ltcGxpY2l0IGNvbnN0cnVjdG9yJyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbXRoZHMgd2l0aCBpbXBsaWNpdCBjb25zdHJ1Y290cicgbXRoZHNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBiaW5kLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGIgaW4gYmluZFxuICAgICAgICAgICAgICAgIGJuID0gYi5rZXl2YWwua2V5LnRleHRcbiAgICAgICAgICAgICAgICBsb2cgJ21ldGhvZCB0byBiaW5kOicgYm4gaWYgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keSA/PSBbXVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5LnB1c2ggXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJ1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcInRoaXMuI3tibn0gPSB0aGlzLiN7Ym59LmJpbmQodGhpcyk7XCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmludC5hc3QgJ2NvbnN0cnVjdG9yIGFmdGVyIGJpbmQnIGNvbnN0cnVjdG9yIGlmIEBkZWJ1Z1xuXG4gICAgICAgIHByaW50LmFzdCAncHJlcGFyZWQgbXRoZHMnIG10aGRzIGlmIEBkZWJ1Z1xuICAgICAgICBtdGhkc1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgbXRoZDogKG4pIC0+XG5cbiAgICAgICAgaWYgbi50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIEBjb21tZW50IG5cbiAgICAgICAgXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzID0gQGZ1bmMgbi5rZXl2YWwudmFsLmZ1bmMsIG4ua2V5dmFsLmtleS50ZXh0XG4gICAgICAgIHNcblxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICBcbiAgICBmdW5jOiAobiwgbmFtZT0nZnVuY3Rpb24nKSAtPlxuICAgICAgICBcbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgXG4gICAgICAgIHMgPSBnaSArIG5hbWVcbiAgICAgICAgcyArPSAnICgnXG4gICAgICAgIGFyZ3MgPSBuLmFyZ3M/LnBhcmVucz8uZXhwc1xuICAgICAgICBpZiBhcmdzXG4gICAgICAgICAgICBzICs9IGFyZ3MubWFwKChhKSA9PiBAbm9kZSBhKS5qb2luICcsICdcbiAgICAgICAgcyArPSAnKVxcbidcbiAgICAgICAgcyArPSBnaSArICd7J1xuICAgICAgICBcbiAgICAgICAgIyBwcmludC5ub29uICdmdW5jJyBuIGlmIEB2ZXJib3NlXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgZW1wdHkgbi5ib2R5XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBpbmRlbnQgPSBnaSArIGlkXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzcyA9IG4uYm9keS5tYXAgKHMpID0+IEBub2RlIHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IHNzWy0xXS5zdGFydHNXaXRoKCdyZXR1cm4nKSBhbmQgbmFtZSAhPSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgc3MucHVzaCAncmV0dXJuICcgKyBrc3RyLmxzdHJpcCBzcy5wb3AoKVxuICAgICAgICAgICAgc3MgPSBzcy5tYXAgKHMpID0+IEBpbmRlbnQgKyBzXG4gICAgICAgICAgICBzICs9IHNzLmpvaW4gJztcXG4nXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgZ2lcbiAgICAgICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzICs9ICd9J1xuICAgICAgICBzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46IChuKSAtPlxuXG4gICAgICAgIHMgPSAncmV0dXJuICdcbiAgICAgICAgcyArPSBrc3RyLmxzdHJpcCBAbm9kZSBuLnZhbFxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIFwiI3tAbm9kZShwLmNhbGxlZSl9KCN7QG5vZGVzIHAuYXJncywgJywnfSlcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnaWYgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaSArIGlkXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJpZiAoI3tAbm9kZShuLmV4cCl9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kgKyBpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGZvciBlbGlmIGluIG4uZWxpZnMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArIFwiZWxzZSBpZiAoI3tAbm9kZShlbGlmLmVsaWYuZXhwKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IGdpICsgaWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZm9yOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnZm9yIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcblxuICAgICAgICB2YWwgPSBuLnZhbHMudGV4dCA/IG4udmFsc1swXT8udGV4dFxuICAgICAgICBsaXN0ID0gQG5vZGUgbi5saXN0XG4gICAgICAgIGlmIG5vdCBsaXN0IG9yIGxpc3QgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIHByaW50Lm5vb24gJ25vIGxpc3QgZm9yJyBuLmxpc3RcbiAgICAgICAgICAgIHByaW50LmFzdCAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICBsaXN0VmFyID0gJ2xpc3QnICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInZhciAje2xpc3RWYXJ9ID0gI3tsaXN0fVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciBpID0gMDsgaSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyBpKyspXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBzICs9IGdpK2lkK1wiI3t2YWx9ID0gI3tsaXN0VmFyfVtpXVxcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK2lkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG4gICAgd2hpbGU6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICd3aGVuIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBnaStpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHN3aXRjaDogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi5tYXRjaCB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgbWF0Y2gnIG5cbiAgICAgICAgaWYgbm90IG4ud2hlbnMgdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIHdoZW5zJyBuXG5cbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpK2lkXG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInN3aXRjaCAoI3tAbm9kZSBuLm1hdGNofSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJyAgICAgICAgICAgIFxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gZ2kraWQrJ2RlZmF1bHQ6XFxuJ1xuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlXG4gICAgICAgICAgICAgICAgcyArPSBnaStpZCtpZCsgQG5vZGUoZSkgKyAnXFxuJyAgICAgICAgICAgIFxuICAgICAgICBzICs9IGdpK1wifVxcblwiXG5cbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnZhbHMgdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdmFscycgblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gcmV0dXJuIGVycm9yICd3aGVuIGV4cGVjdGVkIHRoZW4nIG5cbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArICdjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW5cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArICcgICAgJyArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJ1xuICAgICAgICBzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvay50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgQGNvbW1lbnQgdG9rXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RoaXMnIFxuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG5cbiAgICAgICAgbyAgID0gb3BtYXBbb3Aub3BlcmF0b3IudGV4dF0gPyBvcC5vcGVyYXRvci50ZXh0XG4gICAgICAgIHNlcCA9ICcgJ1xuICAgICAgICBzZXAgPSAnJyBpZiBub3Qgb3AubGhzIG9yIG5vdCBvcC5yaHNcbiAgICAgICAgXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIHJvID0gb3BtYXBbb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRdID8gb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBub2RlKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQG5vZGUob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQG5vZGUob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBAbm9kZShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIGtzdHIubHN0cmlwIEBub2RlKG9wLnJocylcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiI3tAbm9kZSBwLnJoc30uaW5kZXhPZigje0Bub2RlIHAubGhzfSkgPj0gMFwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHBhcmVuczogKHApIC0+IFwiKCN7QG5vZGVzIHAuZXhwc30pXCJcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvYmplY3Q6IChwKSAtPiBcInsje0Bub2RlcyBwLmtleXZhbHMsICcsJ319XCJcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAga2V5dmFsOiAocCkgLT4gXCIje0Bub2RlKHAua2V5KX06I3tAbm9kZShwLnZhbCl9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIHByb3A6ICAgKHApIC0+IFwiI3tAbm9kZShwLm9iail9LiN7QG5vZGUgcC5wcm9wfVwiXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpbmRleDogIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHAuc2xpZHguc2xpY2VcbiAgICAgICAgICAgIGFkZCA9ICcnXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG4gICAgICAgICAgICAgICAgYWRkID0gJysxJ1xuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje0Bub2RlIHAuc2xpZHguc2xpY2UuZnJvbX0sICN7QG5vZGUgcC5zbGlkeC5zbGljZS51cHRvfSN7YWRkfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4Lm9wZXJhdGlvbiBcbiAgICAgICAgICAgICAgICBvID0gcC5zbGlkeC5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICBpZiBvLm9wZXJhdG9yLnRleHQgPT0gJy0nIGFuZCBub3Qgby5saHMgYW5kIG8ucmhzPy50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgby5yaHMudGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBuaSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgtI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoLSN7bml9LC0je25pLTF9KVswXVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6ICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee
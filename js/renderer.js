// koffee 1.20.0

/*
00000000   00000000  000   000  0000000    00000000  00000000   00000000  00000000
000   000  000       0000  000  000   000  000       000   000  000       000   000
0000000    0000000   000 0 000  000   000  0000000   0000000    0000000   0000000
000   000  000       000  0000  000   000  000       000   000  000       000   000
000   000  00000000  000   000  0000000    00000000  000   000  00000000  000   000
 */
var Renderer, empty, kstr, print;

kstr = require('kstr');

print = require('./print');

empty = function(a) {
    return (a === '' || a === null || a === (void 0)) || (typeof a === 'object' && Object.keys(a).length === 0);
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
            sep = '';
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
        var ast, b, base, bind, bn, constructor, i, l, len, len1, m, name, ref;
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
            for (l = 0, len1 = bind.length; l < len1; l++) {
                b = bind[l];
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
        if (n.keyval) {
            s = this.indent + this.func(n.keyval.val.func, n.keyval.key.text);
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
        s = name;
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
            s += ss.join('\n');
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
        var e, elif, gi, i, id, l, len, len1, len2, len3, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, s;
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
        for (l = 0, len1 = ref4.length; l < len1; l++) {
            elif = ref4[l];
            s += '\n';
            s += gi + ("else if (" + (this.node(elif.elif.exp)) + ")\n");
            s += gi + "{\n";
            ref6 = (ref5 = elif.elif.then) != null ? ref5 : [];
            for (q = 0, len2 = ref6.length; q < len2; q++) {
                e = ref6[q];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        if (n["else"]) {
            s += '\n';
            s += gi + 'else\n';
            s += gi + "{\n";
            ref7 = n["else"];
            for (r = 0, len3 = ref7.length; r < len3; r++) {
                e = ref7[r];
                s += gi + id + this.node(e) + '\n';
            }
            s += gi + "}";
        }
        this.indent = gi;
        return s;
    };

    Renderer.prototype["for"] = function(n) {
        if (!n.then) {
            console.error('for expected then', n);
        }
        switch (n.inof.text) {
            case 'in':
                return this.for_in(n);
            case 'of':
                return this.for_of(n);
            default:
                return console.error('for expected in/of');
        }
    };

    Renderer.prototype.for_in = function(n) {
        var e, gi, i, id, j, l, len, len1, list, listVar, lv, q, ref, ref1, ref2, ref3, ref4, ref5, results, s, v;
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        list = this.node(n.list);
        if (!list || list === 'undefined') {
            print.noon('no list for', n.list);
            print.ast('no list for', n.list);
        }
        listVar = 'list';
        s = '';
        s += "var " + listVar + " = " + list + "\n";
        if (n.vals.text) {
            s += gi + ("for (var i = 0; i < " + listVar + ".length; i++)\n");
            s += gi + "{\n";
            s += gi + id + ("var " + n.vals.text + " = " + listVar + "[i]\n");
        } else if ((ref1 = n.vals.array) != null ? ref1.items : void 0) {
            s += gi + ("for (var i = 0; i < " + listVar + ".length; i++)\n");
            s += gi + "{\n";
            ref3 = (function() {
                results = [];
                for (var l = 0, ref2 = n.vals.array.items.length; 0 <= ref2 ? l < ref2 : l > ref2; 0 <= ref2 ? l++ : l--){ results.push(l); }
                return results;
            }).apply(this);
            for (i = 0, len = ref3.length; i < len; i++) {
                j = ref3[i];
                v = n.vals.array.items[j];
                s += gi + id + ("var " + v.text + " = " + listVar + "[i][" + j + "]\n");
            }
        } else if (n.vals.length > 1) {
            lv = n.vals[1].text;
            s += gi + ("for (var " + lv + " = 0; " + lv + " < " + listVar + ".length; " + lv + "++)\n");
            s += gi + "{\n";
            s += gi + id + ("var " + n.vals[0].text + " = " + listVar + "[i]\n");
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (q = 0, len1 = ref5.length; q < len1; q++) {
            e = ref5[q];
            s += gi + id + this.node(e) + '\n';
        }
        s += gi + "}";
        this.indent = gi;
        return s;
    };

    Renderer.prototype.for_of = function(n) {
        var e, gi, i, id, key, len, obj, ref, ref1, ref2, ref3, ref4, ref5, s, val;
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        key = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        val = (ref3 = n.vals[1]) != null ? ref3.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += "for (key in " + obj + ")\n";
        s += gi + "{\n";
        if (val) {
            s += gi + id + (val + " = " + obj + "[key]\n");
        }
        ref5 = (ref4 = n.then) != null ? ref4 : [];
        for (i = 0, len = ref5.length; i < len; i++) {
            e = ref5[i];
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
        var e, gi, i, id, l, len, len1, ref, ref1, ref2, ref3, s;
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
            for (l = 0, len1 = ref3.length; l < len1; l++) {
                e = ref3[l];
                s += gi + id + id + this.node(e) + '\n';
            }
        }
        s += gi + "}\n";
        this.indent = gi;
        return s;
    };

    Renderer.prototype.when = function(n) {
        var e, i, l, len, len1, ref, ref1, s;
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
        for (l = 0, len1 = ref1.length; l < len1; l++) {
            e = ref1[l];
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
        var close, lo, o, open, opmap, ref, ref1, ref2, ref3, ref4, ref5, ro, sep;
        opmap = function(o) {
            var omp, ref;
            omp = {
                and: '&&',
                or: '||',
                not: '!',
                '==': '===',
                '!=': '!=='
            };
            return (ref = omp[o]) != null ? ref : o;
        };
        o = opmap(op.operator.text);
        sep = ' ';
        if (!op.lhs || !op.rhs) {
            sep = '';
        }
        if (o === '<' || o === '<=' || o === '===' || o === '!==' || o === '>=' || o === '>') {
            lo = opmap((ref = op.lhs) != null ? (ref1 = ref.operation) != null ? ref1.operator.text : void 0 : void 0);
            if (lo === '<' || lo === '<=' || lo === '===' || lo === '!==' || lo === '>=' || lo === '>') {
                print.ast("lo " + lo, op);
                return '(' + this.node(op.lhs) + ' && ' + this.node(op.lhs.operation.rhs) + sep + o + sep + kstr.lstrip(this.node(op.rhs)) + ')';
            }
            ro = opmap((ref2 = op.rhs) != null ? (ref3 = ref2.operation) != null ? ref3.operator.text : void 0 : void 0);
            if (ro === '<' || ro === '<=' || ro === '===' || ro === '!==' || ro === '>=' || ro === '>') {
                return '(' + this.node(op.lhs) + sep + o + sep + this.node(op.rhs.operation.lhs) + ' && ' + kstr.lstrip(this.node(op.rhs)) + ')';
            }
        }
        open = close = '';
        if (o !== '=' && ((ref4 = op.rhs) != null ? (ref5 = ref4.operation) != null ? ref5.operator.text : void 0 : void 0) === '=') {
            open = '(';
            close = ')';
        }
        return this.node(op.lhs) + sep + o + sep + open + kstr.lstrip(this.node(op.rhs) + close);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVGO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELHVDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBSHhCOzt1QkFLSCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLENBQUEsR0FBSTtRQUNKLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQVA7ZUFDTDtJQUpJOzt1QkFNUixLQUFBLEdBQU8sU0FBQyxLQUFEO2VBRUgsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO1lBQVA7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixJQUEvQjtJQUZHOzt1QkFJUCxLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsR0FBUjtBQUNILFlBQUE7O1lBRFcsTUFBSTs7UUFDZixFQUFBLEdBQUssS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEs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QWUsS0FBbEI7b0JBQTZCLElBQUEsR0FBN0I7O3VCQUNBLEdBQUEsR0FBSSxDQUFDOztBQUFDO3lCQUFXLGlHQUFYO3FDQUFBO0FBQUE7O29CQUFELENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsR0FBL0IsQ0FBRCxDQUFKLEdBQXlDLElBRjdDO2FBQUEsTUFBQTtnQkFJSSxDQUFBLEdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFQLEtBQWUsS0FBbEIsR0FBNkIsR0FBN0IsR0FBc0M7dUJBQzFDLHlDQUFBLEdBQTBDLElBQTFDLEdBQStDLE1BQS9DLEdBQXFELENBQXJELEdBQXVELEdBQXZELEdBQTBELElBQTFELEdBQStELGdEQUxuRTthQUhKO1NBQUEsTUFBQTtZQVVJLENBQUEsR0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQVAsS0FBZSxLQUFsQixHQUE2QixHQUE3QixHQUFzQzttQkFDMUMseUNBQUEsR0FBeUMsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBekMsR0FBdUQsTUFBdkQsR0FBNkQsQ0FBN0QsR0FBK0QsR0FBL0QsR0FBaUUsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsQ0FBQyxJQUFSLENBQUQsQ0FBakUsR0FBK0UsZ0RBWG5GOztJQUZJOzs7Ozs7QUFlWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxua3N0ciAgPSByZXF1aXJlICdrc3RyJ1xucHJpbnQgPSByZXF1aXJlICcuL3ByaW50J1xuZW1wdHkgPSAoYSkgLT4gYSBpbiBbJycgbnVsbCB1bmRlZmluZWRdIG9yICh0eXBlb2YoYSkgPT0gJ29iamVjdCcgYW5kIE9iamVjdC5rZXlzKGEpLmxlbmd0aCA9PSAwKVxuXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgQDogKEBrb2RlKSAtPlxuXG4gICAgICAgIEBkZWJ1ZyAgID0gQGtvZGUuYXJncz8uZGVidWdcbiAgICAgICAgQHZlcmJvc2UgPSBAa29kZS5hcmdzPy52ZXJib3NlXG5cbiAgICByZW5kZXI6IChhc3QpIC0+XG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gQGJsb2NrIGFzdFxuICAgICAgICBzXG5cbiAgICBibG9jazogKG5vZGVzKSAtPlxuXG4gICAgICAgIG5vZGVzLm1hcCgocykgPT4gQG5vZGUgcykuam9pbiAnXFxuJ1xuICAgICAgICBcbiAgICBub2RlczogKG5vZGVzLCBzZXA9JycpIC0+XG4gICAgICAgIHNzID0gbm9kZXMubWFwIChzKSA9PiBAbm9kZSBzXG4gICAgICAgIHNzLmpvaW4gc2VwXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG4gICAgbm9kZTogKGV4cCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiAnJyBpZiBub3QgZXhwXG5cbiAgICAgICAgaWYgZXhwLnR5cGU/IGFuZCBleHAudGV4dD8gdGhlbiByZXR1cm4gQHRva2VuIGV4cFxuXG4gICAgICAgIGlmIGV4cCBpbnN0YW5jZW9mIEFycmF5IHRoZW4gcmV0dXJuIChAbm9kZShhKSBmb3IgYSBpbiBleHApLmpvaW4gJztcXG4nXG5cbiAgICAgICAgcyA9ICcnXG5cbiAgICAgICAgZm9yIGssdiBvZiBleHBcblxuICAgICAgICAgICAgcyArPSBzd2l0Y2gga1xuICAgICAgICAgICAgICAgIHdoZW4gJ2lmJyAgICAgICAgdGhlbiBAaWYgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2ZvcicgICAgICAgdGhlbiBAZm9yIHZcbiAgICAgICAgICAgICAgICB3aGVuICd3aGlsZScgICAgIHRoZW4gQHdoaWxlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdyZXR1cm4nICAgIHRoZW4gQHJldHVybiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2xhc3MnICAgICB0aGVuIEBjbGFzcyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnc3dpdGNoJyAgICB0aGVuIEBzd2l0Y2ggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doZW4nICAgICAgdGhlbiBAd2hlbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb3BlcmF0aW9uJyB0aGVuIEBvcGVyYXRpb24gdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luY29uZCcgICAgdGhlbiBAaW5jb25kIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwYXJlbnMnICAgIHRoZW4gQHBhcmVucyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnb2JqZWN0JyAgICB0aGVuIEBvYmplY3QgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2tleXZhbCcgICAgdGhlbiBAa2V5dmFsIHZcbiAgICAgICAgICAgICAgICB3aGVuICdhcnJheScgICAgIHRoZW4gQGFycmF5IHZcbiAgICAgICAgICAgICAgICB3aGVuICdpbmRleCcgICAgIHRoZW4gQGluZGV4IHZcbiAgICAgICAgICAgICAgICB3aGVuICdzbGljZScgICAgIHRoZW4gQHNsaWNlIHZcbiAgICAgICAgICAgICAgICB3aGVuICdwcm9wJyAgICAgIHRoZW4gQHByb3AgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2Z1bmMnICAgICAgdGhlbiBAZnVuYyB2XG4gICAgICAgICAgICAgICAgd2hlbiAnY2FsbCcgICAgICB0aGVuIEBjYWxsIHZcbiAgICAgICAgICAgICAgICB3aGVuICd2YXInICAgICAgIHRoZW4gdi50ZXh0XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsb2cgUjQoJ3JlbmRlcmVyLm5vZGUgdW5oYW5kbGVkIGV4cCcpLCBleHAgIyBpZiBAZGVidWcgb3IgQHZlcmJvc2VcbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuICAgIGNsYXNzOiAobikgLT5cblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcImNsYXNzICN7bi5uYW1lLnRleHR9XCJcblxuICAgICAgICBpZiBuLmV4dGVuZHNcbiAgICAgICAgICAgIHMgKz0gXCIgZXh0ZW5kcyBcIiArIG4uZXh0ZW5kcy5tYXAoKGUpIC0+IGUudGV4dCkuam9pbiAnLCAnXG5cbiAgICAgICAgcyArPSAnXFxueydcblxuICAgICAgICBtdGhkcyA9IG4uYm9keT8ub2JqZWN0Py5rZXl2YWxzID8gbi5ib2R5P1swXT8ub2JqZWN0Py5rZXl2YWxzXG4gICAgICAgIFxuICAgICAgICBpZiBtdGhkcz8ubGVuZ3RoXG4gICAgICAgICAgICBtdGhkcyA9IEBwcmVwYXJlTWV0aG9kcyBtdGhkc1xuICAgICAgICAgICAgQGluZGVudCA9ICcgICAgJ1xuICAgICAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICAgICAgcyArPSBAbXRoZCBtXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBAaW5kZW50ID0gJydcbiAgICAgICAgcyArPSAnfSdcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgXG4gICAgcHJlcGFyZU1ldGhvZHM6IChtdGhkcykgLT5cblxuICAgICAgICBiaW5kID0gW11cbiAgICAgICAgZm9yIG0gaW4gbXRoZHNcbiAgICAgICAgICAgIGlmIG5vdCBtLmtleXZhbCBcbiAgICAgICAgICAgICAgICBpZiBub3QgbS50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgICAgICAgICBsb2cgJ3d0Zj8nIG0gXG4gICAgICAgICAgICAgICAgICAgIHByaW50LmFzdCAnbm90IGFuIG1ldGhvZD8nIG1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgbmFtZSA9IG0ua2V5dmFsLmtleS50ZXh0XG4gICAgICAgICAgICBpZiBuYW1lIGluIFsnQCcgJ2NvbnN0cnVjdG9yJ11cbiAgICAgICAgICAgICAgICBpZiBjb25zdHJ1Y3RvciB0aGVuIGVycm9yICdtb3JlIHRoYW4gb25lIGNvbnN0cnVjdG9yPydcbiAgICAgICAgICAgICAgICBtLmtleXZhbC5rZXkudGV4dD0gJ2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gbVxuICAgICAgICAgICAgZWxzZSBpZiBuYW1lLnN0YXJ0c1dpdGggXCIndGhpcy5cIiAjJ0AnXG4gICAgICAgICAgICAgICAgbS5rZXl2YWwua2V5LnRleHQgPSAnc3RhdGljICcgKyBuYW1lWzYuLi0yXVxuICAgICAgICAgICAgZWxzZSBpZiBtLmtleXZhbC52YWwuZnVuYz8uYXJyb3cudGV4dCA9PSAnPT4nXG4gICAgICAgICAgICAgICAgYmluZC5wdXNoIG1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgYmluZC5sZW5ndGggYW5kIG5vdCBjb25zdHJ1Y3RvciAjIGZvdW5kIHNvbWUgbWV0aG9kcyB0byBiaW5kLCBidXQgbm8gY29uc3RydWN0b3JcbiAgICAgICAgICAgIGFzdCA9IEBrb2RlLmFzdCBcImNvbnN0cnVjdG9yOiAtPlwiICMgY3JlYXRlIG9uZSBmcm9tIHNjcmF0Y2hcbiAgICAgICAgICAgIHByaW50Lm5vb24gJ2FzdCcgYXN0IGlmIEBkZWJ1Z1xuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBhc3RbMF0ub2JqZWN0LmtleXZhbHNbMF1cbiAgICAgICAgICAgIG10aGRzLnVuc2hpZnQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgICAgICAgIHByaW50Lm5vb24gJ2NvbnN0cnVjdG9yJyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIHByaW50LmFzdCAnaW1wbGljaXQgY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdtdGhkcyB3aXRoIGltcGxpY2l0IGNvbnN0cnVjb3RyJyBtdGhkc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJpbmQubGVuZ3RoXG4gICAgICAgICAgICBmb3IgYiBpbiBiaW5kXG4gICAgICAgICAgICAgICAgYm4gPSBiLmtleXZhbC5rZXkudGV4dFxuICAgICAgICAgICAgICAgIGxvZyAnbWV0aG9kIHRvIGJpbmQ6JyBibiBpZiBAdmVyYm9zZVxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLmtleXZhbC52YWwuZnVuYy5ib2R5ID89IFtdXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkucHVzaCBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvZGUnXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwidGhpcy4je2JufSA9IHRoaXMuI3tibn0uYmluZCh0aGlzKTtcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByaW50LmFzdCAnY29uc3RydWN0b3IgYWZ0ZXIgYmluZCcgY29uc3RydWN0b3IgaWYgQGRlYnVnXG5cbiAgICAgICAgcHJpbnQuYXN0ICdwcmVwYXJlZCBtdGhkcycgbXRoZHMgaWYgQGRlYnVnXG4gICAgICAgIG10aGRzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBtdGhkOiAobikgLT5cblxuICAgICAgICAjIGlmIG4udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICMgcmV0dXJuIEBjb21tZW50IG5cbiAgICAgICAgXG4gICAgICAgIGlmIG4ua2V5dmFsXG4gICAgICAgICAgICBzID0gQGluZGVudCArIEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jLCBuLmtleXZhbC5rZXkudGV4dFxuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZnVuYzogKG4sIG5hbWU9J2Z1bmN0aW9uJykgLT5cbiAgICAgICAgXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIFxuICAgICAgICBzID0gbmFtZVxuICAgICAgICBzICs9ICcgKCdcbiAgICAgICAgYXJncyA9IG4uYXJncz8ucGFyZW5zPy5leHBzXG4gICAgICAgIGlmIGFyZ3NcbiAgICAgICAgICAgIHMgKz0gYXJncy5tYXAoKGEpID0+IEBub2RlIGEpLmpvaW4gJywgJ1xuICAgICAgICBzICs9ICcpXFxuJ1xuICAgICAgICBzICs9IGdpICsgJ3snXG4gICAgICAgIFxuICAgICAgICAjIHByaW50Lm5vb24gJ2Z1bmMnIG4gaWYgQHZlcmJvc2VcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBlbXB0eSBuLmJvZHlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGluZGVudCA9IGdpICsgaWRcbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHNzID0gbi5ib2R5Lm1hcCAocykgPT4gQG5vZGUgc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBub3Qgc3NbLTFdLnN0YXJ0c1dpdGgoJ3JldHVybicpIGFuZCBuYW1lICE9ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgICBzcy5wdXNoICdyZXR1cm4gJyArIGtzdHIubHN0cmlwIHNzLnBvcCgpXG4gICAgICAgICAgICBzcyA9IHNzLm1hcCAocykgPT4gQGluZGVudCArIHNcbiAgICAgICAgICAgIHMgKz0gc3Muam9pbiAnXFxuJ1xuICAgICAgICAgICAgcyArPSAnXFxuJyArIGdpXG4gICAgICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgcyArPSAnfSdcbiAgICAgICAgc1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmV0dXJuOiAobikgLT5cblxuICAgICAgICBzID0gJ3JldHVybiAnXG4gICAgICAgIHMgKz0ga3N0ci5sc3RyaXAgQG5vZGUgbi52YWxcbiAgICAgICAgc1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGNhbGw6IChwKSAtPlxuICAgICAgICBpZiBwLmNhbGxlZS50ZXh0IGluIFsnbG9nJyd3YXJuJydlcnJvciddXG4gICAgICAgICAgICBwLmNhbGxlZS50ZXh0ID0gXCJjb25zb2xlLiN7cC5jYWxsZWUudGV4dH1cIlxuICAgICAgICBcIiN7QG5vZGUocC5jYWxsZWUpfSgje0Bub2RlcyBwLmFyZ3MsICcsJ30pXCJcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwMFxuICAgICMgMDAwICAwMDBcbiAgICAjIDAwMCAgMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDBcblxuICAgIGlmOiAobikgLT5cblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ2lmIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kgKyBpZFxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiaWYgKCN7QG5vZGUobi5leHApfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IGdpICsgaWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcblxuICAgICAgICBmb3IgZWxpZiBpbiBuLmVsaWZzID8gW11cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2kgKyBcImVsc2UgaWYgKCN7QG5vZGUoZWxpZi5lbGlmLmV4cCl9KVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBlbGlmLmVsaWYudGhlbiA/IFtdXG4gICAgICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArICdlbHNlXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlXG4gICAgICAgICAgICAgICAgIHMgKz0gZ2kgKyBpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGZvcjogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ2ZvciBleHBlY3RlZCB0aGVuJyBuXG5cbiAgICAgICAgc3dpdGNoIG4uaW5vZi50ZXh0IFxuICAgICAgICAgICAgd2hlbiAnaW4nIHRoZW4gQGZvcl9pbiBuXG4gICAgICAgICAgICB3aGVuICdvZicgdGhlbiBAZm9yX29mIG5cbiAgICAgICAgICAgIGVsc2UgZXJyb3IgJ2ZvciBleHBlY3RlZCBpbi9vZidcbiAgICAgICAgXG4gICAgZm9yX2luOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuXG4gICAgICAgIGxpc3QgPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBsaXN0IG9yIGxpc3QgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIHByaW50Lm5vb24gJ25vIGxpc3QgZm9yJyBuLmxpc3RcbiAgICAgICAgICAgIHByaW50LmFzdCAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIGxpc3RWYXIgPSAnbGlzdCcgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwidmFyICN7bGlzdFZhcn0gPSAje2xpc3R9XFxuXCJcbiAgICAgICAgaWYgbi52YWxzLnRleHRcbiAgICAgICAgICAgIHMgKz0gZ2krXCJmb3IgKHZhciBpID0gMDsgaSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyBpKyspXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2kraWQrXCJ2YXIgI3tuLnZhbHMudGV4dH0gPSAje2xpc3RWYXJ9W2ldXFxuXCJcbiAgICAgICAgZWxzZSBpZiBuLnZhbHMuYXJyYXk/Lml0ZW1zXG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgaSA9IDA7IGkgPCAje2xpc3RWYXJ9Lmxlbmd0aDsgaSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgaiBpbiAwLi4ubi52YWxzLmFycmF5Lml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIHYgPSBuLnZhbHMuYXJyYXkuaXRlbXNbal1cbiAgICAgICAgICAgICAgICBzICs9IGdpK2lkK1widmFyICN7di50ZXh0fSA9ICN7bGlzdFZhcn1baV1bI3tqfV1cXG5cIlxuICAgICAgICBlbHNlIGlmIG4udmFscy5sZW5ndGggPiAxXG4gICAgICAgICAgICBsdiA9IG4udmFsc1sxXS50ZXh0XG4gICAgICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgI3tsdn0gPSAwOyAje2x2fSA8ICN7bGlzdFZhcn0ubGVuZ3RoOyAje2x2fSsrKVxcblwiXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBzICs9IGdpK2lkK1widmFyICN7bi52YWxzWzBdLnRleHR9ID0gI3tsaXN0VmFyfVtpXVxcblwiXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuICAgICAgICBcbiAgICBmb3Jfb2Y6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpK2lkXG5cbiAgICAgICAga2V5ID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgdmFsID0gbi52YWxzWzFdPy50ZXh0XG4gICAgICAgIFxuICAgICAgICBvYmogPSBAbm9kZSBuLmxpc3RcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJmb3IgKGtleSBpbiAje29ian0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgIHMgKz0gZ2kraWQrXCIje3ZhbH0gPSAje29ian1ba2V5XVxcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK2lkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG4gICAgd2hpbGU6IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG4udGhlbiB0aGVuIGVycm9yICd3aGVuIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcIndoaWxlICgje0Bub2RlIG4uY29uZH0pXFxuXCJcbiAgICAgICAgcyArPSBnaStcIntcXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBnaStpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHN3aXRjaDogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi5tYXRjaCB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgbWF0Y2gnIG5cbiAgICAgICAgaWYgbm90IG4ud2hlbnMgdGhlbiBlcnJvciAnc3dpdGNoIGV4cGVjdGVkIHdoZW5zJyBuXG5cbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpK2lkXG4gICAgICAgIFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBcInN3aXRjaCAoI3tAbm9kZSBuLm1hdGNofSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4ud2hlbnMgPyBbXVxuICAgICAgICAgICAgcyArPSBnaSsgQG5vZGUoZSkgKyAnXFxuJyAgICAgICAgICAgIFxuICAgICAgICBpZiBuLmVsc2VcbiAgICAgICAgICAgIHMgKz0gZ2kraWQrJ2RlZmF1bHQ6XFxuJ1xuICAgICAgICAgICAgZm9yIGUgaW4gbi5lbHNlXG4gICAgICAgICAgICAgICAgcyArPSBnaStpZCtpZCsgQG5vZGUoZSkgKyAnXFxuJyAgICAgICAgICAgIFxuICAgICAgICBzICs9IGdpK1wifVxcblwiXG5cbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcblxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHdoZW46IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnZhbHMgdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdmFscycgblxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gcmV0dXJuIGVycm9yICd3aGVuIGV4cGVjdGVkIHRoZW4nIG5cbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBmb3IgZSBpbiBuLnZhbHNcbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArICdjYXNlICcgKyBAbm9kZShlKSArICc6XFxuJ1xuICAgICAgICBmb3IgZSBpbiBuLnRoZW5cbiAgICAgICAgICAgIHMgKz0gQGluZGVudCArICcgICAgJyArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgJ2JyZWFrJ1xuICAgICAgICBzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwMCAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwXG4gICAgIyAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbiAgICB0b2tlbjogKHRvaykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvay50eXBlID09ICdjb21tZW50J1xuICAgICAgICAgICAgQGNvbW1lbnQgdG9rXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RoaXMnIFxuICAgICAgICAgICAgJ3RoaXMnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ3RyaXBsZSdcbiAgICAgICAgICAgICdgJyArIHRvay50ZXh0WzMuLi00XSArICdgJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ3llcydcbiAgICAgICAgICAgICd0cnVlJ1xuICAgICAgICBlbHNlIGlmIHRvay50eXBlID09ICdrZXl3b3JkJyBhbmQgdG9rLnRleHQgPT0gJ25vJ1xuICAgICAgICAgICAgJ2ZhbHNlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2sudGV4dFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbiAgICBjb21tZW50OiAodG9rKSAtPlxuXG4gICAgICAgIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMjIydcbiAgICAgICAgICAgICcvKicgKyB0b2sudGV4dFszLi4tNF0gKyAnKi8nICsgJ1xcbidcbiAgICAgICAgZWxzZSBpZiB0b2sudGV4dC5zdGFydHNXaXRoICcjJ1xuICAgICAgICAgICAga3N0ci5wYWQoJycsIHRvay5jb2wpICsgJy8vJyArIHRvay50ZXh0WzEuLi0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvciBcIiMgY29tbWVudCB0b2tlbiBleHBlY3RlZFwiXG4gICAgICAgICAgICAnJ1xuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb3BlcmF0aW9uOiAob3ApIC0+XG4gICAgICAgIFxuICAgICAgICBvcG1hcCA9IChvKSAtPlxuICAgICAgICAgICAgb21wID1cbiAgICAgICAgICAgICAgICBhbmQ6ICAgICcmJidcbiAgICAgICAgICAgICAgICBvcjogICAgICd8fCdcbiAgICAgICAgICAgICAgICBub3Q6ICAgICchJ1xuICAgICAgICAgICAgICAgICc9PSc6ICAgJz09PSdcbiAgICAgICAgICAgICAgICAnIT0nOiAgICchPT0nXG4gICAgICAgICAgICBvbXBbb10gPyBvXG5cbiAgICAgICAgbyAgID0gb3BtYXAgb3Aub3BlcmF0b3IudGV4dFxuICAgICAgICBzZXAgPSAnICdcbiAgICAgICAgc2VwID0gJycgaWYgbm90IG9wLmxocyBvciBub3Qgb3AucmhzXG4gICAgICAgIFxuICAgICAgICBpZiBvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICBsbyA9IG9wbWFwIG9wLmxocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICBpZiBsbyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgICAgIHByaW50LmFzdCBcImxvICN7bG99XCIgb3BcbiAgICAgICAgICAgICAgICByZXR1cm4gJygnICsgQG5vZGUob3AubGhzKSArICcgJiYgJyArIEBub2RlKG9wLmxocy5vcGVyYXRpb24ucmhzKSArIHNlcCArIG8gKyBzZXAgKyBrc3RyLmxzdHJpcChAbm9kZShvcC5yaHMpKSArICcpJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcm8gPSBvcG1hcCBvcC5yaHM/Lm9wZXJhdGlvbj8ub3BlcmF0b3IudGV4dFxuICAgICAgICAgICAgIyBwcmludC5hc3QgXCJybyAje3JvfVwiIG9wXG4gICAgICAgICAgICBpZiBybyBpbiBbJzwnJzw9Jyc9PT0nJyE9PScnPj0nJz4nXVxuICAgICAgICAgICAgICAgIHJldHVybiAnKCcgKyBAbm9kZShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIEBub2RlKG9wLnJocy5vcGVyYXRpb24ubGhzKSArICcgJiYgJyArIGtzdHIubHN0cmlwKEBub2RlKG9wLnJocykpICsgJyknXG5cbiAgICAgICAgb3BlbiA9IGNsb3NlID0gJydcbiAgICAgICAgaWYgbyAhPSAnPScgYW5kIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0ID09ICc9J1xuICAgICAgICAgICAgb3BlbiA9ICcoJ1xuICAgICAgICAgICAgY2xvc2UgPSAnKSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG5vZGUob3AubGhzKSArIHNlcCArIG8gKyBzZXAgKyBvcGVuICsga3N0ci5sc3RyaXAgQG5vZGUob3AucmhzKSArIGNsb3NlXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGluY29uZDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBcIiN7QG5vZGUgcC5yaHN9LmluZGV4T2YoI3tAbm9kZSBwLmxoc30pID49IDBcIlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBwYXJlbnM6IChwKSAtPiBcIigje0Bub2RlcyBwLmV4cHN9KVwiXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb2JqZWN0OiAocCkgLT4gXCJ7I3tAbm9kZXMgcC5rZXl2YWxzLCAnLCd9fVwiXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGtleXZhbDogKHApIC0+IFwiI3tAbm9kZShwLmtleSl9OiN7QG5vZGUocC52YWwpfVwiXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBwcm9wOiAgIChwKSAtPiBcIiN7QG5vZGUocC5vYmopfS4je0Bub2RlIHAucHJvcH1cIlxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaW5kZXg6ICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBwLnNsaWR4LnNsaWNlXG4gICAgICAgICAgICBhZGQgPSAnJ1xuICAgICAgICAgICAgaWYgcC5zbGlkeC5zbGljZS5kb3RzLnRleHQgPT0gJy4uJ1xuICAgICAgICAgICAgICAgIGFkZCA9ICcrMSdcbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoI3tAbm9kZSBwLnNsaWR4LnNsaWNlLmZyb219LCAje0Bub2RlIHAuc2xpZHguc2xpY2UudXB0b30je2FkZH0pXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcC5zbGlkeC5vcGVyYXRpb24gXG4gICAgICAgICAgICAgICAgbyA9IHAuc2xpZHgub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgaWYgby5vcGVyYXRvci50ZXh0ID09ICctJyBhbmQgbm90IG8ubGhzIGFuZCBvLnJocz8udHlwZSA9PSAnbnVtJ1xuICAgICAgICAgICAgICAgICAgICBuaSA9IHBhcnNlSW50IG8ucmhzLnRleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbmkgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoLSN7bml9KVswXVwiXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiN7QG5vZGUocC5pZHhlZSl9LnNsaWNlKC0je25pfSwtI3tuaS0xfSlbMF1cIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcIiN7QG5vZGUocC5pZHhlZSl9WyN7QG5vZGUgcC5zbGlkeH1dXCJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgYXJyYXk6IChwKSAtPlxuXG4gICAgICAgIGlmIHAuaXRlbXNbMF0/LnNsaWNlXG4gICAgICAgICAgICBAc2xpY2UgcC5pdGVtc1swXS5zbGljZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIlsje0Bub2RlcyBwLml0ZW1zLCAnLCd9XVwiXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNsaWNlOiAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgcC5mcm9tLnR5cGUgPT0gJ251bScgPT0gcC51cHRvLnR5cGVcbiAgICAgICAgICAgIGZyb20gPSBwYXJzZUludCBwLmZyb20udGV4dFxuICAgICAgICAgICAgdXB0byA9IHBhcnNlSW50IHAudXB0by50ZXh0XG4gICAgICAgICAgICBpZiB1cHRvLWZyb20gPD0gMTBcbiAgICAgICAgICAgICAgICBpZiBwLmRvdHMudGV4dCA9PSAnLi4uJyB0aGVuIHVwdG8tLVxuICAgICAgICAgICAgICAgICdbJysoKHggZm9yIHggaW4gW2Zyb20uLnVwdG9dKS5qb2luICcsJykrJ10nXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgICAgIFwiKGZ1bmN0aW9uKCkgeyB2YXIgciA9IFtdOyBmb3IgKHZhciBpID0gI3tmcm9tfTsgaSAje299ICN7dXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgbyA9IGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gJzwnIGVsc2UgJzw9J1xuICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje0Bub2RlIHAuZnJvbX07IGkgI3tvfSAje0Bub2RlIHAudXB0b307IGkrKyl7IHIucHVzaChpKTsgfSByZXR1cm4gcjsgfSkuYXBwbHkodGhpcylcIlxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyXG4iXX0=
//# sourceURL=../coffee/renderer.coffee
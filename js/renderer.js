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
        var e, gi, i, id, len, list, listVar, ref, ref1, ref2, ref3, ref4, s, val;
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

    Renderer.prototype.for_of = function(n) {
        var e, gi, i, id, key, len, obj, ref, ref1, ref2, ref3, ref4, ref5, s, val;
        id = '    ';
        gi = (ref = this.indent) != null ? ref : '';
        this.indent = gi + id;
        key = (ref1 = n.vals.text) != null ? ref1 : (ref2 = n.vals[0]) != null ? ref2.text : void 0;
        val = (ref3 = n.vals[1]) != null ? ref3.text : void 0;
        obj = this.node(n.list);
        s = '';
        s += gi + ("for (key in " + obj + ")\n");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJyZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixLQUFBLEdBQVEsU0FBQyxDQUFEO1dBQU8sQ0FBQSxDQUFBLEtBQU0sRUFBTixJQUFBLENBQUEsS0FBUyxJQUFULElBQUEsQ0FBQSxLQUFjLFFBQWQsQ0FBQSxJQUE0QixDQUFDLE9BQU8sQ0FBUCxLQUFhLFFBQWIsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFaLENBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQXBEO0FBQW5DOztBQUVGO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDtRQUVBLElBQUMsQ0FBQSxLQUFELHVDQUFxQixDQUFFO1FBQ3ZCLElBQUMsQ0FBQSxPQUFELHlDQUFxQixDQUFFO0lBSHhCOzt1QkFLSCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBRUosWUFBQTtRQUFBLENBQUEsR0FBSTtRQUNKLENBQUEsSUFBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEdBQVA7ZUFDTDtJQUpJOzt1QkFNUixLQUFBLEdBQU8sU0FBQyxLQUFEO2VBRUgsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOO1lBQVA7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixJQUEvQjtJQUZHOzt1QkFJUCxLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsR0FBUjtBQUNILFlBQUE7O1lBRFcsTUFBSTs7UUFDZixFQUFBLEdBQUssS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEs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QUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQS9CLENBQUg7WUFDSSxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBaEI7WUFDUCxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBaEI7WUFDUCxJQUFHLElBQUEsR0FBSyxJQUFMLElBQWEsRUFBaEI7Z0JBQ0ksSUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQVAsS0FBZSxLQUFsQjtvQkFBNkIsSUFBQSxHQUE3Qjs7dUJBQ0EsR0FBQSxHQUFJLENBQUM7O0FBQUM7eUJBQVcsaUdBQVg7cUNBQUE7QUFBQTs7b0JBQUQsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixHQUEvQixDQUFELENBQUosR0FBeUMsSUFGN0M7YUFBQSxNQUFBO2dCQUlJLENBQUEsR0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQVAsS0FBZSxLQUFsQixHQUE2QixHQUE3QixHQUFzQzt1QkFDMUMseUNBQUEsR0FBMEMsSUFBMUMsR0FBK0MsTUFBL0MsR0FBcUQsQ0FBckQsR0FBdUQsR0FBdkQsR0FBMEQsSUFBMUQsR0FBK0QsZ0RBTG5FO2FBSEo7U0FBQSxNQUFBO1lBVUksQ0FBQSxHQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBUCxLQUFlLEtBQWxCLEdBQTZCLEdBQTdCLEdBQXNDO21CQUMxQyx5Q0FBQSxHQUF5QyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLElBQVIsQ0FBRCxDQUF6QyxHQUF1RCxNQUF2RCxHQUE2RCxDQUE3RCxHQUErRCxHQUEvRCxHQUFpRSxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLElBQVIsQ0FBRCxDQUFqRSxHQUErRSxnREFYbkY7O0lBRkk7Ozs7OztBQWVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG5rc3RyICA9IHJlcXVpcmUgJ2tzdHInXG5wcmludCA9IHJlcXVpcmUgJy4vcHJpbnQnXG5lbXB0eSA9IChhKSAtPiBhIGluIFsnJyBudWxsIHVuZGVmaW5lZF0gb3IgKHR5cGVvZihhKSA9PSAnb2JqZWN0JyBhbmQgT2JqZWN0LmtleXMoYSkubGVuZ3RoID09IDApXG5cbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBAOiAoQGtvZGUpIC0+XG5cbiAgICAgICAgQGRlYnVnICAgPSBAa29kZS5hcmdzPy5kZWJ1Z1xuICAgICAgICBAdmVyYm9zZSA9IEBrb2RlLmFyZ3M/LnZlcmJvc2VcblxuICAgIHJlbmRlcjogKGFzdCkgLT5cblxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBAYmxvY2sgYXN0XG4gICAgICAgIHNcblxuICAgIGJsb2NrOiAobm9kZXMpIC0+XG5cbiAgICAgICAgbm9kZXMubWFwKChzKSA9PiBAbm9kZSBzKS5qb2luICdcXG4nXG4gICAgICAgIFxuICAgIG5vZGVzOiAobm9kZXMsIHNlcD0nJykgLT5cbiAgICAgICAgc3MgPSBub2Rlcy5tYXAgKHMpID0+IEBub2RlIHNcbiAgICAgICAgc3Muam9pbiBzZXBcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbiAgICBub2RlOiAoZXhwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuICcnIGlmIG5vdCBleHBcblxuICAgICAgICBpZiBleHAudHlwZT8gYW5kIGV4cC50ZXh0PyB0aGVuIHJldHVybiBAdG9rZW4gZXhwXG5cbiAgICAgICAgaWYgZXhwIGluc3RhbmNlb2YgQXJyYXkgdGhlbiByZXR1cm4gKEBub2RlKGEpIGZvciBhIGluIGV4cCkuam9pbiAnO1xcbidcblxuICAgICAgICBzID0gJydcblxuICAgICAgICBmb3Igayx2IG9mIGV4cFxuXG4gICAgICAgICAgICBzICs9IHN3aXRjaCBrXG4gICAgICAgICAgICAgICAgd2hlbiAnaWYnICAgICAgICB0aGVuIEBpZiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZm9yJyAgICAgICB0aGVuIEBmb3IgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3doaWxlJyAgICAgdGhlbiBAd2hpbGUgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3JldHVybicgICAgdGhlbiBAcmV0dXJuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjbGFzcycgICAgIHRoZW4gQGNsYXNzIHZcbiAgICAgICAgICAgICAgICB3aGVuICdzd2l0Y2gnICAgIHRoZW4gQHN3aXRjaCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnd2hlbicgICAgICB0aGVuIEB3aGVuIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvcGVyYXRpb24nIHRoZW4gQG9wZXJhdGlvbiB2XG4gICAgICAgICAgICAgICAgd2hlbiAnaW5jb25kJyAgICB0aGVuIEBpbmNvbmQgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3BhcmVucycgICAgdGhlbiBAcGFyZW5zIHZcbiAgICAgICAgICAgICAgICB3aGVuICdvYmplY3QnICAgIHRoZW4gQG9iamVjdCB2XG4gICAgICAgICAgICAgICAgd2hlbiAna2V5dmFsJyAgICB0aGVuIEBrZXl2YWwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2FycmF5JyAgICAgdGhlbiBAYXJyYXkgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ2luZGV4JyAgICAgdGhlbiBAaW5kZXggdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3NsaWNlJyAgICAgdGhlbiBAc2xpY2UgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3Byb3AnICAgICAgdGhlbiBAcHJvcCB2XG4gICAgICAgICAgICAgICAgd2hlbiAnZnVuYycgICAgICB0aGVuIEBmdW5jIHZcbiAgICAgICAgICAgICAgICB3aGVuICdjYWxsJyAgICAgIHRoZW4gQGNhbGwgdlxuICAgICAgICAgICAgICAgIHdoZW4gJ3ZhcicgICAgICAgdGhlbiB2LnRleHRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxvZyBSNCgncmVuZGVyZXIubm9kZSB1bmhhbmRsZWQgZXhwJyksIGV4cCAjIGlmIEBkZWJ1ZyBvciBAdmVyYm9zZVxuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG4gICAgY2xhc3M6IChuKSAtPlxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwiY2xhc3MgI3tuLm5hbWUudGV4dH1cIlxuXG4gICAgICAgIGlmIG4uZXh0ZW5kc1xuICAgICAgICAgICAgcyArPSBcIiBleHRlbmRzIFwiICsgbi5leHRlbmRzLm1hcCgoZSkgLT4gZS50ZXh0KS5qb2luICcsICdcblxuICAgICAgICBzICs9ICdcXG57J1xuXG4gICAgICAgIG10aGRzID0gbi5ib2R5Py5vYmplY3Q/LmtleXZhbHMgPyBuLmJvZHk/WzBdPy5vYmplY3Q/LmtleXZhbHNcbiAgICAgICAgXG4gICAgICAgIGlmIG10aGRzPy5sZW5ndGhcbiAgICAgICAgICAgIG10aGRzID0gQHByZXBhcmVNZXRob2RzIG10aGRzXG4gICAgICAgICAgICBAaW5kZW50ID0gJyAgICAnXG4gICAgICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgICAgICBzICs9IEBtdGhkIG1cbiAgICAgICAgICAgIHMgKz0gJ1xcbidcbiAgICAgICAgICAgIEBpbmRlbnQgPSAnJ1xuICAgICAgICBzICs9ICd9J1xuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiAgICBcbiAgICBwcmVwYXJlTWV0aG9kczogKG10aGRzKSAtPlxuXG4gICAgICAgIGJpbmQgPSBbXVxuICAgICAgICBmb3IgbSBpbiBtdGhkc1xuICAgICAgICAgICAgaWYgbm90IG0ua2V5dmFsIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBtLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGxvZyAnd3RmPycgbSBcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdub3QgYW4gbWV0aG9kPycgbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBuYW1lID0gbS5rZXl2YWwua2V5LnRleHRcbiAgICAgICAgICAgIGlmIG5hbWUgaW4gWydAJyAnY29uc3RydWN0b3InXVxuICAgICAgICAgICAgICAgIGlmIGNvbnN0cnVjdG9yIHRoZW4gZXJyb3IgJ21vcmUgdGhhbiBvbmUgY29uc3RydWN0b3I/J1xuICAgICAgICAgICAgICAgIG0ua2V5dmFsLmtleS50ZXh0PSAnY29uc3RydWN0b3InXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtXG4gICAgICAgICAgICBlbHNlIGlmIG5hbWUuc3RhcnRzV2l0aCBcIid0aGlzLlwiICMnQCdcbiAgICAgICAgICAgICAgICBtLmtleXZhbC5rZXkudGV4dCA9ICdzdGF0aWMgJyArIG5hbWVbNi4uLTJdXG4gICAgICAgICAgICBlbHNlIGlmIG0ua2V5dmFsLnZhbC5mdW5jPy5hcnJvdy50ZXh0ID09ICc9PidcbiAgICAgICAgICAgICAgICBiaW5kLnB1c2ggbVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBiaW5kLmxlbmd0aCBhbmQgbm90IGNvbnN0cnVjdG9yICMgZm91bmQgc29tZSBtZXRob2RzIHRvIGJpbmQsIGJ1dCBubyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgYXN0ID0gQGtvZGUuYXN0IFwiY29uc3RydWN0b3I6IC0+XCIgIyBjcmVhdGUgb25lIGZyb20gc2NyYXRjaFxuICAgICAgICAgICAgcHJpbnQubm9vbiAnYXN0JyBhc3QgaWYgQGRlYnVnXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IGFzdFswXS5vYmplY3Qua2V5dmFsc1swXVxuICAgICAgICAgICAgbXRoZHMudW5zaGlmdCBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgICAgICAgcHJpbnQubm9vbiAnY29uc3RydWN0b3InIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0ICdpbXBsaWNpdCBjb25zdHJ1Y3RvcicgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICBwcmludC5hc3QgJ210aGRzIHdpdGggaW1wbGljaXQgY29uc3RydWNvdHInIG10aGRzXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgYmluZC5sZW5ndGhcbiAgICAgICAgICAgIGZvciBiIGluIGJpbmRcbiAgICAgICAgICAgICAgICBibiA9IGIua2V5dmFsLmtleS50ZXh0XG4gICAgICAgICAgICAgICAgbG9nICdtZXRob2QgdG8gYmluZDonIGJuIGlmIEB2ZXJib3NlXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iua2V5dmFsLnZhbC5mdW5jLmJvZHkgPz0gW11cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5rZXl2YWwudmFsLmZ1bmMuYm9keS5wdXNoIFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29kZSdcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJ0aGlzLiN7Ym59ID0gdGhpcy4je2JufS5iaW5kKHRoaXMpO1wiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdjb25zdHJ1Y3RvciBhZnRlciBiaW5kJyBjb25zdHJ1Y3RvciBpZiBAZGVidWdcblxuICAgICAgICBwcmludC5hc3QgJ3ByZXBhcmVkIG10aGRzJyBtdGhkcyBpZiBAZGVidWdcbiAgICAgICAgbXRoZHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIG10aGQ6IChuKSAtPlxuXG4gICAgICAgIGlmIG4udHlwZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBAY29tbWVudCBuXG4gICAgICAgIFxuICAgICAgICBpZiBuLmtleXZhbFxuICAgICAgICAgICAgcyA9IEBmdW5jIG4ua2V5dmFsLnZhbC5mdW5jLCBuLmtleXZhbC5rZXkudGV4dFxuICAgICAgICBzXG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgXG4gICAgZnVuYzogKG4sIG5hbWU9J2Z1bmN0aW9uJykgLT5cbiAgICAgICAgXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIFxuICAgICAgICBzID0gZ2kgKyBuYW1lXG4gICAgICAgIHMgKz0gJyAoJ1xuICAgICAgICBhcmdzID0gbi5hcmdzPy5wYXJlbnM/LmV4cHNcbiAgICAgICAgaWYgYXJnc1xuICAgICAgICAgICAgcyArPSBhcmdzLm1hcCgoYSkgPT4gQG5vZGUgYSkuam9pbiAnLCAnXG4gICAgICAgIHMgKz0gJylcXG4nXG4gICAgICAgIHMgKz0gZ2kgKyAneydcbiAgICAgICAgXG4gICAgICAgICMgcHJpbnQubm9vbiAnZnVuYycgbiBpZiBAdmVyYm9zZVxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGVtcHR5IG4uYm9keVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAaW5kZW50ID0gZ2kgKyBpZFxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgc3MgPSBuLmJvZHkubWFwIChzKSA9PiBAbm9kZSBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBzc1stMV0uc3RhcnRzV2l0aCgncmV0dXJuJykgYW5kIG5hbWUgIT0gJ2NvbnN0cnVjdG9yJ1xuICAgICAgICAgICAgICAgIHNzLnB1c2ggJ3JldHVybiAnICsga3N0ci5sc3RyaXAgc3MucG9wKClcbiAgICAgICAgICAgIHNzID0gc3MubWFwIChzKSA9PiBAaW5kZW50ICsgc1xuICAgICAgICAgICAgcyArPSBzcy5qb2luICdcXG4nXG4gICAgICAgICAgICBzICs9ICdcXG4nICsgZ2lcbiAgICAgICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzICs9ICd9J1xuICAgICAgICBzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZXR1cm46IChuKSAtPlxuXG4gICAgICAgIHMgPSAncmV0dXJuICdcbiAgICAgICAgcyArPSBrc3RyLmxzdHJpcCBAbm9kZSBuLnZhbFxuICAgICAgICBzXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgY2FsbDogKHApIC0+XG4gICAgICAgIGlmIHAuY2FsbGVlLnRleHQgaW4gWydsb2cnJ3dhcm4nJ2Vycm9yJ11cbiAgICAgICAgICAgIHAuY2FsbGVlLnRleHQgPSBcImNvbnNvbGUuI3twLmNhbGxlZS50ZXh0fVwiXG4gICAgICAgIFwiI3tAbm9kZShwLmNhbGxlZSl9KCN7QG5vZGVzIHAuYXJncywgJywnfSlcIlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMFxuICAgICMgMDAwICAwMDAwMDBcbiAgICAjIDAwMCAgMDAwXG4gICAgIyAwMDAgIDAwMFxuXG4gICAgaWY6IChuKSAtPlxuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnaWYgZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaSArIGlkXG5cbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJpZiAoI3tAbm9kZShuLmV4cCl9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kgKyBpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuXG4gICAgICAgIGZvciBlbGlmIGluIG4uZWxpZnMgPyBbXVxuICAgICAgICAgICAgcyArPSAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaSArIFwiZWxzZSBpZiAoI3tAbm9kZShlbGlmLmVsaWYuZXhwKX0pXFxuXCJcbiAgICAgICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgICAgIGZvciBlIGluIGVsaWYuZWxpZi50aGVuID8gW11cbiAgICAgICAgICAgICAgICBzICs9IGdpICsgaWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wifVwiXG5cbiAgICAgICAgaWYgbi5lbHNlXG4gICAgICAgICAgICBzICs9ICdcXG4nXG4gICAgICAgICAgICBzICs9IGdpICsgJ2Vsc2VcXG4nXG4gICAgICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICAgcyArPSBnaSArIGlkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgZm9yOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiBlcnJvciAnZm9yIGV4cGVjdGVkIHRoZW4nIG5cblxuICAgICAgICBzd2l0Y2ggbi5pbm9mLnRleHQgXG4gICAgICAgICAgICB3aGVuICdpbicgdGhlbiBAZm9yX2luIG5cbiAgICAgICAgICAgIHdoZW4gJ29mJyB0aGVuIEBmb3Jfb2YgblxuICAgICAgICAgICAgZWxzZSBlcnJvciAnZm9yIGV4cGVjdGVkIGluL29mJ1xuICAgICAgICBcbiAgICBmb3JfaW46IChuKSAtPlxuICAgICAgICBcbiAgICAgICAgaWQgPSAnICAgICdcbiAgICAgICAgZ2kgPSBAaW5kZW50ID8gJydcbiAgICAgICAgQGluZGVudCA9IGdpK2lkXG5cbiAgICAgICAgdmFsID0gbi52YWxzLnRleHQgPyBuLnZhbHNbMF0/LnRleHRcbiAgICAgICAgbGlzdCA9IEBub2RlIG4ubGlzdFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGxpc3Qgb3IgbGlzdCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgcHJpbnQubm9vbiAnbm8gbGlzdCBmb3InIG4ubGlzdFxuICAgICAgICAgICAgcHJpbnQuYXN0ICdubyBsaXN0IGZvcicgbi5saXN0XG4gICAgICAgICAgICBcbiAgICAgICAgbGlzdFZhciA9ICdsaXN0JyAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIHMgKz0gXCJ2YXIgI3tsaXN0VmFyfSA9ICN7bGlzdH1cXG5cIlxuICAgICAgICBzICs9IGdpK1wiZm9yICh2YXIgaSA9IDA7IGkgPCAje2xpc3RWYXJ9Lmxlbmd0aDsgaSsrKVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgcyArPSBnaStpZCtcIiN7dmFsfSA9ICN7bGlzdFZhcn1baV1cXG5cIlxuICAgICAgICBmb3IgZSBpbiBuLnRoZW4gPyBbXVxuICAgICAgICAgICAgcyArPSBnaStpZCArIEBub2RlKGUpICsgJ1xcbidcbiAgICAgICAgcyArPSBnaStcIn1cIlxuICAgICAgICAgICAgXG4gICAgICAgIEBpbmRlbnQgPSBnaVxuICAgICAgICBzXG4gICAgICAgIFxuICAgIGZvcl9vZjogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcblxuICAgICAgICBrZXkgPSBuLnZhbHMudGV4dCA/IG4udmFsc1swXT8udGV4dFxuICAgICAgICB2YWwgPSBuLnZhbHNbMV0/LnRleHRcbiAgICAgICAgXG4gICAgICAgIG9iaiA9IEBub2RlIG4ubGlzdFxuICAgICAgICBzID0gJydcbiAgICAgICAgcyArPSBnaStcImZvciAoa2V5IGluICN7b2JqfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgcyArPSBnaStpZCtcIiN7dmFsfSA9ICN7b2JqfVtrZXldXFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi50aGVuID8gW11cbiAgICAgICAgICAgIHMgKz0gZ2kraWQgKyBAbm9kZShlKSArICdcXG4nXG4gICAgICAgIHMgKz0gZ2krXCJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiAgICB3aGlsZTogKG4pIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgbi50aGVuIHRoZW4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuXG4gICAgICAgIGlkID0gJyAgICAnXG4gICAgICAgIGdpID0gQGluZGVudCA/ICcnXG4gICAgICAgIEBpbmRlbnQgPSBnaStpZFxuXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwid2hpbGUgKCN7QG5vZGUgbi5jb25kfSlcXG5cIlxuICAgICAgICBzICs9IGdpK1wie1xcblwiXG4gICAgICAgIGZvciBlIGluIG4udGhlbiA/IFtdXG4gICAgICAgICAgICBzICs9IGdpK2lkICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IGdpK1wifVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGluZGVudCA9IGdpXG4gICAgICAgIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3dpdGNoOiAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBuLm1hdGNoIHRoZW4gZXJyb3IgJ3N3aXRjaCBleHBlY3RlZCBtYXRjaCcgblxuICAgICAgICBpZiBub3Qgbi53aGVucyB0aGVuIGVycm9yICdzd2l0Y2ggZXhwZWN0ZWQgd2hlbnMnIG5cblxuICAgICAgICBpZCA9ICcgICAgJ1xuICAgICAgICBnaSA9IEBpbmRlbnQgPyAnJ1xuICAgICAgICBAaW5kZW50ID0gZ2kraWRcbiAgICAgICAgXG4gICAgICAgIHMgPSAnJ1xuICAgICAgICBzICs9IFwic3dpdGNoICgje0Bub2RlIG4ubWF0Y2h9KVxcblwiXG4gICAgICAgIHMgKz0gZ2krXCJ7XFxuXCJcbiAgICAgICAgZm9yIGUgaW4gbi53aGVucyA/IFtdXG4gICAgICAgICAgICBzICs9IGdpKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIGlmIG4uZWxzZVxuICAgICAgICAgICAgcyArPSBnaStpZCsnZGVmYXVsdDpcXG4nXG4gICAgICAgICAgICBmb3IgZSBpbiBuLmVsc2VcbiAgICAgICAgICAgICAgICBzICs9IGdpK2lkK2lkKyBAbm9kZShlKSArICdcXG4nICAgICAgICAgICAgXG4gICAgICAgIHMgKz0gZ2krXCJ9XFxuXCJcblxuICAgICAgICBAaW5kZW50ID0gZ2lcbiAgICAgICAgc1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgd2hlbjogKG4pIC0+XG5cbiAgICAgICAgaWYgbm90IG4udmFscyB0aGVuIHJldHVybiBlcnJvciAnd2hlbiBleHBlY3RlZCB2YWxzJyBuXG4gICAgICAgIGlmIG5vdCBuLnRoZW4gdGhlbiByZXR1cm4gZXJyb3IgJ3doZW4gZXhwZWN0ZWQgdGhlbicgblxuICAgICAgICBcbiAgICAgICAgcyA9ICcnXG4gICAgICAgIGZvciBlIGluIG4udmFsc1xuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJ2Nhc2UgJyArIEBub2RlKGUpICsgJzpcXG4nXG4gICAgICAgIGZvciBlIGluIG4udGhlblxuICAgICAgICAgICAgcyArPSBAaW5kZW50ICsgJyAgICAnICsgQG5vZGUoZSkgKyAnXFxuJ1xuICAgICAgICBzICs9IEBpbmRlbnQgKyAnICAgICcgKyAnYnJlYWsnXG4gICAgICAgIHNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAwICAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxuICAgIHRva2VuOiAodG9rKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9rLnR5cGUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBAY29tbWVudCB0b2tcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndGhpcycgXG4gICAgICAgICAgICAndGhpcydcbiAgICAgICAgZWxzZSBpZiB0b2sudHlwZSA9PSAndHJpcGxlJ1xuICAgICAgICAgICAgJ2AnICsgdG9rLnRleHRbMy4uLTRdICsgJ2AnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAneWVzJ1xuICAgICAgICAgICAgJ3RydWUnXG4gICAgICAgIGVsc2UgaWYgdG9rLnR5cGUgPT0gJ2tleXdvcmQnIGFuZCB0b2sudGV4dCA9PSAnbm8nXG4gICAgICAgICAgICAnZmFsc2UnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvay50ZXh0XG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGNvbW1lbnQ6ICh0b2spIC0+XG5cbiAgICAgICAgaWYgdG9rLnRleHQuc3RhcnRzV2l0aCAnIyMjJ1xuICAgICAgICAgICAgJy8qJyArIHRvay50ZXh0WzMuLi00XSArICcqLycgKyAnXFxuJ1xuICAgICAgICBlbHNlIGlmIHRvay50ZXh0LnN0YXJ0c1dpdGggJyMnXG4gICAgICAgICAgICBrc3RyLnBhZCgnJywgdG9rLmNvbCkgKyAnLy8nICsgdG9rLnRleHRbMS4uLTFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yIFwiIyBjb21tZW50IHRva2VuIGV4cGVjdGVkXCJcbiAgICAgICAgICAgICcnXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbiAgICBvcGVyYXRpb246IChvcCkgLT5cbiAgICAgICAgXG4gICAgICAgIG9wbWFwID0gKG8pIC0+XG4gICAgICAgICAgICBvbXAgPVxuICAgICAgICAgICAgICAgIGFuZDogICAgJyYmJ1xuICAgICAgICAgICAgICAgIG9yOiAgICAgJ3x8J1xuICAgICAgICAgICAgICAgIG5vdDogICAgJyEnXG4gICAgICAgICAgICAgICAgJz09JzogICAnPT09J1xuICAgICAgICAgICAgICAgICchPSc6ICAgJyE9PSdcbiAgICAgICAgICAgIG9tcFtvXSA/IG9cblxuICAgICAgICBvICAgPSBvcG1hcCBvcC5vcGVyYXRvci50ZXh0XG4gICAgICAgIHNlcCA9ICcgJ1xuICAgICAgICBzZXAgPSAnJyBpZiBub3Qgb3AubGhzIG9yIG5vdCBvcC5yaHNcbiAgICAgICAgXG4gICAgICAgIGlmIG8gaW4gWyc8Jyc8PScnPT09JychPT0nJz49Jyc+J11cbiAgICAgICAgICAgIGxvID0gb3BtYXAgb3AubGhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHRcbiAgICAgICAgICAgIGlmIGxvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcHJpbnQuYXN0IFwibG8gI3tsb31cIiBvcFxuICAgICAgICAgICAgICAgIHJldHVybiAnKCcgKyBAbm9kZShvcC5saHMpICsgJyAmJiAnICsgQG5vZGUob3AubGhzLm9wZXJhdGlvbi5yaHMpICsgc2VwICsgbyArIHNlcCArIGtzdHIubHN0cmlwKEBub2RlKG9wLnJocykpICsgJyknXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBybyA9IG9wbWFwIG9wLnJocz8ub3BlcmF0aW9uPy5vcGVyYXRvci50ZXh0XG4gICAgICAgICAgICAjIHByaW50LmFzdCBcInJvICN7cm99XCIgb3BcbiAgICAgICAgICAgIGlmIHJvIGluIFsnPCcnPD0nJz09PScnIT09Jyc+PScnPiddXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoJyArIEBub2RlKG9wLmxocykgKyBzZXAgKyBvICsgc2VwICsgQG5vZGUob3AucmhzLm9wZXJhdGlvbi5saHMpICsgJyAmJiAnICsga3N0ci5sc3RyaXAoQG5vZGUob3AucmhzKSkgKyAnKSdcblxuICAgICAgICBvcGVuID0gY2xvc2UgPSAnJ1xuICAgICAgICBpZiBvICE9ICc9JyBhbmQgb3AucmhzPy5vcGVyYXRpb24/Lm9wZXJhdG9yLnRleHQgPT0gJz0nXG4gICAgICAgICAgICBvcGVuID0gJygnXG4gICAgICAgICAgICBjbG9zZSA9ICcpJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbm9kZShvcC5saHMpICsgc2VwICsgbyArIHNlcCArIG9wZW4gKyBrc3RyLmxzdHJpcCBAbm9kZShvcC5yaHMpICsgY2xvc2VcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaW5jb25kOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIFwiI3tAbm9kZSBwLnJoc30uaW5kZXhPZigje0Bub2RlIHAubGhzfSkgPj0gMFwiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHBhcmVuczogKHApIC0+IFwiKCN7QG5vZGVzIHAuZXhwc30pXCJcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvYmplY3Q6IChwKSAtPiBcInsje0Bub2RlcyBwLmtleXZhbHMsICcsJ319XCJcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAga2V5dmFsOiAocCkgLT4gXCIje0Bub2RlKHAua2V5KX06I3tAbm9kZShwLnZhbCl9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIHByb3A6ICAgKHApIC0+IFwiI3tAbm9kZShwLm9iail9LiN7QG5vZGUgcC5wcm9wfVwiXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpbmRleDogIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIHAuc2xpZHguc2xpY2VcbiAgICAgICAgICAgIGFkZCA9ICcnXG4gICAgICAgICAgICBpZiBwLnNsaWR4LnNsaWNlLmRvdHMudGV4dCA9PSAnLi4nXG4gICAgICAgICAgICAgICAgYWRkID0gJysxJ1xuICAgICAgICAgICAgXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgje0Bub2RlIHAuc2xpZHguc2xpY2UuZnJvbX0sICN7QG5vZGUgcC5zbGlkeC5zbGljZS51cHRvfSN7YWRkfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwLnNsaWR4Lm9wZXJhdGlvbiBcbiAgICAgICAgICAgICAgICBvID0gcC5zbGlkeC5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICBpZiBvLm9wZXJhdG9yLnRleHQgPT0gJy0nIGFuZCBub3Qgby5saHMgYW5kIG8ucmhzPy50eXBlID09ICdudW0nXG4gICAgICAgICAgICAgICAgICAgIG5pID0gcGFyc2VJbnQgby5yaHMudGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBuaSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIje0Bub2RlKHAuaWR4ZWUpfS5zbGljZSgtI3tuaX0pWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI3tAbm9kZShwLmlkeGVlKX0uc2xpY2UoLSN7bml9LC0je25pLTF9KVswXVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFwiI3tAbm9kZShwLmlkeGVlKX1bI3tAbm9kZSBwLnNsaWR4fV1cIlxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBhcnJheTogKHApIC0+XG5cbiAgICAgICAgaWYgcC5pdGVtc1swXT8uc2xpY2VcbiAgICAgICAgICAgIEBzbGljZSBwLml0ZW1zWzBdLnNsaWNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiWyN7QG5vZGVzIHAuaXRlbXMsICcsJ31dXCJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2xpY2U6ICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBwLmZyb20udHlwZSA9PSAnbnVtJyA9PSBwLnVwdG8udHlwZVxuICAgICAgICAgICAgZnJvbSA9IHBhcnNlSW50IHAuZnJvbS50ZXh0XG4gICAgICAgICAgICB1cHRvID0gcGFyc2VJbnQgcC51cHRvLnRleHRcbiAgICAgICAgICAgIGlmIHVwdG8tZnJvbSA8PSAxMFxuICAgICAgICAgICAgICAgIGlmIHAuZG90cy50ZXh0ID09ICcuLi4nIHRoZW4gdXB0by0tXG4gICAgICAgICAgICAgICAgJ1snKygoeCBmb3IgeCBpbiBbZnJvbS4udXB0b10pLmpvaW4gJywnKSsnXSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICAgICAgXCIoZnVuY3Rpb24oKSB7IHZhciByID0gW107IGZvciAodmFyIGkgPSAje2Zyb219OyBpICN7b30gI3t1cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBvID0gaWYgcC5kb3RzLnRleHQgPT0gJy4uLicgdGhlbiAnPCcgZWxzZSAnPD0nXG4gICAgICAgICAgICBcIihmdW5jdGlvbigpIHsgdmFyIHIgPSBbXTsgZm9yICh2YXIgaSA9ICN7QG5vZGUgcC5mcm9tfTsgaSAje299ICN7QG5vZGUgcC51cHRvfTsgaSsrKXsgci5wdXNoKGkpOyB9IHJldHVybiByOyB9KS5hcHBseSh0aGlzKVwiXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee